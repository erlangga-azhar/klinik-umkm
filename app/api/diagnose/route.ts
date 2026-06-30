import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mengambil API Key dari environment variable
const apiKey: string | undefined = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY belum dikonfigurasi di file .env.local");
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Membersihkan string mentah dari AI dari bungkusan markdown ```json ... ```
 * sebelum di-parse sebagai JSON.
 */
function bersihkanMarkdownJSON(raw: string): string {
  return raw
    .replace(/```(?:json)?\s*/gi, '')
    .replace(/\s*```/g, '')
    .trim();
}

/**
 * JSON fallback darurat jika parsing AI benar-benar gagal.
 */
function buatFallbackJSON(produk: string, hargaModal: number): any {
  const estimasiHarga = Math.round(hargaModal * 1.5);
  return {
    diagnosis: "Maaf, sistem AI mengalami gangguan saat memproses data. Berikut estimasi sementara berdasarkan data yang Anda masukkan.",
    nama_ide_pivot: `Paket Langganan ${produk}`,
    deskripsi_pivot: `Kami sarankan untuk mencoba model paket langganan ${produk} dengan sistem pre-order atau subscription harian/mingguan. Silakan coba diagnosis ulang untuk mendapatkan resep yang lebih akurat.`,
    estimasi_harga_jual_baru: estimasiHarga,
    draft_whatsapp: `Halo! Kami sedang menyiapkan program langganan spesial untuk ${produk}. Dengan harga spesial hanya Rp ${estimasiHarga.toLocaleString('id-ID')}/paket, kami akan kirim ${produk} pilihan setiap minggunya. Yuk, daftar sekarang!`
  };
}

export async function POST(request: any) {
  try {
    const { produk, hargaModal, hargaJualLama, keluhan } = await request.json();

    // Validasi input dasar
    if (!produk || !hargaModal || !hargaJualLama || !keluhan) {
      return NextResponse.json({ error: 'Semua data form wajib diisi!' }, { status: 400 });
    }

    // Inisialisasi model di dalam handler (bukan module scope)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: `Kamu adalah "Dokter UMKM", seorang konsultan bisnis praktis dan analitis yang ahli dalam merancang model bisnis berlangganan (subscription) atau productized services untuk pedagang kecil di Indonesia.
Tugasmu adalah menerima data keluhan dan kondisi bisnis UMKM, lalu merumuskan SATU ide pivot bisnis yang spesifik, realistis, dan anti-FOMO (jangan pernah menyarankan diskon/banting harga).

Aturan Wajib:
1. Gunakan bahasa Indonesia santai yang mudah dipahami pedagang kecil, bukan bahasa korporat.
2. Ide pivot HARUS berbasis paket langganan (harian/mingguan/bulanan).
3. Kamu WAJIB mengembalikan output dalam format JSON murni tanpa markdown block (\`\`\`json).`,
    });

    const prompt = `Profil Bisnis UMKM:
- Produk: ${produk}
- Harga Modal (HPP): Rp ${hargaModal}
- Harga Jual Saat Ini: Rp ${hargaJualLama}
- Keluhan Utama: ${keluhan}

Kembalikan JSON dengan struktur tepat seperti ini:
{
  "diagnosis": "analisis singkat kenapa strategi lama mereka gagal",
  "nama_ide_pivot": "nama paket langganan yang catchy",
  "deskripsi_pivot": "cara kerja operasional model langganan baru ini",
  "estimasi_harga_jual_baru": 150000,
  "draft_whatsapp": "teks promosi persuasif maksimal 4 kalimat untuk ditawarkan ke pelanggan"
}`;

    // Memanggil Gemini 2.0 Flash dengan mode JSON murni
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    // Ambil teks mentah dari response (method invocation)
    const rawResponse = result.response.text();
    if (!rawResponse) {
      throw new Error("Gagal menerima respons dari Gemini API.");
    }

    // --- ROBUST JSON EXTRACTION LAYER ---
    // Bersihkan bungkusan markdown ```json ... ``` jika AI bandel
    const cleanedResponse = bersihkanMarkdownJSON(rawResponse);

    // Parse JSON dengan try-catch internal - jika gagal, pakai fallback
    let aiData: any;
    try {
      aiData = JSON.parse(cleanedResponse);
    } catch (parseError: any) {
      console.error('Gagal parse JSON dari AI, menggunakan fallback:', parseError);
      aiData = buatFallbackJSON(produk, hargaModal);
    }

    // Validasi field kritis - jika tidak valid, pakai nilai aman
    if (typeof aiData.estimasi_harga_jual_baru !== 'number' || aiData.estimasi_harga_jual_baru <= 0) {
      aiData.estimasi_harga_jual_baru = Math.round(hargaModal * 1.5);
    }
    if (!aiData.diagnosis) aiData.diagnosis = "Data diagnosis tidak tersedia.";
    if (!aiData.nama_ide_pivot) aiData.nama_ide_pivot = `Paket ${produk}`;
    if (!aiData.deskripsi_pivot) aiData.deskripsi_pivot = "Deskripsi tidak tersedia.";
    if (!aiData.draft_whatsapp) {
      aiData.draft_whatsapp = `Halo! Yuk cobain ${produk} terbaru dari kami!`;
    }

    // --- LOGIKA KALKULATOR FINANSIAL (aritmatika rigid, tidak dari AI) ---
    const hargaJualBaru = aiData.estimasi_harga_jual_baru;
    const keuntunganBersih = hargaJualBaru - hargaModal;
    const marginPersen = Math.round((keuntunganBersih / hargaJualBaru) * 100);
    
    // Target profit aman bulanan UMKM (misal Rp1.500.000)
    const targetProfitAman = 1500000;
    const targetPelangganBEP = Math.ceil(targetProfitAman / (keuntunganBersih > 0 ? keuntunganBersih : 1));

    // Gabungkan analisis AI dan hitungan matematika sistem
    const finalReport = {
      ...aiData,
      analisis_finansial: {
        margin_persen: marginPersen,
        keuntungan_per_paket: keuntunganBersih,
        target_pelanggan_bep: targetPelangganBEP
      }
    };

    return NextResponse.json(finalReport, { status: 200 });

  } catch (error: any) {
    console.error('Klinik UMKM API Error:', error);
    return NextResponse.json({
      error: 'Terjadi kesalahan pada sistem diagnosis Dokter AI. Silakan coba beberapa saat lagi.',
      detail: error.message || ''
    }, { status: 500 });
  }
}