import type { ClaimData } from '../types';

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

export const claims: ClaimData[] = Array.from({ length: 25 }, (_, i) => {
  const riskScore = randomInt(10, 95);
  const riskLevel =
    riskScore >= 80 ? 'critical' :
    riskScore >= 60 ? 'high' :
    riskScore >= 30 ? 'medium' : 'low';

  const diag = DIAGNOSES[i % DIAGNOSES.length];
  const provider = PROVIDER_NAMES[i % PROVIDER_NAMES.length];
  const isRTL = i % 3 !== 0;

  const anomalyFlags: ClaimData['anomalyFlags'] = [];
  if (riskScore > 70) anomalyFlags.push('cost_anomaly');
  if (riskScore > 80) anomalyFlags.push('duplicate_billing');
  if (riskScore > 85) anomalyFlags.push('upcoding');

  const statusMap: Record<string, ClaimData['status']> = {
    low: 'approved',
    medium: 'pending',
    high: 'flagged',
    critical: 'under_review',
  };

  return {
    id: `CLM-2026-${String(500 - i).padStart(5, '0')}`,
    patientId: `PAT-${String(randomInt(10000, 99999))}`,
    patientName: `Pasien ${String.fromCharCode(65 + (i % 26))}${i + 1}`,
    providerId: `PROV-${String(i + 1).padStart(4, '0')}`,
    providerName: provider,
    providerType: isRTL ? 'FKRTL' : 'FKTP',
    diagnosis: diag.name,
    diagnosisCode: diag.code,
    procedure: `Procedure ${i + 1}`,
    amount: randomInt(500000, 45000000),
    status: statusMap[riskLevel],
    riskScore,
    riskLevel,
    date: randomDate(90),
    anomalyFlags,
    region: REGIONS[i % REGIONS.length],
  };
});
