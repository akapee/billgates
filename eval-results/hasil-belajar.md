# Bukti Simulasi: Belajar dari Keputusan Verifikator

> Data SINTETIS. Verifikator disimulasikan (keliru 5% dari waktu). Latih pada data benih 101, uji pada data baru benih 7 (5.026 klaim, 100 duplikat). Rata-rata 8 pengulangan dengan urutan sampel berbeda; [min–maks] di kurung.
> Ini membuktikan mekanismenya bekerja pada simulasi. Belum membuktikan hasil pada verifikator atau data BPJS sungguhan.

| Keputusan verifikator (k) | Model aktif | Precision | Recall | F1 | Klaim sah salah tandai (FP) | Beban verifikator |
|---:|:-:|---:|---:|---:|---:|---:|
| 0 | tidak (aturan V2) | 56.2% [56.2%–56.2%] | 100.0% | 71.9% [71.9%–71.9%] | 78.0 | 3.5% |
| 10 | tidak (aturan V2) | 56.2% [56.2%–56.2%] | 100.0% | 71.9% [71.9%–71.9%] | 78.0 | 3.5% |
| 25 | tidak (aturan V2) | 56.2% [56.2%–56.2%] | 100.0% | 71.9% [71.9%–71.9%] | 78.0 | 3.5% |
| 50 | ya | 81.0% [57.9%–96.4%] | 72.0% | 74.2% [64.9%–82.7%] | 21.3 | 1.9% |
| 100 | ya | 80.5% [70.7%–90.0%] | 80.9% | 80.2% [77.2%–87.1%] | 20.8 | 2.0% |
| 200 | ya | 86.3% [78.9%–92.9%] | 84.4% | 85.1% [81.7%–89.2%] | 13.8 | 2.0% |
| 400 | ya | 90.4% [82.0%–93.8%] | 87.0% | 88.6% [82.0%–92.4%] | 9.4 | 1.9% |

## Bobot setelah 200 keputusan (satu pengulangan) vs prior

| Fitur | Prior (aturan V2) | Terlatih |
|---|---:|---:|
| Konstanta | -8.00 | -8.64 |
| Skor kemiripan V2 | 10.00 | 9.78 |
| ID pasien hanya mirip (bukan sama) | 0.00 | 1.25 |
| Faskes sama | 0.00 | -0.33 |
| Jarak antar klaim (hari) | 0.00 | -1.08 |
| Nilai klaim hampir sama | 0.00 | 1.11 |
| Klaim berulang pasien+diagnosis+tindakan (±30 hari) | 0.00 | -3.54 |
| Tindakan sama | 0.00 | 0.15 |

_Fitur "klaim berulang pasien+diagnosis+tindakan" bernilai negatif = makin panjang deret kunjungan berulang, makin kecil peluang dianggap duplikat (sesi sah seperti dialisis/rehabilitasi)._
