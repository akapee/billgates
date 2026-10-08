import type { AlertData, NotificationData } from '../types';

export const recentAlerts: AlertData[] = [
  { id: 'ALT-001', severity: 'critical', type: 'duplicate_billing', title: 'Potensi Tagihan Ganda', claimId: '130070323V036336', metric: { label: 'Kemiripan', value: '100%' }, timestamp: new Date(Date.now() - 13 * 60 * 1000), description: 'Klaim identik ditemukan dari faskes yang sama.' },
  { id: 'ALT-002', severity: 'critical', type: 'duplicate_billing', title: 'Potensi Tagihan Ganda', claimId: '311010323V003296', metric: { label: 'Kemiripan', value: '100%' }, timestamp: new Date(Date.now() - 15 * 60 * 1000), description: 'Klaim identik ditemukan dari faskes yang sama.' },
  { id: 'ALT-003', severity: 'critical', type: 'duplicate_billing', title: 'Potensi Tagihan Ganda', claimId: '312601023V010571', metric: { label: 'Kemiripan', value: '100%' }, timestamp: new Date(Date.now() - 19 * 60 * 1000), description: 'Klaim identik ditemukan dari faskes yang sama.' },
  { id: 'ALT-004', severity: 'high', type: 'cost_anomaly', title: 'Anomali Biaya Terdeteksi', claimId: '162020823V044823', metric: { label: 'Deviasi', value: '+300%' }, timestamp: new Date(Date.now() - 269 * 60 * 1000), description: 'Biaya klaim sangat ekstrem.' },
  { id: 'ALT-005', severity: 'high', type: 'cost_anomaly', title: 'Anomali Biaya Terdeteksi', claimId: '416260523V002889', metric: { label: 'Deviasi', value: '+300%' }, timestamp: new Date(Date.now() - 73 * 60 * 1000), description: 'Biaya klaim sangat ekstrem.' },
  { id: 'ALT-006', severity: 'high', type: 'cost_anomaly', title: 'Anomali Biaya Terdeteksi', claimId: '229561023V008257', metric: { label: 'Deviasi', value: '+300%' }, timestamp: new Date(Date.now() - 118 * 60 * 1000), description: 'Biaya klaim sangat ekstrem.' },
];

export const notifications: NotificationData[] = [
  { id: 'NOTIF-001', title: 'Sinkronisasi 2000 Data', message: 'Data sampel BPJS berhasil disinkronisasi.', timestamp: new Date(), read: false, severity: 'medium' },
];
