import type { ClaimData, RiskLevel } from '../types';

export type ProviderAnalytics = {
  name: string;
  region: string;
  claims: number;
  totalAmount: number;
  averageRisk: number;
  level: RiskLevel;
  anomalyScore: number;
  priorityScore: number;
  highRiskRatio: number;
  duplicateRatio: number;
  changePercent: number | null;
  findings: string[];
};

const levelFromScore = (score: number): RiskLevel => score >= 80 ? 'critical' : score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';
const clamp = (value: number) => Math.max(0, Math.min(100, value));
const mean = (values: number[]) => values.reduce((total, value) => total + value, 0) / Math.max(values.length, 1);
const stdDev = (values: number[], avg: number) => Math.sqrt(mean(values.map(value => (value - avg) ** 2)));

/**
 * Analitik fraud lokal, tanpa API atau model cloud.
 * Skor memakai gabungan pola risiko klaim, rasio kandidat duplikat,
 * dan penyimpangan jumlah klaim terbaru dibanding riwayat faskes.
 */
export function analyzeProviders(claims: ClaimData[]): ProviderAnalytics[] {
  const grouped = new Map<string, ClaimData[]>();
  claims.forEach(claim => grouped.set(claim.providerName, [...(grouped.get(claim.providerName) || []), claim]));
  const volumes = [...grouped.values()].map(items => items.length);
  const volumeAvg = mean(volumes);
  const volumeStd = stdDev(volumes, volumeAvg) || 1;

  return [...grouped.entries()].map(([name, items]) => {
    const averageRisk = Math.round(mean(items.map(item => item.riskScore)));
    const highRiskRatio = items.filter(item => item.riskScore >= 60).length / items.length;
    const duplicateRatio = items.filter(item => item.anomalyFlags.includes('duplicate_billing') || item.anomalyFlags.includes('repeat_billing')).length / items.length;
    const latestTime = Math.max(...items.map(item => item.date.getTime()));
    const latestMonth = new Date(latestTime).toISOString().slice(0, 7);
    const latestCount = items.filter(item => item.date.toISOString().slice(0, 7) === latestMonth).length;
    const previousItems = items.filter(item => item.date.toISOString().slice(0, 7) !== latestMonth);
    const months = new Map<string, number>();
    previousItems.forEach(item => {
      const key = item.date.toISOString().slice(0, 7);
      months.set(key, (months.get(key) || 0) + 1);
    });
    const baseline = mean([...months.values()]);
    const changePercent = baseline > 0 ? Math.round(((latestCount - baseline) / baseline) * 100) : null;
    const volumeDeviation = Math.max(0, (items.length - volumeAvg) / volumeStd);
    const changeSignal = changePercent === null ? 0 : clamp(changePercent / 2);
    const anomalyScore = Math.round(clamp(
      averageRisk * 0.42 + highRiskRatio * 100 * 0.23 + duplicateRatio * 100 * 0.2 + Math.min(volumeDeviation * 16, 15)
    ));
    const priorityScore = Math.round(clamp(anomalyScore * 0.75 + changeSignal * 0.25));
    const findings: string[] = [];
    if (duplicateRatio >= 0.12) findings.push(`${Math.round(duplicateRatio * 100)}% klaim memiliki indikasi tagihan ganda/berulang`);
    if (highRiskRatio >= 0.35) findings.push(`${Math.round(highRiskRatio * 100)}% klaim berada pada risiko tinggi atau kritis`);
    if (changePercent !== null && changePercent >= 50) findings.push(`volume klaim bulan terbaru naik ${changePercent}% dari rata-rata sebelumnya`);
    if (volumeDeviation >= 1.5) findings.push('volume klaim menyimpang dari pola mayoritas faskes');
    if (findings.length === 0) findings.push('tidak ada penyimpangan kuat pada indikator lokal');
    return {
      name,
      region: items[0].region,
      claims: items.length,
      totalAmount: items.reduce((total, item) => total + item.amount, 0),
      averageRisk,
      level: levelFromScore(averageRisk),
      anomalyScore,
      priorityScore,
      highRiskRatio,
      duplicateRatio,
      changePercent,
      findings,
    };
  }).sort((left, right) => right.priorityScore - left.priorityScore);
}
