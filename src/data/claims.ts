import type { ClaimData } from '../types';
import { buildRiskProfiles } from '../lib/detection';

const PROVIDER_NAMES = [
  'RSUD Dr. Soetomo Surabaya',
  'RS Cipto Mangunkusumo Jakarta',
  'RSUP Dr. Sardjito Yogyakarta',
  'RS Hasan Sadikin Bandung',
  'RSUP Dr. Wahidin Makassar',
  'Puskesmas Cempaka Putih',
  'Klinik Pratama Sehat Sejahtera',
  'Puskesmas Menteng',
  'RS Premier Bintaro',
  'RS Pondok Indah',
];

const DIAGNOSES = [
  { code: 'J06.9', name: 'Acute upper respiratory infection' },
  { code: 'I10', name: 'Essential hypertension' },
  { code: 'E11.9', name: 'Type 2 diabetes mellitus' },
  { code: 'K35.8', name: 'Acute appendicitis' },
  { code: 'J18.9', name: 'Pneumonia, unspecified' },
  { code: 'N39.0', name: 'Urinary tract infection' },
  { code: 'M54.5', name: 'Low back pain' },
  { code: 'A09', name: 'Gastroenteritis' },
  { code: 'J45.9', name: 'Asthma, unspecified' },
  { code: 'I63.9', name: 'Cerebral infarction' },
];

const REGIONS = [
  'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur',
  'Banten', 'D.I. Yogyakarta', 'Sumatera Utara', 'Sulawesi Selatan',
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysBack = 90): Date {
  const d = new Date();
  d.setDate(d.getDate() - randomInt(0, daysBack));
  return d;
}

type BaseClaim = Omit<ClaimData, 'riskScore' | 'riskLevel' | 'anomalyFlags' | 'status'>;

// ─────────────────────────────────────────────
// 1. Klaim reguler — populasi klaim wajar dengan variasi pasien, faskes,
//    dan diagnosis. Ini adalah baseline "normal" yang dipakai algoritma
//    untuk membandingkan nilai klaim yang wajar per diagnosis.
// ─────────────────────────────────────────────
const normalClaims: BaseClaim[] = Array.from({ length: 16 }, (_, i) => {
  const diag = DIAGNOSES[i % DIAGNOSES.length];
  const provider = PROVIDER_NAMES[i % PROVIDER_NAMES.length];
  const isRTL = i % 3 !== 0;

  return {
    id: `CLM-2026-${String(500 - i).padStart(5, '0')}`,
    patientId: `PAT-${String(randomInt(10000, 69999))}`,
    patientName: `Pasien ${String.fromCharCode(65 + (i % 26))}${i + 1}`,
    providerId: `PROV-${String(i + 1).padStart(4, '0')}`,
    providerName: provider,
    providerType: isRTL ? 'FKRTL' : 'FKTP',
    diagnosis: diag.name,
    diagnosisCode: diag.code,
    procedure: `Tindakan ${diag.code}`,
    amount: randomInt(500000, 9000000),
    date: randomDate(90),
    region: REGIONS[i % REGIONS.length],
  };
});

// ─────────────────────────────────────────────
// 2. Kasus phantom & repeat billing yang "ditanam" secara sengaja:
//    pasien yang sama, diagnosis & tindakan yang sama, diajukan ulang
//    dalam rentang 1-2 hari dengan nilai klaim hampir identik.
//    Ini simulasi sub-kategori "Phantom & Repeat Billing" dari panduan.
// ─────────────────────────────────────────────
const duplicateSeeds = [
  { diagIndex: 0, providerIndex: 2, gapDays: 1 },
  { diagIndex: 3, providerIndex: 5, gapDays: 2 },
  { diagIndex: 6, providerIndex: 8, gapDays: 1 },
];

const duplicatePairs: BaseClaim[] = duplicateSeeds.flatMap((seed, idx) => {
  const diag = DIAGNOSES[seed.diagIndex];
  const provider = PROVIDER_NAMES[seed.providerIndex];
  const patientId = `PAT-D${String(idx + 1).padStart(3, '0')}`;
  const patientName = `Pasien D${idx + 1}`;
  const providerId = `PROV-DUP${idx + 1}`;
  const providerType = seed.providerIndex % 2 === 0 ? 'FKRTL' : 'FKTP';
  const amount = randomInt(1500000, 6000000);
  const firstDate = randomDate(60);
  const secondDate = new Date(firstDate);
  secondDate.setDate(secondDate.getDate() + seed.gapDays);
  const region = REGIONS[seed.providerIndex % REGIONS.length];

  return [
    {
      id: `CLM-2026-D${idx + 1}01`,
      patientId,
      patientName,
      providerId,
      providerName: provider,
      providerType,
      diagnosis: diag.name,
      diagnosisCode: diag.code,
      procedure: `Tindakan ${diag.code}`,
      amount,
      date: firstDate,
      region,
    },
    {
      id: `CLM-2026-D${idx + 1}02`,
      patientId,
      patientName,
      providerId,
      providerName: provider,
      providerType,
      diagnosis: diag.name,
      diagnosisCode: diag.code,
      procedure: `Tindakan ${diag.code}`,
      amount: amount + randomInt(-100000, 100000),
      date: secondDate,
      region,
    },
  ];
});

// ─────────────────────────────────────────────
// 3. Kasus dugaan upcoding / anomali biaya: diagnosis umum yang murah,
//    tapi ditagih jauh di atas rata-rata klaim lain dengan diagnosis
//    yang sama.
// ─────────────────────────────────────────────
const costAnomalies: BaseClaim[] = [0, 1].map((idx) => {
  const diag = DIAGNOSES[idx + 1];
  const provider = PROVIDER_NAMES[(idx + 6) % PROVIDER_NAMES.length];

  return {
    id: `CLM-2026-A${idx + 1}01`,
    patientId: `PAT-A${String(idx + 1).padStart(3, '0')}`,
    patientName: `Pasien A${idx + 1}`,
    providerId: `PROV-ANM${idx + 1}`,
    providerName: provider,
    providerType: idx % 2 === 0 ? 'FKTP' : 'FKRTL',
    diagnosis: diag.name,
    diagnosisCode: diag.code,
    procedure: `Tindakan ${diag.code}`,
    amount: randomInt(28000000, 42000000),
    date: randomDate(60),
    region: REGIONS[(idx + 3) % REGIONS.length],
  };
});

const baseClaims: BaseClaim[] = [...normalClaims, ...duplicatePairs, ...costAnomalies];

// Skor risiko, level, penanda anomali, dan status DIHITUNG dari data klaim
// itu sendiri (lihat src/lib/detection.ts) — bukan angka acak.
const riskProfiles = buildRiskProfiles(baseClaims);

export const claims: ClaimData[] = baseClaims
  .map((claim) => ({ ...claim, ...riskProfiles.get(claim.id)! }))
  .sort((a, b) => b.date.getTime() - a.date.getTime());
