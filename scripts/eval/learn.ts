// Bukti simulasi: apakah sistem membaik setelah belajar dari keputusan verifikator?
// Jalankan: npm run eval:learn
//
// Skema (jujur & tanpa kebocoran):
//  - Data LATIH (benih 101): V2 menghasilkan kolam kandidat (skor >= 70). Verifikator SIMULASI
//    memberi keputusan pada k kandidat acak. Keputusan benar = kunci jawaban generator,
//    tetapi dibalik dengan peluang 5% (verifikator bisa keliru).
//  - Model dilatih dari k keputusan itu, lalu DIUJI pada data BARU (benih 7) yang tidak pernah
//    dilihat. Diulang 8x dengan urutan sampel berbeda; dilaporkan rata-rata dan rentang.
//  - Pembanding: aturan V2 tetap (ambang 80) = model dengan k=0.
import { mkdirSync, writeFileSync } from 'node:fs';
import { generate, positiveIds, rng, type LabeledClaim } from './generate.ts';
import { findDuplicatePairs } from '../../src/lib/detection.ts';
import { POOL_THRESHOLD, buildSeriesIndex, pairFeatures, trainModel, isDuplicate, FEATURE_NAMES, FEATURE_LABELS, type LabeledSample } from '../../src/lib/learning.ts';

const N = Number(process.env.ACC_N ?? 5000);
const REPEATS = 8;
const LABEL_NOISE = 0.05;
const KS = [0, 10, 25, 50, 100, 200, 400];

const train = generate(N, 101);
const test = generate(N, 7);
const pos = positiveIds(test);

function pool(claims: LabeledClaim[]) {
  const pairs = findDuplicatePairs(claims as never[], POOL_THRESHOLD);
  return { pairs, series: buildSeriesIndex(claims as never[]) };
}
const trainPool = pool(train);
const testPool = pool(test);
const labelOf = (later: LabeledClaim): 0 | 1 => (later.truth.startsWith('dup_') ? 1 : 0);

function evaluate(model: ReturnType<typeof trainModel>) {
  const flagged = new Set<string>();
  for (const p of testPool.pairs) if (isDuplicate(model, p as never, testPool.series)) flagged.add((p.later as LabeledClaim).id);
  let tp = 0, fp = 0;
  for (const id of flagged) pos.has(id) ? tp++ : fp++;
  const precision = tp + fp ? tp / (tp + fp) : 0;
  const recall = tp / pos.size;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
  return { precision, recall, f1, flaggedPct: flagged.size / test.length, fp, tp };
}

const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
const pct = (x: number) => (x * 100).toFixed(1) + '%';

interface Row { k: number; active: boolean; precision: number[]; recall: number[]; f1: number[]; flagged: number[]; fp: number[] }
const rows: Row[] = [];
let weightsAt200: number[] = [];

for (const k of KS) {
  const row: Row = { k, active: false, precision: [], recall: [], f1: [], flagged: [], fp: [] };
  for (let rep = 0; rep < REPEATS; rep++) {
    const r = rng(1000 + rep);
    // urutan acak kandidat; verifikator memutuskan k pertama
    const order = trainPool.pairs.map((p, i) => ({ p, i, u: r.next() })).sort((a, b) => a.u - b.u).slice(0, k);
    const samples: LabeledSample[] = order.map(({ p }) => {
      let y = labelOf(p.later as LabeledClaim);
      if (r.next() < LABEL_NOISE) y = (1 - y) as 0 | 1;
      return { x: pairFeatures(p as never, trainPool.series), y };
    });
    const model = trainModel(samples);
    if (k === 200 && rep === 0) weightsAt200 = model.weights;
    row.active = model.active || row.active;
    const m = evaluate(model);
    row.precision.push(m.precision); row.recall.push(m.recall); row.f1.push(m.f1); row.flagged.push(m.flaggedPct); row.fp.push(m.fp);
  }
  rows.push(row);
  console.log('k', k, 'precision', pct(mean(row.precision)), 'recall', pct(mean(row.recall)), 'f1', pct(mean(row.f1)));
}

const L: string[] = [];
L.push('# Bukti Simulasi: Belajar dari Keputusan Verifikator\n');
L.push(`> Data SINTETIS. Verifikator disimulasikan (keliru ${LABEL_NOISE * 100}% dari waktu). Latih pada data benih 101, uji pada data baru benih 7 (${test.length.toLocaleString('id-ID')} klaim, ${pos.size} duplikat). Rata-rata ${REPEATS} pengulangan dengan urutan sampel berbeda; [min–maks] di kurung.`);
L.push('> Ini membuktikan mekanismenya bekerja pada simulasi. Belum membuktikan hasil pada verifikator atau data BPJS sungguhan.\n');
L.push('| Keputusan verifikator (k) | Model aktif | Precision | Recall | F1 | Klaim sah salah tandai (FP) | Beban verifikator |');
L.push('|---:|:-:|---:|---:|---:|---:|---:|');
for (const r of rows) {
  const rg = (a: number[]) => `[${pct(Math.min(...a))}–${pct(Math.max(...a))}]`;
  L.push(`| ${r.k} | ${r.k >= 30 ? 'ya' : 'tidak (aturan V2)'} | ${pct(mean(r.precision))} ${rg(r.precision)} | ${pct(mean(r.recall))} | ${pct(mean(r.f1))} ${rg(r.f1)} | ${mean(r.fp).toFixed(1)} | ${pct(mean(r.flagged))} |`);
}
L.push('\n## Bobot setelah 200 keputusan (satu pengulangan) vs prior\n');
L.push('| Fitur | Prior (aturan V2) | Terlatih |');
L.push('|---|---:|---:|');
const prior = [-8, 10, 0, 0, 0, 0, 0, 0];
FEATURE_NAMES.forEach((n, i) => L.push(`| ${FEATURE_LABELS[n]} | ${prior[i].toFixed(2)} | ${weightsAt200[i]?.toFixed(2) ?? '—'} |`));
L.push('\n_Fitur "klaim berulang pasien+diagnosis+tindakan" bernilai negatif = makin panjang deret kunjungan berulang, makin kecil peluang dianggap duplikat (sesi sah seperti dialisis/rehabilitasi)._');

mkdirSync('eval-results', { recursive: true });
writeFileSync('eval-results/hasil-belajar.md', L.join('\n') + '\n');

const evidence = {
  generatedNote: 'Data sintetis, verifikator simulasi. Dibuat otomatis oleh scripts/eval/learn.ts',
  labelNoise: LABEL_NOISE, repeats: REPEATS, testClaims: test.length, testDuplicates: pos.size,
  rows: rows.map((r) => ({ k: r.k, precision: mean(r.precision), recall: mean(r.recall), f1: mean(r.f1), fp: mean(r.fp), flaggedPct: mean(r.flagged) })),
  weightsAt200: Object.fromEntries(FEATURE_NAMES.map((n, i) => [n, weightsAt200[i] ?? 0])),
};
writeFileSync('eval-results/hasil-belajar.json', JSON.stringify(evidence, null, 2));
writeFileSync('src/data/learningEvidence.ts', `// DIBUAT OTOMATIS oleh scripts/eval/learn.ts — jangan diedit manual.\nexport const learningEvidence = ${JSON.stringify(evidence, null, 2)} as const;\n`);
console.log(L.join('\n'));
