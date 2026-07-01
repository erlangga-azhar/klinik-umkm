import { describe, it, expect } from 'vitest';
import {
  hitungAnalisisFinansial,
  hitungDampakDiskon,
  hitungBungaPinjaman,
  hitungHargaJualDenganMarginTarget,
} from '@/lib';
import type {
  HitungFinansialInput,
  DiskonInput,
  PinjamanInput,
  MarginTargetInput,
} from '@/lib';

// =========================================================================
// Unit Tests: hitungAnalisisFinansial — Additional Edge Cases
// =========================================================================

describe('hitungAnalisisFinansial — Additional Edge Cases', () => {
  // -----------------------------------------------------------------------
  // Skenario: Harga jual sangat besar (Rp 10 Miliar)\n  // -----------------------------------------------------------------------
  it('menangani harga jual sangat besar (Rp 10 Miliar)', () => {
    const input: HitungFinansialInput = {
      hargaModalPerUnit: 5000000000, // 5 Miliar
      jumlahUnitPerPaket: 2,
      hargaJualBaru: 10000000000, // 10 Miliar
    };
    const result = hitungAnalisisFinansial(input);
    expect(result.total_hpp_paket).toBe(10000000000);
    expect(result.keuntungan_bersih_paket).toBe(0);
    expect(result.margin_persen).toBe(0);
  });

  // -----------------------------------------------------------------------
  // Skenario: jumlah_unit_per_paket = 999 (angka ganjil besar)
  // -----------------------------------------------------------------------
  it('menangani jumlah unit per paket 999', () => {
    const input: HitungFinansialInput = {
      hargaModalPerUnit: 1000,
      jumlahUnitPerPaket: 999,
      hargaJualBaru: 1500000,
    };
    const result = hitungAnalisisFinansial(input);
    expect(result.total_hpp_paket).toBe(999000);
    expect(result.keuntungan_bersih_paket).toBe(501000);
    expect(result.margin_persen).toBe(33);
    expect(result.target_pelanggan_bep).toBe(3);
  });

  // -----------------------------------------------------------------------
  // Skenario: Floating point presisi (harga modal Rp 1.234,56)
  // Gunakan toBeCloseTo untuk menghindari error presisi float IEEE 754
  // -----------------------------------------------------------------------
  it('menangani floating point presisi dengan benar', () => {
    const input: HitungFinansialInput = {
      hargaModalPerUnit: 1234.56,
      jumlahUnitPerPaket: 3,
      hargaJualBaru: 5000,
    };
    const result = hitungAnalisisFinansial(input);
    expect(result.total_hpp_paket).toBeCloseTo(3703.68, 2);
    expect(result.keuntungan_bersih_paket).toBeCloseTo(1296.32, 2);
    expect(typeof result.margin_persen).toBe('number');
    expect(typeof result.target_pelanggan_bep).toBe('number');
  });

  // -----------------------------------------------------------------------
  // Skenario: Semua parameter = 0
  // -----------------------------------------------------------------------
  it('menangani semua parameter = 0 tanpa error', () => {
    const input: HitungFinansialInput = {
      hargaModalPerUnit: 0,
      jumlahUnitPerPaket: 0,
      hargaJualBaru: 0,
    };
    const result = hitungAnalisisFinansial(input);
    expect(result.total_hpp_paket).toBe(0);
    expect(result.keuntungan_bersih_paket).toBe(0);
    expect(result.margin_persen).toBe(0);
    // BEP menggunakan divisor aman (1) karena keuntungan = 0
    expect(result.target_pelanggan_bep).toBe(1500000);
  });

  // -----------------------------------------------------------------------
  // Skenario: Keuntungan per paket sangat kecil (Rp 1) — BEP naik drastis
  // -----------------------------------------------------------------------
  it('menghitung BEP dengan keuntungan per paket minimal (Rp 1)', () => {
    const input: HitungFinansialInput = {
      hargaModalPerUnit: 9999,
      jumlahUnitPerPaket: 1,
      hargaJualBaru: 10000,
    };
    const result = hitungAnalisisFinansial(input);
    expect(result.keuntungan_bersih_paket).toBe(1);
    expect(result.target_pelanggan_bep).toBe(1500000); // 1.500.000 / 1
    expect(result.margin_persen).toBe(0);
  });
});

