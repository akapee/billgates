import type { AnomalyType, ClaimData, RiskLevel } from '../types';

// ─────────────────────────────────────────────
// Rule-based duplicate / anomaly detection engine
//
// Mengimplementasikan logika yang dijelaskan di proposal:
// "Algoritma Aturan Logika Waktu & Kemiripan: membandingkan kombinasi
//  ID Pasien, Kode Diagnosis (ICD-10), Jenis Tindakan, dan Rentang Waktu."
//
// Ini rule-based (bukan black-box), sehingga setiap skor bisa dijelaskan
// ke verifikator — sesuai prinsip human-in-the-loop di proposal Bagian 8.
// ─────────────────────────────────────────────

export interface SimilarityResult {
  score: number;
  reasons: string[];
}

export interface DuplicateCandidate {
  claim: ClaimData;
  match: ClaimData;
  similarity: number;
  reasons: string[];
}

export interface RiskProfile {
  riskScore: number;
  riskLevel: RiskLevel;
  anomalyFlags: AnomalyType[];
  status: ClaimData['status'];
}

function daysBetween(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24);
}

/**
 * [LEGACY V1 — jangan dipakai di aplikasi] Skor bisa mencapai 50 tanpa ID pasien
 * yang sama (diagnosis+tindakan+faskes+waktu), dan perbandingan semua pasangan O(n²).
 * Dipertahankan hanya sebagai pembanding di scripts/eval.
 *
 * Menghitung skor kemiripan (0-100) antara dua klaim berdasarkan
 * kombinasi atribut kunci, bukan angka acak.
 */
export function pairSimilarity(a: ClaimData, b: ClaimData): SimilarityResult {
  if (a.id === b.id) return { score: 0, reasons: [] };

  let score = 0;
  const reasons: string[] = [];

  if (a.patientId === b.patientId) {
    score += 45;
    reasons.push('ID Pasien sama');
  }
  if (a.diagnosisCode === b.diagnosisCode) {
    score += 20;
    reasons.push('Kode diagnosis (ICD-10) sama');
  }
  if (a.procedure === b.procedure) {
    score += 15;
    reasons.push('Jenis tindakan sama');
  }
  if (a.providerId === b.providerId) {
    score += 5;
    reasons.push('Faskes sama');
  }

  const gap = daysBetween(a.date, b.date);
  if (gap <= 3) {
    score += 10;
    reasons.push(`Rentang waktu ${Math.round(gap)} hari`);
  } else if (gap <= 14) {
    score += 5;
    reasons.push(`Rentang waktu ${Math.round(gap)} hari`);
  }

  const amountDiff = Math.abs(a.amount - b.amount) / Math.max(a.amount, b.amount, 1);
  if (amountDiff < 0.05) {
    score += 5;
    reasons.push('Nilai klaim hampir identik');
  }

  return { score: Math.min(100, score), reasons };
}

// ─────────────────────────────────────────────
// V2 — detektor duplikat yang dipakai aplikasi (dan diukur di scripts/eval).
// Perbaikan atas V1 (pairSimilarity): ID pasien WAJIB sama/mirip, jendela
// waktu dibatasi, dan klaim dibandingkan per kelompok (blocking) sehingga
// kompleksitas ~O(n·k), bukan O(n²). Hasil ukur: lihat eval-results/.
// ─────────────────────────────────────────────

/** Ambang skor duplikat — dipilih dari data tuning terpisah (scripts/eval/run.ts). */
export const DUP_THRESHOLD = 80;
/** Jendela waktu (hari) antar dua klaim yang dianggap kandidat duplikat. */
export const DUP_WINDOW_DAYS = 21;

export type DupFields = Pick<ClaimData, 'id' | 'patientId' | 'diagnosisCode' | 'procedure' | 'providerId' | 'date' | 'amount'>;

const DAY_MS = 86_400_000;

function idDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length !== b.length) return 99;
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i] && ++d > 1) return 99;
  return d;
}

