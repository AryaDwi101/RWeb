# PoS Dine-In — Restoran (RWeb UAD)

Aplikasi Point-of-Sale restoran dine-in dengan 4 peran: **Admin/Manajer, Kasir, Pelayan, Koki**.

- **backend/** — REST API (Laravel 12 + Sanctum) + MySQL/MariaDB
- **frontend/** — Next.js (React + Tailwind)

## Prasyarat
- PHP 8.2+, Composer, Node 18+, MySQL/MariaDB (mis. XAMPP)

## Menjalankan

### 1) Database & Backend
```bash
# pastikan MySQL (XAMPP) aktif
cd backend
# (sekali saja) buat .env sudah disetel ke DB: pos_dinein, user root, tanpa password
php artisan migrate:fresh --seed      # buat tabel + data contoh
php artisan serve                      # API di http://localhost:8000
```

### 2) Frontend
```bash
cd frontend
# set base URL API (sekali): buat file .env.local berisi
#   NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm run dev                            # web di http://localhost:3000
```

## Akun login (semua password: `password`)
| Peran | Email |
|-------|-------|
| Admin / Manajer | arya@resto.id |
| Kasir | budi@resto.id |
| Pelayan | rafly@resto.id |
| Koki | sari@resto.id |

## Alur singkat
Pelayan **buka meja** → **catat pesanan** (Kirim ke Dapur) → Koki **proses** (Antrian→Dimasak→Siap) → Pelayan **antar** → Kasir **proses pembayaran** → struk & sesi ditutup. Admin kelola menu/meja/pengguna & lihat laporan.