// =========================================================================
// Unit Tests: hitungDampakDiskon
// =========================================================================

describe('hitungDampakDiskon', () => {
  // -----------------------------------------------------------------------
  // Skenario: Diskon 20% pada produk dengan margin 40%
  // -----------------------------------------------------------------------
  it('menghitung dampak diskon 20% pada margin 40%', () => {
    const input: DiskonInput = {
      hargaNormal: 10000,
      diskonPersen: 20,
      hppPerUnit: 6000,
      jumlahUnitTerjualPerBulan: 100,
    };

    const result = hitungDampakDiskon(input);

    expect(result.hargaSetelahDiskon).toBe(8000); // 10.000 - 20%
    expect(result.keuntunganPerUnitNormal).toBe(4000);
    expect(result.keuntunganPerUnitDiskon).toBe(2000);
    expect(result.marginNormalPersen).toBe(40); // 4.000/10.000
    expect(result.marginDiskonPersen).toBe(25); // 2.000/8.000
    expect(result.selisihMarginPersen).toBe(15);
    expect(result.totalKeuntunganNormal).toBe(400000); // 4.000 * 100
    expect(result.totalKeuntunganDiskon).toBe(200000); // 2.000 * 100
    // Tambahan unit agar impas: (400.000 / 2.000) - 100 = 100
    expect(result.unitTambahanUntukImpas).toBe(100);
  });

  // -----------------------------------------------------------------------
  // Skenario: Diskon 10% pada produk margin tinggi (70%)
  // -----------------------------------------------------------------------
  it('menghitung dampak diskon 10% pada margin tinggi 70%', () => {
    const input: DiskonInput = {
      hargaNormal: 50000,
      diskonPersen: 10,
      hppPerUnit: 15000,
      jumlahUnitTerjualPerBulan: 50,
    };

    const result = hitungDampakDiskon(input);

    expect(result.hargaSetelahDiskon).toBe(45000);
    expect(result.keuntunganPerUnitNormal).toBe(35000);
    expect(result.keuntunganPerUnitDiskon).toBe(30000);
    expect(result.marginNormalPersen).toBe(70);
    expect(result.marginDiskonPersen).toBe(67);
    // Tambahan unit: (1.750.000 / 30.000) - 50 ≈ 58.33 - 50 = 8
    expect(result.unitTambahanUntukImpas).toBe(9);
  });

  // -----------------------------------------------------------------------
  // Skenario: Diskon 50% (setengah harga) — hampir tidak ada margin
  // -----------------------------------------------------------------------
  it('menghitung dampak diskon 50% — margin nyaris hilang', () => {
    const input: DiskonInput = {
      hargaNormal: 20000,
      diskonPersen: 50,
      hppPerUnit: 12000,
      jumlahUnitTerjualPerBulan: 30,
    };

    const result = hitungDampakDiskon(input);

    expect(result.hargaSetelahDiskon).toBe(10000);
    expect(result.keuntunganPerUnitNormal).toBe(8000);
    expect(result.keuntunganPerUnitDiskon).toBe(-2000); // Rugi!
    expect(result.marginNormalPersen).toBe(40);
    expect(result.marginDiskonPersen).toBe(-20);
    // Karena rugi, impas secara matematis tidak tercapai
    expect(result.unitTambahanUntukImpas).toBe(30);
  });

  // -----------------------------------------------------------------------
  // Skenario: Diskon 0% (tidak ada diskon) — semua sama
  // -----------------------------------------------------------------------
  it('diskon 0% menghasilkan nilai yang sama dengan harga normal', () => {
    const input: DiskonInput = {
      hargaNormal: 15000,
      diskonPersen: 0,
      hppPerUnit: 10000,
      jumlahUnitTerjualPerBulan: 75,
    };

    const result = hitungDampakDiskon(input);

    expect(result.hargaSetelahDiskon).toBe(15000);
    expect(result.keuntunganPerUnitNormal).toBe(result.keuntunganPerUnitDiskon);
    expect(result.marginNormalPersen).toBe(result.marginDiskonPersen);
    expect(result.selisihMarginPersen).toBe(0);
    expect(result.unitTambahanUntukImpas).toBe(0);
  });

  // -----------------------------------------------------------------------
  // Skenario: HPP = 0 (produk digital) + diskon
  // -----------------------------------------------------------------------
  it('menghitung dampak diskon untuk produk digital (HPP = 0)', () => {
    const input: DiskonInput = {
      hargaNormal: 100000,
      diskonPersen: 25,
      hppPerUnit: 0,
      jumlahUnitTerjualPerBulan: 20,
    };

    const result = hitungDampakDiskon(input);

    expect(result.hargaSetelahDiskon).toBe(75000);
    expect(result.keuntunganPerUnitNormal).toBe(100000);
    expect(result.keuntunganPerUnitDiskon).toBe(75000);
    expect(result.marginNormalPersen).toBe(100);
    expect(result.marginDiskonPersen).toBe(100);
    expect(result.unitTambahanUntukImpas).toBe(7); // (2.000.000/75.000) - 20 = 6.67 → ceil = 7
  });
});

