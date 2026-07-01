// =========================================================================
// RATE LIMITER — In-Memory IP-Based Request Throttle
// =========================================================================
// Zero-dependency rate limiter yang menyimpan state di memori proses.
// Cocok untuk deployment serverless (Vercel) karena setiap instance
// punya isolated memory sendiri — tetap efektif untuk mencegah spam
// dari IP yang sama dalam satu sesi.
//
// Batas: 3 request per 1 jam per IP Address
// =========================================================================

interface RateLimitEntry {
  /** Timestamp (ms) dari setiap request yang tercatat */
  timestamps: number[];
}

// Map<IP, RateLimitEntry>
const rateLimitStore = new Map<string, RateLimitEntry>();

/** Batas maksimal request per window */
const MAX_REQUESTS = 3;

/** Window time dalam milidetik (1 jam) */
const WINDOW_MS = 60 * 60 * 1000;

/** Frekuensi pembersihan cache kadaluarsa (setiap 15 menit) */
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000;

let lastCleanup = Date.now();

/**
 * Membersihkan entry yang sudah melewati window waktu.
 * Dipanggil otomatis setiap CLEANUP_INTERVAL_MS.
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    // Hapus timestamp yang sudah expired
    entry.timestamps = entry.timestamps.filter((ts) => now - ts < WINDOW_MS);
    // Hapus entry jika tidak ada timestamp tersisa
    if (entry.timestamps.length === 0) {
      rateLimitStore.delete(ip);
    }
  }
}

/**
 * Mengecek apakah IP tertentu sudah melebihi batas rate limit.
 * Jika sudah melebihi, return true (terlalu banyak request).
 * Jika masih dalam batas, catat request baru dan return false.
 */
export function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Pembersihan berkala
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    cleanupExpiredEntries();
    lastCleanup = now;
  }

  const entry = rateLimitStore.get(ip);

  if (!entry) {
    // Belum pernah request — buat entry baru
    rateLimitStore.set(ip, { timestamps: [now] });
    return false;
  }

  // Hapus timestamp yang sudah expired
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < WINDOW_MS);

  if (entry.timestamps.length >= MAX_REQUESTS) {
    // Sudah melebihi batas
    return true;
  }

  // Dalam batas — catat request baru
  entry.timestamps.push(now);
  return false;
}

/**
 * Mendapatkan IP dari request headers.
 * Handles berbagai proxy/load balancer:
 * - Vercel: x-forwarded-for
 * - Cloudflare: cf-connecting-ip + x-forwarded-for
 * - Local/dev: fallback ke 127.0.0.1
 */
export function getClientIP(request: any): string {
  // Vercel / Cloudflare proxy
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for bisa berisi multiple IP (chain proxy)
    // Ambil IP pertama (asli client)
    const ip = forwarded.split(',')[0].trim();
    if (ip) return ip;
  }

  // Cloudflare spesifik
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) return cfIP;

  // Fallback
  return '127.0.0.1';
}

/**
 * Membuat pesan error 429 yang konsisten.
 */
export function buildRateLimitError(): { error: string; status: number } {
  return {
    error: 'Terlalu banyak permintaan. Silakan coba lagi dalam beberapa menit.',
    status: 429,
  };
}

/**
 * (Testing Utility) Reset store — hanya untuk digunakan di test.
 */
export function resetRateLimitStore(): void {
  rateLimitStore.clear();
  lastCleanup = Date.now();
}
