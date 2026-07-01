<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/Klinik_UMKM-🩺-10b981?style=for-the-badge&labelColor=18181b&logo=vercel&logoColor=white" />
    <source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/badge/Klinik_UMKM-🩺-059669?style=for-the-badge&labelColor=f8fafc&logo=vercel&logoColor=0f172a" />
    <img alt="Klinik UMKM" src="https://img.shields.io/badge/Klinik_UMKM-🩺-059669?style=for-the-badge&labelColor=f8fafc&logo=vercel&logoColor=0f172a" />
  </picture>
</p>

<p align="center">
  <strong><em>🩺 AI Diagnosis Bisnis untuk UMKM Indonesia — Berhenti Banting Harga, Mulai Racik Model Langganan Anti Boncos.</em></strong>
</p>

<p align="center">
  <a href="https://klinik-umkm.vercel.app"><img src="https://img.shields.io/badge/Live_Demo-klinik--umkm.vercel.app-10b981?style=flat-square&logo=vercel&logoColor=white&labelColor=18181b" alt="Live Demo" /></a>
  <a href="https://klinik-umkm.vercel.app"><img src="https://img.shields.io/badge/Status-Production_Ready-22c55e?style=flat-square&labelColor=18181b" alt="Status" /></a>
  <a href="#test-coverage"><img src="https://img.shields.io/badge/Test_Coverage-192_tests-8b5cf6?style=flat-square&labelColor=18181b" alt="Test Coverage" /></a>
  <a href="https://github.com/erlangga-azhar/klinik-umkm/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/erlangga-azhar/klinik-umkm/ci.yml?style=flat-square&label=CI%2FCD&logo=githubactions&logoColor=white&labelColor=18181b" alt="CI/CD" /></a>
  <a href="https://github.com/erlangga-azhar/klinik-umkm/stargazers"><img src="https://img.shields.io/github/stars/erlangga-azhar/klinik-umkm?style=flat-square&logo=github&logoColor=white&labelColor=18181b" alt="Stars" /></a>
  <a href="https://github.com/erlangga-azhar/klinik-umkm/forks"><img src="https://img.shields.io/github/forks/erlangga-azhar/klinik-umkm?style=flat-square&logo=github&logoColor=white&labelColor=18181b" alt="Forks" /></a>
</p>

<br />

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Google_Gemini_2.5_Flash-8B5CF6?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://img.shields.io/badge/Clean_Architecture-22c55e?style=for-the-badge&logo=clean&logoColor=white" alt="Clean Architecture" />
</p>

<br />

---

## 📋 Daftar Isi