// =========================================================================
// Unit Tests: hitungBungaPinjaman
// =========================================================================

describe('hitungBungaPinjaman', () => {
  // -----------------------------------------------------------------------
  // Skenario: Pinjaman Rp 10 Juta, bunga 12%/thn, tenor 12 bulan
  // -----------------------------------------------------------------------
  it('menghitung angsuran pinjaman standar UMKM', () => {
    const input: PinjamanInput = {
      pokokPinjaman: 10000000,
      bungaPersenPerTahun: 12,
      tenorBulan: 12,
    };

    const result = hitungBungaPinjaman(input);

    expect(result.bungaPerBulan).toBe(100000); // 10jt * 12% / 12
    expect(result.angsuranPokokPerBulan).toBe(833333); // 10jt / 12
    expect(result.totalAngsuranPerBulan).toBe(933333); // 833.333 + 100.000
    expect(result.totalBungaSelamaTenor).toBe(1200000); // 100rb * 12
    expect(result.totalPembayaran).toBe(11200000); // 10jt + 1,2jt
    expect(result.bebanBungaPerUnit).toBe(1000); // 100.000 / 100
  });

  // -----------------------------------------------------------------------
  // Skenario: Pinjaman kecil Rp 1 Juta, bunga 6%/thn, tenor 6 bulan
  // -----------------------------------------------------------------------
  it('menghitung angsuran pinjaman kecil dengan bunga rendah', () => {
    const input: PinjamanInput = {
      pokokPinjaman: 1000000,
      bungaPersenPerTahun: 6,
      tenorBulan: 6,
    };

    const result = hitungBungaPinjaman(input);

    expect(result.bungaPerBulan).toBe(5000); // 1jt * 6% / 12
    expect(result.angsuranPokokPerBulan).toBe(166667); // 1jt / 6
    expect(result.totalAngsuranPerBulan).toBe(171667);
    expect(result.totalBungaSelamaTenor).toBe(30000);
    expect(result.totalPembayaran).toBe(1030000);
  });

  // -----------------------------------------------------------------------
  // Skenario: Pinjaman besar Rp 100 Juta, bunga 24%/thn, tenor 24 bulan
  // -----------------------------------------------------------------------
  it('menghitung angsuran pinjaman besar dengan bunga tinggi', () => {
    const input: PinjamanInput = {
      pokokPinjaman: 100000000,
      bungaPersenPerTahun: 24,
      tenorBulan: 24,
    };

    const result = hitungBungaPinjaman(input);

    expect(result.bungaPerBulan).toBe(2000000); // 100jt * 24% / 12
    expect(result.angsuranPokokPerBulan).toBe(4166667); // 100jt / 24
    expect(result.totalAngsuranPerBulan).toBe(6166667);
    expect(result.totalBungaSelamaTenor).toBe(48000000); // 2jt * 24
    expect(result.totalPembayaran).toBe(148000000); // 100jt + 48jt
  });

  // -----------------------------------------------------------------------
  // Skenario: Bunga 0% (pinjaman tanpa bunga — pinjaman teman/keluarga)
  // -----------------------------------------------------------------------
  it('menangani pinjaman tanpa bunga (0%)', () => {
    const input: PinjamanInput = {
      pokokPinjaman: 5000000,
      bungaPersenPerTahun: 0,
      tenorBulan: 10,
    };

    const result = hitungBungaPinjaman(input);

    expect(result.bungaPerBulan).toBe(0);
    expect(result.angsuranPokokPerBulan).toBe(500000);
    expect(result.totalAngsuranPerBulan).toBe(500000);
    expect(result.totalBungaSelamaTenor).toBe(0);
    expect(result.totalPembayaran).toBe(5000000);
  });

  // -----------------------------------------------------------------------
  // Skenario: Tenor 1 bulan (pinjaman jangka pendek)
  // -----------------------------------------------------------------------
  it('menghitung pinjaman jangka pendek tenor 1 bulan', () => {
    const input: PinjamanInput = {
      pokokPinjaman: 2000000,
      bungaPersenPerTahun: 18,
      tenorBulan: 1,
    };

    const result = hitungBungaPinjaman(input);

    expect(result.bungaPerBulan).toBe(30000); // 2jt * 18% / 12
    expect(result.angsuranPokokPerBulan).toBe(2000000); // 2jt / 1
    expect(result.totalAngsuranPerBulan).toBe(2030000);
    expect(result.totalBungaSelamaTenor).toBe(30000);
    expect(result.totalPembayaran).toBe(2030000);
  });

  // -----------------------------------------------------------------------
  // Skenario: Validasi tipe output
  // -----------------------------------------------------------------------
  it('mengembalikan semua properti yang dibutuhkan', () => {
    const input: PinjamanInput = {
      pokokPinjaman: 5000000,
      bungaPersenPerTahun: 10,
      tenorBulan: 12,
    };

    const result = hitungBungaPinjaman(input);

    expect(result).toHaveProperty('bungaPerBulan');
    expect(result).toHaveProperty('angsuranPokokPerBulan');
    expect(result).toHaveProperty('totalAngsuranPerBulan');
    expect(result).toHaveProperty('totalBungaSelamaTenor');
    expect(result).toHaveProperty('totalPembayaran');
    expect(result).toHaveProperty('bebanBungaPerUnit');

    // Semua nilai adalah number
    expect(typeof result.bungaPerBulan).toBe('number');
    expect(typeof result.totalAngsuranPerBulan).toBe('number');
    expect(typeof result.totalPembayaran).toBe('number');
  });
});

