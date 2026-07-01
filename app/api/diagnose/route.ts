import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Mendapatkan instance GoogleGenerativeAI secara lazy.
 * API key hanya dicek saat fungsi ini pertama dipanggil (bukan saat import),
 * sehingga pure function hitungAnalisisFinansial bisa diimport di test
 * tanpa perlu GEMINI_API_KEY di environment.
 */
let genAIInstance: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAIInstance) {
    const apiKey: string | undefined = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY belum dikonfigurasi di file .env.local");
    }
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return genAIInstance;
}

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
    jumlah_unit_per_paket: 1,
    draft_whatsapp: `Halo! Kami sedang menyiapkan program langganan spesial untuk ${produk}. Dengan harga spesial hanya Rp ${estimasiHarga.toLocaleString('id-ID')}/paket, kami akan kirim ${produk} pilihan setiap minggunya. Yuk, daftar sekarang!`
  };
}

// =========================================================================
// PURE FUNCTION — Kalkulator Finansial (testable, tidak bergantung AI/API)
// =========================================================================

export interface AnalisisFinansial {
  margin_persen: number;
  keuntungan_per_paket: number;
  target_pelanggan_bep: number;
}

export interface HitungFinansialInput {
  hargaModalPerUnit: number;
  jumlahUnitPerPaket: number;
  hargaJualBaru: number;
}

export interface HitungFinansialOutput {
  total_hpp_paket: number;
  keuntungan_bersih_paket: number;
  margin_persen: number;
  target_pelanggan_bep: number;
  analisis_finansial: AnalisisFinansial;
}

/**
 * hitungAnalisisFinansial
 * Pure function yang menghitung kalkulasi finansial UMKM.
 *
 * - HPP yang diinput user adalah per unit/porsi, bukan per paket.
 * - Maka total HPP paket = HPP per unit x jumlah unit per paket.
 * - Keuntungan bersih dihitung dari harga jual paket dikurangi total HPP paket.
 * - Target BEP bulanan menggunakan asumsi profit aman Rp1.500.000.
 *
 * @param input - Parameter kalkulasi
 * @returns Objek hasil kalkulasi lengkap
 */
export function hitungAnalisisFinansial(input: HitungFinansialInput): HitungFinansialOutput {
  const { hargaModalPerUnit, jumlahUnitPerPaket, hargaJualBaru } = input;

  const totalHppPaket: number = hargaModalPerUnit * jumlahUnitPerPaket;
  const keuntunganBersihPaket: number = hargaJualBaru - totalHppPaket;
  const marginPersen: number = Math.round((keuntunganBersihPaket / hargaJualBaru) * 100);

  // Target profit aman bulanan UMKM (misal Rp1.500.000)
  const targetProfitAman: number = 1500000;
  const targetPelangganBEP: number = Math.ceil(targetProfitAman / (keuntunganBersihPaket > 0 ? keuntunganBersihPaket : 1));

  return {
    total_hpp_paket: totalHppPaket,
    keuntungan_bersih_paket: keuntunganBersihPaket,
    margin_persen: marginPersen,
    target_pelanggan_bep: targetPelangganBEP,
    analisis_finansial: {
      margin_persen: marginPersen,
      keuntungan_per_paket: keuntunganBersihPaket,
      target_pelanggan_bep: targetPelangganBEP,
    },
  };
}

// =========================================================================
// POST HANDLER
// =========================================================================

