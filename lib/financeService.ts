// =========================================================================
// FINANCE SERVICE — Kalkulator Finansial UMKM
// =========================================================================
// Pure function untuk menghitung unit economics dan analisis finansial.
// Tidak memiliki ketergantungan pada AI, environment, atau modul eksternal.
// Sepenuhnya testable tanpa setup khusus.
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
// =========================================================================
// FUNGSI BARU: hitungDampakDiskon
// =========================================================================

/**
 * Parameter untuk simulasi dampak diskon terhadap margin dan BEP.
 */
export interface DiskonInput {
  hargaNormal: number;
  diskonPersen: number;
  hppPerUnit: number;
  jumlahUnitTerjualPerBulan: number;
}

/**
 * Hasil simulasi dampak diskon.
 */
export interface DiskonOutput {
  hargaSetelahDiskon: number;
  keuntunganPerUnitNormal: number;
  keuntunganPerUnitDiskon: number;
  marginNormalPersen: number;
  marginDiskonPersen: number;
  selisihMarginPersen: number;
  totalKeuntunganNormal: number;
  totalKeuntunganDiskon: number;
  unitTambahanUntukImpas: number;
}

/**
 * hitungDampakDiskon
 * Mensimulasikan dampak pemberian diskon terhadap keuntungan dan margin.
 * Menghitung berapa unit tambahan yang harus terjual agar keuntungan
 * setelah diskon sama dengan sebelum diskon (impas diskon).
 *
 * @param input - Parameter diskon
 * @returns Objek hasil simulasi
 */
export function hitungDampakDiskon(input: DiskonInput): DiskonOutput {
  const { hargaNormal, diskonPersen, hppPerUnit, jumlahUnitTerjualPerBulan } = input;

  const diskonDecimal = diskonPersen / 100;
  const hargaSetelahDiskon = Math.round(hargaNormal * (1 - diskonDecimal));

  const keuntunganPerUnitNormal = hargaNormal - hppPerUnit;
  const keuntunganPerUnitDiskon = hargaSetelahDiskon - hppPerUnit;

  const marginNormalPersen = Math.round((keuntunganPerUnitNormal / hargaNormal) * 100);
  const marginDiskonPersen = Math.round((keuntunganPerUnitDiskon / hargaSetelahDiskon) * 100);

  const totalKeuntunganNormal = keuntunganPerUnitNormal * jumlahUnitTerjualPerBulan;
  const totalKeuntunganDiskon = keuntunganPerUnitDiskon * jumlahUnitTerjualPerBulan;

  // Berapa unit tambahan yang harus terjual agar total keuntungan sama?
  // (unitNormal + tambahan) * keuntunganDiskon = totalKeuntunganNormal
  // tambahan = (totalKeuntunganNormal / keuntunganPerUnitDiskon) - unitNormal
  const unitTambahanUntukImpas =
    keuntunganPerUnitDiskon > 0
      ? Math.ceil(totalKeuntunganNormal / keuntunganPerUnitDiskon) - jumlahUnitTerjualPerBulan
      : jumlahUnitTerjualPerBulan; // jika rugi, impas tidak mungkin

  return {
    hargaSetelahDiskon,
    keuntunganPerUnitNormal,
    keuntunganPerUnitDiskon,
    marginNormalPersen,
    marginDiskonPersen,
    selisihMarginPersen: marginNormalPersen - marginDiskonPersen,
    totalKeuntunganNormal,
    totalKeuntunganDiskon,
    unitTambahanUntukImpas: Math.max(0, unitTambahanUntukImpas),
  };
}

// =========================================================================
// FUNGSI BARU: hitungBungaPinjaman
// =========================================================================

/**
 * Parameter untuk simulasi pinjaman UMKM.
 */
export interface PinjamanInput {
  pokokPinjaman: number;
  bungaPersenPerTahun: number;
  tenorBulan: number;
}

/**
 * Hasil simulasi pinjaman.
 */
export interface PinjamanOutput {
  bungaPerBulan: number;
  angsuranPokokPerBulan: number;
  totalAngsuranPerBulan: number;
  totalBungaSelamaTenor: number;
  totalPembayaran: number;
  bebanBungaPerUnit: number;
}

