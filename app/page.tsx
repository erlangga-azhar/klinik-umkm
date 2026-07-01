'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Stethoscope, FileText, BrainCircuit, Send,
  HeartPulse, ArrowDownToLine, Syringe, Sparkles, ScrollText,
  AlertTriangle, TrendingDown, ShoppingBag, Users,
} from 'lucide-react';
import FormDiagnose from '@/app/components/FormDiagnose';
import RiwayatPanel from '@/app/components/RiwayatPanel';
import ResepCard from '@/app/components/ResepCard';

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

export default function KlinikUMKM() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [report, setReport] = useState<any>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mounted, setMounted] = useState<boolean>(false);

  const formRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    produk: '',
    hargaModal: '',
    hargaJualLama: '',
    keluhan: ''
  });

  // Hanya akses localStorage setelah mounted (cegah hydration error SSR)
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
      // localStorage tidak tersedia atau data rusak
    }
  }, []);

  const simpanRiwayat = (newReport: any) => {
    const item: HistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('id-ID'),
      produk: form.produk,
      hargaModal: form.hargaModal,
      hargaJualLama: form.hargaJualLama,
      keluhan: form.keluhan,
      nama_ide_pivot: newReport.nama_ide_pivot || '',
      report: newReport,
    };
    const updated = [item, ...history].slice(0, 20);
    setHistory(updated);
    try {
      localStorage.setItem('klinik-umkm-history', JSON.stringify(updated));
    } catch (e: any) {
      // localStorage penuh
    }
  };

  const muatDariRiwayat = (item: HistoryItem) => {
    setReport(item.report);
    setError('');
    setForm({
      produk: item.produk || '',
      hargaModal: item.hargaModal || '',
      hargaJualLama: item.hargaJualLama || '',
      keluhan: item.keluhan || ''
    });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('klinik-umkm-history');
    } catch (e: any) {}
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
      simpanRiwayat(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  const handleKonsultasiUlang = () => {
    setReport(null);
    setForm({ produk: '', hargaModal: '', hargaJualLama: '', keluhan: '' });
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/15 to-white text-slate-800">

      {/* ================================================================== */}
      {/* HERO SECTION                                                       */}
      {/* ================================================================== */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-emerald-400/10 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-teal-300/10 blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex mb-6 items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-slate-200/70 rounded-full shadow-[0_2px_12px_rgb(0,0,0,0.03)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
              AI Diagnosis Gratis &bull; Made for UMKM Indonesia
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] sm:leading-[1.05]">
            Bosan{' '}
            <span className="bg-gradient-to-r from-rose-500 to-rose-400 bg-clip-text text-transparent">
              Banting Harga
            </span>{' '}
            Terus?
            <br />
            <span className="text-slate-900">
              Biar Dokter AI yang{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                Racik Model Langganan
              </span>{' '}
              Anti Boncos
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Omzet gede, pas dihitung malah boncos? Pelanggan cuma datang pas promo doang? 
            Berhenti tebak-tebak margin. Masukkan modal dan harga jual Anda, dapatkan resep 
            model bisnis langganan plus kalkulasi BEP dalam 3 menit. <strong className="text-slate-700">Gratis, tanpa spam.</strong>
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={scrollToForm}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold text-lg py-4 px-8 rounded-2xl transition-all duration-300 shadow-[0_8px_30px_rgb(16,185,129,0.25)] hover:shadow-[0_12px_40px_rgb(16,185,129,0.35)] active:scale-[0.97] hover:scale-[1.02]"
            >
              <span className="absolute inset-0 rounded-2xl ring-2 ring-emerald-400/40 ring-offset-2 ring-offset-slate-50 group-hover:ring-emerald-500/60 transition-all duration-300" />
              <Syringe className="w-6 h-6" />
              Cek Kesehatan Bisnis Sekarang
              <ArrowDownToLine className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-200" />
            </button>
            <span className="text-sm text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Tidak perlu daftar akun
            </span>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-emerald-500" />
              Digerakkan Gemini 2.5 Flash
            </span>
            <span className="flex items-center gap-1.5">
              <ScrollText className="w-3.5 h-3.5 text-emerald-500" />
              Resep + Draf WA siap pakai
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Gratis selamanya
            </span>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* PAIN POINT GRID                                                    */}
      {/* ================================================================== */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Kenali 3 Penyakit Kronis UMKM
            </h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">
              Salah satu saja dari gejala di bawah ini sudah cukup untuk membuat bisnis Anda 
              jalan di tempat. Tenang, semua bisa diobati.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="group relative backdrop-blur-xl bg-white/80 border border-slate-100/80 rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-rose-300 to-rose-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-4">
                <TrendingDown className="w-6 h-6 text-rose-500" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50/80 border border-rose-100/80 rounded-full text-[10px] font-bold uppercase tracking-wider text-rose-600 mb-3">
                <span className="w-1 h-1 rounded-full bg-rose-500" />Gejala #1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Margin Tipis Tersiksa</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Harga jual hampir sama dengan modal. Untung cuma receh, tapi capeknya setara 
                kerja 12 jam sehari. Begitu diakumulasi, gaji owner bahkan kalah sama karyawan.
              </p>
            </div>

            <div className="group relative backdrop-blur-xl bg-white/80 border border-slate-100/80 rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-amber-300 to-amber-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-amber-500" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50/80 border border-amber-100/80 rounded-full text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-3">
                <span className="w-1 h-1 rounded-full bg-amber-500" />Gejala #2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Korban Diskon &amp; FOMO</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Tetangga banting harga, ikut banting harga. Tren musiman berganti, ikut ganti 
                produk. Siklus seterusnya tanpa pernah punya fondasi bisnis yang stabil dan 
                pelanggan setia.
              </p>
            </div>

            <div className="group relative backdrop-blur-xl bg-white/80 border border-slate-100/80 rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-sky-300 to-sky-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-sky-500" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50/80 border border-sky-100/80 rounded-full text-[10px] font-bold uppercase tracking-wider text-sky-600 mb-3">
                <span className="w-1 h-1 rounded-full bg-sky-500" />Gejala #3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Pelanggan Musiman, Nggak Loyal</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Pelanggan cuma datang pas ada promo. Begitu harga normal, mereka kabur ke 
                kompetitor. Nggak ada ikatan jangka panjang, nggak ada uang berulang tiap bulan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* HOW IT WORKS                                                       */}
      {/* ================================================================== */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Cara Kerja Dokter AI
            </h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">
              Tiga langkah sederhana. Hasilnya resep model bisnis yang nggak bakal Anda 
              dapatkan dari buku manajemen biasa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-200" />

            <div className="relative flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center mb-5 relative z-10 shadow-[0_4px_16px_rgb(16,185,129,0.1)]">
                <span className="text-xl font-black text-emerald-700">1</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50/80 border border-emerald-100/80 flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Input Gejala Bisnis</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[240px]">
                Masukkan nama produk, HPP per unit, harga jual saat ini, dan keluhan utama 
                yang Anda rasakan.
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center mb-5 relative z-10 shadow-[0_4px_16px_rgb(16,185,129,0.1)]">
                <span className="text-xl font-black text-emerald-700">2</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50/80 border border-emerald-100/80 flex items-center justify-center mb-3">
                <BrainCircuit className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">AI Analisis &amp; Hitung</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[240px]">
                Dokter AI (Gemini 2.5 Flash) memproses data Anda: struktur biaya, margin, 
                BEP, plus rekomendasi model langganan yang sesuai.
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center mb-5 relative z-10 shadow-[0_4px_16px_rgb(16,185,129,0.1)]">
                <span className="text-xl font-black text-emerald-700">3</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50/80 border border-emerald-100/80 flex items-center justify-center mb-3">
                <Send className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Resep + Draf WA Siap</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[240px]">
                Dapatkan laporan diagnosis, kalkulasi finansial transparan, plus draf 
                WhatsApp yang tinggal Anda kirim ke pelanggan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FORM & DIAGNOSIS CONTAINER                                         */}
      {/* ================================================================== */}
      <div ref={formRef} className="scroll-mt-8" />

      <section className="px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        <div className="max-w-3xl mx-auto">

          {/* Error notification */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50/90 backdrop-blur-sm border border-rose-200/80 text-rose-700 rounded-2xl flex items-start gap-3 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Riwayat Panel */}
          {mounted && history.length > 0 && !report && (
            <RiwayatPanel
              history={history}
              onMuat={muatDariRiwayat}
              onClearHistory={handleClearHistory}
            />
          )}

          {/* Form Diagnosis */}
          {!loading && !report && (
            <FormDiagnose
              form={form}
              loading={loading}
              report={report}
              onSubmit={handleSubmit}
              onInputChange={handleInputChange}
              onSelectKeluhan={handleSelectKeluhan}
            />
          )}

          {/* Loading State */}
          {loading && (
            <div className="backdrop-blur-xl bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 rounded-3xl p-12 sm:p-16 text-center space-y-6">
              <div className="relative inline-flex">
                <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-[0_8px_30px_rgb(16,185,129,0.2)]">
                  <HeartPulse className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Laboratorium Analisis AI Sedang Bekerja</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Dokter AI sedang mengidentifikasi struktur biaya dan meracik resep model bisnis paket langganan yang aman dari perang harga.
                </p>
              </div>
              <div className="flex justify-center gap-1.5">
                {[0, 1, 2].map((i: number) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-emerald-500/60 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Hasil Diagnosis */}
          {report && (
            <ResepCard
              report={report}
              onKonsultasiUlang={handleKonsultasiUlang}
            />
          )}

        </div>
      </section>

      {/* ================================================================== */}
      {/* FOOTER                                                             */}
      {/* ================================================================== */}
      <footer className="border-t border-slate-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Stethoscope className="w-4 h-4 text-emerald-500" />
              <span>Klinik UMKM &mdash; Diagnosis Berbasis AI</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span>Gratis &bull; Open Source</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>Ditenagai Gemini 2.5 Flash</span>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}
