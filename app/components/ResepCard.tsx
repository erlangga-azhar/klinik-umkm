'use client';

import { useState } from 'react';
import {
  MessageCircle, AlertTriangle, FileText,
  Send, Copy, Check, Wallet, Package, TrendingUp, Headphones,
} from 'lucide-react';

interface ResepCardProps {
  report: any;
  onKonsultasiUlang: () => void;
}

export default function ResepCard({ report, onKonsultasiUlang }: ResepCardProps) {
  const [copied, setCopied] = useState<boolean>(false);

  // Guard: jika report null/undefined, jangan render apapun
  // Mencegah React error #31 jika data dari API tidak sesuai format
  if (!report) return null;

  const handleCopyPesan = async () => {
    if (!report?.draft_whatsapp) return;
    try {
      await navigator.clipboard.writeText(report.draft_whatsapp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e: any) {
      // Clipboard tidak tersedia
    }
  };

  // Ikon & metadata untuk setiap aspek diagnosis
  const ASPEK_DIAGNOSIS = [
    {
      key: 'keuangan' as const,
      label: 'Keuangan',
      icon: Wallet,
      desc: report?.diagnosis?.keuangan || 'Data tidak tersedia.',
      gradient: 'from-emerald-600 to-teal-600',
      borderGlow: 'before:bg-linear-to-br before:from-emerald-500/20 before:to-teal-500/5',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
    },
    {
      key: 'stok' as const,
      label: 'Stok & Produk',
      icon: Package,
      desc: report?.diagnosis?.stok || 'Data tidak tersedia.',
      gradient: 'from-sky-600 to-blue-600',
      borderGlow: 'before:bg-linear-to-br before:from-sky-500/20 before:to-blue-500/5',
      iconBg: 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400',
    },
    {
      key: 'pemasaran' as const,
      label: 'Pemasaran',
      icon: TrendingUp,
      desc: report?.diagnosis?.pemasaran || 'Data tidak tersedia.',
      gradient: 'from-amber-600 to-orange-600',
      borderGlow: 'before:bg-linear-to-br before:from-amber-500/20 before:to-orange-500/5',
      iconBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
    },
    {
      key: 'layanan' as const,
      label: 'Layanan',
      icon: Headphones,
      desc: report?.diagnosis?.layanan || 'Data tidak tersedia.',
      gradient: 'from-violet-600 to-purple-600',
      borderGlow: 'before:bg-linear-to-br before:from-violet-500/20 before:to-purple-500/5',
      iconBg: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400',
    },
  ];

  return (
    <div className="space-y-5">
      {/* 4 Premium Grid Cards — Diagnosis Terstruktur */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ASPEK_DIAGNOSIS.map((aspek) => {
          const IconComp = aspek.icon;
          return (
            <div
              key={aspek.key}
              className={`group relative bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-slate-100/60 dark:border-zinc-800/50 shadow-[0_2px_16px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_2px_16px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden ${aspek.borderGlow}`}
            >
              {/* Glow corner accent */}
              <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${aspek.borderGlow} opacity-30 blur-2xl group-hover:opacity-60 transition-opacity duration-500`} />

              <div className="relative z-10">
                {/* Header: icon + label */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-2xl ${aspek.iconBg} flex items-center justify-center shadow-[0_2px_8px_rgb(0,0,0,0.04)]`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className={`text-sm font-extrabold bg-linear-to-r ${aspek.gradient} bg-clip-text text-transparent`}>
                    {aspek.label}
                  </h3>
                </div>

                {/* Body text */}
                <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {aspek.desc}
                </p>
              </div>

              {/* Bottom border accent */}
              <div className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-linear-to-r ${aspek.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-300`} />
            </div>
          );
        })}
      </div>

      {/* Kartu Resep Utama */}
      <div className="bg-white/70 dark:bg-zinc-900/75 border-2 border-emerald-400/70 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-linear-to-r from-emerald-500 to-emerald-600 text-white px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] rounded-bl-2xl shadow-[0_2px_12px_rgb(16,185,129,0.2)]">
          Resep Utama
        </div>

        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400 mb-1">
          Rekomendasi Paket Pivot
        </h3>
        <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-3">{report.nama_ide_pivot}</h4>
        <p className="text-slate-500 dark:text-zinc-400 leading-relaxed text-sm">{report.deskripsi_pivot}</p>

        {/* Rincian Transparansi Modal */}
        {(report.jumlah_unit_per_paket || report.total_hpp_paket) && (
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 px-4 py-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100/70 dark:border-emerald-900/50 rounded-2xl text-xs font-medium text-emerald-800 dark:text-emerald-300 shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Detail Paket: <strong className="text-slate-900 dark:text-white">{report.jumlah_unit_per_paket} Unit/Porsi</strong></span>
            </span>
            <span className="hidden sm:inline text-emerald-300 dark:text-emerald-700">|</span>
            <span className="flex items-center gap-1.5">
              <span>Total Modal Paket: <strong className="text-slate-900 dark:text-white">Rp {report.total_hpp_paket?.toLocaleString('id-ID')}</strong></span>
            </span>
          </div>
        )}

        {/* Kalkulator Finansial Premium */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 border-t border-slate-100 dark:border-zinc-800 pt-5">
          <div className="bg-linear-to-br from-slate-50 to-white dark:from-zinc-800/50 dark:to-zinc-900/50 rounded-2xl border border-slate-100/80 dark:border-zinc-800/80 p-4 text-center shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-zinc-500 mb-1.5">
              Harga Jual Baru
            </span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white">
              Rp {report.estimasi_harga_jual_baru?.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="bg-linear-to-br from-emerald-50/50 to-white dark:from-emerald-950/30 dark:to-zinc-900/50 rounded-2xl border border-emerald-100/80 dark:border-emerald-900/60 p-4 text-center shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-zinc-500 mb-1.5">
              Margin Kotor
            </span>
            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
              +{report.analisis_finansial?.margin_persen}%
            </span>
          </div>
          <div className="bg-linear-to-br from-slate-50 to-white dark:from-zinc-800/50 dark:to-zinc-900/50 rounded-2xl border border-slate-100/80 dark:border-zinc-800/80 p-4 text-center shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-zinc-500 mb-1.5">
              Target Pelanggan
            </span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white">
              {report.analisis_finansial?.target_pelanggan_bep} Orang
            </span>
          </div>
        </div>
      </div>

      {/* Kartu Pemasaran Premium */}
      <div className="bg-white/70 dark:bg-zinc-900/75 border border-slate-100/80 dark:border-zinc-800/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] rounded-3xl p-6 space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-zinc-500 flex items-center gap-2">
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Amunisi Pemasaran
        </h3>

        <div className="relative bg-linear-to-br from-slate-50 to-white dark:from-zinc-800/50 dark:to-zinc-900/50 rounded-2xl border border-slate-100/80 dark:border-zinc-800/80 p-5 shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/30 rounded-l-2xl" />
          <p className="text-sm text-slate-600 dark:text-zinc-400 italic leading-relaxed pl-3">
            &ldquo;{report.draft_whatsapp}&rdquo;
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(report.draft_whatsapp)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold text-center py-3.5 px-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-[0_4px_16px_rgb(16,185,129,0.15)] hover:shadow-[0_6px_24px_rgb(16,185,129,0.25)] active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            Bagikan ke WhatsApp
          </a>
          <button
            onClick={handleCopyPesan}
            className="flex-1 bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold py-3.5 px-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-[0_2px_8px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgb(0,0,0,0.04)] active:scale-[0.98]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Salin Pesan
              </>
            )}
          </button>
        </div>

        <div className="flex pt-1">
          <button
            onClick={() => { onKonsultasiUlang(); setCopied(false); }}
            className="w-full py-3 bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-400 font-bold rounded-2xl transition-all duration-200 text-sm shadow-[0_2px_8px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgb(0,0,0,0.04)] active:scale-[0.98]"
          >
            Konsultasi Ulang
          </button>
        </div>
      </div>
    </div>
  );
}