/** Skor kemiripan V2 (0-100) beserta alasannya, bisa dijelaskan ke verifikator. */
export function pairScoreV2(a: DupFields, b: DupFields): SimilarityResult {
  const reasons: string[] = [];
  let score = 0;
  const d = idDistance(a.patientId, b.patientId);
  if (d === 0) { score += 45; reasons.push('ID pasien sama'); }
  else if (d === 1) { score += 35; reasons.push('ID pasien mirip (beda 1 karakter)'); }
  else return { score: 0, reasons: [] };
  if (a.diagnosisCode === b.diagnosisCode) { score += 20; reasons.push('Diagnosis (ICD-10) sama'); }
  if (a.procedure === b.procedure) { score += 15; reasons.push('Tindakan sama'); }
  if (a.providerId === b.providerId) { score += 5; reasons.push('Faskes sama'); }
  const gap = Math.abs(a.date.getTime() - b.date.getTime()) / DAY_MS;
  if (gap <= 3) { score += 10; reasons.push(`Selisih ${Math.round(gap)} hari`); }
  else if (gap <= DUP_WINDOW_DAYS) { score += 5; reasons.push(`Selisih ${Math.round(gap)} hari`); }
  if (Math.abs(a.amount - b.amount) / Math.max(a.amount, b.amount, 1) < 0.05) { score += 5; reasons.push('Nilai klaim hampir identik'); }
  return { score, reasons };
}

export interface DuplicatePair<T extends DupFields = DupFields> {
  /** klaim yang diajukan belakangan (yang perlu ditahan sebelum bayar) */
  later: T;
  /** klaim yang lebih dulu */
  earlier: T;
  score: number;
  reasons: string[];
  gapDays: number;
}

/**
 * Mencari pasangan duplikat. Setiap klaim "belakangan" dipasangkan dengan
 * kandidat terkuatnya (skor >= threshold) dalam jendela waktu.
 * Blocking memakai dua kunci: (diagnosis+tindakan) dan (ID pasien+diagnosis).
 */
export function findDuplicatePairs<T extends DupFields>(
  claims: T[],
  threshold = DUP_THRESHOLD,
  windowDays = DUP_WINDOW_DAYS
): DuplicatePair<T>[] {
  const groups = new Map<string, T[]>();
  for (const c of claims) {
    for (const k of [`A|${c.diagnosisCode}|${c.procedure}`, `B|${c.patientId}|${c.diagnosisCode}`]) {
      const g = groups.get(k);
      if (g) g.push(c); else groups.set(k, [c]);
    }
  }
  const win = windowDays * DAY_MS;
  const best = new Map<string, DuplicatePair<T>>();
  for (const g of groups.values()) {
    if (g.length < 2) continue;
    g.sort((x, y) => x.date.getTime() - y.date.getTime() || (x.id < y.id ? -1 : 1));
    let start = 0;
    for (let i = 0; i < g.length; i++) {
      while (g[i].date.getTime() - g[start].date.getTime() > win) start++;
      for (let j = start; j < i; j++) {
        const { score, reasons } = pairScoreV2(g[i], g[j]);
        if (score < threshold) continue;
        const prev = best.get(g[i].id);
        if (!prev || score > prev.score) {
          best.set(g[i].id, { later: g[i], earlier: g[j], score, reasons, gapDays: Math.abs(g[i].date.getTime() - g[j].date.getTime()) / DAY_MS });
        }
      }
    }
  }
  return [...best.values()].sort((a, b) => b.score - a.score);
}

/**
 * Daftar kandidat untuk halaman "Deteksi Tagihan Ganda".
 * claim = klaim yang diajukan belakangan, match = klaim pembandingnya.
 */
export function findDuplicateCandidates<T extends ClaimData>(claims: T[], threshold = DUP_THRESHOLD): { claim: T; match: T; similarity: number; reasons: string[] }[] {
  return findDuplicatePairs(claims, threshold).map((p) => ({ claim: p.later, match: p.earlier, similarity: p.score, reasons: p.reasons }));
}

function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

