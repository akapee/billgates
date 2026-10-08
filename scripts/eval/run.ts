// Jalankan:  node --experimental-strip-types scripts/eval/run.ts   (Node >= 22.6)
//        atau npx tsx scripts/eval/run.ts
// Hasil: eval-results/hasil-evaluasi.md + hasil-evaluasi.json
import { mkdirSync, writeFileSync } from 'node:fs';
import { generate, positiveIds, type LabeledClaim, type Truth } from './generate.ts';
import { detectExactBaseline, detectV1, detectV2, V2_DEFAULT } from './detectors.ts';

const SEED = 42;
const ACC_N = Number(process.env.ACC_N ?? 5000);

function metrics(claims: LabeledClaim[], flagged: Set<string>) {
  const pos = positiveIds(claims);
  let tp = 0, fp = 0;
  for (const id of flagged) pos.has(id) ? tp++ : fp++;
  const fn = pos.size - tp;
  const precision = tp + fp ? tp / (tp + fp) : 0;
  const recall = pos.size ? tp / pos.size : 0;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
  const legit = claims.filter((c) => c.truth.startsWith('legit_') || c.truth === 'normal').length;
  const fpr = legit ? fp / legit : 0;
  const byTruth: Record<string, string> = {};
  for (const t of ['dup_exact', 'dup_cross', 'dup_typo', 'dup_late', 'dup_noisy'] as Truth[]) {
    const all = claims.filter((c) => c.truth === t);
    byTruth[t] = `${all.filter((c) => flagged.has(c.id)).length}/${all.length}`;
  }
  const fpBy: Record<string, number> = {};
  for (const c of claims) if (flagged.has(c.id) && !pos.has(c.id)) fpBy[c.truth] = (fpBy[c.truth] ?? 0) + 1;
  return { n: claims.length, positives: pos.size, flagged: flagged.size, tp, fp, fn, precision, recall, f1, fpr, workloadPct: flagged.size / claims.length, byTruth, fpBy };
}

function time<T>(fn: () => T): { out: T; ms: number } {
  const t = performance.now(); const out = fn(); return { out, ms: performance.now() - t };
}
const pct = (x: number) => (x * 100).toFixed(1) + '%';

// ---------- 0. Tuning ambang V2 pada data TERPISAH (benih 42), uji pada data baru (benih 7) ----------
const tuning = generate(ACC_N, SEED);
const sweepTune = [50, 60, 70, 75, 80, 85, 90, 95].map((th) => ({ th, ...metrics(tuning, detectV2(tuning, { ...V2_DEFAULT, threshold: th })) }));
const chosen = sweepTune.reduce((b, s) => (s.f1 > b.f1 ? s : b)).th;
const TEST_SEED = 7;

// ---------- 1. Akurasi (data uji, tidak dipakai untuk memilih ambang) ----------
const data = generate(ACC_N, TEST_SEED);
const detectors = {
  'Baseline (persis: pasien+dx+tindakan+faskes+tanggal)': () => detectExactBaseline(data),
  'V1 (algoritma proposal lama, ambang 50)': () => detectV1(data, 50),
  [`V2 (berblok + jendela 21 hari + ID fuzzy, ambang ${chosen})`]: () => detectV2(data, { ...V2_DEFAULT, threshold: chosen }),
};
const acc: Record<string, ReturnType<typeof metrics> & { ms: number }> = {};
for (const [name, fn] of Object.entries(detectors)) {
  const { out, ms } = time(fn);
  acc[name] = { ...metrics(data, out), ms };
}

// ---------- 2. Sweep ambang V2 ----------
const sweep = [50, 60, 70, 75, 80, 85, 90, 95].map((th) => ({ th, ...metrics(data, detectV2(data, { ...V2_DEFAULT, threshold: th })) }));

// ---------- 3. Latensi vs ukuran ----------
const lat: { n: number; v1?: number; v2: number }[] = [];
for (const n of [1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000]) {
  const d = generate(n, SEED);
  const row: { n: number; v1?: number; v2: number } = { n, v2: time(() => detectV2(d)).ms };
  if (n <= 10000) row.v1 = time(() => detectV1(d, 50)).ms;
  lat.push(row);
  console.log('latensi', row);
}

