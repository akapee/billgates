import type { AlertData, NotificationData } from '../types';

// ─────────────────────────────────────────────
// Recent Alerts
// ─────────────────────────────────────────────

export const recentAlerts: AlertData[] = [
  {
    id: 'ALT-001',
    severity: 'critical',
    type: 'duplicate_billing',
    title: 'Potensi Tagihan Ganda',
    claimId: 'CLM-2026-00482',
    metric: {
      label: 'Kemiripan',
      value: '94%',
    },
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    description: 'Klaim identik ditemukan dari faskes yang sama dalam periode 3 hari.',
  },
  {
    id: 'ALT-002',
    severity: 'high',
    type: 'cost_anomaly',
    title: 'Anomali Biaya Terdeteksi',
    claimId: 'CLM-2026-00471',
    metric: {
      label: 'Deviasi',
      value: '+284%',
    },
    timestamp: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
    description: 'Biaya klaim melebihi standar tarif INA-CBGs secara signifikan.',
  },
  {
    id: 'ALT-003',
    severity: 'medium',
    type: 'procedure_anomaly',
    title: 'Pola Prosedur Tidak Wajar',
    claimId: 'CLM-2026-00463',
    metric: {
      label: 'Skor Risiko',
      value: '71',
    },
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    description: 'Pola prosedur medis tidak sesuai dengan diagnosis primer.',
  },
  {
    id: 'ALT-004',
    severity: 'critical',
    type: 'upcoding',
    title: 'Dugaan Upcoding',
    claimId: 'CLM-2026-00458',
    metric: {
      label: 'Skor Risiko',
      value: '88',
    },
    timestamp: new Date(Date.now() - 23 * 60 * 1000), // 23 minutes ago
    description: 'Kode diagnosis dinaikkan ke tingkat yang lebih tinggi tanpa bukti klinis.',
  },
  {
    id: 'ALT-005',
    severity: 'high',
    type: 'repeat_billing',
    title: 'Tagihan Berulang Terdeteksi',
    claimId: 'CLM-2026-00449',
    metric: {
      label: 'Kejadian',
      value: '3x',
    },
    timestamp: new Date(Date.now() - 41 * 60 * 1000), // 41 minutes ago
    description: 'Prosedur yang sama ditagihkan 3 kali pada pasien yang sama.',
  },
  {
    id: 'ALT-006',
    severity: 'low',
    type: 'diagnosis_anomaly',
    title: 'Ketidaksesuaian Diagnosis',
    claimId: 'CLM-2026-00437',
    metric: {
      label: 'Tingkat Keyakinan',
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
    title: 'Peringatan Kritis',
    message: 'CLM-2026-00482 — Potensi tagihan ganda (kemiripan 94%)',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    read: false,
    severity: 'critical',
  },
  {
    id: 'NOTIF-002',
    title: 'Risiko Tinggi Terdeteksi',
    message: 'CLM-2026-00471 — Anomali biaya +284% di atas tarif INA-CBGs',
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    read: false,
    severity: 'high',
  },
  {
    id: 'NOTIF-003',
    title: 'Analisis Batch Selesai',
    message: '1.240 klaim dianalisis — 12 penanda baru terdeteksi',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    read: false,
    severity: 'medium',
  },
  {
    id: 'NOTIF-004',
    title: 'Laporan Dibuat',
    message: 'Laporan risiko fraud bulanan — September 2026 siap',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
    severity: 'low',
  },
  {
    id: 'NOTIF-005',
    title: 'Pembaruan Sistem',
    message: 'Model deteksi AI diperbarui — akurasi meningkat menjadi 94,7%',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: true,
    severity: 'low',
  },
];
