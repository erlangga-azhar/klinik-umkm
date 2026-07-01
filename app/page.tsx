'use client';

import { useState, useEffect, useRef } from 'react';
import {
  BrainCircuit,
  HeartPulse, ArrowDownToLine, Syringe, Sparkles, ScrollText,
  AlertTriangle, Wallet, TrendingDown, Boxes, MessageSquareX,
  Sun, Moon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import FormDiagnose from '@/app/components/FormDiagnose';
import RiwayatPanel from '@/app/components/RiwayatPanel';
import ResepCard from '@/app/components/ResepCard';
import CaraKerja from '@/app/components/CaraKerja';
import ChatBox from '@/app/components/ChatBox';
import FooterLegal from '@/app/components/FooterLegal';
import type { ChatLogEntry } from '@/app/components/ChatBox';

interface HistoryItem {
  id: string;
  timestamp: string;
  produk: string;
  hargaModal: string;
  hargaJualLama: string;
  keluhan: string;
  nama_ide_pivot: string;
  report: any;
  chatLogs?: ChatLogEntry[];
  followUpCount?: number;
}

const MAX_FOLLOW_UPS = 3;

const PAIN_POINTS = [
  {
    icon: Wallet,
    label: 'Keuangan',
    title: 'Pengelolaan Keuangan (Sindrom Laci Warung)',
    desc: 'Uang hasil penjualan tercampur dengan uang dapur. Omzet harian terlihat besar, tapi pas akhir bulan dihitung, saldo ATM malah nol dan modal habis tak berbekas.',
    gradient: 'from-rose-300 to-rose-400',
    badge: 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-100/80 dark:border-rose-900/60 text-rose-600 dark:text-rose-300',
    iconBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/60 text-rose-500 dark:text-rose-300',
  },
  {
    icon: TrendingDown,
    label: 'Pemasaran',
    title: 'Pemasaran Digital (Korban Banting Harga)',
    desc: 'Sudah lelah bikin konten dan bakar modal buat promosi, tapi pembeli cuma datang pas ada diskon gila-gilaan. Begitu harga kembali normal, toko langsung sepi senyap.',
    gradient: 'from-amber-300 to-amber-400',
    badge: 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-100/80 dark:border-amber-900/60 text-amber-600 dark:text-amber-300',
    iconBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/60 text-amber-500 dark:text-amber-300',
  },
  {
    icon: Boxes,
    label: 'Stok',
    title: 'Manajemen Stok (Modal Mati di Gudang)',
    desc: 'Salah prediksi tren membuat barang yang tidak laku menumpuk jadi pajangan mati di gudang, sementara produk yang sedang dicari pelanggan malah kehabisan modal untuk kulakan.',
    gradient: 'from-sky-300 to-sky-400',
    badge: 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-100/80 dark:border-sky-900/60 text-sky-600 dark:text-sky-300',
    iconBg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-100 dark:border-sky-900/60 text-sky-500 dark:text-sky-300',
  },
  {
    icon: MessageSquareX,
    label: 'Layanan',
    title: 'Layanan Pelanggan (Habis Energi Bales Chat)',
    desc: 'Energi habis seharian hanya untuk membalas ribuan chat calon pembeli yang cuma "P", tanya-tanya kelengkapan produk, minta diskon gratis ongkir, tapi ujung-ujungnya PHP.',
    gradient: 'from-violet-300 to-violet-400',
    badge: 'bg-violet-50/80 dark:bg-violet-950/40 border-violet-100/80 dark:border-violet-900/60 text-violet-600 dark:text-violet-300',
    iconBg: 'bg-violet-50 dark:bg-violet-950/40 border-violet-100 dark:border-violet-900/60 text-violet-500 dark:text-violet-300',
  },
];

export default function KlinikUMKM() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [report, setReport] = useState<any>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);

  // Chat 3 Ronde States
  const [chatLogs, setChatLogs] = useState<ChatLogEntry[]>([]);
  const [followUpCount, setFollowUpCount] = useState<number>(0);
  const [isSessionClosed, setIsSessionClosed] = useState<boolean>(false);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);

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

  const simpanRiwayat = (newReport: any, chatData?: { chatLogs: ChatLogEntry[]; followUpCount: number }) => {
    const item: HistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('id-ID'),
      produk: form.produk,
      hargaModal: form.hargaModal,
      hargaJualLama: form.hargaJualLama,
      keluhan: form.keluhan,
      nama_ide_pivot: newReport.nama_ide_pivot || '',
      report: newReport,
      chatLogs: chatData?.chatLogs || [],
      followUpCount: chatData?.followUpCount || 0,
    };
    const updated = [item, ...history].slice(0, 20);
    setHistory(updated);
    setCurrentHistoryId(item.id);
    try {
      localStorage.setItem('klinik-umkm-history', JSON.stringify(updated));
    } catch (e: any) {
      // localStorage penuh
    }
  };

  const updateRiwayatChat = (chatLogs: ChatLogEntry[], followUpCount: number) => {
    setHistory(prev => {
      const updated = prev.map((item: HistoryItem) => {
        if (item.id === currentHistoryId) {
          return { ...item, chatLogs, followUpCount };
        }
        return item;
      });
      try {
        localStorage.setItem('klinik-umkm-history', JSON.stringify(updated));
      } catch (e: any) {}
      return updated;
    });
  };

  const muatDariRiwayat = (item: HistoryItem) => {
    setReport(item.report);
    setError('');
    setChatLogs(item.chatLogs || []);
    setFollowUpCount(item.followUpCount || 0);
    setIsSessionClosed((item.followUpCount || 0) >= MAX_FOLLOW_UPS);
    setCurrentHistoryId(item.id);
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
    setChatLogs([]);
    setFollowUpCount(0);
    setIsSessionClosed(false);
    setCurrentHistoryId(null);

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
    setChatLogs([]);
    setFollowUpCount(0);
    setIsSessionClosed(false);
    setCurrentHistoryId(null);
    setForm({ produk: '', hargaModal: '', hargaJualLama: '', keluhan: '' });
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleChatSubmit = async (question: string) => {
    if (chatLoading || isSessionClosed) return;

    const userQuestion = question;
    setChatLoading(true);

    // Rekam pertanyaan user ke log lokal dulu
    const updatedLogs: ChatLogEntry[] = [
      ...chatLogs,
      { question: userQuestion, answer: '' },
    ];
    setChatLogs(updatedLogs);

    try {
      // Bangun chatHistory untuk dikirim ke API
      const chatHistoryPayload = chatLogs.map((log: ChatLogEntry) => ({
        question: log.question,
        answer: log.answer,
      }));

      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatHistory: chatHistoryPayload,
          pertanyaan: userQuestion,
        }),
      });

      const data = await res.json();
      const aiReply = data.reply || 'Maaf, saya tidak bisa menjawab saat ini. Coba lagi ya.';

      const newCount = followUpCount + 1;

      // Update log dengan jawaban AI
      const finalLogs: ChatLogEntry[] = [
        ...chatLogs,
        { question: userQuestion, answer: aiReply },
      ];

      setChatLogs(finalLogs);
      setFollowUpCount(newCount);

      if (newCount >= MAX_FOLLOW_UPS) {
        setIsSessionClosed(true);
      }

      // Simpan ke localStorage via update riwayat
      updateRiwayatChat(finalLogs, newCount);

    } catch (err: any) {
      // Jika gagal, tetap catat jawaban error
      const failedCount = followUpCount + 1;
      const failedLogs: ChatLogEntry[] = [
        ...chatLogs,
        { question: userQuestion, answer: 'Maaf, terjadi gangguan jaringan. Coba tanya lagi ya.' },
      ];
      setChatLogs(failedLogs);
      setFollowUpCount(failedCount);
      if (failedCount >= MAX_FOLLOW_UPS) {
        setIsSessionClosed(true);
      }
      updateRiwayatChat(failedLogs, failedCount);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/15 to-white text-slate-800 dark:from-zinc-950 dark:via-emerald-950/10 dark:to-zinc-900 dark:text-zinc-100 transition-[color,background,border,box-shadow] duration-300">

      {/* ================================================================== */}
      {/* DATA GRID PATTERN — garis metrik samar di seluruh halaman           */}
      {/* ================================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" />

      {/* ================================================================== */}
      {/* FLOATING AURA BLOBS — pendaran cahaya dinamis yang bernapas pelan   */}
      {/* ================================================================== */}
      <div className="fixed pointer-events-none z-0 inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full bg-emerald-400/10 dark:bg-emerald-400/15 blur-[130px] animate-aura-pulse" />
        <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] rounded-full bg-indigo-400/10 dark:bg-indigo-500/15 blur-[130px] animate-aura-pulse-delayed" />
      </div>

      {/* ================================================================== */}
      {/* THEME TOGGLE — Floating button, safe di viewport corner,            */}
      {/* tidak overlapping dengan konten hero di layar HP kecil              */}
      {/* ================================================================== */}
      {mounted && (
        <div className="fixed top-3 right-3 sm:top-5 sm:right-5 z-50">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/90 dark:bg-zinc-800/90 border border-slate-200/70 dark:border-zinc-700/70 flex items-center justify-center text-slate-600 dark:text-zinc-300 shadow-[0_2px_12px_rgb(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.1)] dark:hover:shadow-[0_4px_20px_rgb(0,0,0,0.3)] backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label={theme === 'dark' ? 'Aktifkan Light Mode' : 'Aktifkan Dark Mode'}
            title={theme === 'dark' ? 'Aktifkan Light Mode' : 'Aktifkan Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300" />
            )}
          </button>
        </div>
      )}

      {/* ================================================================== */}
      {/* HERO SECTION                                                       */}
      {/* ================================================================== */}
      <section className="relative overflow-hidden pt-20 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex mb-6 items-center gap-2 px-4 py-2 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-sm border border-slate-200/70 dark:border-zinc-800/70 rounded-full shadow-[0_2px_12px_rgb(0,0,0,0.03)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 tracking-wide uppercase">
              AI Diagnosis Gratis &bull; Made for UMKM Indonesia
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] sm:leading-[1.05]">
            Bosan{' '}
            <span className="bg-gradient-to-r from-rose-500 to-rose-400 bg-clip-text text-transparent">
              Banting Harga
            </span>{' '}
            Terus?
            <br />
            <span className="text-slate-900 dark:text-white">
              Biar Dokter AI yang{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                Racik Model Langganan
              </span>{' '}
              Anti Boncos
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Omzet gede, pas dihitung malah boncos? Pelanggan cuma datang pas promo doang? 
            Berhenti tebak-tebak margin. Masukkan modal dan harga jual Anda, dapatkan resep 
            model bisnis langganan plus kalkulasi BEP dalam 3 menit. <strong className="text-slate-700 dark:text-zinc-200">Gratis, tanpa spam.</strong>
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={scrollToForm}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold text-lg py-4 px-8 rounded-2xl transition-all duration-300 shadow-[0_8px_30px_rgb(16,185,129,0.25)] hover:shadow-[0_12px_40px_rgb(16,185,129,0.35)] active:scale-[0.97] hover:scale-[1.02]"
            >
              <span className="absolute inset-0 rounded-2xl ring-2 ring-emerald-400/40 ring-offset-2 ring-offset-slate-50 dark:ring-offset-zinc-950 group-hover:ring-emerald-500/60 transition-all duration-300" />
              <Syringe className="w-6 h-6" />
              Cek Kesehatan Bisnis Sekarang
              <ArrowDownToLine className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-200" />
            </button>
            <span className="text-sm text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Tidak perlu daftar akun
            </span>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs text-slate-400 dark:text-zinc-500 font-medium">
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
      {/* EMOTIONAL PAIN POINTS — 4 KOLOM (Desktop) / 1 KOLOM (Mobile)       */}
      {/* ================================================================== */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Pilih Penyakit Bisnis yang Paling Membuat Anda Lelah Saat Ini
            </h2>
            <p className="mt-3 text-slate-500 dark:text-zinc-400 max-w-lg mx-auto">
              Pilih salah satu—atau jujur saja, Anda pasti mengalami lebih dari satu. 
              Tenang, semua ada resep obatnya.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {PAIN_POINTS.map((point, idx) => {
              const IconComp = point.icon;
              return (
                <div
                  key={idx}
                  className="group relative bg-white/70 dark:bg-zinc-900/75 border border-slate-100/80 dark:border-zinc-800/60 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-[0_2px_16px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_2px_16px_rgb(0,0,0,0.15)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Glassmorphism shine overlay */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/40 dark:from-white/5 to-transparent pointer-events-none" />

                  {/* Top accent line */}
                  <div className={`absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r ${point.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  <div className="relative z-10">
                    <div className={`w-11 h-11 rounded-2xl ${point.iconBg} flex items-center justify-center mb-3.5`}>
                      <IconComp className="w-5 h-5" />
                    </div>

                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${point.badge} rounded-full text-[10px] font-bold uppercase tracking-wider mb-2.5`}>
                      <span className={`w-1 h-1 rounded-full bg-current`} />
                      {point.label}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                      {point.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                      {point.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <CaraKerja />

      {/* ================================================================== */}
      {/* FORM & DIAGNOSIS CONTAINER                                         */}
      {/* ================================================================== */}
      <div ref={formRef} className="scroll-mt-8" />

      <section className="px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        <div className="max-w-3xl mx-auto">

          {/* Error notification */}            {error && (
            <div className="mb-6 p-4 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 backdrop-blur-md text-rose-700 dark:text-rose-300 rounded-2xl flex items-start gap-3 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
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
            <div className="bg-white/70 dark:bg-zinc-900/75 border border-slate-100/80 dark:border-zinc-800/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] rounded-3xl p-12 sm:p-16 text-center space-y-6">
              <div className="relative inline-flex">
                <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-[0_8px_30px_rgb(16,185,129,0.2)]">
                  <HeartPulse className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Laboratorium Analisis AI Sedang Bekerja</h3>
                <p className="text-sm text-slate-400 dark:text-zinc-500 max-w-sm mx-auto leading-relaxed">
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

          {/* Hasil Diagnosis + Chat 3 Ronde */}
          {report && (
            <div className="space-y-6">
              <ResepCard
                report={report}
                onKonsultasiUlang={handleKonsultasiUlang}
              />

              <ChatBox
                chatLogs={chatLogs}
                followUpCount={followUpCount}
                isSessionClosed={isSessionClosed}
                chatLoading={chatLoading}
                maxFollowUps={MAX_FOLLOW_UPS}
                onSendMessage={handleChatSubmit}
              />
            </div>
          )}

        </div>
      </section>

      <FooterLegal />

    </main>
  );
}
