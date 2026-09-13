import type {
  KpiCardData,
  RiskDistributionData,
  TrendDataset,
  AnomalyBreakdownData,
  QuickActionData,
} from '../types';

// ─────────────────────────────────────────────
// KPI Cards
// ─────────────────────────────────────────────

export const kpiCards: KpiCardData[] = [
  {
    id: 'total-claims',
    label: 'Total Klaim Dianalisis',
    value: '12,458',
    rawValue: 12458,
    trend: 12.4,
    trendLabel: '+12.4% dari bulan lalu',
    icon: 'FileText',
    accentColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    unit: 'klaim',
  },
  {
    id: 'high-risk',
    label: 'Klaim Risiko Tinggi',
    value: '127',
    rawValue: 127,
    trend: 8.2,
    trendLabel: '+8.2% dari bulan lalu',
    icon: 'AlertTriangle',
    accentColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    riskLevel: 'high',
  },
  {
    id: 'duplicate-billing',
    label: 'Potensi Tagihan Ganda',
    value: '43',
    rawValue: 43,
    trend: -4.6,
    trendLabel: '-4.6% dari bulan lalu',
    icon: 'Copy',
    accentColor: 'text-red-600',
    bgColor: 'bg-red-50',
    riskLevel: 'critical',
  },
  {
    id: 'need-verification',
    label: 'Perlu Verifikasi',
    value: '86',
    rawValue: 86,
    trend: 5.7,
    trendLabel: '+5.7% dari bulan lalu',
    icon: 'ClipboardCheck',
    accentColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'risk-value',
    label: 'Potensi Nilai Risiko',
    value: 'Rp 2.4 M',
    rawValue: 2400000000,
    trend: 14.2,
    trendLabel: '+14.2% dari bulan lalu',
    icon: 'BadgeDollarSign',
    accentColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    unit: 'IDR',
  },
];

// ─────────────────────────────────────────────
// Risk Distribution (Donut Chart)
// ─────────────────────────────────────────────

export const riskDistribution: RiskDistributionData[] = [
  {
    category: 'Risiko Rendah',
    level: 'low',
    count: 9812,
    percentage: 78.8,
    color: '#22c55e',
    fillColor: '#22c55e',
  },
  {
    category: 'Risiko Sedang',
    level: 'medium',
    count: 2403,
    percentage: 19.3,
    color: '#eab308',
    fillColor: '#eab308',
  },
  {
    category: 'Risiko Tinggi',
    level: 'high',
    count: 196,
    percentage: 1.6,
    color: '#f97316',
    fillColor: '#f97316',
  },
  {
    category: 'Risiko Kritis',
    level: 'critical',
    count: 47,
    percentage: 0.3,
    color: '#ef4444',
    fillColor: '#ef4444',
  },
];

// ─────────────────────────────────────────────
// Claim Risk Trend (Line Chart)
// ─────────────────────────────────────────────

function generateTrendData(days: number): { date: string; totalClaims: number; flaggedClaims: number; criticalClaims: number }[] {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    const base = 380 + Math.floor(Math.random() * 80);
    const flagged = Math.floor(base * (0.04 + Math.random() * 0.04));
    const critical = Math.floor(flagged * (0.15 + Math.random() * 0.15));
    data.push({
      date: dateStr,
      totalClaims: base,
      flaggedClaims: flagged,
      criticalClaims: critical,
    });
  }
  return data;
}

export const trendData: TrendDataset = {
  '7d': generateTrendData(7),
  '30d': generateTrendData(30),
  '90d': generateTrendData(90),
};

// ─────────────────────────────────────────────
// Anomaly Breakdown (Bar Chart)
// ─────────────────────────────────────────────

export const anomalyBreakdown: AnomalyBreakdownData[] = [
  {
    type: 'duplicate_billing',
    label: 'Tagihan Ganda',
    count: 43,
    percentage: 22.4,
    color: '#ef4444',
  },
  {
    type: 'repeat_billing',
    label: 'Tagihan Berulang',
    count: 31,
    percentage: 16.1,
    color: '#f97316',
  },
  {
    type: 'cost_anomaly',
    label: 'Anomali Biaya',
    count: 28,
    percentage: 14.6,
    color: '#eab308',
  },
  {
    type: 'upcoding',
    label: 'Upcoding',
    count: 24,
    percentage: 12.5,
    color: '#8b5cf6',
  },
  {
    type: 'diagnosis_anomaly',
    label: 'Anomali Diagnosis',
    count: 22,
    percentage: 11.5,
    color: '#3b82f6',
  },
  {
    type: 'procedure_anomaly',
    label: 'Anomali Prosedur',
    count: 19,
    percentage: 9.9,
    color: '#06b6d4',
  },
  {
    type: 'unbundling',
    label: 'Unbundling',
    count: 16,
    percentage: 8.3,
    color: '#ec4899',
  },
  {
    type: 'other',
    label: 'Lainnya',
    count: 9,
    percentage: 4.7,
    color: '#94a3b8',
  },
];

// ─────────────────────────────────────────────
// Quick Actions
// ─────────────────────────────────────────────

export const quickActions: QuickActionData[] = [
  {
    id: 'review-high-risk',
    label: 'Tinjau Klaim Risiko Tinggi',
    icon: 'AlertTriangle',
    route: '/risk-radar',
    variant: 'danger',
  },
  {
    id: 'duplicate-detection',
    label: 'Deteksi Tagihan Ganda',
    icon: 'Copy',
    route: '/duplicate-detection',
    variant: 'warning',
  },
  {
    id: 'verification-center',
    label: 'Buka Pusat Verifikasi',
    icon: 'CheckCircle',
    route: '/verification',
    variant: 'primary',
  },
  {
    id: 'view-reports',
    label: 'Lihat Laporan',
    icon: 'BarChart2',
    route: '/reports',
    variant: 'secondary',
  },
];
