import pandas as pd
import os
import sys
import json
import random
from datetime import datetime, timedelta

# Set up paths
base_dir = r"c:\Users\CHRONUS\Downloads\Compressed\Data Sampel 2015-2023\Data Sampel 2015-2023\Data Sampel Reguler Edisi 2024\data"
filepath = os.path.join(base_dir, "202303_fkrtl.dta")
excel_path = r"c:\Users\CHRONUS\Downloads\Compressed\Data Sampel 2015-2023\Data Sampel 2015-2023\2023 Metadata Data Sampel BPJS Kesehatan.xlsx"
out_dir = r"c:\Users\CHRONUS\Downloads\Compressed\Data Sampel 2015-2023\Data Sampel 2015-2023\web_bpjs\src\data"

# 1. Load wilayah
print("Membaca referensi kode wilayah dari Excel...")
df_wilayah = pd.read_excel(excel_path, sheet_name="Kode wilayah")
wilayah_dict = {}
for _, row in df_wilayah.iterrows():
    kode = str(row['kode_kabupaten/kota']).split('.')[0]
    nama = str(row['nama_kabupaten/kota']).title()
    if kode != 'nan':
        wilayah_dict[kode] = nama

# 2. Read data
print("Membaca klaim data...")
df = pd.read_stata(filepath, convert_categoricals=False, chunksize=500000)
df = next(df)

dup_cols = ['PSTV01', 'FKL03', 'FKL17A']
dupes = df[df.duplicated(subset=dup_cols, keep=False)].copy().sort_values(dup_cols)

mean_cost = df['FKL46'].mean()
std_cost = df['FKL46'].std()
outliers = df[df['FKL46'] > mean_cost + 3*std_cost].copy()

# Pilih 2000 data
selected_dupes = dupes.head(500).copy()
selected_outliers = outliers.head(100).copy()
selected_normals = df.sample(1400).copy()
selected = pd.concat([selected_dupes, selected_outliers, selected_normals])

# --- GENERATE CLAIMS.TS ---
claims_data = []
for _, row in selected.iterrows():
    cid = str(row.get('FKL02', ''))
    pid = "PAT-" + str(row['PSTV01'])
    kode_kab = str(row.get('FKL06', '')).split('.')[0]
    nama_kab = wilayah_dict.get(kode_kab, f"Kab. Kode {kode_kab}")
    
    amount = int(row.get('FKL46', 0))
    dt = pd.to_datetime(row['FKL03'])
    
    claims_data.append({
        'id': cid,
        'patientId': pid,
        'providerId': f"PROV-{kode_kab}",
        'providerName': f"RSUD {nama_kab}",
        'diagnosis': str(row.get('FKL17A', '')),
        'procedure': f"ICD9-{str(row.get('FKL30', ''))[:5]}",
        'amount': amount,
        'date': dt,
        'region': nama_kab,
        'is_dupe': cid in selected_dupes['FKL02'].values,
        'is_outlier': cid in selected_outliers['FKL02'].values
    })

claims_ts = """import type { ClaimData } from '../types';
import { buildRiskProfiles } from '../lib/detection';
type BaseClaim = Omit<ClaimData, 'riskScore' | 'riskLevel' | 'anomalyFlags' | 'status'>;
const baseClaims: BaseClaim[] = [\n"""

for c in claims_data:
    claims_ts += f"""  {{
    id: '{c['id']}', patientId: '{c['patientId']}', patientName: 'Peserta {c['patientId']}',
    providerId: '{c['providerId']}', providerName: '{c['providerName']}', providerType: 'FKRTL',
    diagnosis: '{c['diagnosis']}', diagnosisCode: '{c['diagnosis']}', procedure: '{c['procedure']}',
    amount: {c['amount']}, date: new Date('{c['date'].strftime('%Y-%m-%dT%H:%M:%S')}'), region: '{c['region']}',
  }},\n"""
claims_ts += "];\nconst riskProfiles = buildRiskProfiles(baseClaims);\nexport const claims: ClaimData[] = baseClaims.map((claim) => ({ ...claim, ...riskProfiles.get(claim.id)! })).sort((a, b) => b.date.getTime() - a.date.getTime());\n"

with open(os.path.join(out_dir, "claims.ts"), "w", encoding='utf-8') as f:
    f.write(claims_ts)


# --- GENERATE ALERTS.TS ---
alerts_ts = """import type { AlertData, NotificationData } from '../types';

export const recentAlerts: AlertData[] = [\n"""