// ---------- Laporan ----------
const L: string[] = [];
L.push('# Hasil Evaluasi BILL GATES (data SINTETIS)\n');
L.push(`Ambang V2 dipilih dari data tuning (benih ${SEED}, F1 tertinggi = ${chosen}); semua angka di bawah memakai data uji baru (benih ${TEST_SEED}).\n`);
L.push(`> Data uji: ${data.length.toLocaleString('id-ID')} klaim, ${positiveIds(data).size} duplikat sengaja disisipkan (≈2%), plus klaim SAH yang mirip duplikat (kontrol kronis, kontrol ulang, sesi berulang).`);
L.push('> Angka ini mengukur algoritma pada data buatan sendiri. Bukan akurasi di data JKN riil. Asumsi generator ada di `scripts/eval/generate.ts`.\n');
L.push('## 1. Akurasi tingkat klaim\n');
L.push('| Metode | Ditandai | Precision | Recall | F1 | False-positive rate | Beban verifikator | Waktu |');
L.push('|---|---:|---:|---:|---:|---:|---:|---:|');
for (const [k, m] of Object.entries(acc)) L.push(`| ${k} | ${m.flagged} | ${pct(m.precision)} | ${pct(m.recall)} | ${pct(m.f1)} | ${pct(m.fpr)} | ${pct(m.workloadPct)} | ${m.ms.toFixed(0)} ms |`);
L.push('\n### Recall per jenis duplikat (terdeteksi/total)\n');
L.push('| Metode | Persis | Lintas faskes | ID salah ketik | Terlambat 8-21 hr | Sulit (label beda, nilai ±15%) |');
L.push('|---|---:|---:|---:|---:|---:|');
for (const [k, m] of Object.entries(acc)) L.push(`| ${k} | ${m.byTruth.dup_exact} | ${m.byTruth.dup_cross} | ${m.byTruth.dup_typo} | ${m.byTruth.dup_late} | ${m.byTruth.dup_noisy} |`);
L.push('\n### Sumber false positive (jumlah klaim SAH yang salah ditandai)\n');
L.push('| Metode | normal | kronis | kontrol ulang | sesi berulang |');
L.push('|---|---:|---:|---:|---:|');
for (const [k, m] of Object.entries(acc)) L.push(`| ${k} | ${m.fpBy.normal ?? 0} | ${m.fpBy.legit_chronic ?? 0} | ${m.fpBy.legit_followup ?? 0} | ${m.fpBy.legit_series ?? 0} |`);
L.push('\n## 2. Sensitivitas ambang (V2, data uji)\n');
L.push('| Ambang | Precision | Recall | F1 | Beban verifikator |');
L.push('|---:|---:|---:|---:|---:|');
for (const s of sweep) L.push(`| ${s.th} | ${pct(s.precision)} | ${pct(s.recall)} | ${pct(s.f1)} | ${pct(s.workloadPct)} |`);
L.push('\n## 3. Waktu proses vs jumlah klaim (seluruh batch, 1 core)\n');
L.push('| Jumlah klaim | V1 O(n²) | V2 berblok |');
L.push('|---:|---:|---:|');
for (const r of lat) L.push(`| ${r.n.toLocaleString('id-ID')} | ${r.v1 !== undefined ? (r.v1 / 1000).toFixed(2) + ' s' : '—'} | ${(r.v2 / 1000).toFixed(2)} s |`);
L.push('\n_Waktu = memproses seluruh batch sekaligus, bukan latensi satu klaim. Latensi per klaim baru (inkremental) perlu diukur terpisah di backend._');

mkdirSync('eval-results', { recursive: true });
writeFileSync('eval-results/hasil-evaluasi.md', L.join('\n') + '\n');
writeFileSync('eval-results/hasil-evaluasi.json', JSON.stringify({ tuneSeed: SEED, testSeed: TEST_SEED, chosenThreshold: chosen, accuracy: acc, sweep, latency: lat }, null, 2));
const evalEvidence = {
  note: 'Data sintetis. Dibuat otomatis oleh scripts/eval/run.ts',
  testClaims: data.length,
  testDuplicates: positiveIds(data).size,
  chosenThreshold: chosen,
  methods: Object.entries(acc).map(([name, m]) => ({ name, flagged: m.flagged, precision: m.precision, recall: m.recall, f1: m.f1, workloadPct: m.workloadPct, fp: m.fp })),
  latency: lat,
};
writeFileSync('src/data/evalEvidence.ts', `// DIBUAT OTOMATIS oleh scripts/eval/run.ts — jangan diedit manual.\nexport const evalEvidence = ${JSON.stringify(evalEvidence, null, 2)} as const;\n`);
console.log(L.join('\n'));
