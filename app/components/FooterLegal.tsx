'use client';

import { useState } from 'react';
import {
  Stethoscope, FileText, ShieldCheck, Copyright, X,
} from 'lucide-react';

type ModalType = 'terms' | 'privacy' | 'copyright' | null;

const MODAL_CONTENT: Record<Exclude<ModalType, null>, { title: string; icon: any; body: string }> = {
  terms: {
    title: 'Terms & Conditions',
    icon: FileText,
    body: 'Aplikasi "Klinik UMKM" adalah alat bantu rekomendasi berbasis AI (Artificial Intelligence) yang dirancang untuk membantu pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) dalam menganalisis struktur biaya dan meracik ide model bisnis. Seluruh hasil diagnosis, kalkulasi finansial, dan saran yang diberikan bersifat informatif dan konsultatif — BUKAN jaminan mutlak keberhasilan bisnis. Segala keputusan finansial akhir, termasuk namun tidak terbatas pada penetapan harga, strategi pemasaran, dan pengelolaan modal, tetap menjadi tanggung jawab penuh masing-masing pelaku usaha. Pengguna disarankan untuk melakukan validasi lebih lanjut dan berkonsultasi dengan tenaga ahli profesional sebelum mengambil keputusan bisnis strategis.',
  },
  privacy: {
    title: 'Privacy Policy',
    icon: ShieldCheck,
    body: 'Klinik UMKM menghormati privasi data bisnis Anda. Seluruh data yang dimasukkan — termasuk nama produk, Harga Pokok Penjualan (HPP), omzet, keluhan bisnis, dan riwayat chat — hanya diproses secara instan di dua tempat: (1) localStorage browser Anda untuk menyimpan riwayat diagnosis, dan (2) API Google Gemini untuk menghasilkan rekomendasi diagnosis. Kami TIDAK menyimpan data Anda di database eksternal, server pihak ketiga, atau sistem penyimpanan permanen mana pun. Data Anda aman, privat, dan sepenuhnya berada dalam kendali Anda. Anda dapat menghapus seluruh riwayat kapan saja melalui tombol "Hapus" di panel Rekam Medis Digital.',
  },
  copyright: {
    title: 'Hak Cipta',
    icon: Copyright,
    body: '© 2026 Klinik UMKM oleh Erlangga Azhar. Seluruh hak cipta dilindungi undang-undang. Dilarang memperbanyak, mendistribusikan, atau memanfaatkan sebagian atau seluruh konten aplikasi ini tanpa izin tertulis dari pengembang.',
  },
};

// Inline SVG untuk brand icons (tidak tersedia di lucide-react v1.22)
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function FooterLegal() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openModal = (type: ModalType) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  return (
    <>
      {/* ================================================================== */}
      {/* FOOTER PREMIUM                                                      */}
      {/* ================================================================== */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12 mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Branding + Social */}
          <div className="flex flex-col items-center text-center gap-6">
            {/* Logo & Tagline */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white tracking-tight">Klinik UMKM</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.12em] font-medium">by Erlangga Azhar</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              Diagnosis bisnis berbasis AI untuk UMKM Indonesia. Gratis, tanpa spam, tanpa daftar akun.
            </p>

            {/* Social Icons — inline SVG karena lucide-react tidak menyertakan brand icons */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/erlng_zhr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-slate-800 transition-all duration-200 group"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </a>
              <a
                href="https://github.com/erlangga-azhar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-slate-800 transition-all duration-200 group"
                aria-label="GitHub"
              >
                <GithubIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </a>
              <a
                href="https://linkedin.com/in/erlangga-azhar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-slate-800 transition-all duration-200 group"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-slate-800/80" />

          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
            <button
              onClick={() => openModal('terms')}
              className="text-slate-500 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1.5"
            >
              <FileText className="w-3 h-3" />
              Terms &amp; Conditions
            </button>
            <button
              onClick={() => openModal('privacy')}
              className="text-slate-500 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3 h-3" />
              Privacy Policy
            </button>
            <button
              onClick={() => openModal('copyright')}
              className="text-slate-500 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1.5"
            >
              <Copyright className="w-3 h-3" />
              Hak Cipta
            </button>
          </div>

          {/* Bottom Credit */}
          <div className="mt-6 text-center">
            <p className="text-[10px] text-slate-600 uppercase tracking-[0.15em]">
              Developed by <span className="text-slate-400 font-semibold">Erlangga Azhar</span>
            </p>
            <p className="text-[10px] text-slate-700 mt-1">
              &copy; 2026 Klinik UMKM &mdash; All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* ================================================================== */}
      {/* LEGAL MODAL (Glassmorphism + CSS transition)                        */}
      {/* ================================================================== */}
      {/* Animasi menggunakan CSS transition (opacity + scale) agar modal    */}
      {/* muncul dengan efek "fade + zoom" tanpa perlu plugin Tailwind       */}
      {/* eksternal. State `activeModal` dikontrol via React useState.       */}
      {/* ================================================================== */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ease-out ${
          activeModal
            ? 'visible opacity-100'
            : 'invisible opacity-0 pointer-events-none'
        }`}
        onClick={closeModal}
      >
        {/* Backdrop */}
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300 ${
          activeModal ? 'opacity-100' : 'opacity-0'
        }`} />

        {/* Modal Card */}
        <div
          className={`relative max-w-lg w-full bg-white/70 dark:bg-zinc-900/75 border border-slate-100/80 dark:border-zinc-800/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgb(0,0,0,0.12)] dark:shadow-[0_20px_60px_rgb(0,0,0,0.5)] transition-all duration-300 ease-out ${
            activeModal
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-95'
          }`}
          onClick={(e: any) => e.stopPropagation()}
        >
          {/* Konten modal hanya dirender jika activeModal tidak null */}
          {activeModal && (() => {
            const content = MODAL_CONTENT[activeModal];
            const Icon = content.icon;
            return (
              <>
                {/* Close button */}
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-100/80 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-center text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-200/80 dark:hover:bg-zinc-700/80 transition-all duration-200"
                  aria-label="Tutup modal"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-100/80 dark:border-emerald-800/60 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{content.title}</h3>
                </div>

                {/* Body */}
                <div className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-h-[50vh] overflow-y-auto pr-1">
                  <p>{content.body}</p>
                </div>

                {/* Close action */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    onClick={closeModal}
                    className="w-full py-3 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold rounded-2xl transition-all duration-200 text-sm shadow-[0_4px_16px_rgb(16,185,129,0.15)] active:scale-[0.98]"
                  >
                    Tutup
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </>
  );
}
