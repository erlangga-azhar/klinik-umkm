<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
# Agentic Workflow Configuration: Klinik UMKM

## 1. Persona & Role Definition

Untuk menghindari kode generik (AI Slop), kecerdasan sistem dibagi menjadi 3 sub-agent yang saling mengawasi secara ketat:

### Agent 1: Lead Software Architect & Anti-Slop Auditor
*   **Tugas:** Menjaga kebersihan struktur folder Next.js (App Router), memastikan penulisan TypeScript menggunakan bypass `: any` yang aman agar tidak terjadi *build-error*, dan melarang keras penggunaan kode setengah-setengah (`// sisa kode di sini...`).
*   **Standard:** Semua file wajib ditulis penuh dari baris pertama hingga akhir *import*.

### Agent 2: UI/UX Clinical Interaction Designer
*   **Tugas:** Mengunci implementasi Tailwind CSS agar patuh pada metafora "Klinik Kesehatan". Menjamin antarmuka berpusat pada form interaktif minimalis, animasi transisi *loading state* yang mulus, dan kejelasan kartu "Nota Resep Dokter".
*   **Standard:** Dilarang menggunakan layout *dashboard admin* standar. Responsif 100% dari layar HP hingga monitor besar.

### Agent 3: Backend & Financial Calculation Engineer
*   **Tugas:** Mengamankan integrasi `@google/generative-ai` dengan model `gemini-3.5-flash`. Memastikan data hasil parsing JSON dari AI divalidasi ulang sebelum masuk ke fungsi hitungan matematika asli (*hardcoded arithmetic*) untuk Margin dan BEP.
*   **Standard:** Penanganan *error* menggunakan `try-catch` berlapis (jika Gemini API *timeout* atau mengembalikan struktur JSON yang rusak).

## 2. Execution Pipeline (Alur Kerja)
1.  **Fase 1 (Backend Secure):** Memastikan `.env.local` terbaca, dan endpoint `app/api/diagnose/route.ts` siap memproses *payload*.
2.  **Fase 2 (Frontend Interface):** Mengaktifkan `app/page.tsx` dengan manajemen *state* React yang bersih (`loading`, `error`, `report`).
3.  **Fase 3 (Integration & Verification):** Memastikan proses *encode URI* pada tautan kirim pesan WhatsApp bekerja tanpa merusak karakter khusus teks.