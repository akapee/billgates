import pandas as pd
import os
import sys

base_dir = r"c:\Users\CHRONUS\Downloads\Compressed\Data Sampel 2015-2023\Data Sampel 2015-2023\Data Sampel Reguler Edisi 2024\data"
filepath = os.path.join(base_dir, "202303_fkrtl.dta")
excel_path = r"c:\Users\CHRONUS\Downloads\Compressed\Data Sampel 2015-2023\Data Sampel 2015-2023\2023 Metadata Data Sampel BPJS Kesehatan.xlsx"

print("Membaca referensi kode wilayah dari Excel...")
df_wilayah = pd.read_excel(excel_path, sheet_name="Kode wilayah")

# Membuat kamus (dictionary) dari kode kabupaten ke nama kabupaten
wilayah_dict = {}
for _, row in df_wilayah.iterrows():
    kode = str(row['kode_kabupaten/kota']).split('.')[0] # buang .0 jika ada
    nama = str(row['nama_kabupaten/kota']).title() # Format huruf kapital yang rapi
    if kode != 'nan':
        wilayah_dict[kode] = nama

print("Reading klaim data...")
df = pd.read_stata(filepath, convert_categoricals=False, chunksize=500000)
df = next(df)  # read first 500k rows

# Find exact duplicates
dup_cols = ['PSTV01', 'FKL03', 'FKL17A']
dupes = df[df.duplicated(subset=dup_cols, keep=False)].copy()
dupes = dupes.sort_values(dup_cols)

# Find high cost outliers
mean_cost = df['FKL46'].mean()
std_cost = df['FKL46'].std()
outliers = df[df['FKL46'] > mean_cost + 3*std_cost].copy()

# Pilih 2000 data: 500 duplikat, 100 outlier, dan 1400 normal
selected_dupes = dupes.head(500).copy()
selected_outliers = outliers.head(100).copy()
selected_normals = df.sample(1400).copy()

selected = pd.concat([selected_dupes, selected_outliers, selected_normals])


claims_ts = """import type { ClaimData } from '../types';
import { buildRiskProfiles } from '../lib/detection';

type BaseClaim = Omit<ClaimData, 'riskScore' | 'riskLevel' | 'anomalyFlags' | 'status'>;

const baseClaims: BaseClaim[] = [
"""

for _, row in selected.iterrows():
    cid = str(row.get('FKL02', ''))
    pid = "PAT-" + str(row['PSTV01'])
    
    # Menerjemahkan kode wilayah ke nama asli
    kode_kab = str(row.get('FKL06', '')).split('.')[0]
    nama_kab = wilayah_dict.get(kode_kab, f"Kab. Kode {kode_kab}")
    
    prov = "RSUD " + nama_kab
    dx = str(row.get('FKL17A', ''))
    amount = int(row.get('FKL46', 0))
    # format date
    dt = pd.to_datetime(row['FKL03'])
    dt_str = f"new Date('{dt.strftime('%Y-%m-%dT%H:%M:%S')}')"
    
    claims_ts += f"""  {{
    id: '{cid}',
    patientId: '{pid}',
    patientName: 'Peserta {pid}',
    providerId: 'PROV-{kode_kab}',
    providerName: '{prov}',
    providerType: 'FKRTL',
    diagnosis: '{dx}',
    diagnosisCode: '{dx}',
    procedure: 'ICD9-{str(row.get('FKL30', ''))[:5]}',
    amount: {amount},
    date: {dt_str},
    region: '{nama_kab}',
  }},
"""

claims_ts += """];

const riskProfiles = buildRiskProfiles(baseClaims);

export const claims: ClaimData[] = baseClaims
  .map((claim) => ({ ...claim, ...riskProfiles.get(claim.id)! }))
  .sort((a, b) => b.date.getTime() - a.date.getTime());
"""

out_path = r"c:\Users\CHRONUS\Downloads\Compressed\Data Sampel 2015-2023\Data Sampel 2015-2023\web_bpjs\src\data\claims.ts"
with open(out_path, "w", encoding='utf-8') as f:
    f.write(claims_ts)

print(f"Berhasil meng-generate claims.ts dengan NAMA WILAYAH di {out_path}")
