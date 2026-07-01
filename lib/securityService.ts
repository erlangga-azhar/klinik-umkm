// =========================================================================
// SECURITY SERVICE — Input Validation & Anti-Jailbreak
// =========================================================================
// Pure functions untuk memvalidasi input user terhadap pola serangan
// Prompt Injection, kata ilegal, dan karakter mencurigakan.
// Tidak memiliki ketergantungan pada environment, AI, atau modul eksternal.
// =========================================================================

/**
 * Pola regex untuk mendeteksi upaya Prompt Injection dan jailbreak.
 */
const JAILBREAK_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?previous\s+(instructions|directives|commands|prompts)/i,
  /system\s+prompt/i,
  /become\s+(a\s+)?developer/i,
  /delete\s+(the\s+)?(entire\s+)?database/i,
  /drop\s+(table|database|collection)/i,
  /reveal\s+(your\s+)?(system|instructions|prompt)/i,
  /show\s+(me\s+)?(your\s+)?(system|instructions|raw\s+prompt)/i,
  /display\s+(your\s+)?(system|raw\s+)?prompt/i,
  /reveal\s+(your\s+)?(prompt|system)/i,
  /akses\s+(file\s+)?(system|konfigurasi|config|env)/i,
  /bocorkan\s+(system\s+)?(instruction|prompt|konfigurasi)/i,
  /abaikan\s+(semua\s+)?(instruksi|perintah|arahan|aturan)\s+(sebelumnya|lalu)/i,
  /kamu\s+(sekarang\s+)?adalah/i,
  /act\s+as\s+(if\s+you\s+are\s+)?/i,
  /DAN\s+(lupakan|abaikan)\s+(semua\s+)?/i,
];

/**
 * Kata kunci ilegal / berbahaya yang tidak boleh diproses.
 */
const ILLEGAL_KEYWORDS: string[] = [
  'narkoba', 'sabu', 'shabu', 'ekstasi', 'ganja', 'kokain', 'heroin',
  'senjata api', 'senjata tajam ilegal',
  'judi online', 'slot online', 'togel', 'casino online',
  'penipuan finansial', 'skema ponzi', 'money game', 'investasi bodong',
  'carding', 'hack', 'crack', 'phishing',
  'prostitusi', 'esek-esek berbayar',
  'terorisme', 'radikalisme',
  'jual ginjal', 'jual organ tubuh',
];

/**
 * Karakter mencurigakan yang sering dipakai dalam upaya jailbreak.
 */
const SUSPICIOUS_CHAR_PATTERN = /[^\x20-\x7E\u00C0-\u024F\u1E00-\u1EFF\u2000-\u206F\u2E00-\u2E7F\u0600-\u06FF\u0E00-\u0E7F\u0020-\u00FF\u0100-\u024F\u0250-\u02AF\u0300-\u036F\u1D00-\u1FFF\u2100-\u214F\u2C60-\u2C7F\uA720-\uA7FF\uAB30-\uAB6F\uFB00-\uFB06\uFE00-\uFE0F\u3000-\u303F\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\u0E00-\u0E7F\u0E81-\u0EDF\u0F00-\u0FFF\u0E00-\u0E7F]/u;

/**
 * validasiKeamananInput
 * Memeriksa input user terhadap pola jailbreak, kata ilegal, dan karakter mencurigakan.
 *
 * @param namaProduk - Nama produk/jasa dari form
 * @param keluhan - Keluhan utama dari form
 * @param pertanyaan - (Opsional) Pertanyaan chat lanjutan
 * @returns object { aman: boolean, alasan?: string }
 */
export function validasiKeamananInput(
  namaProduk: string,
  keluhan: string,
  pertanyaan?: string
): { aman: boolean; alasan?: string } {
  const semuaInput = [namaProduk, keluhan, pertanyaan || ''].join(' ');

  // 1. Cek pola jailbreak
  for (const pattern of JAILBREAK_PATTERNS) {
    if (pattern.test(semuaInput)) {
      return {
        aman: false,
        alasan: 'Aktivitas mencurigakan terdeteksi. Sistem Klinik UMKM menolak memproses input yang melanggar kebijakan keamanan.',
      };
    }
  }

  // 2. Cek kata kunci ilegal
  const inputLower = semuaInput.toLowerCase();
  for (const keyword of ILLEGAL_KEYWORDS) {
    if (inputLower.includes(keyword)) {
      return {
        aman: false,
        alasan: 'Aktivitas mencurigakan terdeteksi. Sistem Klinik UMKM menolak memproses input yang melanggar kebijakan keamanan.',
      };
    }
  }

  // 3. Cek karakter mencurigakan (Unicode aneh di luar range normal)
  if (SUSPICIOUS_CHAR_PATTERN.test(semuaInput)) {
    return {
      aman: false,
      alasan: 'Aktivitas mencurigakan terdeteksi. Sistem Klinik UMKM menolak memproses input yang melanggar kebijakan keamanan.',
    };
  }

  return { aman: true };
}