/**
 * hitungBungaPinjaman
 * Menghitung simulasi angsuran pinjaman bank/koperasi untuk UMKM
 * menggunakan metode anuitas sederhana (flat rate).
 *
 * Berguna untuk pemilik UMKM yang ingin tahu:
 * - Berapa cicilan per bulan jika pinjam RpX?
 * - Berapa total bunga yang dibayar?
 * - Berapa beban bunga per unit produk yang harus ditutup?
 *
 * @param input - Parameter pinjaman
 * @returns Objek hasil simulasi angsuran
 */
export function hitungBungaPinjaman(input: PinjamanInput): PinjamanOutput {
  const { pokokPinjaman, bungaPersenPerTahun, tenorBulan } = input;

  const bungaDecimalPerTahun = bungaPersenPerTahun / 100;
  const bungaPerBulan = Math.round((pokokPinjaman * bungaDecimalPerTahun) / 12);
  const angsuranPokokPerBulan = Math.round(pokokPinjaman / tenorBulan);
  const totalAngsuranPerBulan = angsuranPokokPerBulan + bungaPerBulan;
  const totalBungaSelamaTenor = bungaPerBulan * tenorBulan;
  const totalPembayaran = pokokPinjaman + totalBungaSelamaTenor;

  // Beban bunga per unit (asumsi 100 unit terjual per bulan sebagai baseline)
  const bebanBungaPerUnit = Math.round(bungaPerBulan / 100);

  return {
    bungaPerBulan,
    angsuranPokokPerBulan,
    totalAngsuranPerBulan,
    totalBungaSelamaTenor,
    totalPembayaran,
    bebanBungaPerUnit,
  };
}

// =========================================================================
// FUNGSI BARU: hitungHargaJualDenganMarginTarget
// =========================================================================

/**
 * Parameter untuk kalkulasi harga jual berdasarkan target margin.
 */
export interface MarginTargetInput {
  hppPerUnit: number;
  marginTargetPersen: number;
}

/**
 * Hasil kalkulasi harga jual berdasarkan target margin.
 */
export interface MarginTargetOutput {
  hargaJualTarget: number;
  keuntunganPerUnit: number;
  marginAktualPersen: number;
}

/**
 * hitungHargaJualDenganMarginTarget
 * Menghitung berapa harga jual yang harus ditetapkan untuk mencapai
 * target margin tertentu.
 *
 * @param input - Parameter target margin
 * @returns Objek hasil kalkulasi harga jual
 */
export function hitungHargaJualDenganMarginTarget(input: MarginTargetInput): MarginTargetOutput {
  const { hppPerUnit, marginTargetPersen } = input;

  const marginDecimal = marginTargetPersen / 100;
  // hargaJual = HPP / (1 - marginDesimal)
  // Contoh: HPP 5.000, target margin 40% → harga = 5.000 / 0.6 = 8.333
  if (marginDecimal >= 1) {
    return {
      hargaJualTarget: 0,
      keuntunganPerUnit: 0,
      marginAktualPersen: 0,
    };
  }

  const hargaJualTarget = Math.round(hppPerUnit / (1 - marginDecimal));
  const keuntunganPerUnit = hargaJualTarget - hppPerUnit;
  // Guard division by zero ketika hargaJualTarget = 0
  const marginAktualPersen = hargaJualTarget > 0
    ? Math.round((keuntunganPerUnit / hargaJualTarget) * 100)
    : 0;

  return {
    hargaJualTarget,
    keuntunganPerUnit,
    marginAktualPersen,
  };
}

export function hitungAnalisisFinansial(input: HitungFinansialInput): HitungFinansialOutput {
  const { hargaModalPerUnit, jumlahUnitPerPaket, hargaJualBaru } = input;

  const totalHppPaket: number = hargaModalPerUnit * jumlahUnitPerPaket;
  const keuntunganBersihPaket: number = hargaJualBaru - totalHppPaket;
  // Guard division by zero ketika hargaJualBaru = 0
  const marginPersen: number = hargaJualBaru > 0
    ? Math.round((keuntunganBersihPaket / hargaJualBaru) * 100)
    : 0;

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
