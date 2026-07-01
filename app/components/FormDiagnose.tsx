'use client';

import { Pill, Syringe } from 'lucide-react';

interface FormData {
  produk: string;
  hargaModal: string;
  hargaJualLama: string;
  keluhan: string;
}

interface FormDiagnoseProps {
  form: FormData;
  loading: boolean;
  report: any;
  onSubmit: (e: any) => void;
  onInputChange: (e: any) => void;
  onSelectKeluhan: (teks: string) => void;
}

const KELUHAN_OPTIONS = [
  'Tetangga sebelah banting harga jauh lebih murah',
  'Omzet harian besar tapi pas dihitung malah boncos',
  'Pembeli ramai kalau pas ada promo diskon saja',
];

export default function FormDiagnose({
  form,
  loading,
  report,
  onSubmit,
  onInputChange,
  onSelectKeluhan,
}: FormDiagnoseProps) {
  return (
    <form onSubmit={onSubmit} className="backdrop-blur-xl bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 rounded-3xl p-6 sm:p-8 space-y-7">
      <h2 className="text-lg font-bold flex items-center gap-2.5 border-b border-slate-100 pb-4 text-slate-900">
        <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Pill className="w-4 h-4 text-emerald-600" />
        </div>
        Loket Pemeriksaan Gejala
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="produk" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Nama Produk / Jasa
          </label>
          <input
            id="produk" type="text" name="produk" required placeholder="Contoh: Es Kopi Susu Aren"
            value={form.produk} onChange={onInputChange}
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200/80 text-slate-800 placeholder:text-slate-400/70 transition-all duration-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none shadow-[0_2px_8px_rgb(0,0,0,0.02)]"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="keluhan" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Keluhan Utama
          </label>
          <input
            id="keluhan" type="text" name="keluhan" required placeholder="Atau pilih opsi cepat di bawah..."
            value={form.keluhan} onChange={onInputChange}
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200/80 text-slate-800 placeholder:text-slate-400/70 transition-all duration-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none shadow-[0_2px_8px_rgb(0,0,0,0.02)]"
          />
        </div>
      </div>

      {/* Pilihan Gejala Instan */}
      <div className="space-y-2.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
          Pilihan Gejala Populer
        </span>
        <div className="flex flex-wrap gap-2">
          {KELUHAN_OPTIONS.map((opsi) => (
            <button
              key={opsi} type="button" onClick={() => onSelectKeluhan(opsi)}
              className={`px-3.5 py-2 text-xs font-medium rounded-2xl border transition-all duration-200 ${
                form.keluhan === opsi
                  ? 'bg-emerald-50/80 border-emerald-400/60 text-emerald-700 shadow-[0_2px_12px_rgb(16,185,129,0.12)]'
                  : 'bg-white/60 border-slate-200/70 text-slate-600 hover:bg-white hover:border-slate-300/70'
              }`}
            >
              {opsi}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="hargaModal" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Harga Modal (HPP)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400" aria-hidden="true">Rp</span>
            <input
              id="hargaModal" type="number" name="hargaModal" required placeholder="0"
              value={form.hargaModal} onChange={onInputChange}
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200/80 text-slate-800 placeholder:text-slate-400/70 transition-all duration-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none shadow-[0_2px_8px_rgb(0,0,0,0.02)]"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="hargaJualLama" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Harga Jual Saat Ini
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400" aria-hidden="true">Rp</span>
            <input
              id="hargaJualLama" type="number" name="hargaJualLama" required placeholder="0"
              value={form.hargaJualLama} onChange={onInputChange}
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200/80 text-slate-800 placeholder:text-slate-400/70 transition-all duration-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none shadow-[0_2px_8px_rgb(0,0,0,0.02)]"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 shadow-[0_4px_20px_rgb(16,185,129,0.2)] hover:shadow-[0_6px_30px_rgb(16,185,129,0.3)] active:scale-[0.98] flex items-center justify-center gap-2.5"
      >
        <Syringe className="w-5 h-5" />
        Cek Kesehatan Bisnis
      </button>
    </form>
  );
}
