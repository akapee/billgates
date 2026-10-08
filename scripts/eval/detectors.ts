// Tiga detektor yang dibandingkan. Semuanya mengembalikan himpunan ID klaim
// yang ditandai sebagai "kemungkinan duplikat dari klaim yang lebih dulu".
import { pairSimilarity, findDuplicatePairs, DUP_THRESHOLD, DUP_WINDOW_DAYS } from '../../src/lib/detection.ts';
import type { LabeledClaim } from './generate.ts';

const byDate = (a: LabeledClaim, b: LabeledClaim) => a.date.getTime() - b.date.getTime() || (a.id < b.id ? -1 : 1);

/** Baseline sederhana: pasien+diagnosis+tindakan+faskes sama, tanggal sama persis. */
export function detectExactBaseline(claims: LabeledClaim[]): Set<string> {
  const seen = new Map<string, string>();
  const flagged = new Set<string>();
  for (const c of [...claims].sort(byDate)) {
    const key = [c.patientId, c.diagnosisCode, c.procedure, c.providerId, c.date.toISOString().slice(0, 10)].join('|');
    if (seen.has(key)) flagged.add(c.id); else seen.set(key, c.id);
  }
  return flagged;
}

/** V1 = algoritma di proposal/kode saat ini (pairSimilarity, ambang 50), semua pasangan O(n^2). */
export function detectV1(claims: LabeledClaim[], threshold = 50): Set<string> {
  const flagged = new Set<string>();
  const sorted = [...claims].sort(byDate);
  for (let i = 0; i < sorted.length; i++) {
    for (let j = 0; j < i; j++) {
      if (pairSimilarity(sorted[i] as never, sorted[j] as never).score >= threshold) { flagged.add(sorted[i].id); break; }
    }
  }
  return flagged;
}

// ---------- V2: kode yang SAMA dengan yang dipakai aplikasi (src/lib/detection.ts) ----------
export interface V2Options { windowDays: number; threshold: number }
export const V2_DEFAULT: V2Options = { windowDays: DUP_WINDOW_DAYS, threshold: DUP_THRESHOLD };

export function detectV2(claims: LabeledClaim[], opts: V2Options = V2_DEFAULT): Set<string> {
  return new Set(findDuplicatePairs(claims as never[], opts.threshold, opts.windowDays).map((p) => (p.later as LabeledClaim).id));
}
