# Keamanan & Tata Kelola BILL GATES

## Prinsip
1. **Data demo = sintetis.** Firebase hanya dipakai untuk demo prototipe. Tidak ada data peserta JKN riil di Firestore.
2. **Produksi = di dalam lingkungan BPJS.** Arsitektur produksi menempatkan basis data dan layanan deteksi di infrastruktur BPJS (on-premise / pusat data pemerintah). Tidak ada data klaim yang keluar ke cloud publik. Firestore tidak dipakai untuk data klaim riil.
3. **Akses minimum (least privilege).** Tolak semua secara default (`firestore.rules`).

## Peran
| Peran | Baca klaim | Buat keputusan | Baca log audit | Ubah pengaturan/seed |
|---|:-:|:-:|:-:|:-:|
| Verifikator | ✔ | ✔ | ✖ | ✖ |
| Auditor | ✔ | ✖ | ✔ | ✖ |
| Administrator | ✔ | ✔ | ✔ | ✔ |

Peran disimpan di `staff/{uid}` dan **tidak bisa diubah dari aplikasi** (hanya lewat Firebase Console / Admin SDK).

## Kontrol yang diterapkan di prototipe
- Login Firebase Auth (email + kata sandi); halaman aplikasi tertutup tanpa login dan tanpa peran.
- Sesi berakhir otomatis setelah 15 menit tanpa aktivitas.
- Keputusan verifikator disimpan permanen, wajib alasan ≥ 5 karakter, atas nama pengguna yang login, waktu dari server.
- Keputusan dan entri audit ditulis **atomik** (satu batch): tidak ada keputusan tanpa jejak.
- Log audit append-only: login, logout, sesi habis, membuka klaim, ekspor CSV, keputusan. Tidak ada update/hapus.
- Klaim tidak lagi diubah dari browser (status tinjauan disimpan di koleksi `decisions`).

## Yang BELUM ada (jujur)
- Aturan Firestore belum diuji dengan Firebase Emulator.
- Belum ada enkripsi tingkat kolom, pseudonimisasi hash pada ID pasien, dan kebijakan retensi otomatis.
- Belum ada DPIA tertulis, MFA, dan pemantauan anomali akses.
- Pemeriksaan peran saat ini juga bergantung pada aturan Firestore; audit independen diperlukan sebelum produksi.

## Cara menerapkan
1. Firebase Console → Authentication → aktifkan **Email/Password**.
2. Buat 3 pengguna (admin, verifikator, auditor). Catat UID masing-masing.
3. Firestore → buat dokumen `staff/{uid}` dengan field `role` = `admin` | `verifier` | `auditor`.
4. Deploy aturan: `npx firebase-tools deploy --only firestore:rules` (atau tempel isi `firestore.rules` di tab Rules).
5. Isi `.env.local` (konfigurasi Firebase + `SEED_EMAIL`/`SEED_PASSWORD` milik admin), lalu `npm run seed:firebase`.
6. Tambahkan secret GitHub yang sama untuk `deploy.yml` bila belum ada. Berikan akun demo read-only (verifikator/auditor) kepada juri lewat dashboard peserta, bukan di repo publik.