alert_id = 1
for c in claims_data:
    if c['is_dupe'] and alert_id <= 3:
        alerts_ts += f"""  {{ id: 'ALT-{alert_id:03}', severity: 'critical', type: 'duplicate_billing', title: 'Potensi Tagihan Ganda', claimId: '{c['id']}', metric: {{ label: 'Kemiripan', value: '100%' }}, timestamp: new Date(Date.now() - {random.randint(1, 60)} * 60 * 1000), description: 'Klaim identik ditemukan dari faskes yang sama.' }},\n"""
        alert_id += 1
    elif c['is_outlier'] and alert_id <= 6:
        alerts_ts += f"""  {{ id: 'ALT-{alert_id:03}', severity: 'high', type: 'cost_anomaly', title: 'Anomali Biaya Terdeteksi', claimId: '{c['id']}', metric: {{ label: 'Deviasi', value: '+300%' }}, timestamp: new Date(Date.now() - {random.randint(60, 300)} * 60 * 1000), description: 'Biaya klaim sangat ekstrem.' }},\n"""
        alert_id += 1

alerts_ts += "];\n\nexport const notifications: NotificationData[] = [\n"
alerts_ts += """  { id: 'NOTIF-001', title: 'Sinkronisasi 2000 Data', message: 'Data sampel BPJS berhasil disinkronisasi.', timestamp: new Date(), read: false, severity: 'medium' },\n];\n"""
with open(os.path.join(out_dir, "alerts.ts"), "w", encoding='utf-8') as f:
    f.write(alerts_ts)


# --- GENERATE DASHBOARD.TS ---
dashboard_ts = f"""import type {{ KpiCardData, RiskDistributionData, TrendDataset, AnomalyBreakdownData, QuickActionData }} from '../types';

export const kpiCards: KpiCardData[] = [
  {{ id: 'total-claims', label: 'Total Klaim', value: '2,000', rawValue: 2000, trend: 0, trendLabel: 'Sampel Aktif', icon: 'FileText', accentColor: 'text-blue-600', bgColor: 'bg-blue-50', unit: 'klaim' }},
  {{ id: 'high-risk', label: 'Klaim Risiko Tinggi', value: '600', rawValue: 600, trend: 0, trendLabel: 'Dari 2000 Sampel', icon: 'AlertTriangle', accentColor: 'text-orange-600', bgColor: 'bg-orange-50', riskLevel: 'high' }},
  {{ id: 'duplicate-billing', label: 'Tagihan Ganda', value: '500', rawValue: 500, trend: 0, trendLabel: 'Kasus Identik', icon: 'Copy', accentColor: 'text-red-600', bgColor: 'bg-red-50', riskLevel: 'critical' }},
  {{ id: 'cost-outliers', label: 'Anomali Biaya', value: '100', rawValue: 100, trend: 0, trendLabel: 'Nilai Ekstrem', icon: 'BadgeDollarSign', accentColor: 'text-emerald-600', bgColor: 'bg-emerald-50', unit: 'kasus' }},
];

export const riskDistribution: RiskDistributionData[] = [
  {{ category: 'Risiko Rendah', level: 'low', count: 1400, percentage: 70, color: '#22c55e', fillColor: '#22c55e' }},
  {{ category: 'Risiko Sedang', level: 'medium', count: 0, percentage: 0, color: '#eab308', fillColor: '#eab308' }},
  {{ category: 'Risiko Tinggi', level: 'high', count: 100, percentage: 5, color: '#f97316', fillColor: '#f97316' }},
  {{ category: 'Risiko Kritis', level: 'critical', count: 500, percentage: 25, color: '#ef4444', fillColor: '#ef4444' }},
];

export const anomalyBreakdown: AnomalyBreakdownData[] = [
  {{ type: 'duplicate_billing', label: 'Tagihan Ganda', count: 500, percentage: 83.3, color: '#ef4444' }},
  {{ type: 'cost_anomaly', label: 'Anomali Biaya', count: 100, percentage: 16.7, color: '#eab308' }},
];

function generateTrendData(days: number) {{
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {{
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({{
      date: d.toLocaleDateString('id-ID', {{ day: '2-digit', month: 'short' }}),
      totalClaims: Math.floor(2000/days),
      flaggedClaims: Math.floor(600/days),
      criticalClaims: Math.floor(500/days),
    }});
  }}
  return data;
}}

export const trendData: TrendDataset = {{
  '7d': generateTrendData(7),
  '30d': generateTrendData(30),
  '90d': generateTrendData(90),
}};

export const quickActions: QuickActionData[] = [
  {{ id: 'review-high-risk', label: 'Tinjau Klaim Risiko Tinggi', icon: 'AlertTriangle', route: '/risk-radar', variant: 'danger' }},
  {{ id: 'duplicate-detection', label: 'Deteksi Tagihan Ganda', icon: 'Copy', route: '/duplicate-detection', variant: 'warning' }},
  {{ id: 'verification-center', label: 'Buka Pusat Verifikasi', icon: 'CheckCircle', route: '/verification', variant: 'primary' }},
  {{ id: 'view-reports', label: 'Lihat Laporan', icon: 'BarChart2', route: '/reports', variant: 'secondary' }},
];
"""
with open(os.path.join(out_dir, "dashboard.ts"), "w", encoding='utf-8') as f:
    f.write(dashboard_ts)

print("Semua data berhasil disinkronisasi!")