export async function POST(request: any) {
  try {
    const { produk, hargaModal, hargaJualLama, keluhan } = await request.json();

    // Validasi input dasar
    if (!produk || !hargaModal || !hargaJualLama || !keluhan) {
      return NextResponse.json({ error: 'Semua data form wajib diisi!' }, { status: 400 });
    }

    // Konversi input harga ke number
    const hargaModalPerUnit: number = Number(hargaModal);

    // Dapatkan model dari lazy-loaded AI instance (hanya throw jika API key tidak ada saat runtime)
    const model = getGenAI().getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `Kamu adalah "Dokter UMKM", seorang konsultan bisnis praktis dan analitis yang ahli dalam merancang model bisnis berlangganan (subscription) atau productized services untuk pedagang kecil di Indonesia.
Tugasmu adalah menerima data keluhan dan kondisi bisnis UMKM, lalu merumuskan SATU ide pivot bisnis yang spesifik, realistis, dan anti-FOMO (jangan pernah menyarankan diskon/banting harga).

Aturan Wajib:
1. Gunakan bahasa Indonesia santai yang mudah dipahami pedagang kecil, bukan bahasa korporat.
2. Ide pivot HARUS berbasis paket langganan (harian/mingguan/bulanan).
3. Kamu WAJIB mengembalikan output dalam format JSON murni tanpa markdown block (\`\`\`json).`,
    });

    const prompt = `Profil Bisnis UMKM:
- Produk: ${produk}
- Harga Modal (HPP) per unit/porsi: Rp ${hargaModal}
- Harga Jual Saat Ini: Rp ${hargaJualLama}
- Keluhan Utama: ${keluhan}

Kembalikan JSON dengan struktur tepat seperti ini:
{
  "diagnosis": "analisis singkat kenapa strategi lama mereka gagal",
  "nama_ide_pivot": "nama paket langganan yang catchy",
  "deskripsi_pivot": "cara kerja operasional model langganan baru ini",
  "estimasi_harga_jual_baru": 150000,
  "jumlah_unit_per_paket": 10,
  "draft_whatsapp": "teks promosi persuasif maksimal 4 kalimat untuk ditawarkan ke pelanggan"
}

Isian "jumlah_unit_per_paket" adalah jumlah unit/porsi yang didapatkan konsumen dalam SATU paket langganan tersebut. Contoh: jika ide pivotnya "Paket Kopi 20 Gelas" maka jumlah_unit_per_paket = 20. Jika ide pivotnya bukan tipe paket/grosir (misal jasa konsultasi), maka jumlah_unit_per_paket = 1.`;

    // Memanggil Gemini 2.5 Flash dengan mode JSON murni
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
      aiData = buatFallbackJSON(produk, hargaModalPerUnit);
    }

    // Validasi field kritis - jika tidak valid, pakai nilai aman
    if (typeof aiData.estimasi_harga_jual_baru !== 'number' || aiData.estimasi_harga_jual_baru <= 0) {
      aiData.estimasi_harga_jual_baru = Math.round(hargaModalPerUnit * 1.5);
    }
    if (typeof aiData.jumlah_unit_per_paket !== 'number' || aiData.jumlah_unit_per_paket < 1) {
      aiData.jumlah_unit_per_paket = 1;
    }
    if (!aiData.diagnosis) aiData.diagnosis = "Data diagnosis tidak tersedia.";
    if (!aiData.nama_ide_pivot) aiData.nama_ide_pivot = `Paket ${produk}`;
    if (!aiData.deskripsi_pivot) aiData.deskripsi_pivot = "Deskripsi tidak tersedia.";
    if (!aiData.draft_whatsapp) {
      aiData.draft_whatsapp = `Halo! Yuk cobain ${produk} terbaru dari kami!`;
    }

    // --- LOGIKA KALKULATOR FINANSIAL (pure function, tidak dari AI) ---
    const hasilFinansial = hitungAnalisisFinansial({
      hargaModalPerUnit,
      jumlahUnitPerPaket: aiData.jumlah_unit_per_paket,
      hargaJualBaru: aiData.estimasi_harga_jual_baru,
    });

    // Gabungkan analisis AI dan hitungan matematika sistem
    const finalReport = {
      ...aiData,
      jumlah_unit_per_paket: aiData.jumlah_unit_per_paket,
      total_hpp_paket: hasilFinansial.total_hpp_paket,
      analisis_finansial: hasilFinansial.analisis_finansial,
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
