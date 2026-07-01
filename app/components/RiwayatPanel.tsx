'use client';

import { useState } from 'react';
import { FileText, Trash2, ArrowRight, AlertTriangle } from 'lucide-react';

interface HistoryItem {
  id: string;
  timestamp: string;
  produk: string;
  hargaModal: string;
  hargaJualLama: string;
  keluhan: string;
  nama_ide_pivot: string;
  report: any;
}

interface RiwayatPanelProps {
  history: HistoryItem[];
  onMuat: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export default function RiwayatPanel({ history, onMuat, onClearHistory }: RiwayatPanelProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

  const hapusSemuaRiwayat = () => {
    setShowConfirmDelete(true);
  };

  const konfirmasiHapusSemua = () => {
    setShowConfirmDelete(false);
    onClearHistory();
  };

  const batalHapusSemua = () => {
    setShowConfirmDelete(false);
  };

  return (
    <div className="mb-6 backdrop-blur-xl bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 rounded-3xl p-5 relative overflow-visible">
      {/* Dialog Konfirmasi Hapus */}
      {showConfirmDelete && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-3xl p-5">
          <div className="bg-white border border-slate-100/80 rounded-2xl shadow-[0_12px_40px_rgb(0,0,0,0.08)] p-5 max-w-sm w-full text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Hapus Semua Riwayat?</h4>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Semua rekam medis digital akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={batalHapusSemua}
                className="flex-1 py-2.5 px-4 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-all duration-200"
              >
                Batal
              </button>
              <button
                onClick={konfirmasiHapusSemua}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Ya, Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Rekam Medis Digital
        </h3>
        <button
          onClick={hapusSemuaRiwayat}
          className="text-xs text-rose-400 hover:text-rose-600 flex items-center gap-1.5 font-medium transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Hapus
        </button>
      </div>

      <div className="space-y-2.5">
        {history.map((item: HistoryItem) => (
          <button
            key={item.id}
            onClick={() => onMuat(item)}
            className="w-full text-left p-3.5 rounded-2xl border border-slate-100/80 bg-white/60 hover:bg-emerald-50/60 hover:border-emerald-200/60 transition-all duration-200 flex items-center justify-between gap-3 group shadow-[0_2px_8px_rgb(0,0,0,0.02)]"
          >
            <div className="min-w-0 flex-1 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100/60 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-slate-800 truncate leading-tight">
                  {item.nama_ide_pivot || item.produk}
                </span>
                <span className="block text-xs text-slate-400 mt-0.5">
                  {item.timestamp} &middot; {item.produk}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
