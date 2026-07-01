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
// SYSTEM INSTRUCTION — Street-Smart Mentor Garis Keras
// =========================================================================

const SYSTEM_INSTRUCTION_DIAGNOSIS = `Kamu BUKAN konsultan formal. Kamu adalah Growth Hacker & Mentor Bisnis Garis Keras yang benci teori bertele-tele. Kamu ngomong realita pahit yang bikin pengusaha sadar, tapi langsung kasih solusi praktis yang bisa dijalanin besok pagi.

IDENTITAS:
- Tone: tegas, realistis, menyentil tapi sangat solutif.
- Kamu paham betul kehidupan UMKM Indonesia. Istilah boncos, laci bocor, kerja rodi, subsidi pembeli, stok mati, di-PHP pembeli, kuncian cashflow, itu bahasa sehari-hari kamu.

TUGAS:
Terima data keluhan dan kondisi bisnis UMKM, lalu:
1. Buat DIAGNOSIS yang jujur dan blak-blakan dari 4 aspek (Keuangan, Stok, Pemasaran, Layanan).
2. Rancang SATU ide pivot nama paket layanan berlangganan (harian/mingguan/bulanan). Nama paket HARUS pakai psikologi kelangkaan atau status premium. DILARANG nama generik kayak "Paket Hemat" atau "Paket Semangat Pagi".
3. Deksripsi pivot HARUS berisi langkah operasional taktis 1-2-3 yang sangat bumi. Jangan suruh 'analisis pasar'.
4. Draft WA harus ngalir kayak chat manusia asli. DILARANG emoji lebay (🚀🔥) atau kata-kata robot "Halo Kak! Kami ada kabar gembira".

Kembalikan output dalam JSON murni tanpa markdown block.`;

const SYSTEM_INSTRUCTION_CHAT = `Kamu adalah Growth Hacker & Mentor Bisnis Garis Keras yang benci teori bertele-tele. Sekarang kamu lagi sesi tanya-jawab lanjutan dengan pengusaha UMKM yang udah dapet resep bisnis dari kamu sebelumnya.

PEDOMAN:
- Jawab singkat, padat, langsung ke inti masalah operasional lapangan.
- Tetap gunakan tone tegas, realistis, dan blak-blakan.
- Gunakan istilah bisnis lokal yang konkret (boncos, laci bocor, stok mati, dll).
- Solusi harus praktis dan bisa dijalankan besok pagi, bukan teori muluk.
- DILARANG emoji berlebihan atau bahasa robot.

Kembalikan output dalam format JSON murni dengan properti "reply" berisi string jawaban kamu. Jangan gunakan markdown block (triple backtick).`;

// =========================================================================
// POST HANDLER
// =========================================================================

export async function POST(request: any) {
  try {
    const payload = await request.json();

    // ===================================================================
    // MODE 1: Chat / Tanya-Jawab Lanjutan
    // ===================================================================
    if (payload.chatHistory && payload.pertanyaan) {
      const { chatHistory, pertanyaan } = payload;

      if (!Array.isArray(chatHistory) || !pertanyaan) {
        return NextResponse.json({ error: 'Data chat tidak valid.' }, { status: 400 });
      }

      const model = getGenAI().getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: SYSTEM_INSTRUCTION_CHAT,
      });

      // Bangun konteks percakapan dari riwayat chat
      const contents: any[] = [];

      // Tambahkan riwayat diagnosis awal jika ada di chatHistory[0]
      // Konteks: nama produk, harga modal, dll sudah tertanam di chat awal
      for (const msg of chatHistory) {
        if (msg.question) {
          contents.push({ role: 'user', parts: [{ text: msg.question }] });
        }
        if (msg.answer) {
          contents.push({ role: 'model', parts: [{ text: msg.answer }] });
        }
      }

      // Tambahkan pertanyaan terakhir user
      const promptChat = `Pertanyaan user: "${pertanyaan}"

Jawab dengan JSON:
{
  "reply": "jawaban kamu yang singkat, padat, dan praktis"
}`;

      contents.push({ role: 'user', parts: [{ text: promptChat }] });

      const result = await model.generateContent({
        contents,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const rawResponse = result.response.text();
      if (!rawResponse) {
        return NextResponse.json({ reply: 'Maaf, saya gagal merespons. Coba tanya lagi ya.' }, { status: 200 });
      }

      const cleaned = bersihkanMarkdownJSON(rawResponse);
      let replyData: any;

      try {
        replyData = JSON.parse(cleaned);
      } catch (parseError: any) {
        return NextResponse.json({ reply: cleaned }, { status: 200 });
      }

      return NextResponse.json({ reply: replyData.reply || cleaned }, { status: 200 });
    }

    // ===================================================================
    // MODE 2: Diagnosis Awal (Flow lama yang sudah berjalan)
    // ===================================================================
    const { produk, hargaModal, hargaJualLama, keluhan } = payload;

    // Validasi input dasar
    if (!produk || !hargaModal || !hargaJualLama || !keluhan) {
      return NextResponse.json({ error: 'Semua data form wajib diisi!' }, { status: 400 });
    }

    // Konversi input harga ke number
    const hargaModalPerUnit: number = Number(hargaModal);

    // Dapatkan model dari lazy-loaded AI instance
    const model = getGenAI().getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION_DIAGNOSIS,
    });

    const prompt = `Profil Bisnis UMKM:
- Produk: ${produk}
- Harga Modal (HPP) per unit/porsi: Rp ${hargaModal}
- Harga Jual Saat Ini: Rp ${hargaJualLama}
- Keluhan Utama: ${keluhan}

Kembalikan JSON dengan struktur tepat seperti ini:
{
  "diagnosis": "analisis blak-blakan dari 4 aspek (Keuangan, Stok, Pemasaran, Layanan) — jangan teori, langsung tembak masalah riil pakai istilah boncos, laci bocor, subsidi pembeli, dll",
  "nama_ide_pivot": "nama paket langganan yang pakai psikologi kelangkaan/status premium — dilarang generik!",
  "deskripsi_pivot": "langkah operasional taktis 1-2-3 yang bisa dijalankan besok pagi",
  "estimasi_harga_jual_baru": 150000,
  "jumlah_unit_per_paket": 10,
  "draft_whatsapp": "draf chat WA yang ngalir kayak manusia, dilarang emoji lebay atau kata robot"
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

    // Ambil teks mentah dari response
    const rawResponse = result.response.text();
    if (!rawResponse) {
      throw new Error("Gagal menerima respons dari Gemini API.");
    }

    // --- ROBUST JSON EXTRACTION LAYER ---
    const cleanedResponse = bersihkanMarkdownJSON(rawResponse);

    // Parse JSON dengan try-catch internal - jika gagal, pakai fallback
    let aiData: any;
    try {
      aiData = JSON.parse(cleanedResponse);
    } catch (parseError: any) {
      console.error('Gagal parse JSON dari AI, menggunakan fallback:', parseError);
      aiData = buatFallbackJSON(produk, hargaModalPerUnit);
    }

    // Validasi field kritis
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
