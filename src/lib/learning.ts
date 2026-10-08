// ─────────────────────────────────────────────────────────────
// Belajar dari keputusan verifikator (tahap-2 setelah deteksi V2)
//
// Ide: V2 menghasilkan kumpulan kandidat duplikat. Verifikator memutuskan
// "duplikat" (Tolak) atau "sah" (Setujui). Dari keputusan itu, model regresi
// logistik kecil belajar bobot fitur mana yang sebenarnya membedakan duplikat
// dari klaim sah yang kebetulan mirip (mis. sesi dialisis berulang).
//
// Sifat penting (untuk juri):
//  - Bisa dijelaskan: 8 bobot yang bisa dibaca, bukan black-box.
//  - Aman saat data sedikit: bobot ditarik ke PRIOR = aturan V2 (ambang 80).
//    Dengan 0 keputusan, model PERSIS sama dengan aturan V2.
//  - Hanya MENYARING kandidat dari V2 (bisa menurunkan recall, tidak menambah
//    temuan baru); verifikator tetap pengambil keputusan.
//  - Fungsi murni tanpa Firebase, sehingga bisa diuji di scripts/eval.
// ─────────────────────────────────────────────────────────────

import type { DupFields, DuplicatePair } from './detection.ts';

/** Ambang kolam kandidat yang diberikan ke verifikator (lebih longgar dari aturan 80). */
export const POOL_THRESHOLD = 70;
/** Minimal keputusan sebelum model dipakai menggantikan aturan awal. */
export const MIN_LABELS = 30;

export const FEATURE_NAMES = [
  'bias',
  'skor_v2',
  'id_pasien_mirip',
  'faskes_sama',
  'jarak_hari',
  'nilai_hampir_sama',
  'panjang_deret',
  'tindakan_sama',
] as const;
export type FeatureName = (typeof FEATURE_NAMES)[number];

export const FEATURE_LABELS: Record<FeatureName, string> = {
  bias: 'Konstanta',
  skor_v2: 'Skor kemiripan V2',
  id_pasien_mirip: 'ID pasien hanya mirip (bukan sama)',
  faskes_sama: 'Faskes sama',
  jarak_hari: 'Jarak antar klaim (hari)',
  nilai_hampir_sama: 'Nilai klaim hampir sama',
  panjang_deret: 'Klaim berulang pasien+diagnosis+tindakan (±30 hari)',
  tindakan_sama: 'Tindakan sama',
};

export interface LearnedModel {
  weights: number[];
  prior: number[];
  /** jumlah keputusan yang dipakai melatih */
  n: number;
  /** true bila n >= MIN_LABELS dan kedua kelas ada */
  active: boolean;
}

/** Prior = aturan V2: p>=0.5 tepat saat skor_v2 >= 0.80. */
export const PRIOR: number[] = [-8, 10, 0, 0, 0, 0, 0, 0];

const DAY_MS = 86_400_000;

// ---------- Fitur ----------

export type SeriesIndex = Map<string, number[]>; // kunci pasien|dx|tindakan -> daftar waktu (ms)

export function buildSeriesIndex(claims: Pick<DupFields, 'patientId' | 'diagnosisCode' | 'procedure' | 'date'>[]): SeriesIndex {
  const idx: SeriesIndex = new Map();
  for (const c of claims) {
    const k = `${c.patientId}|${c.diagnosisCode}|${c.procedure}`;
    const arr = idx.get(k);
    if (arr) arr.push(c.date.getTime()); else idx.set(k, [c.date.getTime()]);
  }
  return idx;
}

export function pairFeatures<T extends DupFields>(pair: DuplicatePair<T>, series: SeriesIndex): number[] {
  const { later, earlier, score, gapDays } = pair;
  const times = series.get(`${later.patientId}|${later.diagnosisCode}|${later.procedure}`) ?? [];
  const t = later.date.getTime();
  let around = 0;
  for (const x of times) if (x !== t && Math.abs(x - t) <= 30 * DAY_MS) around++;
  const amountClose = Math.abs(later.amount - earlier.amount) / Math.max(later.amount, earlier.amount, 1) < 0.05;
  return [
    1,
    score / 100,
    later.patientId === earlier.patientId ? 0 : 1,
    later.providerId === earlier.providerId ? 1 : 0,
    Math.min(gapDays, 21) / 21,
    amountClose ? 1 : 0,
    Math.min(around, 6) / 6,
    later.procedure === earlier.procedure ? 1 : 0,
  ];
}

// ---------- Pelatihan (Newton/IRLS dengan regularisasi ke prior) ----------

const sigmoid = (z: number) => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z))));
const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);

function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    const d = M[c][c] || 1e-12;
    for (let k = c; k <= n; k++) M[c][k] /= d;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((row) => row[n]);
}

export interface LabeledSample { x: number[]; y: 0 | 1 } // y=1: duplikat (ditolak), y=0: sah (disetujui)

/**
 * Meminimalkan  sum logloss + (lambda/2)·||w - prior||².
 * lambda=1 artinya prior setara bobot ~1 sampel per dimensi: cukup untuk stabil
 * saat data sedikit, tetapi mudah dikalahkan data begitu keputusan menumpuk.
 */
export function trainModel(samples: LabeledSample[], lambda = 1): LearnedModel {
  const d = PRIOR.length;
  const pos = samples.filter((s) => s.y === 1).length;
  const neg = samples.length - pos;
  let w = [...PRIOR];
  if (samples.length === 0) return { weights: w, prior: PRIOR, n: 0, active: false };
  for (let it = 0; it < 25; it++) {
    const g = new Array(d).fill(0);
    const H: number[][] = Array.from({ length: d }, () => new Array(d).fill(0));
    for (const { x, y } of samples) {
      const p = sigmoid(dot(w, x));
      const r = p - y;
      const v = Math.max(p * (1 - p), 1e-6);
      for (let i = 0; i < d; i++) {
        g[i] += r * x[i];
        for (let j = 0; j < d; j++) H[i][j] += v * x[i] * x[j];
      }
    }
    for (let i = 0; i < d; i++) { g[i] += lambda * (w[i] - PRIOR[i]); H[i][i] += lambda; }
    const step = solve(H, g);
    let maxStep = 0;
    w = w.map((wi, i) => { maxStep = Math.max(maxStep, Math.abs(step[i])); return wi - step[i]; });
    if (maxStep < 1e-6) break;
  }
  return { weights: w, prior: PRIOR, n: samples.length, active: samples.length >= MIN_LABELS && pos >= 5 && neg >= 5 };
}

export const predictProbability = (m: LearnedModel, x: number[]) => sigmoid(dot(m.weights, x));

/** Kontribusi tiap fitur terhadap logit (untuk penjelasan ke verifikator). */
export function explain(m: LearnedModel, x: number[]) {
  return FEATURE_NAMES.map((name, i) => ({ name, label: FEATURE_LABELS[name], contribution: m.weights[i] * x[i] }))
    .filter((c) => c.name !== 'bias' && Math.abs(c.contribution) > 0.05)
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
}

/** Keputusan akhir: model terlatih bila aktif, selain itu aturan awal V2 (skor >= 80). */
export function isDuplicate(m: LearnedModel, pair: DuplicatePair, series: SeriesIndex): boolean {
  if (!m.active) return pair.score >= 80;
  return predictProbability(m, pairFeatures(pair, series)) >= 0.5;
}
