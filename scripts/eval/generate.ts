// Generator data klaim SINTETIS berbenih (reproducible) dengan kunci jawaban.
// Semua asumsi perilaku ada di sini dan harus ditulis jujur di proposal:
// angka hasil evaluasi hanya sebaik realisme generator ini. Kalibrasi parameter
// dengan Data Sampel BPJS (Portal Data JKN) bila sudah disetujui.
import type { ClaimData } from '../../src/types/index.ts';

export type Truth =
  | 'normal'
  | 'legit_chronic'    // kontrol rutin penyakit kronis (jarak 28-90 hari) -> SAH
  | 'legit_followup'   // kontrol ulang akut dengan tindakan berbeda -> SAH
  | 'legit_series'     // sesi berulang sah (mis. rehab/dialisis, jarak 3-7 hari) -> SAH
  | 'dup_exact'        // klaim diajukan ulang persis
  | 'dup_cross'        // diajukan ulang di faskes lain
  | 'dup_typo'         // diajukan ulang dengan ID pasien salah ketik 1 karakter
  | 'dup_late'         // diajukan ulang 8-21 hari kemudian
  | 'dup_noisy';        // duplikat sulit: label tindakan beda & nilai selisih sampai 15%

export interface LabeledClaim extends Omit<ClaimData, 'riskScore' | 'riskLevel' | 'anomalyFlags' | 'status'> {
  truth: Truth;
  /** untuk klaim duplikat: id klaim asli yang diduplikasi */
  dupOf?: string;
}

// PRNG berbenih (mulberry32)
export function rng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (lo: number, hi: number) => lo + Math.floor(next() * (hi - lo + 1));
  const pick = <T,>(arr: T[]) => arr[Math.floor(next() * arr.length)];
  return { next, int, pick };
}

const DX = [
  { code: 'J06.9', base: 450_000, chronic: false },
  { code: 'I10', base: 600_000, chronic: true },
  { code: 'E11.9', base: 900_000, chronic: true },
  { code: 'K35.8', base: 7_500_000, chronic: false },
  { code: 'J18.9', base: 5_200_000, chronic: false },
  { code: 'N39.0', base: 1_100_000, chronic: false },
  { code: 'M54.5', base: 800_000, chronic: false },
  { code: 'A09', base: 700_000, chronic: false },
  { code: 'J45.9', base: 1_000_000, chronic: true },
  { code: 'I63.9', base: 9_000_000, chronic: false },
];
const PROCS_PER_DX = 3;
const DAY = 86_400_000;

