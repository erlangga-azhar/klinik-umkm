import { describe, it, expect } from 'vitest';

// Tidak perlu mock GEMINI_API_KEY karena hitungAnalisisFinansial
// adalah pure function yang tidak bergantung pada AI initialization.
// AI instance di route.ts sekarang lazy-loaded via getGenAI().

import { hitungAnalisisFinansial } from '@/lib';
import type { HitungFinansialInput, HitungFinansialOutput } from '@/lib';

// =========================================================================
// Unit Test: hitungAnalisisFinansial
// =========================================================================
// Menguji pure function kalkulator finansial dengan berbagai skenario
// jumlah_unit_per_paket untuk memastikan logika unit economics benar.
// =========================================================================

describe('hitungAnalisisFinansial', () => {
  // -----------------------------------------------------------------------
  // Skenario 1: Paket grosir (jumlah unit > 1)
  // Kopi: HPP Rp 5.000/ gelas, dijual dalam Paket 20 Gelas seharga Rp 150.000
  // -----------------------------------------------------------------------
  it('menghitung finansial dengan benar untuk paket grosir (20 unit)', () => {
    const input: HitungFinansialInput = {
      hargaModalPerUnit: 5000,
      jumlahUnitPerPaket: 20,
      hargaJualBaru: 150000,
    };

    const result: HitungFinansialOutput = hitungAnalisisFinansial(input);

    // Total HPP paket = 5.000 * 20 = 100.000
    expect(result.total_hpp_paket).toBe(100000);
    // Keuntungan bersih = 150.000 - 100.000 = 50.000
    expect(result.keuntungan_bersih_paket).toBe(50000);
    // Margin = (50.000 / 150.000) * 100 = 33%
    expect(result.margin_persen).toBe(33);
    // BEP = 1.500.000 / 50.000 = 30 pelanggan
    expect(result.target_pelanggan_bep).toBe(30);

    // Pastikan analisis_finansial konsisten
    expect(result.analisis_finansial.margin_persen).toBe(33);
    expect(result.analisis_finansial.keuntungan_per_paket).toBe(50000);
    expect(result.analisis_finansial.target_pelanggan_bep).toBe(30);
  });

  // -----------------------------------------------------------------------
  // Skenario 2: Non-paket / jasa (jumlah unit = 1)
  // Jasa Konsultasi: HPP Rp 0, dijual Rp 200.000
  // -----------------------------------------------------------------------
  it('menghitung finansial dengan benar untuk non-paket (1 unit)', () => {
    const input: HitungFinansialInput = {
      hargaModalPerUnit: 0,
      jumlahUnitPerPaket: 1,
      hargaJualBaru: 200000,
    };

    const result: HitungFinansialOutput = hitungAnalisisFinansial(input);

    expect(result.total_hpp_paket).toBe(0);
    expect(result.keuntungan_bersih_paket).toBe(200000);
    expect(result.margin_persen).toBe(100);
    expect(result.target_pelanggan_bep).toBe(8); // 1.500.000 / 200.000 = 7.5 -> ceil = 8
  });

  // -----------------------------------------------------------------------
  // Skenario 3: Paket besar dengan margin rendah
  // Produk: HPP Rp 10.000/unit, Paket 50 unit, harga jual Rp 550.000
  // -----------------------------------------------------------------------
  it('menghitung finansial untuk paket besar dengan margin rendah', () => {
    const input: HitungFinansialInput = {
      hargaModalPerUnit: 10000,
      jumlahUnitPerPaket: 50,
      hargaJualBaru: 550000,
    };

    const result: HitungFinansialOutput = hitungAnalisisFinansial(input);

    // Total HPP = 10.000 * 50 = 500.000
    expect(result.total_hpp_paket).toBe(500000);
    // Keuntungan = 550.000 - 500.000 = 50.000
    expect(result.keuntungan_bersih_paket).toBe(50000);
    // Margin = (50.000 / 550.000) * 100 ≈ 9%
    expect(result.margin_persen).toBe(9);
    // BEP = 1.500.000 / 50.000 = 30
    expect(result.target_pelanggan_bep).toBe(30);
  });

  // -----------------------------------------------------------------------
  // Skenario 4: Rugi (harga jual lebih kecil dari total HPP paket)
  // -----------------------------------------------------------------------
  it('menangani skenario rugi (harga jual < total HPP paket)', () => {
    const input: HitungFinansialInput = {
      hargaModalPerUnit: 10000,
      jumlahUnitPerPaket: 10,
      hargaJualBaru: 80000,
    };

    const result: HitungFinansialOutput = hitungAnalisisFinansial(input);

    expect(result.total_hpp_paket).toBe(100000);
    expect(result.keuntungan_bersih_paket).toBe(-20000);
    expect(result.margin_persen).toBe(-25);
    // BEP menggunakan divisor aman (1) karena keuntungan <= 0
    expect(result.target_pelanggan_bep).toBe(1500000);
  });

  // -----------------------------------------------------------------------
  // Skenario 5: Impas (harga jual = total HPP paket)
  // -----------------------------------------------------------------------
  it('menangani skenario impas (harga jual = total HPP paket)', () => {
    const input: HitungFinansialInput = {
      hargaModalPerUnit: 5000,
      jumlahUnitPerPaket: 20,
      hargaJualBaru: 100000,
    };

    const result: HitungFinansialOutput = hitungAnalisisFinansial(input);

    expect(result.total_hpp_paket).toBe(100000);
    expect(result.keuntungan_bersih_paket).toBe(0);
    expect(result.margin_persen).toBe(0);
    // BEP menggunakan divisor aman (1) karena keuntungan = 0
    expect(result.target_pelanggan_bep).toBe(1500000);
  });

  // -----------------------------------------------------------------------
  // Skenario 6: HPP Rp 0 (digital product / jasa murni)
  // -----------------------------------------------------------------------
  it('menghitung finansial untuk produk digital (HPP = 0)', () => {
    const input: HitungFinansialInput = {
      hargaModalPerUnit: 0,
      jumlahUnitPerPaket: 1,
      hargaJualBaru: 50000,
    };

    const result: HitungFinansialOutput = hitungAnalisisFinansial(input);

    expect(result.total_hpp_paket).toBe(0);
    expect(result.keuntungan_bersih_paket).toBe(50000);
    expect(result.margin_persen).toBe(100);
    expect(result.target_pelanggan_bep).toBe(30);
  });

  // -----------------------------------------------------------------------
  // Skenario 7: jumlah_unit_per_paket yang sangat besar (1000 unit)
  // -----------------------------------------------------------------------
  it('menghitung finansial dengan jumlah unit per paket besar (1000)', () => {
    const input: HitungFinansialInput = {
      hargaModalPerUnit: 1000,
      jumlahUnitPerPaket: 1000,
      hargaJualBaru: 2000000,
    };

    const result: HitungFinansialOutput = hitungAnalisisFinansial(input);

    expect(result.total_hpp_paket).toBe(1000000);
    expect(result.keuntungan_bersih_paket).toBe(1000000);
    expect(result.margin_persen).toBe(50);
    expect(result.target_pelanggan_bep).toBe(2);
  });

  // -----------------------------------------------------------------------
  // Skenario 8: Edge case - harga jual sangat kecil (Rp 1)
  // -----------------------------------------------------------------------
  it('menangani harga jual sangat kecil (Rp 1) tanpa division by zero', () => {
    const input: HitungFinansialInput = {
      hargaModalPerUnit: 5000,
      jumlahUnitPerPaket: 1,
      hargaJualBaru: 1,
    };

    const result: HitungFinansialOutput = hitungAnalisisFinansial(input);

    expect(result.total_hpp_paket).toBe(5000);
    expect(result.keuntungan_bersih_paket).toBe(-4999);
    expect(result.margin_persen).toBe(-499900);
    expect(result.target_pelanggan_bep).toBe(1500000);
  });

  // -----------------------------------------------------------------------
  // Skenario 9: Validasi tipe output
  // -----------------------------------------------------------------------
  it('mengembalikan objek dengan tipe dan struktur yang benar', () => {
    const input: HitungFinansialInput = {
      hargaModalPerUnit: 5000,
      jumlahUnitPerPaket: 10,
      hargaJualBaru: 100000,
    };

    const result = hitungAnalisisFinansial(input);

    // Pastikan semua properti yang dibutuhkan ada
    expect(result).toHaveProperty('total_hpp_paket');
    expect(result).toHaveProperty('keuntungan_bersih_paket');
    expect(result).toHaveProperty('margin_persen');
    expect(result).toHaveProperty('target_pelanggan_bep');
    expect(result).toHaveProperty('analisis_finansial');

    // Pastikan analisis_finansial memiliki properti yang benar
    expect(result.analisis_finansial).toHaveProperty('margin_persen');
    expect(result.analisis_finansial).toHaveProperty('keuntungan_per_paket');
    expect(result.analisis_finansial).toHaveProperty('target_pelanggan_bep');

    // Pastikan semua nilai adalah number
    expect(typeof result.total_hpp_paket).toBe('number');
    expect(typeof result.keuntungan_bersih_paket).toBe('number');
    expect(typeof result.margin_persen).toBe('number');
    expect(typeof result.target_pelanggan_bep).toBe('number');
    expect(typeof result.analisis_finansial.margin_persen).toBe('number');
    expect(typeof result.analisis_finansial.keuntungan_per_paket).toBe('number');
    expect(typeof result.analisis_finansial.target_pelanggan_bep).toBe('number');
  });
});
