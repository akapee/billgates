// ─────────────────────────────────────────────
// Risk & Severity
// ─────────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ClaimStatus = 'approved' | 'pending' | 'flagged' | 'rejected' | 'under_review';
export type AnomalyType =
  | 'duplicate_billing'
  | 'repeat_billing'
  | 'cost_anomaly'
  | 'diagnosis_anomaly'
  | 'procedure_anomaly'
  | 'upcoding'
  | 'unbundling'
  | 'other';

export type ChartFilter = '7d' | '30d' | '90d';

// ─────────────────────────────────────────────
// KPI Card
// ─────────────────────────────────────────────

export interface KpiCardData {
  id: string;
  label: string;
  value: string;
  rawValue: number;
  trend: number; // percentage, positive = up, negative = down
  trendLabel: string;
  icon: string; // lucide icon name
  accentColor: string; // tailwind color class
  bgColor: string;
  riskLevel?: RiskLevel;
  unit?: string;
}

// ─────────────────────────────────────────────
// Alerts
// ─────────────────────────────────────────────

export interface AlertData {
  id: string;
  severity: AlertSeverity;
  type: AnomalyType;
  title: string;
  claimId: string;
  metric: {
    label: string;
    value: string;
  };
  timestamp: Date;
  description?: string;
}

// ─────────────────────────────────────────────
// Claims
// ─────────────────────────────────────────────

export interface ClaimData {
  id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  providerType: 'FKTP' | 'FKRTL';
  diagnosis: string;
  diagnosisCode: string;
  procedure: string;
  amount: number;
  status: ClaimStatus;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  date: Date;
  anomalyFlags: AnomalyType[];
  region: string;
}

// ─────────────────────────────────────────────
// Risk Distribution
// ─────────────────────────────────────────────

export interface RiskDistributionData {
  category: string;
  level: RiskLevel;
  count: number;
  percentage: number;
  color: string;
  fillColor: string;
}

// ─────────────────────────────────────────────
// Trend Data
// ─────────────────────────────────────────────

export interface TrendDataPoint {
  date: string;
  totalClaims: number;
  flaggedClaims: number;
  criticalClaims: number;
}

export type TrendDataset = {
  [K in ChartFilter]: TrendDataPoint[];
};

// ─────────────────────────────────────────────
// Anomaly Breakdown
// ─────────────────────────────────────────────

export interface AnomalyBreakdownData {
  type: AnomalyType;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

// ─────────────────────────────────────────────
// Quick Actions
// ─────────────────────────────────────────────

export interface QuickActionData {
  id: string;
  label: string;
  icon: string;
  route: string;
  variant: 'primary' | 'secondary' | 'warning' | 'danger';
}

// ─────────────────────────────────────────────
// Notification
// ─────────────────────────────────────────────

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  severity: AlertSeverity;
}
