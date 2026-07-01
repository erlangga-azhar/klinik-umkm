'use client';

import { useState, useEffect } from 'react';
import {
  Send,
  LockKeyhole, MessageCircle,
} from 'lucide-react';

export interface ChatLogEntry {
  question: string;
  answer: string;
}

interface ChatBoxProps {
  chatLogs: ChatLogEntry[];
  followUpCount: number;
  isSessionClosed: boolean;
  chatLoading: boolean;
  maxFollowUps: number;
  onSendMessage: (question: string) => void;
}

export default function ChatBox({
  chatLogs,
  followUpCount,
  isSessionClosed,
  chatLoading,
  maxFollowUps,
  onSendMessage,
}: ChatBoxProps) {
  const [chatQuestion, setChatQuestion] = useState<string>('');

  // Auto-scroll chat ke bawah saat ada pesan baru
  useEffect(() => {
    const el = document.getElementById('chat-end-anchor');
    el?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLogs]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!chatQuestion.trim() || chatLoading || isSessionClosed) return;
    onSendMessage(chatQuestion.trim());
    setChatQuestion('');
  };

  return (
    <div className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-slate-100/80 dark:border-zinc-800/80 rounded-3xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-zinc-500 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Sesi Tanya Dokter
        </h3>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
          isSessionClosed
            ? 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-400 dark:text-zinc-500'
            : 'bg-emerald-50/80 dark:bg-emerald-900/40 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300'
        }`}>
          {isSessionClosed
            ? 'Sesi Berakhir'
            : `Sisa Kuota: ${maxFollowUps - followUpCount} Kali`
          }
        </span>
      </div>

      {/* Chat Logs */}
      <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto pr-1">
        {chatLogs.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-slate-400 dark:text-zinc-500 italic">
              Ada yang mau ditanyakan soal resep di atas? Kasih tahu Dokter, gratis 3x tanya.
            </p>
          </div>
        )}

        {chatLogs.map((log: ChatLogEntry, idx: number) => (
          <div key={idx} className="space-y-2">
            {/* Bubble User */}
            <div className="flex justify-end">
              <div className="max-w-[85%] sm:max-w-[75%] bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-sm rounded-2xl rounded-br-md px-4 py-2.5 shadow-[0_2px_12px_rgb(16,185,129,0.12)]">
                <p className="leading-relaxed">{log.question}</p>
              </div>
            </div>
            {/* Bubble AI */}
            {log.answer && (
              <div className="flex justify-start">
                <div className="max-w-[85%] sm:max-w-[75%] bg-slate-100/90 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 text-slate-700 dark:text-zinc-300 text-sm rounded-2xl rounded-bl-md px-4 py-2.5 shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                  <p className="leading-relaxed">{log.answer}</p>
                </div>
              </div>
            )}
            {/* Loading dots untuk jawaban yang belum datang */}
            {!log.answer && (
              <div className="flex justify-start">
                <div className="bg-slate-100/90 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 text-slate-400 dark:text-zinc-500 text-sm rounded-2xl rounded-bl-md px-4 py-3 shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div id="chat-end-anchor" />
      </div>

      {/* Session Closed Banner */}
      {isSessionClosed && (
        <div className="mb-4 p-4 bg-slate-50/90 dark:bg-zinc-800/90 border border-slate-200/80 dark:border-zinc-700/80 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
            <LockKeyhole className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">Sesi Konsultasi Ditutup</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Resep Bisnis Anda Telah Dikunci &amp; Disimpan di Rekam Medis.
            </p>
          </div>
        </div>
      )}

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
        <input
          type="text"
          placeholder={isSessionClosed ? "Sesi telah berakhir..." : "Tanya soal margin, stok, atau strategi..."}
          value={chatQuestion}
          onChange={(e: any) => setChatQuestion(e.target.value)}
          disabled={isSessionClosed || chatLoading}
          className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-700/80 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400/70 dark:placeholder:text-zinc-500/70 text-sm transition-all duration-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none shadow-[0_2px_8px_rgb(0,0,0,0.02)] disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={isSessionClosed || chatLoading || !chatQuestion.trim()}
          className="w-11 h-11 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white flex items-center justify-center transition-all duration-200 shadow-[0_4px_16px_rgb(16,185,129,0.15)] hover:shadow-[0_6px_24px_rgb(16,185,129,0.25)] active:scale-[0.92] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {chatLoading ? (
            <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}