export function generate(n: number, seed = 42, dupRate = 0.02): LabeledClaim[] {
  const r = rng(seed);
  const t0 = new Date('2026-01-01T00:00:00Z').getTime();
  const nProviders = Math.max(40, Math.round(n / 60));
  const nPatients = Math.round(n * 0.7);
  const claims: LabeledClaim[] = [];
  let seq = 0;

  const mk = (p: Partial<LabeledClaim> & { patientIdx: number; providerIdx: number; dx: number; proc: number; day: number; amount: number; truth: Truth }): LabeledClaim => {
    const dx = DX[p.dx];
    seq += 1;
    return {
      id: `CLM-${String(seq).padStart(7, '0')}`,
      patientId: p.patientId ?? `PAT-${String((p.patientIdx * 2654435761) % 10_000_000_000).padStart(10, '0')}`, // acak seperti No. kartu asli, bukan berurutan
      patientName: 'Pasien (anonim)',
      providerId: `PROV-${String(p.providerIdx).padStart(4, '0')}`,
      providerName: `Faskes ${p.providerIdx}`,
      providerType: p.providerIdx % 3 === 0 ? 'FKTP' : 'FKRTL',
      diagnosis: dx.code,
      diagnosisCode: dx.code,
      procedure: `Tindakan ${dx.code}-${p.proc}`,
      amount: Math.round(p.amount),
      date: new Date(t0 + p.day * DAY),
      region: 'Sintetis',
      truth: p.truth,
      dupOf: p.dupOf,
    } as LabeledClaim;
  };

  const amountFor = (dx: number) => DX[dx].base * (0.75 + r.next() * 0.5);
  const jitter = (v: number, pct: number) => v * (1 + (r.next() * 2 - 1) * pct);
  const homeProvider = (pat: number) => 1 + ((pat * 2654435761) % nProviders);

  // 1. Klaim normal
  const nNormal = Math.round(n * 0.86);
  for (let i = 0; i < nNormal; i++) {
    const pat = r.int(1, nPatients);
    const prov = r.next() < 0.7 ? homeProvider(pat) : r.int(1, nProviders);
    const dx = r.int(0, DX.length - 1);
    claims.push(mk({ patientIdx: pat, providerIdx: prov, dx, proc: r.int(1, PROCS_PER_DX), day: r.int(0, 330), amount: amountFor(dx), truth: 'normal' }));
  }

  // 2. Hard negatives (SAH tetapi mirip duplikat)
  const chronic = DX.map((d, i) => (d.chronic ? i : -1)).filter((i) => i >= 0);
  for (let i = 0; i < Math.round(n * 0.03); i++) {           // kontrol kronis
    const pat = r.int(1, nPatients), prov = homeProvider(pat), dx = r.pick(chronic), proc = r.int(1, PROCS_PER_DX);
    const day = r.int(0, 200), amt = amountFor(dx);
    claims.push(mk({ patientIdx: pat, providerIdx: prov, dx, proc, day, amount: amt, truth: 'legit_chronic' }));
    claims.push(mk({ patientIdx: pat, providerIdx: prov, dx, proc, day: day + r.int(28, 90), amount: jitter(amt, 0.1), truth: 'legit_chronic' }));
  }
  for (let i = 0; i < Math.round(n * 0.015); i++) {          // kontrol ulang akut, tindakan beda
    const pat = r.int(1, nPatients), prov = homeProvider(pat), dx = r.int(0, DX.length - 1);
    const day = r.int(0, 300);
    claims.push(mk({ patientIdx: pat, providerIdx: prov, dx, proc: 1, day, amount: amountFor(dx), truth: 'legit_followup' }));
    claims.push(mk({ patientIdx: pat, providerIdx: prov, dx, proc: 2, day: day + r.int(5, 14), amount: amountFor(dx) * 0.4, truth: 'legit_followup' }));
  }
  for (let i = 0; i < Math.round(n * 0.004); i++) {          // sesi berulang sah
    const pat = r.int(1, nPatients), prov = homeProvider(pat), dx = r.int(0, DX.length - 1), proc = r.int(1, PROCS_PER_DX);
    const sessions = r.int(3, 5), amt = amountFor(dx) * 0.5;
    let day = r.int(0, 250);
    for (let s = 0; s < sessions; s++) {
      claims.push(mk({ patientIdx: pat, providerIdx: prov, dx, proc, day, amount: jitter(amt, 0.03), truth: 'legit_series' }));
      day += r.int(3, 7);
    }
  }

  // 3. Duplikat (positif)
  const nDup = Math.round(n * dupRate);
  for (let i = 0; i < nDup; i++) {
    const pat = r.int(1, nPatients), prov = homeProvider(pat), dx = r.int(0, DX.length - 1), proc = r.int(1, PROCS_PER_DX);
    const day = r.int(0, 300), amt = amountFor(dx);
    const orig = mk({ patientIdx: pat, providerIdx: prov, dx, proc, day, amount: amt, truth: 'normal' });
    claims.push(orig);
    const u = r.next();
    if (u < 0.40) {
      claims.push(mk({ patientIdx: pat, providerIdx: prov, dx, proc, day: day + r.int(0, 3), amount: jitter(amt, 0.01), truth: 'dup_exact', dupOf: orig.id }));
    } else if (u < 0.58) {
      let p2 = r.int(1, nProviders); if (p2 === prov) p2 = (p2 % nProviders) + 1;
      claims.push(mk({ patientIdx: pat, providerIdx: p2, dx, proc, day: day + r.int(0, 7), amount: jitter(amt, 0.03), truth: 'dup_cross', dupOf: orig.id }));
    } else if (u < 0.70) {
      const id = orig.patientId.split('');
      const pos = r.int(4, id.length - 1);
      id[pos] = String((Number(id[pos]) + r.int(1, 9)) % 10);
      claims.push(mk({ patientIdx: pat, patientId: id.join(''), providerIdx: prov, dx, proc, day: day + r.int(0, 5), amount: jitter(amt, 0.02), truth: 'dup_typo', dupOf: orig.id }));
    } else if (u < 0.88) {
      claims.push(mk({ patientIdx: pat, providerIdx: prov, dx, proc, day: day + r.int(8, 21), amount: jitter(amt, 0.03), truth: 'dup_late', dupOf: orig.id }));
    } else {
      const proc2 = (proc % PROCS_PER_DX) + 1;
      claims.push(mk({ patientIdx: pat, providerIdx: prov, dx, proc: proc2, day: day + r.int(0, 3), amount: jitter(amt, 0.15), truth: 'dup_noisy', dupOf: orig.id }));
    }
  }

  // acak urutan secara deterministik, lalu beri ulang id berurutan tidak perlu (id tetap unik)
  for (let i = claims.length - 1; i > 0; i--) {
    const j = Math.floor(r.next() * (i + 1));
    [claims[i], claims[j]] = [claims[j], claims[i]];
  }
  return claims;
}

/** Kunci jawaban tingkat klaim: klaim yang harus dicegat = klaim "kedua" (duplikat). */
export function positiveIds(claims: LabeledClaim[]): Set<string> {
  return new Set(claims.filter((c) => c.truth.startsWith('dup_')).map((c) => c.id));
}
