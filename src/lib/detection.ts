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

/**
 * Mencari pasangan klaim dengan kemiripan tertinggi di atas ambang batas.
 * Setiap klaim hanya dipasangkan sekali dengan kandidat terkuatnya, agar
 * daftar yang ditampilkan ke verifikator tidak duplikat.
 */
export function findDuplicateCandidates(claims: ClaimData[], threshold = 50): DuplicateCandidate[] {
  const used = new Set<string>();
  const candidates: DuplicateCandidate[] = [];

  for (const claim of claims) {
    if (used.has(claim.id)) continue;

    let bestMatch: ClaimData | undefined;
    let bestScore = 0;
    let bestReasons: string[] = [];

    for (const other of claims) {
      if (other.id === claim.id || used.has(other.id)) continue;
      const { score, reasons } = pairSimilarity(claim, other);
      if (score >= threshold && score > bestScore) {
        bestMatch = other;
        bestScore = score;
        bestReasons = reasons;
      }
    }

    if (bestMatch) {
      candidates.push({ claim, match: bestMatch, similarity: bestScore, reasons: bestReasons });
      used.add(claim.id);
      used.add(bestMatch.id);
    }
  }

  return candidates.sort((a, b) => b.similarity - a.similarity);
}

function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

/**
 * Menghitung profil risiko untuk seluruh batch klaim dari tiga sinyal
 * yang bisa dijelaskan:
 *  - dupSignal  : kemiripan tertinggi terhadap klaim lain (phantom/repeat billing)
 *  - costSignal : seberapa jauh nilai klaim menyimpang dari rata-rata
 *                 klaim lain dengan diagnosis yang sama (indikasi upcoding)
 *  - freqSignal : seberapa sering kombinasi pasien+faskes yang sama
 *                 muncul dalam jendela waktu 30 hari (indikasi repeat billing)
 *
 * Tidak ada Math.random() di sini — semua skor berasal dari data klaim itu sendiri.
 */
export function buildRiskProfiles(
  claims: Omit<ClaimData, 'riskScore' | 'riskLevel' | 'anomalyFlags' | 'status'>[]
): Map<string, RiskProfile> {
  const profiles = new Map<string, RiskProfile>();
  const asClaims = claims as ClaimData[];

  const amountsByDiagnosis = new Map<string, { id: string; amount: number }[]>();
  asClaims.forEach((claim) => {
    const list = amountsByDiagnosis.get(claim.diagnosisCode) || [];
    list.push({ id: claim.id, amount: claim.amount });
    amountsByDiagnosis.set(claim.diagnosisCode, list);
  });
  const globalAverage = asClaims.reduce((sum, c) => sum + c.amount, 0) / Math.max(1, asClaims.length);

  asClaims.forEach((claim) => {
    // 1. Sinyal duplikasi
    let dupSignal = 0;
    asClaims.forEach((other) => {
      if (other.id === claim.id) return;
      const { score } = pairSimilarity(claim, other);
      if (score > dupSignal) dupSignal = score;
    });

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

    // 3. Sinyal frekuensi (pasien + faskes sama dalam 30 hari)
    const frequency = asClaims.filter((other) =>
      other.id !== claim.id &&
      other.patientId === claim.patientId &&
      other.providerId === claim.providerId &&
      daysBetween(other.date, claim.date) <= 30
    ).length;
    const freqSignal = frequency > 0 ? Math.min(100, 40 + frequency * 20) : 0;

    // Gabungkan: skor didominasi sinyal terkuat, dengan bonus kecil bila
    // lebih dari satu sinyal muncul bersamaan (semakin banyak indikasi,
    // semakin tinggi prioritas verifikasi).
    const signals = [dupSignal, costSignal, freqSignal];
    const primary = Math.max(...signals);
    const multiSignalBonus = signals.filter((s) => s > 40).length > 1 ? 8 : 0;
    const riskScore = Math.round(Math.max(5, Math.min(98, primary + multiSignalBonus)));
    const riskLevel = riskLevelFromScore(riskScore);

    const anomalyFlags: AnomalyType[] = [];
    if (dupSignal >= 70) anomalyFlags.push('duplicate_billing');
    else if (freqSignal >= 60) anomalyFlags.push('repeat_billing');
    if (costRatio >= 2) anomalyFlags.push('upcoding');
    else if (costRatio >= 1.5) anomalyFlags.push('cost_anomaly');

    const statusMap: Record<RiskLevel, ClaimData['status']> = {
      low: 'approved',
      medium: 'pending',
      high: 'flagged',
      critical: 'under_review',
    };
    const status = anomalyFlags.includes('duplicate_billing') ? 'under_review' : statusMap[riskLevel];

    profiles.set(claim.id, { riskScore, riskLevel, anomalyFlags, status });
  });

  return profiles;
}
