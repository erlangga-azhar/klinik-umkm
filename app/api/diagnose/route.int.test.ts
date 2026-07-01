import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';

// =========================================================================
// Integration Test: POST /api/diagnose
// =========================================================================
// Menguji endpoint API secara end-to-end dengan mock @google/generative-ai
// sehingga tidak perlu API key nyata atau koneksi ke Gemini.
// =========================================================================

// Mock @google/generative-ai SEBELUM import modul yang menggunakannya
// Gunakan vi.hoisted() agar variable tersedia saat factory vi.mock() di-hoist
const mockGenerateContent = vi.hoisted(() => vi.fn());

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(function() {
    return {
      getGenerativeModel: vi.fn(function() {
        return {
          generateContent: mockGenerateContent,
        };
      }),
    };
  }),
}));

// Sekarang import — getGenAI() akan return instance dari mock di atas
import { POST } from '@/app/api/diagnose/route';

// Helper: buat mock Request object seperti Next.js
function createMockRequest(body: any): any {
  return {
    json: () => Promise.resolve(body),
  };
}

// Helper: parse response dari NextResponse.json
async function parseResponse(res: Response): Promise<any> {
  const data = await res.json();
  return { status: res.status, data };
}

describe('POST /api/diagnose — Integration Tests', () => {
  beforeAll(() => {
    // Beri API key dummy agar getGenAI() tidak throw
    process.env.GEMINI_API_KEY = 'test-mock-key';
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // Test 1: Valid input → AI mengembalikan JSON dengan diagnosis terstruktur
  // -----------------------------------------------------------------------
  it('mengembalikan response 200 dengan diagnosis terstruktur {keuangan, stok, pemasaran, layanan}', async () => {
    const aiResponse = JSON.stringify({
      diagnosis: {
        keuangan: 'Margin tipis karena HPP terlalu tinggi, kamu subsidi pembeli tiap transaksi.',
        stok: 'Stok bahan baku perlu diatur lebih efisien agar tidak ada sisa hangus.',
        pemasaran: 'Harga jual terlalu murah dibanding kompetitor — naikin value, jangan cuma lomba diskon.',
        layanan: 'Waktu habis untuk bales chat nanyain harga doang. Buat sistem pesan otomatis.',
      },
      nama_ide_pivot: 'Paket Kopi 20 Gelas',
      deskripsi_pivot: 'Jual paket 20 gelas kopi dengan harga spesial langganan.',
      estimasi_harga_jual_baru: 150000,
      jumlah_unit_per_paket: 20,
      draft_whatsapp: 'Halo! Kami punya paket kopi 20 gelas hanya Rp150.000!',
    });

    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => aiResponse },
    });

    const { status, data } = await parseResponse(
      await POST(createMockRequest({
        produk: 'Es Kopi Susu Aren',
        hargaModal: 5000,
        hargaJualLama: 12000,
        keluhan: 'Omzet besar tapi boncos',
      }))
    );

    expect(status).toBe(200);
    expect(data).toHaveProperty('diagnosis');
    // Diagnosis adalah objek terstruktur
    expect(typeof data.diagnosis).toBe('object');
    expect(data.diagnosis).toHaveProperty('keuangan');
    expect(data.diagnosis).toHaveProperty('stok');
    expect(data.diagnosis).toHaveProperty('pemasaran');
    expect(data.diagnosis).toHaveProperty('layanan');
    expect(typeof data.diagnosis.keuangan).toBe('string');
    expect(data.diagnosis.keuangan).toMatch(/margin tipis/i);
    expect(data).toHaveProperty('nama_ide_pivot', 'Paket Kopi 20 Gelas');
    expect(data).toHaveProperty('estimasi_harga_jual_baru', 150000);
    expect(data).toHaveProperty('jumlah_unit_per_paket', 20);
    expect(data).toHaveProperty('total_hpp_paket');
    expect(data).toHaveProperty('analisis_finansial');

    // Validasi kalkulasi finansial
    // total_hpp_paket = 5000 * 20 = 100000
    expect(data.total_hpp_paket).toBe(100000);
    // margin = (150000 - 100000) / 150000 * 100 = 33%
    expect(data.analisis_finansial.margin_persen).toBe(33);
    // keuntungan per paket = 150000 - 100000 = 50000
    expect(data.analisis_finansial.keuntungan_per_paket).toBe(50000);
    // BEP = 1.500.000 / 50.000 = 30
    expect(data.analisis_finansial.target_pelanggan_bep).toBe(30);
  });

  // -----------------------------------------------------------------------
  // Test 2: AI mengembalikan JSON tidak valid → fallback JSON digunakan
  // -----------------------------------------------------------------------
  it('menggunakan fallback ketika AI mengembalikan JSON tidak valid', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => 'Ini bukan JSON sama sekali' },
    });

    const { status, data } = await parseResponse(
      await POST(createMockRequest({
        produk: 'Nasi Goreng',
        hargaModal: 10000,
        hargaJualLama: 20000,
        keluhan: 'Sepi pembeli',
      }))
    );

    expect(status).toBe(200);
    // Fallback menghasilkan estimasi harga jual = 10.000 * 1.5 = 15.000
    expect(data.estimasi_harga_jual_baru).toBe(15000);
    // Fallback: jumlah_unit_per_paket = 1
    expect(data.jumlah_unit_per_paket).toBe(1);
    // total_hpp_paket = 10.000 * 1 = 10.000
    expect(data.total_hpp_paket).toBe(10000);
    // Diagnosis berupa objek terstruktur fallback
    expect(typeof data.diagnosis).toBe('object');
    expect(data.diagnosis).toHaveProperty('keuangan');
    expect(data.diagnosis).toHaveProperty('stok');
    expect(data.diagnosis).toHaveProperty('pemasaran');
    expect(data.diagnosis).toHaveProperty('layanan');
    expect(data.diagnosis.keuangan).toContain('Maaf');
  });

  // -----------------------------------------------------------------------
  // Test 3: AI mengembalikan JSON terbungkus markdown ```json ...
  // -----------------------------------------------------------------------
  it('membersihkan bungkusan markdown ```json dari response AI', async () => {
    const aiResponse = '```json\n{"diagnosis": {"keuangan":"Test keuangan","stok":"Test stok","pemasaran":"Test pemasaran","layanan":"Test layanan"},"nama_ide_pivot": "Paket Test","deskripsi_pivot": "Deskripsi test","estimasi_harga_jual_baru": 100000,"jumlah_unit_per_paket": 5,"draft_whatsapp": "Test WA"}\n```';

    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => aiResponse },
    });

    const { status, data } = await parseResponse(
      await POST(createMockRequest({
        produk: 'Test Produk',
        hargaModal: 20000,
        hargaJualLama: 30000,
        keluhan: 'Test keluhan',
      }))
    );

    expect(status).toBe(200);
    expect(data.nama_ide_pivot).toBe('Paket Test');
    expect(data.jumlah_unit_per_paket).toBe(5);
    expect(data.total_hpp_paket).toBe(100000); // 20.000 * 5
  });

  // -----------------------------------------------------------------------
  // Test 4: Input tidak lengkap → 400 error
  // -----------------------------------------------------------------------
  it('mengembalikan 400 ketika ada field yang kosong', async () => {
    const { status, data } = await parseResponse(
      await POST(createMockRequest({
        produk: 'Es Kopi',
        hargaModal: '',
        hargaJualLama: '',
        keluhan: '',
      }))
    );

    expect(status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('wajib diisi');
  });

  // -----------------------------------------------------------------------
  // Test 5: AI response valid tapi jumlah_unit_per_paket tidak ada
  // -----------------------------------------------------------------------
  it('set default jumlah_unit_per_paket = 1 jika AI tidak mengirimnya', async () => {
    const aiResponse = JSON.stringify({
      diagnosis: {
        keuangan: 'Test keuangan',
        stok: 'Test stok',
        pemasaran: 'Test pemasaran',
        layanan: 'Test layanan',
      },
      nama_ide_pivot: 'Paket Test',
      deskripsi_pivot: 'Test',
      estimasi_harga_jual_baru: 50000,
      draft_whatsapp: 'Test WA',
    });
    // Tidak ada jumlah_unit_per_paket di atas

    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => aiResponse },
    });

    const { status, data } = await parseResponse(
      await POST(createMockRequest({
        produk: 'Test',
        hargaModal: 10000,
        hargaJualLama: 15000,
        keluhan: 'Test',
      }))
    );

    expect(status).toBe(200);
    expect(data.jumlah_unit_per_paket).toBe(1); // default
    expect(data.total_hpp_paket).toBe(10000); // 10.000 * 1
  });

  // -----------------------------------------------------------------------
  // Test 6: AI response dengan estimasi_harga_jual_baru tidak valid (0)
  // -----------------------------------------------------------------------
  it('gunakan fallback estimasi harga jika AI return angka tidak valid', async () => {
    const aiResponse = JSON.stringify({
      diagnosis: {
        keuangan: 'Test keuangan',
        stok: 'Test stok',
        pemasaran: 'Test pemasaran',
        layanan: 'Test layanan',
      },
      nama_ide_pivot: 'Paket Test',
      deskripsi_pivot: 'Test',
      estimasi_harga_jual_baru: 0, // tidak valid
      jumlah_unit_per_paket: 10,
      draft_whatsapp: 'Test WA',
    });

    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => aiResponse },
    });

    const { status, data } = await parseResponse(
      await POST(createMockRequest({
        produk: 'Test',
        hargaModal: 10000,
        hargaJualLama: 20000,
        keluhan: 'Test',
      }))
    );

    expect(status).toBe(200);
    // Fallback: 10.000 * 1.5 = 15.000
    expect(data.estimasi_harga_jual_baru).toBe(15000);
    // jumlah_unit_per_paket tetap 10 karena valid
    expect(data.jumlah_unit_per_paket).toBe(10);
  });

  // -----------------------------------------------------------------------
  // Test 7: response mengandung semua field kritis yang dibutuhkan frontend
  // -----------------------------------------------------------------------
  it('response mengandung semua field yang dibutuhkan frontend', async () => {
    const aiResponse = JSON.stringify({
      diagnosis: {
        keuangan: 'Test keuangan',
        stok: 'Test stok',
        pemasaran: 'Test pemasaran',
        layanan: 'Test layanan',
      },
      nama_ide_pivot: 'Paket Premium',
      deskripsi_pivot: 'Deskripsi paket premium',
      estimasi_harga_jual_baru: 200000,
      jumlah_unit_per_paket: 10,
      draft_whatsapp: 'Coba paket premium kami!',
    });

    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => aiResponse },
    });

    const { data } = await parseResponse(
      await POST(createMockRequest({
        produk: 'Premium',
        hargaModal: 15000,
        hargaJualLama: 25000,
        keluhan: 'Test premium',
      }))
    );

    // Field dari AI
    expect(data).toHaveProperty('diagnosis');
    expect(data).toHaveProperty('nama_ide_pivot');
    expect(data).toHaveProperty('deskripsi_pivot');
    expect(data).toHaveProperty('estimasi_harga_jual_baru');
    expect(data).toHaveProperty('jumlah_unit_per_paket');
    expect(data).toHaveProperty('draft_whatsapp');

    // Field dari kalkulator finansial (pure function)
    expect(data).toHaveProperty('total_hpp_paket');
    expect(data).toHaveProperty('analisis_finansial');
    expect(data.analisis_finansial).toHaveProperty('margin_persen');
    expect(data.analisis_finansial).toHaveProperty('keuntungan_per_paket');
    expect(data.analisis_finansial).toHaveProperty('target_pelanggan_bep');
  });
});
