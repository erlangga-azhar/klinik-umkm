'use client';

import { useState, useMemo } from 'react';
import {
  MessageCircle, AlertTriangle, FileText,
  Send, Copy, Check, Wallet, Package, TrendingUp, Headphones,
  Activity, AlertCircle, ShieldCheck, Zap, Target,
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

  // ===================================================================
  // DERIVED METRICS — Analisis terkomputasi dari data finansial
  // ===================================================================

  const margin = report?.analisis_finansial?.margin_persen ?? 0;
  const bepTarget = report?.analisis_finansial?.target_pelanggan_bep ?? 0;
  const hpp = report?.total_hpp_paket ?? 0;
  const hargaJual = report?.estimasi_harga_jual_baru ?? 0;

  /** Skor keuangan (0-100) berdasarkan margin */
  const skorKeuangan = useMemo(() => {
    if (margin <= 0) return 15;
    if (margin <= 10) return 30;
    if (margin <= 20) return 50;
    if (margin <= 35) return 70;
    if (margin <= 50) return 85;
    return 95;
  }, [margin]);

  /** Skor stok (0-100) berdasarkan jumlah unit per paket */
  const skorStok = useMemo(() => {
    const unit = report?.jumlah_unit_per_paket ?? 0;
    if (unit <= 0) return 10;
    if (unit === 1) return 40;
    if (unit <= 5) return 55;
    if (unit <= 15) return 70;
    if (unit <= 30) return 85;
    return 95;
  }, [report?.jumlah_unit_per_paket]);

  /** Skor pemasaran (0-100) berdasarkan kemudahan BEP */
  const skorPemasaran = useMemo(() => {
    if (bepTarget <= 0) return 10;
    if (bepTarget <= 10) return 90;
    if (bepTarget <= 20) return 75;
    if (bepTarget <= 50) return 55;
    if (bepTarget <= 100) return 35;
    return 15;
  }, [bepTarget]);

  /** Skor layanan (0-100) — kombinasi margin + BEP + HPP */
  const skorLayanan = useMemo(() => {
    // Makin tinggi margin dan makin rendah BEP, makin sehat operasional
    const raw = (skorKeuangan * 0.4 + (100 - Math.min(bepTarget / 15, 100)) * 0.3 + (hargaJual > hpp ? 80 : 20) * 0.3);
    return Math.round(Math.min(Math.max(raw, 0), 100));
  }, [skorKeuangan, bepTarget, hargaJual, hpp]);

  /** Skor kesehatan bisnis keseluruhan */
  const skorKesehatan = useMemo(() => {
    return Math.round((skorKeuangan + skorStok + skorPemasaran + skorLayanan) / 4);
  }, [skorKeuangan, skorStok, skorPemasaran, skorLayanan]);

  /** Label & warna berdasarkan skor */
  const getStatusInfo = (skor: number): { statusLabel: string; color: string; bg: string; dot: string } => {
    if (skor < 25) return { statusLabel: 'Kritis', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50', dot: 'bg-rose-500' };
    if (skor < 45) return { statusLabel: 'Waspada', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50', dot: 'bg-amber-500' };
    if (skor < 65) return { statusLabel: 'Cukup', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900/50', dot: 'bg-yellow-500' };
    if (skor < 85) return { statusLabel: 'Baik', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50', dot: 'bg-emerald-500' };
    return { statusLabel: 'Sehat', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900/50', dot: 'bg-teal-500' };
  };

  const buildAspek = (key: string, label: string, skor: number) => {
    const info = getStatusInfo(skor);
    return { key, label, skor, ...info };
  };

  const aspekRingkasan = [
    buildAspek('keuangan', 'Keuangan', skorKeuangan),
    buildAspek('stok', 'Stok', skorStok),
    buildAspek('pemasaran', 'Pemasaran', skorPemasaran),
    buildAspek('layanan', 'Layanan', skorLayanan),
  ];

  /** Rekomendasi prioritas berdasarkan skor terendah */
  const prioritasUtama = useMemo(() => {
    const terendah = [...aspekRingkasan].sort((a, b) => a.skor - b.skor)[0];
    if (!terendah || terendah.skor >= 65) return null;
    return terendah;
  }, [skorKeuangan, skorStok, skorPemasaran, skorLayanan]);

  /** Insight yang bisa ditampilkan berdasarkan data finansial */
  const insightCepat = useMemo(() => {
    const insights: string[] = [];
    if (margin <= 0) {
      insights.push('⚠️ Margin negatif — Anda menjual di bawah harga modal, ini tidak sustain.');
    } else if (margin < 15) {
      insights.push('⚠️ Margin tipis — biaya operasional bisa menggerus keuntungan.');
    } else if (margin < 30) {
      insights.push('✅ Margin cukup — masih ada ruang untuk promosi dan diskon terbatas.');
    } else {
      insights.push('✅ Margin sehat — struktur harga Anda sudah ideal.');
    }

    if (bepTarget > 100) {
      insights.push('🎯 Target BEP tinggi (>100 pelanggan) — butuh strategi akuisisi agresif.');
    } else if (bepTarget > 30) {
      insights.push('🎯 BEP terjangkau — fokus pada retensi pelanggan untuk stabilitas.');
    } else if (bepTarget > 0) {
      insights.push('🎯 BEP rendah — bisnis bisa cepat balik modal.');
    }

    return insights.join(' ');
  }, [margin, bepTarget]);

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

      {/* ================================================================ */}
      {/* RINGKASAN DIAGNOSIS — Skor Kesehatan + Insight Terkomputasi      */}
      {/* ================================================================ */}
      <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-slate-100/60 dark:border-zinc-800/50 shadow-[0_2px_16px_rgb(0,0,0,0.02)] dark:shadow-[0_2px_16px_rgb(0,0,0,0.12)] rounded-3xl p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-linear-to-br from-emerald-500/10 to-indigo-500/5 blur-3xl" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-zinc-500">
              Ringkasan Diagnosis
            </h3>
          </div>

          {/* Health Score Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
                Skor Kesehatan Bisnis
              </span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-white">
                {skorKesehatan}<span className="text-xs font-medium text-slate-400 dark:text-zinc-500">/100</span>
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  skorKesehatan >= 70 ? 'bg-linear-to-r from-emerald-500 to-teal-500' :
                  skorKesehatan >= 45 ? 'bg-linear-to-r from-amber-500 to-yellow-500' :
                  'bg-linear-to-r from-rose-500 to-pink-500'
                }`}
                style={{ width: `${skorKesehatan}%` }}
              />
            </div>
          </div>

          {/* 4 Status Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {aspekRingkasan.map((a) => (
              <div
                key={a.key}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${a.bg} shadow-[0_1px_4px_rgb(0,0,0,0.02)]`}
              >
                <span className={`w-2 h-2 rounded-full ${a.dot} shrink-0`} />
                <div className="min-w-0">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 truncate">
                    {a.label}
                  </span>
                  <span className={`block text-xs font-bold ${a.color} truncate`}>
                    {a.label === 'Keuangan' || a.label === 'Stok' ? `${a.skor}` : `${a.skor}`}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Prioritas & Quick Insight */}
          {prioritasUtama && (
            <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/50 mb-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                <strong className="font-bold">Prioritas: {prioritasUtama.label}.</strong>{' '}
                Aspek {prioritasUtama.label.toLowerCase()} membutuhkan perhatian paling segera.
                {prioritasUtama.key === 'keuangan' && ' Tinjau ulang struktur HPP dan harga jual Anda.'}
                {prioritasUtama.key === 'stok' && ' Evaluasi jumlah unit per paket dan rotasi stok.'}
                {prioritasUtama.key === 'pemasaran' && ' Strategi akuisisi pelanggan perlu dioptimalkan.'}
                {prioritasUtama.key === 'layanan' && ' Efisiensi operasional bisa menjadi pengungkit utama.'}
              </p>
            </div>
          )}

          {insightCepat && (
            <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/40">
              <Zap className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                <strong className="font-bold">Insight Cepat: </strong>
                {insightCepat}
              </p>
            </div>
          )}
        </div>
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