/**
 * Menghitung profil risiko untuk seluruh batch klaim dari tiga sinyal
 * yang bisa dijelaskan (dua sinyal; sinyal biaya BELUM dievaluasi di scripts/eval):
 *  - dupSignal  : kemiripan tertinggi terhadap klaim lain (phantom/repeat billing)
 *  - costSignal : seberapa jauh nilai klaim menyimpang dari rata-rata
 *                 klaim lain dengan diagnosis yang sama (indikasi upcoding)
 *
 * Tidak ada Math.random() di sini — semua skor berasal dari data klaim itu sendiri.
 */
export function buildRiskProfiles(
  claims: Omit<ClaimData, 'riskScore' | 'riskLevel' | 'anomalyFlags' | 'status'>[]
): Map<string, RiskProfile> {
  const profiles = new Map<string, RiskProfile>();
  const asClaims = claims as ClaimData[];
  const dupByLater = new Map(findDuplicatePairs(asClaims).map((p) => [p.later.id, p]));

  const amountsByDiagnosis = new Map<string, { id: string; amount: number }[]>();
  asClaims.forEach((claim) => {
    const list = amountsByDiagnosis.get(claim.diagnosisCode) || [];
    list.push({ id: claim.id, amount: claim.amount });
    amountsByDiagnosis.set(claim.diagnosisCode, list);
  });
  const globalAverage = asClaims.reduce((sum, c) => sum + c.amount, 0) / Math.max(1, asClaims.length);

  asClaims.forEach((claim) => {
    // 1. Sinyal duplikasi (V2): hanya klaim yang diajukan BELAKANGAN ditandai,
    //    karena itulah yang perlu ditahan sebelum dibayar.
    const dupPair = dupByLater.get(claim.id);
    const dupSignal = dupPair ? dupPair.score : 0;

    // 2. Sinyal anomali biaya (leave-one-out agar klaim itu sendiri tidak
    //    ikut menaikkan rata-rata pembandingnya). Menggunakan smoothing
    //    (pseudo-count k) ke rata-rata global supaya grup diagnosis yang
    //    hanya berisi 1-2 klaim tidak menghasilkan baseline yang bising
    //    dan memicu false positive.
    const group = amountsByDiagnosis.get(claim.diagnosisCode) || [];
    const others = group.filter((g) => g.id !== claim.id);
    const smoothing = 3;
    const othersSum = others.reduce((sum, g) => sum + g.amount, 0);
    const avgAmount = (othersSum + globalAverage * smoothing) / (others.length + smoothing);
    const costRatio = avgAmount > 0 ? claim.amount / avgAmount : 1;
    const costSignal = costRatio > 1.3 ? Math.min(100, (costRatio - 1) * 100) : 0;

    // Gabungkan: skor didominasi sinyal terkuat, dengan bonus kecil bila
    // lebih dari satu sinyal muncul bersamaan (semakin banyak indikasi,
    // semakin tinggi prioritas verifikasi).
    const signals = [dupSignal, costSignal];
    const primary = Math.max(...signals);
    const multiSignalBonus = signals.filter((s) => s > 40).length > 1 ? 8 : 0;
    const riskScore = Math.round(Math.max(5, Math.min(98, primary + multiSignalBonus)));
    const riskLevel = riskLevelFromScore(riskScore);

    const anomalyFlags: AnomalyType[] = [];
    if (dupPair) anomalyFlags.push(dupPair.gapDays <= 3 ? 'duplicate_billing' : 'repeat_billing');
    if (costRatio >= 2) anomalyFlags.push('upcoding');
    else if (costRatio >= 1.5) anomalyFlags.push('cost_anomaly');

    const statusMap: Record<RiskLevel, ClaimData['status']> = {
      low: 'approved',
      medium: 'pending',
      high: 'flagged',
      critical: 'under_review',
    };
    const status = dupPair ? 'under_review' : statusMap[riskLevel];

    profiles.set(claim.id, { riskScore, riskLevel, anomalyFlags, status });
  });

  return profiles;
}
