import type { KpiCardData, RiskDistributionData, TrendDataset, AnomalyBreakdownData, QuickActionData } from '../types';

export const kpiCards: KpiCardData[] = [
  { id: 'total-claims', label: 'Total Klaim', value: '3,917', rawValue: 3917, trend: 0, trendLabel: 'FKRTL + Non-Kapitasi (> Rp 0)', icon: 'FileText', accentColor: 'text-blue-600', bgColor: 'bg-blue-50', unit: 'klaim' },
  { id: 'high-risk', label: 'Klaim Risiko Tinggi', value: '1,000', rawValue: 1000, trend: 0, trendLabel: 'Dari 3,917 Sampel', icon: 'AlertTriangle', accentColor: 'text-orange-600', bgColor: 'bg-orange-50', riskLevel: 'high' },
  { id: 'duplicate-billing', label: 'Tagihan Ganda', value: '600', rawValue: 600, trend: 0, trendLabel: 'Kasus Identik', icon: 'Copy', accentColor: 'text-red-600', bgColor: 'bg-red-50', riskLevel: 'critical' },
  { id: 'cost-outliers', label: 'Anomali Biaya', value: '400', rawValue: 400, trend: 0, trendLabel: 'Nilai Ekstrem', icon: 'BadgeDollarSign', accentColor: 'text-emerald-600', bgColor: 'bg-emerald-50', unit: 'kasus' },
];

export const riskDistribution: RiskDistributionData[] = [
  { category: 'Risiko Rendah', level: 'low', count: 2917, percentage: 74.5, color: '#22c55e', fillColor: '#22c55e' },
  { category: 'Risiko Sedang', level: 'medium', count: 0, percentage: 0, color: '#eab308', fillColor: '#eab308' },
  { category: 'Risiko Tinggi', level: 'high', count: 400, percentage: 10.2, color: '#f97316', fillColor: '#f97316' },
  { category: 'Risiko Kritis', level: 'critical', count: 600, percentage: 15.3, color: '#ef4444', fillColor: '#ef4444' },
];

export const anomalyBreakdown: AnomalyBreakdownData[] = [
  { type: 'duplicate_billing', label: 'Tagihan Ganda', count: 600, percentage: 60.0, color: '#ef4444' },
  { type: 'cost_anomaly', label: 'Anomali Biaya', count: 400, percentage: 40.0, color: '#eab308' },
];

function generateTrendData(days: number) {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      totalClaims: Math.floor(3917/days) + Math.floor(Math.random() * 20 - 10),
      flaggedClaims: Math.floor(1000/days) + Math.floor(Math.random() * 5 - 2),
      criticalClaims: Math.floor(600/days) + Math.floor(Math.random() * 3 - 1),
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
