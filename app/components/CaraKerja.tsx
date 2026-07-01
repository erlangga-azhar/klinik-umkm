'use client';

import { FileText, BrainCircuit, Send } from 'lucide-react';

export default function CaraKerja() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Cara Kerja Dokter AI
          </h2>
          <p className="mt-3 text-slate-500 dark:text-zinc-400 max-w-lg mx-auto">
            Tiga langkah sederhana. Hasilnya resep model bisnis yang nggak bakal Anda
            dapatkan dari buku manajemen biasa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-200 dark:from-emerald-800/40 dark:via-emerald-700/40 dark:to-emerald-800/40" />

          <div className="relative flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/50 border-2 border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center mb-5 relative z-10 shadow-[0_4px_16px_rgb(16,185,129,0.1)]">
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">1</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50/80 dark:bg-emerald-900/30 border border-emerald-100/80 dark:border-emerald-800/40 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Input Gejala Bisnis</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed max-w-[240px]">
              Masukkan nama produk, HPP per unit, harga jual saat ini, dan keluhan utama
              yang Anda rasakan.
            </p>
          </div>

          <div className="relative flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/50 border-2 border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center mb-5 relative z-10 shadow-[0_4px_16px_rgb(16,185,129,0.1)]">
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">2</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50/80 dark:bg-emerald-900/30 border border-emerald-100/80 dark:border-emerald-800/40 flex items-center justify-center mb-3">
              <BrainCircuit className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">AI Analisis &amp; Hitung</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed max-w-[240px]">
              Dokter AI (Gemini 2.5 Flash) memproses data Anda: struktur biaya, margin,
              BEP, plus rekomendasi model langganan yang sesuai.
            </p>
          </div>

          <div className="relative flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/50 border-2 border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center mb-5 relative z-10 shadow-[0_4px_16px_rgb(16,185,129,0.1)]">
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">3</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50/80 dark:bg-emerald-900/30 border border-emerald-100/80 dark:border-emerald-800/40 flex items-center justify-center mb-3">
              <Send className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Resep + Draf WA Siap</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed max-w-[240px]">
              Dapatkan laporan diagnosis, kalkulasi finansial transparan, plus draf
              WhatsApp yang tinggal Anda kirim ke pelanggan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
