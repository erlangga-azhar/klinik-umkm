'use client';

import { useState } from 'react';
import {
  MessageCircle, AlertTriangle, FileText,
  Send, Copy, Check,
} from 'lucide-react';

interface ResepCardProps {
  report: any;
  onKonsultasiUlang: () => void;
}

export default function ResepCard({ report, onKonsultasiUlang }: ResepCardProps) {
  const [copied, setCopied] = useState<boolean>(false);

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

  return (
    <div className="space-y-5">
      {/* Kartu Diagnosis */}
      <div className="backdrop-blur-xl bg-amber-50/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-amber-200/80 rounded-3xl p-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-700 mb-3 flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-amber-500" />
          Hasil Diagnosis Sistem
        </h3>
        <p className="text-slate-700 leading-relaxed font-medium">{report.diagnosis}</p>
      </div>

      {/* Kartu Resep Utama */}
      <div className="backdrop-blur-xl bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-emerald-400/70 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] rounded-bl-2xl shadow-[0_2px_12px_rgb(16,185,129,0.2)]">
          Resep Utama
        </div>

        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-600 mb-1">
          Rekomendasi Paket Pivot
        </h3>
        <h4 className="text-2xl font-black text-slate-900 mb-3">{report.nama_ide_pivot}</h4>
        <p className="text-slate-500 leading-relaxed text-sm">{report.deskripsi_pivot}</p>

        {/* Rincian Transparansi Modal */}
        {(report.jumlah_unit_per_paket || report.total_hpp_paket) && (
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 px-4 py-3 bg-emerald-50/60 border border-emerald-100/70 rounded-2xl text-xs font-medium text-emerald-800 shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Detail Paket: <strong className="text-slate-900">{report.jumlah_unit_per_paket} Unit/Porsi</strong></span>
            </span>
            <span className="hidden sm:inline text-emerald-300">|</span>
            <span className="flex items-center gap-1.5">
              <span>Total Modal Paket: <strong className="text-slate-900">Rp {report.total_hpp_paket?.toLocaleString('id-ID')}</strong></span>
            </span>
          </div>
        )}

        {/* Kalkulator Finansial Premium */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 border-t border-slate-100 pt-5">
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100/80 p-4 text-center shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1.5">
              Harga Jual Baru
            </span>
            <span className="text-lg font-extrabold text-slate-900">
              Rp {report.estimasi_harga_jual_baru?.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="bg-gradient-to-br from-emerald-50/50 to-white rounded-2xl border border-emerald-100/80 p-4 text-center shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1.5">
              Margin Kotor
            </span>
            <span className="text-lg font-extrabold text-emerald-600">
              +{report.analisis_finansial?.margin_persen}%
            </span>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100/80 p-4 text-center shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1.5">
              Target Pelanggan
            </span>
            <span className="text-lg font-extrabold text-slate-900">
              {report.analisis_finansial?.target_pelanggan_bep} Orang
            </span>
          </div>
        </div>
      </div>

      {/* Kartu Pemasaran Premium */}
      <div className="backdrop-blur-xl bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 rounded-3xl p-6 space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2">
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          Amunisi Pemasaran
        </h3>

        <div className="relative bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100/80 p-5 shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/30 rounded-l-2xl" />
          <p className="text-sm text-slate-600 italic leading-relaxed pl-3">
            &ldquo;{report.draft_whatsapp}&rdquo;
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(report.draft_whatsapp)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold text-center py-3.5 px-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-[0_4px_16px_rgb(16,185,129,0.15)] hover:shadow-[0_6px_24px_rgb(16,185,129,0.25)] active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            Bagikan ke WhatsApp
          </a>
          <button
            onClick={handleCopyPesan}
            className="flex-1 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-[0_2px_8px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgb(0,0,0,0.04)] active:scale-[0.98]"
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
            className="w-full py-3 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-600 font-bold rounded-2xl transition-all duration-200 text-sm shadow-[0_2px_8px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgb(0,0,0,0.04)] active:scale-[0.98]"
          >
            Konsultasi Ulang
          </button>
        </div>
      </div>
    </div>
  );
}
