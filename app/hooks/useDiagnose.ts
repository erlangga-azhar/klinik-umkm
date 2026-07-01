'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatLogEntry } from '@/app/components/ChatBox';

// =========================================================================
// Types
// =========================================================================

export interface HistoryItem {
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

interface FormData {
  produk: string;
  hargaModal: string;
  hargaJualLama: string;
  keluhan: string;
}

interface UseDiagnoseReturn {
  // Form
  form: FormData;
  handleInputChange: (e: any) => void;
  handleSelectKeluhan: (teksKeluhan: string) => void;

  // Submit & Results
  loading: boolean;
  error: string;
  report: any;
  handleSubmit: (e: any) => Promise<void>;
  handleKonsultasiUlang: () => void;

  // Chat 3 Ronde
  chatLogs: ChatLogEntry[];
  followUpCount: number;
  isSessionClosed: boolean;
  chatLoading: boolean;
  currentHistoryId: string | null;
  handleChatSubmit: (question: string) => Promise<void>;

  // Riwayat
  history: HistoryItem[];
  muatDariRiwayat: (item: HistoryItem) => void;
  handleClearHistory: () => void;

  // Rate Limit Countdown
  retryAfter: number | null;

  // UI Utilities
  mounted: boolean;
  scrollToForm: () => void;
  formRef: React.RefObject<HTMLDivElement | null>;
}

const MAX_FOLLOW_UPS = 3;

// =========================================================================
// useDiagnose — Custom Hook
// =========================================================================
// Mengelola seluruh state aplikasi: form, diagnosis, chat 3 ronde,
// riwayat localStorage, loading, dan error.
// =========================================================================

export function useDiagnose(): UseDiagnoseReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [report, setReport] = useState<any>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mounted, setMounted] = useState<boolean>(false);

  // Chat 3 Ronde States
  // Rate limit timer — ditrigger oleh 429 response
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  // ==================================================================
  // COUNTDOWN TIMER — live tick setiap 1 detik
  // ==================================================================
  useEffect(() => {
    if (retryAfter === null || retryAfter <= 0) return;

    const timer = setInterval(() => {
      setRetryAfter((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [retryAfter !== null]);

  const [chatLogs, setChatLogs] = useState<ChatLogEntry[]>([]);
  const [followUpCount, setFollowUpCount] = useState<number>(0);
  const [isSessionClosed, setIsSessionClosed] = useState<boolean>(false);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormData>({
    produk: '',
    hargaModal: '',
    hargaJualLama: '',
    keluhan: ''
  });

  // ==================================================================
  // HYDRATION SAFEGUARD — localStorage hanya diakses setelah mounted
  // ==================================================================
  useEffect(() => {
    setMounted(true);
    // typeof window guard sebagai defense-in-depth untuk SSR
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('klinik-umkm-history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (e: any) {
      // localStorage tidak tersedia atau data rusak — abaikan
    }
  }, []);

  // ==================================================================
  // SIMPAN & MUAT RIWAYAT
  // ==================================================================

  const simpanRiwayat = useCallback((newReport: any, chatData?: { chatLogs: ChatLogEntry[]; followUpCount: number }) => {
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
    setHistory(prev => {
      const updated = [item, ...prev].slice(0, 20);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('klinik-umkm-history', JSON.stringify(updated));
        } catch (e: any) {
          // Quota exceeded atau localStorage tidak tersedia
        }
      }
      return updated;
    });
    setCurrentHistoryId(item.id);
  }, [form]);

  const updateRiwayatChat = useCallback((chatLogs: ChatLogEntry[], followUpCount: number) => {
    setHistory(prev => {
      const updated = prev.map((item: HistoryItem) => {
        if (item.id === currentHistoryId) {
          return { ...item, chatLogs, followUpCount };
        }
        return item;
      });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('klinik-umkm-history', JSON.stringify(updated));
        } catch (e: any) {
          // Quota exceeded atau localStorage tidak tersedia
        }
      }
      return updated;
    });
  }, [currentHistoryId]);

  const muatDariRiwayat = useCallback((item: HistoryItem) => {
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
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('klinik-umkm-history');
      } catch (e: any) {
        // localStorage tidak tersedia
      }
    }
  }, []);

  // ==================================================================
  // FORM HANDLERS
  // ==================================================================

  const handleInputChange = useCallback((e: any) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSelectKeluhan = useCallback((teksKeluhan: string) => {
    setForm(prev => ({ ...prev, keluhan: teksKeluhan }));
  }, []);

  const scrollToForm = useCallback(() => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // ==================================================================
  // DIAGNOSIS SUBMIT
  // ==================================================================

  const handleSubmit = useCallback(async (e: any) => {
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

      // --- 429 Too Many Requests — simpan retryAfter, tampilkan countdown ---
      if (res.status === 429) {
        setRetryAfter(data.retryAfter || 300);
        throw new Error(data.error || 'Terlalu banyak permintaan. Silakan coba lagi dalam beberapa menit.');
      }

      if (!res.ok) throw new Error(data.error || 'Gagal memproses data.');

      setReport(data);
      simpanRiwayat(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  }, [form, simpanRiwayat]);

  const handleKonsultasiUlang = useCallback(() => {
    setReport(null);
    setChatLogs([]);
    setFollowUpCount(0);
    setIsSessionClosed(false);
    setCurrentHistoryId(null);
    setForm({ produk: '', hargaModal: '', hargaJualLama: '', keluhan: '' });
  }, []);

  // ==================================================================
  // CHAT 3 RONDE
  // ==================================================================

  const handleChatSubmit = useCallback(async (question: string) => {
    if (chatLoading || isSessionClosed) return;

    const userQuestion = question;
    setChatLoading(true);

    const updatedLogs: ChatLogEntry[] = [
      ...chatLogs,
      { question: userQuestion, answer: '' },
    ];
    setChatLogs(updatedLogs);

    try {
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

      // --- 429 Too Many Requests pada chat — simpan retryAfter, countdown ---
      if (res.status === 429) {
        setRetryAfter(data.retryAfter || 300);
        const failedCount = followUpCount + 1;
        const failedLogs: ChatLogEntry[] = [
          ...chatLogs,
          { question: userQuestion, answer: data.error || 'Terlalu banyak permintaan. Silakan coba lagi dalam beberapa menit.' },
        ];
        setChatLogs(failedLogs);
        setFollowUpCount(failedCount);
        if (failedCount >= MAX_FOLLOW_UPS) {
          setIsSessionClosed(true);
        }
        updateRiwayatChat(failedLogs, failedCount);
        setChatLoading(false);
        return;
      }

      const aiReply = data.reply || 'Maaf, saya tidak bisa menjawab saat ini. Coba lagi ya.';
      const newCount = followUpCount + 1;

      const finalLogs: ChatLogEntry[] = [
        ...chatLogs,
        { question: userQuestion, answer: aiReply },
      ];

      setChatLogs(finalLogs);
      setFollowUpCount(newCount);

      if (newCount >= MAX_FOLLOW_UPS) {
        setIsSessionClosed(true);
      }

      updateRiwayatChat(finalLogs, newCount);

    } catch (err: any) {
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
  }, [chatLogs, chatLoading, isSessionClosed, followUpCount, updateRiwayatChat]);

  return {
    form,
    handleInputChange,
    handleSelectKeluhan,
    loading,
    error,
    report,
    handleSubmit,
    handleKonsultasiUlang,
    chatLogs,
    followUpCount,
    isSessionClosed,
    chatLoading,
    currentHistoryId,
    handleChatSubmit,
    history,
    muatDariRiwayat,
    handleClearHistory,
    retryAfter,
    mounted,
    scrollToForm,
    formRef,
  };
}

export { MAX_FOLLOW_UPS };
