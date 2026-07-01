# 🩺 Klinik UMKM (Powered by AI)

**Aplikasi SaaS inovatif berbasis kecerdasan buatan (AI-Driven Financial Diagnostic Tool)** yang dirancang khusus untuk menyembuhkan penyakit kronis pelaku UMKM Indonesia — perang harga, kebocoran modal (boncos), stok macet, dan kelelahan melayani chat PHP — menggunakan model bisnis langganan/membership.

> 🚀 **Live Demo:** [klinik-umkm.vercel.app](https://klinik-umkm.vercel.app)

---

## 📋 Daftar Isi

- [Tech Stack](#-tech-stack)
- [Fitur Unggulan](#-fitur-unggulan)
  - [AI Diagnosis Engine](#-ai-diagnosis-engine)
  - [Deep-Dive Chat (3 Ronde)](#-deep-dive-chat-3-ronde)
  - [Kotak Obat (History Engine)](#-kotak-obat-history-engine)
- [Ironclad Security Layer](#-ironclad-security-layer)
- [Struktur Proyek](#-struktur-proyek)
- [Cara Memulai](#-cara-memulai)
- [Testing](#-testing)
- [Dokumen Legalitas](#-dokumen-legalitas)
- [Developer](#-developer)

---

## 🏗 Tech Stack

| Layer | Teknologi |
|---|---|
| **Framework** | [Next.js](https://nextjs.org) 16 (App Router) + [TypeScript](https://www.typescriptlang.org) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) 4 — Premium Glassmorphism & Custom Gradient Theme |
| **AI Engine** | [Google Gemini 2.5 Flash](https://cloud.google.com/vertex-ai/generative-ai/docs/overview) via `@google/generative-ai` SDK |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Testing** | [Vitest](https://vitest.dev) — 75 unit & integration tests |
| **Font** | Geist (Vercel) |

### ✨ Fitur Unggulan

#### 🤖 AI Diagnosis Engine

- **Persona:** Growth Hacker & Mentor Bisnis Garis Keras — tone tegas, realistis, menyentil, sangat solutif.
- **Output:** Diagnosis dari 4 aspek (Keuangan, Stok, Pemasaran, Layanan), rekomendasi nama paket pivot berbasis psikologi kelangkaan, kalkulasi finansial transparan (HPP, Margin, BEP), dan draf WhatsApp siap kirim.
- **Bahasa:** Indonesia natural dengan istilah bisnis lokal (boncos, laci bocor, kerja rodi, subsidi pembeli, dll).

#### 💬 Deep-Dive Chat (3 Ronde)

Setelah diagnosis pertama keluar, pengguna bisa mengajukan **maksimal 3 pertanyaan lanjutan** untuk mengulik detail operasional:

- Riwayat percakapan dikirim sebagai konteks ke Gemini agar AI paham konteks bisnis sebelumnya.
- Setiap jawaban AI tetap menggunakan persona mentor garis keras yang solutif, singkat, dan padat.
- **Setelah ronde ke-3, sesi otomatis terkunci** — chat input dinonaktifkan dan banner "Sesi Konsultasi Ditutup" tampil.
- Seluruh log chat tersimpan di LocalStorage dan bisa dipulihkan dari riwayat.

#### 📦 Kotak Obat (History Engine)

- Penyimpanan penuh **berbasis LocalStorage** — **Zero Server Database Overload.**
- Setiap diagnosis menyimpan: data form, report lengkap, seluruh log chat, dan status sesi (masih aktif/terkunci).
- Pengguna dapat memuat ulang riwayat diagnosis **persis di kondisi terakhir** — chat logs dan status sesi ter-restore sempurna.

---

## 🛡 Ironclad Security Layer

Backend dilengkapi dengan sistem keamanan berlapis sebelum request mencapai Gemini API:

### 🔒 Input Validation & Anti-Jailbreak

Fungsi **`validasiKeamananInput`** menggunakan:

- **14+ Regex Patterns** — Mendeteksi upaya Prompt Injection:
  - `ignore previous instructions`, `system prompt`, `become a developer`
  - `abaikan semua instruksi sebelumnya`, `bocorkan system instruction`, `kamu sekarang adalah`
  - `delete database`, `drop table`, `reveal your prompt`, `display your system`
- **18+ Blacklist Keywords** — Memblokir konten ilegal:
  - Narkoba, senjata api ilegal, judi online, slot, togel
  - Penipuan finansial, skema ponzi, investasi bodong, carding, phishing
  - Prostitusi, terorisme, radikalisme, jual organ tubuh
- **Suspicious Character Detection** — Memfilter Unicode aneh dan control characters

### 🚫 Response Flow

```
Input User → validasiKeamananInput → ❌ BLOCKED (HTTP 400 + pesan edukatif)
                                  → ✅ AMAN → Gemini API → Output
```

### 🤐 Anti-Prompt Leak

System Instruction Gemini diperbarui dengan **larangan mutlak** membocorkan:
- File `AGENTS.md`, skema database, kunci konfigurasi
- API key, instruksi internal, atau petunjuk sistem dalam bentuk apa pun
- AI diperintahkan menolak tegas jika user meminta "mengabaikan instruksi" atau "menampilkan system prompt"

### ✅ Test Coverage

```bash
# 59 security-specific test cases
npx vitest run app/api/diagnose/route.security.test.ts

# Semua test (financial + security + integration)
npx vitest run
# → 75 tests passed
```

---

## 📁 Struktur Proyek

```
klinik-umkm/
├── app/
│   ├── api/diagnose/
│   │   ├── route.ts              # API endpoint + security layer + Gemini integration
│   │   ├── route.test.ts         # Unit test: financial calculator (9 tests)
│   │   ├── route.security.test.ts # Unit test: security guardrail (59 tests)
│   │   └── route.int.test.ts     # Integration test: full API flow (7 tests)
│   ├── components/
│   │   ├── CaraKerja.tsx         # "Cara Kerja Dokter AI" section
│   │   ├── ChatBox.tsx           # Deep-dive chat 3 ronde component
│   │   ├── FormDiagnose.tsx      # Form input loket pemeriksaan
│   │   ├── FooterLegal.tsx       # Premium footer + legal modals
│   │   ├── ResepCard.tsx         # Nota resep + kalkulator finansial + draft WA
│   │   └── RiwayatPanel.tsx      # History engine panel
│   ├── layout.tsx                # Root layout + SEO metadata + JSON-LD
│   └── page.tsx                  # Halaman utama (Hero, Pain Points, Form, Chat, Footer)
├── .env.local                    # GEMINI_API_KEY (tidak di-commit)
├── vitest.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Cara Memulai

### Prasyarat

- Node.js 20+
- Google Gemini API Key ([dapatkan di sini](https://aistudio.google.com/apikey))

### Instalasi

```bash
# Clone repository
git clone https://github.com/erlangga-azhar/klinik-umkm.git
cd klinik-umkm

# Install dependencies
npm install

# Set environment variable
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### Production Build

```bash
npm run build
npm start
```

---

## 🧪 Testing

```bash
# Jalankan semua test
npx vitest run

# Test spesifik
npx vitest run app/api/diagnose/route.test.ts        # Financial calculator (9 tests)
npx vitest run app/api/diagnose/route.security.test.ts # Security guardrail (59 tests)
npx vitest run app/api/diagnose/route.int.test.ts     # Integration (7 tests)

# Watch mode (saat development)
npx vitest
```

---

## ⚖️ Dokumen Legalitas

### Terms & Conditions

Aplikasi **Klinik UMKM** adalah alat bantu rekomendasi berbasis AI. Seluruh hasil diagnosis, kalkulasi finansial, dan saran yang diberikan bersifat **informatif dan konsultatif** — BUKAN jaminan mutlak keberhasilan bisnis. Segala keputusan finansial akhir tetap menjadi **tanggung jawab penuh masing-masing pelaku usaha**.

### Privacy Policy

**Isolasi data total.** Data yang dimasukkan (nama produk, HPP, omzet, keluhan, riwayat chat) **hanya diproses secara instan** di:
1. **LocalStorage browser** — untuk menyimpan riwayat diagnosis
2. **API Google Gemini** — untuk menghasilkan rekomendasi diagnosis

Kami **TIDAK menyimpan data Anda** di database eksternal, server pihak ketiga, atau sistem penyimpanan permanen mana pun. Data Anda aman, privat, dan sepenuhnya dalam kendali Anda.

### Hak Cipta

**© 2026 Klinik UMKM oleh Erlangga Azhar.** Seluruh hak cipta dilindungi undang-undang. Dilarang memperbanyak, mendistribusikan, atau memanfaatkan sebagian atau seluruh konten aplikasi ini tanpa izin tertulis dari pengembang.

---

## 👨‍💻 Developer

**Developed by Erlangga Azhar**

| Platform | Link |
|---|---|
| <img src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/instagram.svg" width="16" height="16" alt="Instagram"/> **Instagram** | [@erlng_zhr](https://www.instagram.com/erlng_zhr) |
| <img src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/github.svg" width="16" height="16" alt="GitHub"/> **GitHub** | [erlangga-azhar](https://github.com/erlangga-azhar) |
| <img src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/linkedin.svg" width="16" height="16" alt="LinkedIn"/> **LinkedIn** | [erlangga-azhar](https://linkedin.com/in/erlangga-azhar) |

---

> 💡 **Klinik UMKM** — Diagnosis bisnis berbasis AI untuk UMKM Indonesia. Gratis, tanpa spam, tanpa daftar akun.