- [💉 Kenapa Klinik UMKM?](#-kenapa-klinik-umkm)
- [🧠 Fitur Unggulan](#-fitur-unggulan)
- [🏗️ Arsitektur — Clean Architecture](#️-arsitektur--clean-architecture)
- [🛡️ Keamanan — Berlapis](#️-keamanan--berlapis)
- [✅ Test Coverage](#-test-coverage)
- [📁 Struktur Proyek](#-struktur-proyek)
- [🚀 Cara Memulai](#-cara-memulai)
- [🔄 Changelog & Architectural Refactoring](#-changelog--architectural-refactoring)
- [🤝 Kontribusi](#-kontribusi)
- [👤 Developer](#-developer)
- [❓ FAQ](#-faq)
- [⚖️ Legalitas](#️-legalitas)

---

## 💉 Kenapa Klinik UMKM?

> Omzet gede, pas dihitung **boncos**. Pelanggan rame cuma pas **diskon gila-gilaan**. Uang hasil jualan **campur sama uang dapur**. Modal habis, stok mati, energi habis bales chat "P" doang.

**Klinik UMKM adalah Dokter AI untuk bisnis Anda.** Masukkan modal dan harga jual, dapatkan resep model bisnis langganan plus kalkulasi BEP dalam 3 menit. **Gratis, tanpa spam, tanpa daftar akun.**

<p align="center">
  <a href="https://klinik-umkm.vercel.app">
    <img src="https://img.shields.io/badge/🚀_Coba_Sekarang-10b981?style=for-the-badge&labelColor=18181b" alt="Coba Sekarang" />
  </a>
</p>

---

## 🧠 Fitur Unggulan

| Fitur | Detail | Teknologi |
|-------|--------|-----------|
| **🤖 AI Diagnosis Engine** | Growth Hacker persona — 4 aspek diagnosis (Keuangan, Stok, Pemasaran, Layanan) | Gemini 2.5 Flash + Structured JSON Mode |
| **💬 Deep-Dive Chat 3 Ronde** | Follow-up dengan konteks penuh, auto-lock setelah 3x | Context window 1M token |
| **📊 Kalkulator Unit Economics** | HPP, Margin, BEP — pure function tanpa AI | `financeService.ts` (34 test cases) |
| **📦 Rekam Medis Digital** | Riwayat diagnosis + chat logs di LocalStorage | `useDiagnose` custom hook |
| **🌓 Dark/Light Mode** | Persisten, deteksi preferensi sistem | `next-themes` |
| **🛡️ Anti-Spam Shield** | Rate limiter 3 req/jam per IP | In-memory `rateLimiter.ts` |
| **✨ Glassmorphism UI** | Premium blur + floating aura + parallax | Tailwind CSS v4 |

---

## 🏗️ Arsitektur — Clean Architecture

Proyek ini menerapkan **pemisahan lapisan** yang ketat antara Controller, Service/Business Logic, dan Presentasi.

```
📁 lib/                    →  SERVICE LAYER (Pure functions, AI config, Security)
📁 app/api/diagnose/       →  CONTROLLER LAYER (Thin orchestrator)
📁 app/hooks/              →  STATE MANAGEMENT LAYER (Custom hooks)
📁 app/components/         →  PRESENTATION LAYER (UI-only components)
📄 app/page.tsx            →  PAGE LAYER (Composition root)
```

### Backend Service Layer — `lib/`

| Service | Fungsi | Dependensi | Test Cases |
|---------|--------|------------|------------|
| `securityService.ts` | Validasi input 3 lapis: regex jailbreak, blacklist keyword, filter unicode | **Zero** — pure function | 50 |
| `financeService.ts` | Kalkulator finansial + simulasi diskon, bunga, margin target | **Zero** — pure function | 34 |
| `geminiService.ts` | Lazy init Gemini SDK, system instructions, prompt builders, fallback JSON | `@google/generative-ai` | — |
| `rateLimiter.ts` | In-memory IP-based rate limiter (3 req/jam) | **Zero** | — |

### Controller Layer — `app/api/diagnose/route.ts`

Thin controller — tidak mengandung logika bisnis, hanya orchestrasi:

```
POST /api/diagnose
  ├── Step 1: Rate Limit Check (getClientIP + checkRateLimit)
  ├── Step 2: Security Validation (validasiKeamananInput)
  ├── Step 3: AI Generation (getGenAI → generateContent)
  ├── Step 4: JSON Parse + Fallback (JSON.parse | buatFallbackJSON)
  ├── Step 5: Financial Calculation (hitungAnalisisFinansial)
  └── Response: NextResponse.json(finalReport)
```

### State Management — Custom Hook `useDiagnose.ts`

Semua state aplikasi dienkapsulasi dalam satu custom hook:

```tsx
const { form, loading, error, report, handleSubmit, retryAfter, ... } = useDiagnose();
```

| State | Tipe | Deskripsi |
|-------|------|-----------|
| `form` | `{ produk, hargaModal, hargaJualLama, keluhan }` | Data form diagnosis |
| `loading` | `boolean` | Status loading API |
| `error` | `string` | Pesan error (termasuk 429 rate limit) |
| `report` | `object \| null` | Hasil diagnosis dari AI |
| `retryAfter` | `number \| null` | Countdown rate limit (detik) |
| `chatLogs` | `ChatLogEntry[]` | Riwayat chat 3 ronde |
| `history` | `HistoryItem[]` | Riwayat diagnosis dari LocalStorage |

---

## 🛡️ Keamanan — Berlapis

### Lapisan 1: Anti-Spam Shield — IP Rate Limiter

```ts
// lib/rateLimiter.ts — in-memory, zero dependency
const result = checkRateLimit(clientIP);
// result = { limited: false } | { limited: true, retryAfter: 3420 }
```

- **3 request per jam per IP** — dicek SEBELUM parsing body atau hit Gemini
- **Live countdown timer** di frontend (MM:SS format + progress bar)
- **Per-IP isolation** — IP berbeda tidak saling mempengaruhi
- **Auto-cleanup** entry expired setiap 15 menit

### Lapisan 2: Input Validation — Security Service

3 mekanisme independen berjalan sekuensial:

| Lapisan | Mekanisme | Coverage |
|---------|-----------|----------|
| **Regex Patterns** | 15+ pola Prompt Injection | `ignore previous instructions`, `abaikan semua perintah`, `bocorkan system prompt` |
| **Blacklist Keywords** | 18+ kata ilegal | Narkoba, judi, penipuan, phishing, terorisme |
| **Character Filter** | Unicode range validation | Control chars, Cyrillic dalam input Bahasa Indonesia |

### Lapisan 3: Anti-Prompt Leak

Setiap system instruction Gemini mengandung **larangan absolut** untuk membocorkan:
- `AGENTS.md`, skema database, konfigurasi internal
- API key, environment variables
- System prompt atau instruksi

---

## ✅ Test Coverage

| Test File | Lokasi | Jumlah | Cakupan |
|-----------|--------|--------|---------|
| `route.security.test.ts` | `app/api/diagnose/` | 48 | Security guardrails — jailbreak regex, blacklist, unicode, boundary, false positive |
| `route.test.ts` | `app/api/diagnose/` | 9 | Financial calculator — HPP, margin, BEP |
| `route.int.test.ts` | `app/api/diagnose/` | 10 | Full API integration + 3 rate limit tests (429, per-IP isolation, chat mode) |
| `financeService.test.ts` | `lib/__tests__/` | 34 | Discount simulation, loan interest, margin target, edge cases |
| `securityService.test.ts` | `lib/__tests__/` | 50 | Advanced injection, multi-language, unicode, stress tests |
| `ResepCard.test.tsx` | `app/components/__tests__/` | 33 | Component rendering, 4 grid cards, summary, copy, WA link |
| **Total** | | **192** | ✅ Seluruhnya passing |

```bash
# Jalankan semua test (192 test cases)
npm test

# Test spesifik
npx vitest run app/components/__tests__/   # Component tests (33)
npx vitest run app/api/diagnose/            # API tests (67)
npx vitest run lib/__tests__/               # Service tests (84)
```

---

## 📁 Struktur Proyek

```
klinik-umkm/
├── .github/workflows/ci.yml        # CI: typecheck → lint → test → build
├── lib/
│   ├── index.ts                    # Barrel export
│   ├── securityService.ts          # Validasi input 3 lapis
│   ├── financeService.ts           # Kalkulator finansial (pure functions)
│   ├── geminiService.ts            # Gemini AI config + prompts
│   ├── rateLimiter.ts             # In-memory IP rate limiter
│   └── __tests__/
│       ├── financeService.test.ts  # 34 tests
│       └── securityService.test.ts # 50 tests
├── app/
│   ├── api/diagnose/
│   │   ├── route.ts                # Controller (thin orchestrator)
│   │   ├── route.test.ts           # 9 tests
│   │   ├── route.security.test.ts  # 48 tests
│   │   └── route.int.test.ts       # 10 tests
│   ├── hooks/
│   │   └── useDiagnose.ts          # State management hub
│   ├── components/
│   │   ├── __tests__/
│   │   │   └── ResepCard.test.tsx  # 33 tests
│   │   ├── CaraKerja.tsx           # 3-step explanation
│   │   ├── ChatBox.tsx             # Deep-dive chat UI
│   │   ├── FormDiagnose.tsx        # Input form
│   │   ├── FooterLegal.tsx         # Premium footer + modals
│   │   ├── ResepCard.tsx           # 4 grid cards + summary + WA share
│   │   └── RiwayatPanel.tsx        # Medical record panel
│   ├── layout.tsx                  # Root layout + SEO + ThemeProvider
│   ├── globals.css                 # Tailwind v4 + custom animations
│   └── page.tsx                    # Composition root (UI-only)
├── .env.example
├── vitest.config.ts
├── next.config.ts
└── tsconfig.json
```

---

## 🚀 Cara Memulai

### Prasyarat

- **Node.js** 20+
- **Google Gemini API Key** — [dapatkan gratis di Google AI Studio](https://aistudio.google.com/apikey)

### Instalasi

```bash
git clone https://github.com/erlangga-azhar/klinik-umkm.git
cd klinik-umkm
npm install
cp .env.example .env.local
# Edit .env.local dan isi GEMINI_API_KEY=your_key_here
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Scripts

| Script | Perintah | Deskripsi |
|--------|----------|-----------|
| `npm run dev` | `next dev` | Development server |
| `npm run build` | `next build` | Production build |
| `npm test` | `vitest run` | Jalankan 192 test |
| `npm run typecheck` | `tsc --noEmit` | TypeScript strict check |
| `npm run lint` | `eslint` | ESLint |

---

## 🔄 Changelog & Architectural Refactoring

Berikut adalah rangkuman perjalanan refactoring teknis yang telah dilakukan untuk mencapai arsitektur saat ini.

### 🏗️ 1. SSR & Hydration Protection — Eliminasi Total "window is not defined"

**Masalah:** Next.js 16 Server-Side Rendering (SSR) mengeksekusi komponen di Node.js — akses ke `window`, `localStorage`, dan browser API mengakibatkan `ReferenceError: window is not defined`.

**Solusi — Sistem Pertahanan 3 Lapis:**

```
Lapis 1: useState(false)      → mounted = false saat SSR
Lapis 2: useEffect + guard    → setMounted(true) di client + typeof window check
Lapis 3: try/catch            → localStorage.getItem() dibungkus error boundary
```

```tsx
// RiwayatPanel.tsx
const [mounted, setMounted] = useState(false);
if (!mounted) return null; // SSR: tidak render apapun

// useDiagnose.ts
useEffect(() => {
  setMounted(true);
  if (typeof window === 'undefined') return;
  try {
    const saved = localStorage.getItem('klinik-umkm-history');
    // ...
  } catch { /* localStorage tidak tersedia */ }
}, []);
```

**File terdampak:** `RiwayatPanel.tsx`, `useDiagnose.ts`, `page.tsx`

### 🔒 2. Boundary Sterilization — Zero Env Variable Leakage

**Masalah:** Environment variable `GEMINI_API_KEY` berpotensi bocor ke client bundle jika diakses di komponen React.

**Solusi — Pemisahan Tegas Server-Client:**

```ts
// ❌ SEBELUM: API key bisa bocor ke client
// ✅ SESUDAH: Hanya diakses di server route handler

// lib/geminiService.ts
let genAIInstance: GoogleGenerativeAI | null = null;

export function getGenAI(): GoogleGenerativeAI {
  if (!genAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY; // ✅ Server-only
    if (!apiKey) throw new Error("GEMINI_API_KEY belum dikonfigurasi");
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return genAIInstance;
}
```

- ✅ Lazy initialization — instance hanya dibuat saat pertama dipanggil
- ✅ Error eksplisit jika API key tidak dikonfigurasi
- ✅ `GEMINI_API_KEY` hanya ada di server — frontend fetch ke `/api/diagnose`

### ⚡ 3. Vercel Runtime & Standalone Build Resolution

**Masalah:** Cold start pada Vercel serverless mengakibatkan crash saat modul Gemini SDK diinisialisasi di global scope.

**Solusi — Lazy Initialization + Vercel Native Deployment:**

```ts
// ❌ SEBELUM: Inisialisasi di global scope (crash saat cold start)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ SESUDAH: Lazy-loaded, hanya diinisialisasi saat endpoint dipanggil
export function getGenAI(): GoogleGenerativeAI {
  if (!genAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return genAIInstance;
}
```

**Konfigurasi Vercel:**
- Migrasi dari standalone Docker ke Vercel native serverless mapping
- `next.config.ts` — security headers (CSP, X-Frame-Options, dll)
- CI/CD pipeline di `.github/workflows/ci.yml`

### 🧩 4. React Error #31 Resolution — Structured JSON Mode

**Masalah:** Gemini API kadang mengembalikan `diagnosis` sebagai objek `{keuangan, stok, pemasaran, layanan}` alih-alih string, menyebabkan **React Error #31** — objek tidak bisa dirender sebagai children React.

**Solusi — Paksa Gemini Output JSON + Parse Terstruktur:**

```ts
// 1. Konfigurasi Gemini dalam mode JSON
const model = getGenAI().getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: SYSTEM_INSTRUCTION_DIAGNOSIS,
  generationConfig: { responseMimeType: "application/json" },
});

// 2. Parse JSON dengan fallback
let aiData: any;
try {
  aiData = JSON.parse(cleanedResponse);
} catch {
  aiData = buatFallbackJSON(produk, hargaModalPerUnit);
}
```

**System Instruction diperbarui** dengan skema JSON eksplisit:

```json
{
  "diagnosis": {
    "keuangan": "analisis keuangan",
    "stok": "analisis stok",
    "pemasaran": "analisis pemasaran",
    "layanan": "analisis layanan"
  },
  "nama_ide_pivot": "Paket Premium",
  "deskripsi_pivot": "langkah 1-2-3",
  "estimasi_harga_jual_baru": 150000,
  "jumlah_unit_per_paket": 10,
  "draft_whatsapp": "draf WA"
}
```

**ResepCard diupgrade** dari satu paragraf panjang menjadi **4 Premium Grid Cards**:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Keuangan → Wallet icon + Emerald gradient */}
  {/* Stok → Package icon + Sky gradient */}
  {/* Pemasaran → TrendingUp icon + Amber gradient */}
  {/* Layanan → Headphones icon + Violet gradient */}
</div>

<div> {/* Ringkasan Diagnosis — Health Score + Status Indicators + Prioritas */}</div>
```

### 🎨 5. Tailwind v4 Lint Code Optimization

**Masalah:** Kelas utilitas Tailwind v3 (`bg-gradient-to-r`, `flex-shrink-0`, `max-h-[400px]`) menghasilkan warning dari Tailwind CSS IntelliSense.

**Solusi — Refactoring ke Kanonikal Tailwind v4:**

| Sebelum (v3) | Sesudah (v4) | File |
|-------------|-------------|------|
| `bg-gradient-to-r` | `bg-linear-to-r` | `CaraKerja.tsx`, `ChatBox.tsx`, `FooterLegal.tsx`, `page.tsx` |
| `bg-gradient-to-br` | `bg-linear-to-br` | `ChatBox.tsx` |
| `flex-shrink-0` | `shrink-0` | `ChatBox.tsx` |
| `max-h-[400px]` | `max-h-100` | `ChatBox.tsx` |
| `max-w-[240px]` | `max-w-60` | `CaraKerja.tsx` |

### 🛡️ 6. Anti-Spam Shield — IP Rate Limiter

**Masalah:** Endpoint API rentan terhadap spam — penyalahgunaan token Gemini oleh request berulang.

**Solusi — In-Memory Rate Limiter + Live Countdown Timer:**

```ts
// lib/rateLimiter.ts — zero dependency
const { limited, retryAfter } = checkRateLimit(clientIP);
if (limited) {
  return NextResponse.json({ error: '...', retryAfter }, { status: 429 });
}
```

- ✅ **3 request per jam per IP** — dicek sebelum parsing body
- ✅ **Per-IP isolation** — IP berbeda tidak saling mempengaruhi
- ✅ **Live countdown** di frontend — timer MM:SS + progress bar
- ✅ **Auto-cleanup** — memory leak prevention (cleanup setiap 15 menit)
- ✅ **192 test cases semuanya passing**

### 🧪 7. Component Testing — ResepCard Test Suite

**Masalah:** Komponen UI kritis (`ResepCard`) tidak memiliki unit test — perubahan rentan menyebabkan regresi.

**Solusi — 33 Test Cases dengan React Testing Library:**

```tsx
// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';

describe('ResepCard — 4 Diagnosis Premium Grid Cards', () => {
  it('menampilkan keempat kartu diagnosis dengan label yang benar', () => { ... });
  it('menampilkan teks diagnosis dari masing-masing aspek', () => { ... });
  it('fallback "Data tidak tersedia" untuk field kosong', () => { ... });
});

describe('ResepCard — Ringkasan Diagnosis (Summary Section)', () => {
  it('menampilkan skor kesehatan dengan denominator /100', () => { ... });
  it('menampilkan prioritas jika ada aspek dengan skor < 65', () => { ... });
  it('tidak crash ketika report tidak memiliki analisis_finansial', () => { ... });
});
```

### Ringkasan Metrik Refactoring

| Metrik | Sebelum | Sesudah |
|--------|---------|---------|
| **Test Coverage** | ~84 tests | **192 tests** (▲128%) |
| **Tipe Error SSR** | `window is not defined` | ✅ Zero error |
| **API Security** | Validasi input saja | Validasi + **Rate Limiter 3/jam** |
| **AI Output** | String flat (rawat error #31) | **Structured JSON** + fallback |
| **UI Diagnosis** | 1 paragraf panjang | **4 Grid Cards + Summary Section** |
| **Tailwind Version** | v3 syntax (warning) | **v4 canonical** (zero warning) |
| **Env Security** | Export di komponen client | **Server-only lazy init** |

---

## 🤝 Kontribusi

Klinik UMKM adalah proyek open-source. Lihat panduan kontribusi di bawah.

### Aturan Commit Message

```
<type>: <deskripsi singkat>
```

| Type | Contoh |
|------|--------|
| `feat` | `feat: tambah simulasi bunga pinjaman` |
| `fix` | `fix: perbaiki hydration error di RiwayatPanel` |
| `refactor` | `refactor: extract custom hook useDiagnose` |
| `test` | `test: tambah edge case rate limit per-IP` |
| `docs` | `docs: update README changelog` |
| `style` | `style: migrasi bg-gradient ke bg-linear v4` |

### Alur PR

1. 🍴 Fork & clone
2. 🌿 Branch: `feat/`, `fix/`, `refactor/`, dll
3. 💻 Code — ikuti Clean Architecture
4. 🧪 Test — minimal 2 test case per logic baru
5. ✅ Verifikasi: `npm run typecheck && npm test && npm run lint`
6. 📬 PR ke branch `main`

**Review checklist:** ✅ Clean Architecture, ✅ Tests pass, ✅ No console.log, ✅ TypeScript clean.

---

## 👤 Developer

<p align="center">
  <strong>Developed by Erlangga Azhar</strong>
  <br />
  <em>Full-stack developer & growth hacker — membangun tools AI untuk UMKM Indonesia.</em>
</p>

<p align="center">
  <a href="https://www.instagram.com/erlng_zhr"><img src="https://img.shields.io/badge/Instagram-erlng__zhr-E4405F?style=for-the-badge&logo=instagram&logoColor=white&labelColor=18181b" alt="Instagram" /></a>
  <a href="https://github.com/erlangga-azhar"><img src="https://img.shields.io/badge/GitHub-erlangga--azhar-18181b?style=for-the-badge&logo=github&logoColor=white&labelColor=18181b" alt="GitHub" /></a>
</p>

---

## ❓ FAQ

<details>
<summary><strong>Apakah Klinik UMKM benar-benar gratis?</strong></summary>
<br />
**Ya, 100% gratis.** Tidak ada biaya tersembunyi, tidak perlu kartu kredit, tidak ada batasan pemakaian harian. Cukup buka [klinik-umkm.vercel.app](https://klinik-umkm.vercel.app) dan mulai diagnosis. Satu-satunya yang Anda butuhkan adalah koneksi internet.
</details>

<details>
<summary><strong>Apakah saya perlu mendaftar akun?</strong></summary>
<br />
**Tidak perlu.** Klinik UMKM tidak menggunakan sistem akun, login, atau pendaftaran. Semua data Anda cukup di browser — kami tidak ingin mengelola database pengguna.
</details>

<details>
<summary><strong>Bagaimana cara kerja AI diagnosis?</strong></summary>
<br />
Anda mengisi 4 data bisnis: Nama Produk, Modal per Unit (HPP), Harga Jual Saat Ini, dan Keluhan. Data dikirim ke Google Gemini 2.5 Flash yang berperan sebagai Growth Hacker & Mentor Bisnis. AI mendiagnosis dari 4 aspek (Keuangan, Stok, Pemasaran, Layanan) dan meracik paket model langganan. Kalkulasi finansial (HPP, margin, BEP) dilakukan oleh **pure function** di `financeService.ts` — bukan oleh AI.
</details>

<details>
<summary><strong>Data saya aman tidak?</strong></summary>
<br />
**Aman dan privat.** Zero-storage policy: Riwayat diagnosis hanya di LocalStorage browser Anda, data ke Gemini API tidak disimpan oleh Google setelah respons selesai, dan kami tidak punya database eksternal. Klik "Hapus" di panel Rekam Medis dan semua data Anda hilang.
</details>

<details>
<summary><strong>Kenapa pakai Google Gemini?</strong></summary>
<br />
Kecepatan (latensi rendah), gratis (tier mumpuni), konteks 1M token, dan performa natural dalam Bahasa Indonesia. Kode di `lib/geminiService.ts` bisa dimodifikasi untuk model AI lain.
</details>

<details>
<summary><strong>Kenapa chat cuma 3 ronde?</strong></summary>
<br />
Mencegah penyalahgunaan API, menjaga fokus, dan mendorong aksi. Setelah 3 ronde sesi terkunci otomatis — Anda bisa mulai diagnosis baru kapan saja.
</details>

<details>
<summary><strong>Ada masalah / bug? Lapor ke mana?</strong></summary>
<br />
GitHub Issues (rekomendasi) atau DM Instagram [@erlng_zhr](https://www.instagram.com/erlng_zhr).
</details>

---

## ⚖️ Legalitas

### 📜 Terms & Conditions

> Aplikasi **Klinik UMKM** adalah alat bantu rekomendasi berbasis AI. Seluruh hasil diagnosis bersifat informatif — **BUKAN jaminan mutlak keberhasilan bisnis**. Keputusan finansial tetap tanggung jawab pengguna.

### 🔒 Privacy Policy

> **Zero-storage policy.** Data hanya diproses di LocalStorage browser dan API Google Gemini. Kami TIDAK menyimpan data di database eksternal mana pun.

### © Hak Cipta

> **© 2026 Klinik UMKM oleh Erlangga Azhar.** Seluruh hak cipta dilindungi undang-undang.

---

<br />

<p align="center">
  <img src="https://img.shields.io/badge/💡_Diagnosis_bisnis_berbasis_AI_untuk_UMKM_Indonesia-10b981?style=flat-square&labelColor=18181b" alt="Tagline" />
  <br />
  <strong>Gratis · Tanpa Spam · Tanpa Daftar Akun</strong>
  <br />
  <a href="https://klinik-umkm.vercel.app">klinik-umkm.vercel.app</a>
</p>
