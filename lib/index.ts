// =========================================================================
// BARREL EXPORT — Semua service dari lib/ dapat diakses via satu import
// =========================================================================
// Contoh:
//   import { validasiKeamananInput, hitungAnalisisFinansial, getGenAI } from '@/lib';
// =========================================================================

export { validasiKeamananInput } from './securityService';

export {
  hitungAnalisisFinansial,
  hitungDampakDiskon,
  hitungBungaPinjaman,
  hitungHargaJualDenganMarginTarget,
} from './financeService';
export type {
  AnalisisFinansial,
  HitungFinansialInput,
  HitungFinansialOutput,
  DiskonInput,
  DiskonOutput,
  PinjamanInput,
  PinjamanOutput,
  MarginTargetInput,
  MarginTargetOutput,
} from './financeService';

export {
  getGenAI,
  bersihkanMarkdownJSON,
  buatFallbackJSON,
  buildDiagnosisPrompt,
  buildChatPrompt,
  SYSTEM_INSTRUCTION_DIAGNOSIS,
  SYSTEM_INSTRUCTION_CHAT,
} from './geminiService';

export {
  isRateLimited,
  getClientIP,
  buildRateLimitError,
  resetRateLimitStore,
} from './rateLimiter';
