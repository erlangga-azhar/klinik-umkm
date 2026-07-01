import { NextResponse } from 'next/server';
import {
  validasiKeamananInput,
  hitungAnalisisFinansial,
  getGenAI,
  bersihkanMarkdownJSON,
  buatFallbackJSON,
  buildDiagnosisPrompt,
  buildChatPrompt,
  SYSTEM_INSTRUCTION_DIAGNOSIS,
  SYSTEM_INSTRUCTION_CHAT,
} from '@/lib';

// =========================================================================
// CONTROLLER — POST Handler
// =========================================================================
// Hanya bertugas sebagai orchestrator yang memanggil service-layer functions
// secara sekuensial. Tidak berisi logika bisnis atau konfigurasi AI.
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

      // --- SECURITY CHECK ---
      const hasilValidasi = validasiKeamananInput('', '', pertanyaan);
      if (!hasilValidasi.aman) {
        return NextResponse.json({ error: hasilValidasi.alasan }, { status: 400 });
      }

      const model = getGenAI().getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: SYSTEM_INSTRUCTION_CHAT,
      });

      // Bangun konteks percakapan dari riwayat chat
      const contents: any[] = [];
      for (const msg of chatHistory) {
        if (msg.question) {
          contents.push({ role: 'user', parts: [{ text: msg.question }] });
        }
        if (msg.answer) {
          contents.push({ role: 'model', parts: [{ text: msg.answer }] });
        }
      }

      contents.push({ role: 'user', parts: [{ text: buildChatPrompt(pertanyaan) }] });

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
    // MODE 2: Diagnosis Awal
    // ===================================================================
    const { produk, hargaModal, hargaJualLama, keluhan } = payload;

    if (!produk || !hargaModal || !hargaJualLama || !keluhan) {
      return NextResponse.json({ error: 'Semua data form wajib diisi!' }, { status: 400 });
    }

    // --- SECURITY CHECK ---
    const hasilValidasi = validasiKeamananInput(produk, keluhan);
    if (!hasilValidasi.aman) {
      return NextResponse.json({ error: hasilValidasi.alasan }, { status: 400 });
    }

    const hargaModalPerUnit: number = Number(hargaModal);

    const model = getGenAI().getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION_DIAGNOSIS,
    });

    const prompt = buildDiagnosisPrompt(produk, hargaModal, hargaJualLama, keluhan);

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const rawResponse = result.response.text();
    if (!rawResponse) {
      throw new Error("Gagal menerima respons dari Gemini API.");
    }

    const cleanedResponse = bersihkanMarkdownJSON(rawResponse);

    let aiData: any;
    try {
      aiData = JSON.parse(cleanedResponse);
    } catch (parseError: any) {
      console.error('Gagal parse JSON dari AI, menggunakan fallback:', parseError);
      aiData = buatFallbackJSON(produk, hargaModalPerUnit);
    }

    // Validasi & sanitasi field kritis — paksa tipe yang benar
    // React error #31: AI kadang mengembalikan objek {keuangan, stok, ...}
    // sebagai 'diagnosis' alih-alih string, karena instruksi "dari 4 aspek"
    // disalahartikan AI sebagai struktur objek, bukan teks naratif.
    // Maka kita paksa casting ke string di sini.
    if (typeof aiData.estimasi_harga_jual_baru !== 'number' || aiData.estimasi_harga_jual_baru <= 0) {
      aiData.estimasi_harga_jual_baru = Math.round(hargaModalPerUnit * 1.5);
    }
    if (typeof aiData.jumlah_unit_per_paket !== 'number' || aiData.jumlah_unit_per_paket < 1) {
      aiData.jumlah_unit_per_paket = 1;
    }

    // Diagnosis sekarang berupa objek terstruktur {keuangan, stok, pemasaran, layanan}
    // dari Gemini JSON mode. Pastikan struktur tetap valid, bukan string.
    if (!aiData.diagnosis || typeof aiData.diagnosis === 'string') {
      aiData.diagnosis = {
        keuangan: aiData.diagnosis || "Data diagnosis tidak tersedia.",
        stok: "Data diagnosis tidak tersedia.",
        pemasaran: "Data diagnosis tidak tersedia.",
        layanan: "Data diagnosis tidak tersedia.",
      };
    }

    if (!aiData.nama_ide_pivot) {
      aiData.nama_ide_pivot = `Paket ${produk}`;
    } else if (typeof aiData.nama_ide_pivot === 'object') {
      aiData.nama_ide_pivot = JSON.stringify(aiData.nama_ide_pivot);
    }

    if (!aiData.deskripsi_pivot) {
      aiData.deskripsi_pivot = "Deskripsi tidak tersedia.";
    } else if (typeof aiData.deskripsi_pivot === 'object') {
      aiData.deskripsi_pivot = Object.values(aiData.deskripsi_pivot).join('\n');
    }

    if (!aiData.draft_whatsapp) {
      aiData.draft_whatsapp = `Halo! Yuk cobain ${produk} terbaru dari kami!`;
    } else if (typeof aiData.draft_whatsapp === 'object') {
      aiData.draft_whatsapp = Object.values(aiData.draft_whatsapp).join(' ');
    }

    // --- Hitung finansial via pure function ---
    const hasilFinansial = hitungAnalisisFinansial({
      hargaModalPerUnit,
      jumlahUnitPerPaket: aiData.jumlah_unit_per_paket,
      hargaJualBaru: aiData.estimasi_harga_jual_baru,
    });

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
