import type { AlertData, NotificationData } from '../types';

export const recentAlerts: AlertData[] = [
  { id: 'ALT-001', severity: 'critical', type: 'duplicate_billing', title: 'Potensi Tagihan Ganda', claimId: '637360623P000544', metric: { label: 'Kemiripan', value: '100%' }, timestamp: new Date(Date.now() - 4 * 60 * 1000), description: 'Klaim identik ditemukan — nilai Rp 20,000.' },
  { id: 'ALT-002', severity: 'critical', type: 'duplicate_billing', title: 'Potensi Tagihan Ganda', claimId: '637360623P000544', metric: { label: 'Kemiripan', value: '100%' }, timestamp: new Date(Date.now() - 16 * 60 * 1000), description: 'Klaim identik ditemukan — nilai Rp 45,000.' },
  { id: 'ALT-003', severity: 'critical', type: 'duplicate_billing', title: 'Potensi Tagihan Ganda', claimId: '637360623P000544', metric: { label: 'Kemiripan', value: '100%' }, timestamp: new Date(Date.now() - 25 * 60 * 1000), description: 'Klaim identik ditemukan — nilai Rp 60,000.' },
  { id: 'ALT-004', severity: 'high', type: 'cost_anomaly', title: 'Anomali Biaya Terdeteksi', claimId: '162020823V044823', metric: { label: 'Deviasi', value: '+1070%' }, timestamp: new Date(Date.now() - 213 * 60 * 1000), description: 'Biaya Rp 2,144,600 jauh di atas rata-rata Rp 200,333.' },
  { id: 'ALT-005', severity: 'high', type: 'cost_anomaly', title: 'Anomali Biaya Terdeteksi', claimId: '416260523V002889', metric: { label: 'Deviasi', value: '+1134%' }, timestamp: new Date(Date.now() - 299 * 60 * 1000), description: 'Biaya Rp 2,273,300 jauh di atas rata-rata Rp 200,333.' },
  { id: 'ALT-006', severity: 'high', type: 'cost_anomaly', title: 'Anomali Biaya Terdeteksi', claimId: '229561023V008257', metric: { label: 'Deviasi', value: '+1099%' }, timestamp: new Date(Date.now() - 161 * 60 * 1000), description: 'Biaya Rp 2,203,400 jauh di atas rata-rata Rp 200,333.' },
];

export const notifications: NotificationData[] = [
  { id: 'NOTIF-001', title: 'Sinkronisasi 3,917 Data', message: '3,917 klaim BPJS (FKRTL + Non-Kapitasi) bernilai > Rp 0 berhasil dimuat.', timestamp: new Date(), read: false, severity: 'medium' },
];
