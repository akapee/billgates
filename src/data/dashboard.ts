import type { KpiCardData, RiskDistributionData, TrendDataset, AnomalyBreakdownData, QuickActionData } from '../types';

export const kpiCards: KpiCardData[] = [
  { id: 'total-claims', label: 'Total Klaim', value: '2,000', rawValue: 2000, trend: 0, trendLabel: 'Sampel Aktif', icon: 'FileText', accentColor: 'text-blue-600', bgColor: 'bg-blue-50', unit: 'klaim' },
  { id: 'high-risk', label: 'Klaim Risiko Tinggi', value: '600', rawValue: 600, trend: 0, trendLabel: 'Dari 2000 Sampel', icon: 'AlertTriangle', accentColor: 'text-orange-600', bgColor: 'bg-orange-50', riskLevel: 'high' },
  { id: 'duplicate-billing', label: 'Tagihan Ganda', value: '500', rawValue: 500, trend: 0, trendLabel: 'Kasus Identik', icon: 'Copy', accentColor: 'text-red-600', bgColor: 'bg-red-50', riskLevel: 'critical' },
  { id: 'cost-outliers', label: 'Anomali Biaya', value: '100', rawValue: 100, trend: 0, trendLabel: 'Nilai Ekstrem', icon: 'BadgeDollarSign', accentColor: 'text-emerald-600', bgColor: 'bg-emerald-50', unit: 'kasus' },
];

export const riskDistribution: RiskDistributionData[] = [
  { category: 'Risiko Rendah', level: 'low', count: 1400, percentage: 70, color: '#22c55e', fillColor: '#22c55e' },
  { category: 'Risiko Sedang', level: 'medium', count: 0, percentage: 0, color: '#eab308', fillColor: '#eab308' },
  { category: 'Risiko Tinggi', level: 'high', count: 100, percentage: 5, color: '#f97316', fillColor: '#f97316' },
  { category: 'Risiko Kritis', level: 'critical', count: 500, percentage: 25, color: '#ef4444', fillColor: '#ef4444' },
];

export const anomalyBreakdown: AnomalyBreakdownData[] = [
  { type: 'duplicate_billing', label: 'Tagihan Ganda', count: 500, percentage: 83.3, color: '#ef4444' },
  { type: 'cost_anomaly', label: 'Anomali Biaya', count: 100, percentage: 16.7, color: '#eab308' },
];

function generateTrendData(days: number) {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      totalClaims: Math.floor(2000/days),
      flaggedClaims: Math.floor(600/days),
      criticalClaims: Math.floor(500/days),
    });
  }
  return data;
}

export const trendData: TrendDataset = {
  '7d': generateTrendData(7),
  '30d': generateTrendData(30),
  '90d': generateTrendData(90),
};

export const quickActions: QuickActionData[] = [
  { id: 'review-high-risk', label: 'Tinjau Klaim Risiko Tinggi', icon: 'AlertTriangle', route: '/risk-radar', variant: 'danger' },
  { id: 'duplicate-detection', label: 'Deteksi Tagihan Ganda', icon: 'Copy', route: '/duplicate-detection', variant: 'warning' },
  { id: 'verification-center', label: 'Buka Pusat Verifikasi', icon: 'CheckCircle', route: '/verification', variant: 'primary' },
  { id: 'view-reports', label: 'Lihat Laporan', icon: 'BarChart2', route: '/reports', variant: 'secondary' },
];
