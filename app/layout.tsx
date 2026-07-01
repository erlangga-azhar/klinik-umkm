import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Klinik UMKM - Diagnosis Bisnis & Racik Model Langganan Anti Boncos",
  description:
    "Berhenti banting harga! Dokter AI akan diagnosis struktur HPP, margin, dan BEP bisnis UMKM Anda. Dapatkan resep model langganan siap pakai + draf WhatsApp dalam 3 menit.",
  applicationName: "Klinik UMKM",
  keywords: [
    "diagnosis bisnis UMKM",
    "kalkulator HPP",
    "margin bisnis",
    "BEP UMKM",
    "model langganan",
    "subscription bisnis kecil",
    "anti boncos",
    "dokter AI UMKM",
    "pivot bisnis UKM",
    "strategi harga UMKM Indonesia",
  ],
  authors: [{ name: "Klinik UMKM" }],
  creator: "Klinik UMKM",
  publisher: "Klinik UMKM",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Klinik UMKM - Diagnosis Bisnis & Racik Model Langganan Anti Boncos",
    description:
      "Berhenti banting harga! Dokter AI akan diagnosis struktur HPP, margin, dan BEP bisnis UMKM Anda. Dapatkan resep model langganan siap pakai + draf WhatsApp.",
    url: "https://klinik-umkm.vercel.app",
    siteName: "Klinik UMKM",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Klinik UMKM - Dokter AI untuk Bisnis UMKM Indonesia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Klinik UMKM - Diagnosis Bisnis & Racik Model Langganan Anti Boncos",
    description:
      "Berhenti banting harga! Dokter AI diagnosis HPP, margin, dan BEP bisnis UMKM. Dapatkan resep model langganan siap pakai + draf WhatsApp.",
    images: ["/og-image.png"],
    creator: "@klinikumkm",
  },
  category: "business",
  classification: "Business Diagnosis Tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        {/* JSON-LD Structured Data untuk AI Crawler (GPTBot, ClaudeBot, Perplexity, Google) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Klinik UMKM",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              browserRequirements: "Requires JavaScript",
              description:
                "Alat diagnosis finansial berbasis AI untuk UMKM Indonesia. Menganalisis HPP, margin, dan BEP, lalu meracik resep model bisnis langganan yang aman dari perang harga.",
              url: "https://klinik-umkm.vercel.app",
              author: {
                "@type": "Organization",
                name: "Klinik UMKM",
              },
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "IDR",
                description: "Gratis untuk pedagang UMKM Indonesia",
              },
              featureList: [
                "Diagnosis struktur biaya dan HPP",
                "Kalkulasi margin dan BEP otomatis",
                "Rekomendasi model bisnis langganan berbasis AI",
                "Draf WhatsApp siap kirim ke pelanggan",
                "Riwayat diagnosis tersimpan di browser",
              ],
              screenshot: "/og-image.png",
              softwareVersion: "1.0.0",
              releaseNotes:
                "Rilis perdana - Diagnosis bisnis UMKM berbasis AI dengan model Gemini.",
              countryOfOrigin: {
                "@type": "Country",
                name: "Indonesia",
              },
              inLanguage: ["id", "en"],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
