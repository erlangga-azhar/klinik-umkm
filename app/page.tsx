'use client';

import { useState, useEffect } from 'react';
import { Stethoscope, Pill, MessageCircle, RefreshCw, AlertTriangle, Clock, Trash2 } from 'lucide-react';

interface HistoryItem {
  id: string;
  timestamp: string;
  produk: string;
  nama_ide_pivot: string;
  report: any;
}

export default function KlinikUMKM() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [report, setReport] = useState<any>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mounted, setMounted] = useState<boolean>(false);

  const [form, setForm] = useState({
    produk: '',
    hargaModal: '',
    hargaJualLama: '',
    keluhan: ''
  });

  // Hanya jalankan di client-side setelah mounted (cegah hydration error SSR)
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('klinik-umkm-history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (e: any) {
      // localStorage tidak tersedia atau data rusak, abaikan
    }
  }, []);

  // Simpan riwayat ke localStorage
  const simpanRiwayat = (newReport: any) => {
    const item: HistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('id-ID'),
      produk: form.produk,
      nama_ide_pivot: newReport.nama_ide_pivot || '',
      report: newReport,
    };
    const updated = [item, ...history].slice(0, 20); // maksimal 20 item
    setHistory(updated);
    try {
      localStorage.setItem('klinik-umkm-history', JSON.stringify(updated));
    } catch (e: any) {
      // localStorage penuh, abaikan
    }
  };

  // Muat ulang hasil diagnosis dari riwayat
  const muatDariRiwayat = (item: HistoryItem) => {
    setReport(item.report);
    setError('');
    setForm({
      produk: item.produk || '',
      hargaModal: item.report.estimasi_harga_jual_baru?.toString() || '',
      hargaJualLama: '',
      keluhan: ''
    });
  };

  // Hapus semua riwayat
  const hapusSemuaRiwayat = () => {
    setHistory([]);
    try {
      localStorage.removeItem('klinik-umkm-history');
    } catch (e: any) {
      // abaikan
    }
  };

  const handleInputChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectKeluhan = (teksKeluhan: string) => {
    setForm({ ...form, keluhan: teksKeluhan });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setReport(null);

    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produk: form.produk,
          hargaModal: Number(form.hargaModal),
          hargaJualLama: Number(form.hargaJualLama),
          keluhan: form.keluhan
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memproses data.');

      setReport(data);
      // Simpan ke riwayat setelah sukses
      simpanRiwayat(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Header Title */}
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-2xl mb-4">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Klinik UMKM <span className="text-emerald-600 font-medium text-lg block sm:inline">(powered by AI)</span>
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Sembuhkan bisnis Anda dari perang harga dan FOMO lewat resep model bisnis langganan.
          </p>
        </div>

        {/* Notifikasi Error */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Kotak Obat: Riwayat Diagnosis (hanya tampil setelah mounted) */}
        {mounted && history.length > 0 && !report && (
          <div className="mb-6 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" /> Kotak Obat (Riwayat Diagnosis)
              </h3>
              <button
                onClick={hapusSemuaRiwayat}
                className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus Semua
              </button>
            </div>
            <div className="space-y-2">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => muatDariRiwayat(item)}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 transition-all flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-800 truncate">
                      {item.nama_ide_pivot || item.produk}
                    </span>
                    <span className="block text-xs text-slate-400 mt-0.5">
                      {item.timestamp} &middot; {item.produk}
                    </span>
                  </div>
                  <span className="text-xs text-emerald-600 font-medium flex-shrink-0">Lihat &rarr;</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Input: Loket Gejala */}
        {!loading && !report && (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b pb-4 text-slate-900">
              <Pill className="text-emerald-600 w-5 h-5" /> Loket Pemeriksaan Gejala
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Nama Produk / Jasa</label>
                <input
                  type="text" name="produk" required placeholder="Contoh: Es Kopi Susu Aren"
                  value={form.produk} onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Keluhan Utama Anda</label>
                <input
                  type="text" name="keluhan" required placeholder="Atau pilih opsi cepat di bawah..."
                  value={form.keluhan} onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Pilihan Gejala Instan */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Pilihan Gejala Populer:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Tetangga sebelah banting harga jauh lebih murah',
                  'Omzet harian besar tapi pas dihitung malah boncos',
                  'Pembeli ramai kalau pas ada promo diskon saja'
                ].map((opsi) => (
                  <button
                    key={opsi} type="button" onClick={() => handleSelectKeluhan(opsi)}
                    className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all ${
                      form.keluhan === opsi
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {opsi}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-sm font-semibold mb-2">Harga Modal (HPP / unit)</label>
                <input
                  type="number" name="hargaModal" required placeholder="Rp"
                  value={form.hargaModal} onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Harga Jual Saat Ini</label>
                <input
                  type="number" name="hargaJualLama" required placeholder="Rp"
                  value={form.hargaJualLama} onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-[0.99]"
            >
              Cek Kesehatan Bisnis
            </button>
          </form>
        )}

        {/* Loading State: Laboratorium Analisis */}
        {loading && (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm space-y-4">
            <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
            <h3 className="text-xl font-bold text-slate-900">Laboratorium Analisis AI Sedang Bekerja...</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Dokter AI sedang mengidentifikasi struktur biaya dan meracik resep model bisnis paket langganan yang aman dari perang harga.
            </p>
          </div>
        )}

        {/* Output Dashboard: Nota Resep Dokter */}
        {report && (
          <div className="space-y-6">

            {/* Kartu Diagnosis */}
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Hasil Diagnosis Sistem
              </h3>
              <p className="text-slate-700 leading-relaxed font-medium">{report.diagnosis}</p>
            </div>

            {/* Kartu Resep Utama (Ide Bisnis) */}
            <div className="bg-white border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-1 text-xs font-bold uppercase rounded-bl-xl tracking-widest">
                Resep Utama
              </div>

              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Rekomendasi Paket Pivot</h3>
              <h4 className="text-2xl font-black text-slate-900 mb-3">{report.nama_ide_pivot}</h4>
              <p className="text-slate-600 leading-relaxed text-sm">{report.deskripsi_pivot}</p>

              {/* Hasil Kalkulator Finansial */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 border-t pt-6 border-slate-100">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Harga Jual Baru</span>
                  <span className="text-lg font-extrabold text-slate-900">Rp {report.estimasi_harga_jual_baru?.toLocaleString('id-ID')}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Margin Kotor</span>
                  <span className="text-lg font-extrabold text-emerald-600">+{report.analisis_finansial?.margin_persen}%</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Target Pelanggan</span>
                  <span className="text-lg font-extrabold text-slate-900">{report.analisis_finansial?.target_pelanggan_bep} Orang</span>
                </div>
              </div>
            </div>

            {/* Kartu Pemasaran */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" /> Amunisi Pemasaran (Draf WhatsApp)
              </h3>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm text-slate-700 italic font-mono leading-relaxed">
                &quot;{report.draft_whatsapp}&quot;
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(report.draft_whatsapp)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-5 h-5" /> Bagikan Uji Coba ke WhatsApp
                </a>
                <button
                  onClick={() => { setReport(null); setForm({ produk: '', hargaModal: '', hargaJualLama: '', keluhan: '' }); }}
                  className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-sm"
                >
                  Konsultasi Ulang
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
