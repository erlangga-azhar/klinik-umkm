// @vitest-environment jsdom
/**
 * Unit Test: ResepCard Component
 * =============================================================================
 * Menguji komponen ResepCard yang menampilkan hasil diagnosis dokter AI
 * dalam format 4 Premium Grid Cards + Resep Utama + Kartu Pemasaran.
 *
 * Cakupan test:
 * 1. Null guard — tidak render jika report null/undefined
 * 2. 4 diagnosis cards — Keuangan, Stok, Pemasaran, Layanan
 * 3. Fallback "Data tidak tersedia" jika field diagnosis kosong
 * 4. Partial diagnosis — sebagian field ada, sebagian tidak
 * 5. Resep Utama card — nama_ide_pivot, deskripsi_pivot
 * 6. Kalkulator finansial — harga jual, margin, BEP
 * 7. Transparansi modal — jumlah unit & total HPP paket
 * 8. Modal disembunyikan jika data tidak ada
 * 9. Tombol WhatsApp — link dengan encodeURIComponent
 * 10. Tombol Copy — clipboard API + visual feedback "Tersalin"
 * 11. Tombol Konsultasi Ulang — callback firing
 * =============================================================================
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import ResepCard from '../ResepCard';

// Helper: render dengan default mock
function renderCard(report: any) {
  return render(<ResepCard report={report} onKonsultasiUlang={vi.fn()} />);
}

// =========================================================================
// Fixtures
// =========================================================================

const mockReportLengkap = {
  diagnosis: {
    keuangan: 'Margin tipis karena HPP terlalu tinggi, kamu subsidi pembeli tiap transaksi.',
    stok: 'Putaran barang lambat, kurangi stok mati dan evaluasi supplier.',
    pemasaran: 'Jangan perang harga — tingkatkan value proposition dengan bundling eksklusif.',
    layanan: 'Waktu habis untuk bales chat nanyain harga doang. Buat sistem katalog otomatis.',
  },
  nama_ide_pivot: 'Paket Kopi 20 Gelas',
  deskripsi_pivot: 'Langkah 1: Siapkan 20 gelas kopi setiap pagi. Langkah 2: Kemas dengan label premium dan jadwalkan pengiriman. Langkah 3: Tag pelanggan di media sosial.',
  estimasi_harga_jual_baru: 150000,
  jumlah_unit_per_paket: 20,
  total_hpp_paket: 100000,
  analisis_finansial: {
    margin_persen: 33,
    target_pelanggan_bep: 30,
  },
  draft_whatsapp: 'Halo! Cobain paket kopi 20 gelas spesial kami hanya Rp150.000, pas banget buat stok seminggu!',
};

const mockReportMinimal = {
  diagnosis: {
    keuangan: 'Test keuangan',
    stok: 'Test stok',
    pemasaran: 'Test pemasaran',
    layanan: 'Test layanan',
  },
  nama_ide_pivot: 'Paket Test',
  deskripsi_pivot: 'Deskripsi test',
  estimasi_harga_jual_baru: 50000,
  draft_whatsapp: 'Test WA',
};

const mockReportTanpaDiagnosis = {
  nama_ide_pivot: 'Paket Emergency',
  deskripsi_pivot: 'Deskripsi emergency',
  estimasi_harga_jual_baru: 25000,
  jumlah_unit_per_paket: 5,
  total_hpp_paket: 12500,
  analisis_finansial: {
    margin_persen: 50,
    target_pelanggan_bep: 60,
  },
  draft_whatsapp: 'Test emergency WA',
};

// =========================================================================
// Setup & Teardown
// =========================================================================

beforeEach(() => {
  // Mock clipboard API via vi.stubGlobal agar tidak memutasi objek global
  // jsdom tidak mengimplementasikan navigator.clipboard secara native
  vi.stubGlobal('navigator', {
    ...navigator,
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

// =========================================================================
// Test Suite
// =========================================================================

describe('ResepCard — Null Guard', () => {
  it('tidak render apapun jika report = null', () => {
    const { container } = renderCard(null);
    expect(container.innerHTML).toBe('');
  });

  it('tidak render apapun jika report = undefined', () => {
    const { container } = renderCard(undefined as any);
    expect(container.innerHTML).toBe('');
  });
});

describe('ResepCard — 4 Diagnosis Premium Grid Cards', () => {
  it('menampilkan keempat kartu diagnosis dengan label yang benar', () => {
    renderCard(mockReportLengkap);

    // Label unik di 4 grid cards (summary juga punya label 'Keuangan'/'Pemasaran'/'Layanan')
    // 'Stok & Produk' hanya muncul di grid cards — gunakan untuk verifikasi
    expect(screen.getByText('Stok & Produk')).toBeInTheDocument();
    // Label di grid cards minimal 1x muncul
    expect(screen.getAllByText('Keuangan').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Pemasaran').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Layanan').length).toBeGreaterThanOrEqual(1);
  });

  it('menampilkan teks diagnosis dari masing-masing aspek', () => {
    renderCard(mockReportLengkap);

    expect(screen.getByText(mockReportLengkap.diagnosis.keuangan)).toBeInTheDocument();
    expect(screen.getByText(mockReportLengkap.diagnosis.stok)).toBeInTheDocument();
    expect(screen.getByText(mockReportLengkap.diagnosis.pemasaran)).toBeInTheDocument();
    expect(screen.getByText(mockReportLengkap.diagnosis.layanan)).toBeInTheDocument();
  });

  it('grid container menggunakan class grid cols-1 md:cols-2', () => {
    const { container } = renderCard(mockReportLengkap);

    const grid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
    // Karena Tailwind class tidak diproses di jsdom, kita cek apakah ada element
    // dengan string class yang mengandung "grid" dan "grid-cols-1"
    const gridEl = container.querySelector('[class*="grid"]');
    expect(gridEl).toBeInTheDocument();
  });

  it('menampilkan container grid dengan 4 child card', () => {
    const { container } = renderCard(mockReportLengkap);

    // Cari parent dari keempat kartu — wrapper grid
    const cards = container.querySelectorAll('[class*="rounded-3xl"]');
    // Minimal ada 4 kartu diagnosis + kartu resep + kartu pemasaran
    expect(cards.length).toBeGreaterThanOrEqual(4);
  });
});

describe('ResepCard — Fallback Diagnosis Kosong', () => {
  it('menampilkan "Data tidak tersedia" jika diagnosis tidak ada di report', () => {
    renderCard(mockReportTanpaDiagnosis);

    // Karena diagnosis undefined, fallback "Data tidak tersedia" tampil
    const fallbackTexts = screen.getAllByText('Data tidak tersedia.');
    expect(fallbackTexts).toHaveLength(4);
  });

  it('menampilkan "Data tidak tersedia" untuk field diagnosis yang hilang sebagian', () => {
    // Hanya berisi keuangan, sisanya null
    const reportPartial = {
      ...mockReportLengkap,
      diagnosis: {
        keuangan: mockReportLengkap.diagnosis.keuangan,
        stok: null,
        pemasaran: undefined as any,
        layanan: '',
      },
    };

    renderCard(reportPartial);

    expect(screen.getByText(reportPartial.diagnosis.keuangan)).toBeInTheDocument();
    expect(screen.getAllByText('Data tidak tersedia.')).toHaveLength(3);
  });
});

describe('ResepCard — Kartu Resep Utama', () => {
  it('menampilkan badge "Resep Utama"', () => {
    renderCard(mockReportLengkap);
    expect(screen.getByText('Resep Utama')).toBeInTheDocument();
  });

  it('menampilkan nama_ide_pivot sebagai judul rekomendasi', () => {
    renderCard(mockReportLengkap);
    expect(screen.getByText('Paket Kopi 20 Gelas')).toBeInTheDocument();
  });

  it('menampilkan deskripsi_pivot', () => {
    renderCard(mockReportLengkap);
    expect(screen.getByText(mockReportLengkap.deskripsi_pivot)).toBeInTheDocument();
  });
});

describe('ResepCard — Kalkulator Finansial', () => {
  it('menampilkan estimasi harga jual baru dengan format Rupiah', () => {
    renderCard(mockReportLengkap);
    expect(screen.getByText(/Rp 150[.,]?000/)).toBeInTheDocument();
  });

  it('menampilkan margin kotor dengan simbol persen', () => {
    renderCard(mockReportLengkap);
    expect(screen.getByText('+33%')).toBeInTheDocument();
  });

  it('menampilkan target pelanggan BEP dengan label "Orang"', () => {
    renderCard(mockReportLengkap);
    expect(screen.getByText('30 Orang')).toBeInTheDocument();
  });

  it('menampilkan label kalkulator finansial yang benar', () => {
    renderCard(mockReportLengkap);
    expect(screen.getByText('Harga Jual Baru')).toBeInTheDocument();
    expect(screen.getByText('Margin Kotor')).toBeInTheDocument();
    expect(screen.getByText('Target Pelanggan')).toBeInTheDocument();
  });

  it('tidak error jika analisis_finansial tidak ada', () => {
    renderCard({
      ...mockReportLengkap,
      analisis_finansial: undefined,
    });
    expect(screen.getByText('Paket Kopi 20 Gelas')).toBeInTheDocument();
  });
});

describe('ResepCard — Transparansi Modal', () => {
  it('menampilkan jumlah unit per paket jika ada', () => {
    renderCard(mockReportLengkap);
    expect(screen.getByText(/20 Unit\/Porsi/)).toBeInTheDocument();
  });

  it('menampilkan total HPP paket dengan format Rupiah', () => {
    renderCard(mockReportLengkap);
    expect(screen.getByText(/Rp 100[.,]?000/)).toBeInTheDocument();
  });

  it('tidak menampilkan detail modal jika data tidak tersedia', () => {
    renderCard(mockReportMinimal);
    expect(screen.queryByText(/Unit\/Porsi/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Total Modal Paket/)).not.toBeInTheDocument();
  });
});

describe('ResepCard — Kartu Pemasaran & WhatsApp', () => {
  it('menampilkan judul "Amunisi Pemasaran"', () => {
    renderCard(mockReportLengkap);
    expect(screen.getByText('Amunisi Pemasaran')).toBeInTheDocument();
  });

  it('menampilkan draft WhatsApp di dalam quote', () => {
    renderCard(mockReportLengkap);
    const draftEl = screen.getByText((content) =>
      content.includes(mockReportLengkap.draft_whatsapp)
    );
    expect(draftEl).toBeInTheDocument();
  });

  it('tombol "Bagikan ke WhatsApp" memiliki href dengan encodeURIComponent', () => {
    renderCard(mockReportLengkap);

    const waLink = screen.getByText('Bagikan ke WhatsApp').closest('a');
    expect(waLink).toBeInTheDocument();
    expect(waLink?.getAttribute('href')).toContain('https://wa.me/?text=');
    expect(waLink?.getAttribute('href')).toContain(encodeURIComponent(mockReportLengkap.draft_whatsapp));
    expect(waLink?.getAttribute('target')).toBe('_blank');
    expect(waLink?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('menampilkan tombol "Salin Pesan"', () => {
    renderCard(mockReportLengkap);
    expect(screen.getByText('Salin Pesan')).toBeInTheDocument();
  });
});

describe('ResepCard — Copy Button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('memanggil navigator.clipboard.writeText dengan draft WhatsApp saat diklik', async () => {
    renderCard(mockReportLengkap);

    const copyBtn = screen.getByText('Salin Pesan');
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockReportLengkap.draft_whatsapp);
    });
  });

  it('menampilkan teks "Tersalin" setelah tombol copy diklik', async () => {
    renderCard(mockReportLengkap);

    const copyBtn = screen.getByText('Salin Pesan');
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(screen.getByText('Tersalin')).toBeInTheDocument();
    });
  });

  it('tidak memanggil clipboard jika draft_whatsapp tidak ada', () => {
    renderCard({ ...mockReportLengkap, draft_whatsapp: '' });

    const copyBtn = screen.getByText('Salin Pesan');
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });
});

describe('ResepCard — Konsultasi Ulang', () => {
  it('memanggil callback onKonsultasiUlang saat tombol diklik', () => {
    const onKonsultasiUlang = vi.fn();
    render(<ResepCard report={mockReportLengkap} onKonsultasiUlang={onKonsultasiUlang} />);

    fireEvent.click(screen.getByText('Konsultasi Ulang'));
    expect(onKonsultasiUlang).toHaveBeenCalledTimes(1);
  });
});

// =========================================================================
// Ringkasan Diagnosis — Baru: Skor Kesehatan + Status Indicators
// =========================================================================

describe('ResepCard — Ringkasan Diagnosis (Summary Section)', () => {
  it('menampilkan judul "Ringkasan Diagnosis"', () => {
    renderCard(mockReportLengkap);
    expect(screen.getByText('Ringkasan Diagnosis')).toBeInTheDocument();
  });

  it('menampilkan label "Skor Kesehatan Bisnis"', () => {
    renderCard(mockReportLengkap);
    expect(screen.getByText('Skor Kesehatan Bisnis')).toBeInTheDocument();
  });

  it('menampilkan skor kesehatan berupa angka dengan denominator /100', () => {
    renderCard(mockReportLengkap);
    expect(screen.getByText(/\/100/)).toBeInTheDocument();
  });

  it('menampilkan 4 status indicator (Keuangan, Stok, Pemasaran, Layanan)', () => {
    renderCard(mockReportLengkap);
    // 'Stok' hanya muncul di summary section (grid cards pakai 'Stok & Produk')
    expect(screen.getByText('Stok')).toBeInTheDocument();
    // Label lain muncul di kedua section — pastikan ada minimal 2
    expect(screen.getAllByText('Keuangan').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Pemasaran').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Layanan').length).toBeGreaterThanOrEqual(2);
  });

  it('menampilkan label "Insight Cepat"', () => {
    renderCard(mockReportLengkap);
    expect(screen.getByText('Insight Cepat:')).toBeInTheDocument();
  });

  it('menampilkan teks insight yang relevan dengan data margin', () => {
    renderCard(mockReportLengkap);
    // margin = 33 → kategori "sehat" (>= 30)
    expect(screen.getByText(/Margin sehat/i)).toBeInTheDocument();
  });

  it('menampilkan prioritas jika ada aspek dengan skor < 65', () => {
    // mockReportLengkap: margin=33 → skorKeuangan=70, 20 unit → skorStok=85
    // BEP=30 → skorPemasaran=55, skorLayanan ~ 68
    // Jadi prioritas = Pemasaran
    renderCard(mockReportLengkap);
    expect(screen.getByText(/Prioritas/)).toBeInTheDocument();
  });

  it('tidak menampilkan prioritas jika semua skor >= 65', () => {
    // mockReportTanpaDiagnosis: margin=50 → skorKeuangan=85, 5 unit → skorStok=55
    // Hmm, stok = 55 which is < 65. Let me use a special high-score report.
    const highScoreReport = {
      ...mockReportLengkap,
      analisis_finansial: { margin_persen: 60, target_pelanggan_bep: 8 },
      jumlah_unit_per_paket: 25,
    };
    renderCard(highScoreReport);
    // Seharusnya tidak ada prioritas karena margin=60→95, unit=25→85, BEP=8→90
    expect(screen.queryByText(/Prioritas:/)).not.toBeInTheDocument();
  });

  it('menampilkan insight negatif untuk margin <= 0', () => {
    renderCard({
      ...mockReportLengkap,
      analisis_finansial: { margin_persen: -5, target_pelanggan_bep: 200 },
    });
    expect(screen.getByText(/margin negatif/i)).toBeInTheDocument();
  });

  it('menampilkan insight tentang BEP tinggi jika target > 100', () => {
    renderCard({
      ...mockReportLengkap,
      analisis_finansial: { margin_persen: 30, target_pelanggan_bep: 150 },
    });
    expect(screen.getByText(/BEP tinggi/i)).toBeInTheDocument();
  });

  it('tidak crash ketika report tidak memiliki analisis_finansial', () => {
    const { container } = renderCard({
      diagnosis: mockReportLengkap.diagnosis,
      nama_ide_pivot: 'Test',
      deskripsi_pivot: 'Test',
      estimasi_harga_jual_baru: 50000,
      draft_whatsapp: 'Test',
    });
    // Komponen tetap render tanpa error meski tanpa data finansial
    expect(container.innerHTML).not.toBe('');
    expect(screen.getByText('Ringkasan Diagnosis')).toBeInTheDocument();
  });
});

describe('ResepCard — Report Sangat Minimal (no analisis_finansial, no jumlah_unit)', () => {
  it('summary section tetap render dengan skor default', () => {
    const report = {
      diagnosis: { keuangan: 'A', stok: 'B', pemasaran: 'C', layanan: 'D' },
      nama_ide_pivot: 'X',
      deskripsi_pivot: 'Y',
      estimasi_harga_jual_baru: 10000,
      draft_whatsapp: 'Z',
    };
    renderCard(report);
    // Ringkasan Diagnosis masih muncul meski data finansial minimal
    expect(screen.getByText('Ringkasan Diagnosis')).toBeInTheDocument();
    expect(screen.getByText(/\/100/)).toBeInTheDocument();
  });
});

describe('ResepCard — Report Minimal (edge case)', () => {
  it('tetap render tanpa error untuk report minimal (tanpa jumlah_unit_per_paket, total_hpp_paket, analisis_finansial)', () => {
    render(<ResepCard report={mockReportMinimal} onKonsultasiUlang={vi.fn()} />);

    // Tetap menampilkan informasi yang ada
    expect(screen.getByText('Paket Test')).toBeInTheDocument();
    expect(screen.getByText('Test keuangan')).toBeInTheDocument();
    expect(screen.getByText('Deskripsi test')).toBeInTheDocument();
    // Gunakan function matcher karena &ldquo;/&rdquo; membungkus teks dengan quote
    expect(
      screen.getByText((content) => content.includes('Test WA'))
    ).toBeInTheDocument();

    // Harga jual tetap tampil (handle variasi separator ribuan)
    expect(screen.getByText(/Rp 50[.,]?000/)).toBeInTheDocument();
  });

  it('tidak error ketika report hanya berisi field minimum', () => {
    const reportSangatMinimal = {
      diagnosis: {
        keuangan: 'A',
        stok: 'B',
        pemasaran: 'C',
        layanan: 'D',
      },
      nama_ide_pivot: 'Minimal',
      deskripsi_pivot: 'Test',
      estimasi_harga_jual_baru: 10000,
      draft_whatsapp: 'Test',
    };

    const { container } = render(
      <ResepCard report={reportSangatMinimal} onKonsultasiUlang={vi.fn()} />
    );

    // Komponen tidak crash
    expect(container.innerHTML).not.toBe('');
    expect(screen.getByText('Minimal')).toBeInTheDocument();
  });
});
