import type { AlertData, NotificationData } from '../types';

// ─────────────────────────────────────────────
// Recent Alerts
// ─────────────────────────────────────────────

export const recentAlerts: AlertData[] = [
  {
    id: 'ALT-001',
    severity: 'critical',
    type: 'duplicate_billing',
    title: 'Potential Duplicate Billing',
    claimId: 'CLM-2026-00482',
    metric: {
      label: 'Similarity',
      value: '94%',
    },
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    description: 'Klaim identik ditemukan dari faskes yang sama dalam periode 3 hari.',
  },
  {
    id: 'ALT-002',
    severity: 'high',
    type: 'cost_anomaly',
    title: 'Cost Anomaly Detected',
    claimId: 'CLM-2026-00471',
    metric: {
      label: 'Deviation',
      value: '+284%',
    },
    timestamp: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
    description: 'Biaya klaim melebihi standar tarif INA-CBGs secara signifikan.',
  },
  {
    id: 'ALT-003',
    severity: 'medium',
    type: 'procedure_anomaly',
    title: 'Unusual Procedure Pattern',
    claimId: 'CLM-2026-00463',
    metric: {
      label: 'Risk Score',
      value: '71',
    },
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    description: 'Pola prosedur medis tidak sesuai dengan diagnosis primer.',
  },
  {
    id: 'ALT-004',
    severity: 'critical',
    type: 'upcoding',
    title: 'Upcoding Suspected',
    claimId: 'CLM-2026-00458',
    metric: {
      label: 'Risk Score',
      value: '88',
    },
    timestamp: new Date(Date.now() - 23 * 60 * 1000), // 23 minutes ago
    description: 'Kode diagnosis dinaikkan ke tingkat yang lebih tinggi tanpa bukti klinis.',
  },
  {
    id: 'ALT-005',
    severity: 'high',
    type: 'repeat_billing',
    title: 'Repeat Billing Detected',
    claimId: 'CLM-2026-00449',
    metric: {
      label: 'Occurrence',
      value: '3x',
    },
    timestamp: new Date(Date.now() - 41 * 60 * 1000), // 41 minutes ago
    description: 'Prosedur yang sama ditagihkan 3 kali pada pasien yang sama.',
  },
  {
    id: 'ALT-006',
    severity: 'low',
    type: 'diagnosis_anomaly',
    title: 'Diagnosis Inconsistency',
    claimId: 'CLM-2026-00437',
    metric: {
      label: 'Confidence',
      value: '62%',
    },
    timestamp: new Date(Date.now() - 67 * 60 * 1000), // 67 minutes ago
    description: 'Diagnosis tidak konsisten dengan riwayat medis pasien.',
  },
];

// ─────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────

export const notifications: NotificationData[] = [
  {
    id: 'NOTIF-001',
    title: 'Critical Alert',
    message: 'CLM-2026-00482 — Potential Duplicate Billing (94% similarity)',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    read: false,
    severity: 'critical',
  },
  {
    id: 'NOTIF-002',
    title: 'High Risk Detected',
    message: 'CLM-2026-00471 — Cost anomaly +284% above INA-CBGs rate',
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    read: false,
    severity: 'high',
  },
  {
    id: 'NOTIF-003',
    title: 'Batch Analysis Complete',
    message: '1,240 claims analyzed — 12 new flags detected',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    read: false,
    severity: 'medium',
  },
  {
    id: 'NOTIF-004',
    title: 'Report Generated',
    message: 'Monthly fraud risk report — September 2026 is ready',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
    severity: 'low',
  },
  {
    id: 'NOTIF-005',
    title: 'System Update',
    message: 'AI detection model updated — accuracy improved to 94.7%',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: true,
    severity: 'low',
  },
];
