# Hasil Evaluasi BILL GATES (data SINTETIS)

Ambang V2 dipilih dari data tuning (benih 42, F1 tertinggi = 80); semua angka di bawah memakai data uji baru (benih 7).

> Data uji: 5.026 klaim, 100 duplikat sengaja disisipkan (≈2%), plus klaim SAH yang mirip duplikat (kontrol kronis, kontrol ulang, sesi berulang).
> Angka ini mengukur algoritma pada data buatan sendiri. Bukan akurasi di data JKN riil. Asumsi generator ada di `scripts/eval/generate.ts`.

## 1. Akurasi tingkat klaim

| Metode | Ditandai | Precision | Recall | F1 | False-positive rate | Beban verifikator | Waktu |
|---|---:|---:|---:|---:|---:|---:|---:|
| Baseline (persis: pasien+dx+tindakan+faskes+tanggal) | 14 | 100.0% | 14.0% | 24.6% | 0.0% | 0.3% | 19 ms |
| V1 (algoritma proposal lama, ambang 50) | 2822 | 3.5% | 100.0% | 6.8% | 55.3% | 56.1% | 903 ms |
| V2 (berblok + jendela 21 hari + ID fuzzy, ambang 80) | 178 | 56.2% | 100.0% | 71.9% | 1.6% | 3.5% | 13 ms |

### Recall per jenis duplikat (terdeteksi/total)

| Metode | Persis | Lintas faskes | ID salah ketik | Terlambat 8-21 hr | Sulit (label beda, nilai ±15%) |
|---|---:|---:|---:|---:|---:|
| Baseline (persis: pasien+dx+tindakan+faskes+tanggal) | 14/37 | 0/20 | 0/9 | 0/18 | 0/16 |
| V1 (algoritma proposal lama, ambang 50) | 37/37 | 20/20 | 9/9 | 18/18 | 16/16 |
| V2 (berblok + jendela 21 hari + ID fuzzy, ambang 80) | 37/37 | 20/20 | 9/9 | 18/18 | 16/16 |

### Sumber false positive (jumlah klaim SAH yang salah ditandai)

| Metode | normal | kronis | kontrol ulang | sesi berulang |
|---|---:|---:|---:|---:|
| Baseline (persis: pasien+dx+tindakan+faskes+tanggal) | 0 | 0 | 0 | 0 |
| V1 (algoritma proposal lama, ambang 50) | 2309 | 233 | 115 | 65 |
| V2 (berblok + jendela 21 hari + ID fuzzy, ambang 80) | 20 | 2 | 0 | 56 |

## 2. Sensitivitas ambang (V2, data uji)

| Ambang | Precision | Recall | F1 | Beban verifikator |
|---:|---:|---:|---:|---:|
| 50 | 35.0% | 100.0% | 51.8% | 5.7% |
| 60 | 35.0% | 100.0% | 51.8% | 5.7% |
| 70 | 35.0% | 100.0% | 51.8% | 5.7% |
| 75 | 36.4% | 100.0% | 53.3% | 5.5% |
| 80 | 56.2% | 100.0% | 71.9% | 3.5% |
| 85 | 56.5% | 91.0% | 69.7% | 3.2% |
| 90 | 54.1% | 79.0% | 64.2% | 2.9% |
| 95 | 52.1% | 63.0% | 57.0% | 2.4% |

## 3. Waktu proses vs jumlah klaim (seluruh batch, 1 core)

| Jumlah klaim | V1 O(n²) | V2 berblok |
|---:|---:|---:|
| 1.000 | 0.02 s | 0.00 s |
| 2.000 | 0.13 s | 0.00 s |
| 5.000 | 1.13 s | 0.02 s |
| 10.000 | 5.22 s | 0.09 s |
| 20.000 | — | 0.16 s |
| 50.000 | — | 0.69 s |
| 100.000 | — | 2.41 s |
| 200.000 | — | 7.97 s |

_Waktu = memproses seluruh batch sekaligus, bukan latensi satu klaim. Latensi per klaim baru (inkremental) perlu diukur terpisah di backend._
