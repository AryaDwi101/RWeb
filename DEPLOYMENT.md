# Panduan Deploy — POS Dine-In

Backend (Laravel) di **Railway** (punya MySQL bawaan), frontend (Next.js) di **Vercel** (zero-config, gratis, dan yang paling umum dipakai untuk Next.js). Total waktu ±15 menit.

## 1) Deploy Backend (Railway)

1. Buka [railway.app](https://railway.app) → login pakai akun GitHub kamu.
2. **New Project** → **Deploy from GitHub repo** → pilih repo `AryaDwi101/RWeb`.
3. Setelah service dibuat, klik service tsb → tab **Settings** → **Root Directory** → isi `backend`.
4. Masih di **Settings** → cari **Networking** → klik **Generate Domain** (akan muncul URL seperti `xxxxx.up.railway.app` — ini domain backend kamu).
5. Klik **+ New** di kanan atas project → **Database** → **Add MySQL**. Railway otomatis membuat service MySQL terpisah di project yang sama.
6. Kembali ke service backend → tab **Variables** → tambahkan satu-satu (klik "New Variable", untuk yang mereferensikan MySQL gunakan tombol "Add Reference"):

   | Variable | Value |
   |---|---|
   | `APP_NAME` | `POS Dine-In` |
   | `APP_ENV` | `production` |
   | `APP_DEBUG` | `false` |
   | `APP_URL` | `https://<domain-backend-railway-kamu>` |
   | `APP_KEY` | *(lihat langkah 7 di bawah)* |
   | `DB_CONNECTION` | `mysql` |
   | `DB_HOST` | `${{MySQL.MYSQLHOST}}` |
   | `DB_PORT` | `${{MySQL.MYSQLPORT}}` |
   | `DB_DATABASE` | `${{MySQL.MYSQLDATABASE}}` |
   | `DB_USERNAME` | `${{MySQL.MYSQLUSER}}` |
   | `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
   | `FRONTEND_URL` | `https://<domain-frontend-vercel-kamu>` *(isi setelah langkah 2 selesai)* |

   Notasi `${{MySQL.MYSQLHOST}}` dst. adalah cara Railway mereferensikan variable dari service MySQL — pilih lewat tombol "Add Reference" di UI, jangan ketik manual supaya tidak salah nama service.

7. **Generate APP_KEY**: di komputer kamu, jalankan:
   ```bash
   cd backend
   php artisan key:generate --show
   ```
   Copy hasilnya (`base64:...`) dan tempel sebagai value `APP_KEY` di Railway.

8. Railway akan otomatis build & deploy (baca `backend/nixpacks.toml` dan `backend/Procfile` yang sudah disiapkan — ini yang menjalankan `composer install`, migrasi database, lalu start server). Tunggu sampai status **Success**.

9. **Seed data demo** (sekali saja, setelah deploy pertama sukses): install [Railway CLI](https://docs.railway.app/guides/cli), lalu dari folder `backend/`:
   ```bash
   railway link      # pilih project & service backend
   railway run php artisan db:seed
   ```
   Atau lewat tab **Deployments** → klik deployment aktif → **View Logs** → cari opsi **"Run Command"** di dashboard Railway untuk menjalankan `php artisan db:seed` langsung dari browser.

## 2) Deploy Frontend (Vercel)

1. Buka [vercel.com](https://vercel.com) → login pakai akun GitHub kamu.
2. **Add New** → **Project** → import repo `AryaDwi101/RWeb`.
3. Di step konfigurasi: **Root Directory** → klik **Edit** → pilih folder `frontend`. Framework Preset otomatis terdeteksi **Next.js**.
4. Buka **Environment Variables**, tambahkan:
   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://<domain-backend-railway-kamu>/api` |
5. Klik **Deploy**. Setelah selesai, Vercel kasih URL seperti `rweb-xxxx.vercel.app` — ini **Live Demo URL** untuk laporan Tahap 3.
6. **Balik ke Railway**, update variable `FRONTEND_URL` di service backend dengan URL Vercel ini (langkah 6 di atas), supaya CORS mengizinkan frontend mengakses API. Railway akan auto-redeploy.

## 3) Cek hasil

- Buka URL Vercel → halaman login harus muncul.
- Coba salah satu quick-login (misal Admin) → kalau berhasil masuk ke dashboard, deployment sukses.
- Kalau muncul error CORS di console browser → pastikan `FRONTEND_URL` di Railway persis sama dengan URL Vercel (termasu `https://`, tanpa trailing slash).
- Kalau muncul error 500 dari API → cek Railway **Deployments → View Logs** untuk pesan errornya (paling sering: `APP_KEY` belum diisi, atau variable `DB_*` salah referensi).

## Catatan

- File `backend/Procfile` dan `backend/nixpacks.toml` sudah disiapkan di repo ini — jangan dihapus, itu yang dibaca Railway saat build & start.
- `php artisan serve` dipakai di sini demi kesederhanaan (cukup untuk demo/UAS). Untuk production sungguhan sebaiknya pakai `heroku-php-apache2` atau Octane, tapi di luar cakupan tugas ini.
- Data di database akan ke-reset kalau kamu menjalankan `migrate:fresh` — untuk update migrasi setelah seed awal, pakai `php artisan migrate` biasa (bukan `:fresh`) supaya data demo tidak hilang.