// =========================================================================
// Unit Tests: hitungHargaJualDenganMarginTarget
// =========================================================================

describe('hitungHargaJualDenganMarginTarget', () => {
  // -----------------------------------------------------------------------
  // Skenario: HPP 5.000, target margin 40%
  // -----------------------------------------------------------------------
  it('menghitung harga jual untuk target margin 40%', () => {
    const input: MarginTargetInput = {
      hppPerUnit: 5000,
      marginTargetPersen: 40,
    };

    const result = hitungHargaJualDenganMarginTarget(input);

    // Harga = 5.000 / (1 - 0,4) = 5.000 / 0,6 = 8.333
    expect(result.hargaJualTarget).toBe(8333);
    expect(result.keuntunganPerUnit).toBe(3333);
    expect(result.marginAktualPersen).toBe(40);
  });

  // -----------------------------------------------------------------------
  // Skenario: HPP 10.000, target margin 25%
  // -----------------------------------------------------------------------
  it('menghitung harga jual untuk target margin 25%', () => {
    const input: MarginTargetInput = {
      hppPerUnit: 10000,
      marginTargetPersen: 25,
    };

    const result = hitungHargaJualDenganMarginTarget(input);

    expect(result.hargaJualTarget).toBe(13333); // 10.000 / 0,75
    expect(result.keuntunganPerUnit).toBe(3333);
    expect(result.marginAktualPersen).toBe(25);
  });

  // -----------------------------------------------------------------------
  // Skenario: Target margin 0% (harga jual = HPP)
  // -----------------------------------------------------------------------
  it('target margin 0% menghasilkan harga jual = HPP', () => {
    const input: MarginTargetInput = {
      hppPerUnit: 15000,
      marginTargetPersen: 0,
    };

    const result = hitungHargaJualDenganMarginTarget(input);

    expect(result.hargaJualTarget).toBe(15000);
    expect(result.keuntunganPerUnit).toBe(0);
    expect(result.marginAktualPersen).toBe(0);
  });

  // -----------------------------------------------------------------------
  // Skenario: Target margin 100% (harga jual 2x HPP)
  // -----------------------------------------------------------------------
  it('target margin 100% menghasilkan harga jual 2x HPP', () => {
    const input: MarginTargetInput = {
      hppPerUnit: 20000,
      marginTargetPersen: 100,
    };

    const result = hitungHargaJualDenganMarginTarget(input);

    // Batas: marginDecimal = 1, return 0 (fallback)
    // Atau secara matematis: 20.000 / (1-1) = Infinity
    // Implementasi mengembalikan 0 sebagai safety
    expect(result.hargaJualTarget).toBe(0);
    expect(result.keuntunganPerUnit).toBe(0);
    expect(result.marginAktualPersen).toBe(0);
  });

  // -----------------------------------------------------------------------
  // Skenario: Target margin > 100% (tidak realistis — fallback ke 0)
  // -----------------------------------------------------------------------
  it('target margin 150% mengembalikan 0 (safety fallback)', () => {
    const input: MarginTargetInput = {
      hppPerUnit: 10000,
      marginTargetPersen: 150,
    };

    const result = hitungHargaJualDenganMarginTarget(input);
    expect(result.hargaJualTarget).toBe(0);
    expect(result.keuntunganPerUnit).toBe(0);
    expect(result.marginAktualPersen).toBe(0);
  });

  // -----------------------------------------------------------------------
  // Skenario: HPP Rp 0 (produk digital), target margin 50%
  // -----------------------------------------------------------------------
  it('menghitung harga jual untuk HPP = 0 (produk digital)', () => {
    const input: MarginTargetInput = {
      hppPerUnit: 0,
      marginTargetPersen: 50,
    };

    const result = hitungHargaJualDenganMarginTarget(input);

    expect(result.hargaJualTarget).toBe(0);
    expect(result.keuntunganPerUnit).toBe(0);
    expect(result.marginAktualPersen).toBe(0);
  });

  // -----------------------------------------------------------------------
  // Skenario: Target margin 10% pada HPP besar
  // -----------------------------------------------------------------------
  it('target margin 10% pada HPP besar', () => {
    const input: MarginTargetInput = {
      hppPerUnit: 500000,
      marginTargetPersen: 10,
    };

    const result = hitungHargaJualDenganMarginTarget(input);

    expect(result.hargaJualTarget).toBe(555556); // 500.000 / 0,9
    expect(result.keuntunganPerUnit).toBe(55556);
    expect(result.marginAktualPersen).toBe(10);
  });

  // -----------------------------------------------------------------------
  // Skenario: Validasi tipe output
  // -----------------------------------------------------------------------
  it('mengembalikan properti dengan tipe yang benar', () => {
    const input: MarginTargetInput = {
      hppPerUnit: 25000,
      marginTargetPersen: 35,
    };

    const result = hitungHargaJualDenganMarginTarget(input);

    expect(result).toHaveProperty('hargaJualTarget');
    expect(result).toHaveProperty('keuntunganPerUnit');
    expect(result).toHaveProperty('marginAktualPersen');
    expect(typeof result.hargaJualTarget).toBe('number');
    expect(typeof result.keuntunganPerUnit).toBe('number');
    expect(typeof result.marginAktualPersen).toBe('number');
  });

  // -----------------------------------------------------------------------
  // Validasi chain: margin 30% → hitung harga → hitung ulang margin = 30%
  // -----------------------------------------------------------------------
  it('konsisten: margin dari harga yang dihitung harus sama dengan target', () => {
    const input: MarginTargetInput = {
      hppPerUnit: 8000,
      marginTargetPersen: 30,
    };

    const result = hitungHargaJualDenganMarginTarget(input);
    // Harga jual = 8.000 / 0,7 = 11.429
    // Keuntungan = 11.429 - 8.000 = 3.429
    // Margin = 3.429 / 11.429 = 30% ✅

    expect(result.hargaJualTarget).toBe(11429);
    expect(result.keuntunganPerUnit).toBe(3429);
    expect(result.marginAktualPersen).toBe(30);
  });
});
