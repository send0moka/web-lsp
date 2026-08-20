# Web-LSP

Sistem Informasi Manajemen Lembaga Sertifikasi Profesi (LSP) untuk PT Denso. Mengelola data skema sertifikasi, asesor, tempat uji kompetensi (TUK), jadwal, pendaftaran, hasil,sertifikat, dan laporan.

## Tech Stack

- **Framework:** Next.js 14.2.5 (App Router)
- **UI:** React 18 + Bootstrap 5 + Chart.js
- **Database:** SQLite (better-sqlite3)
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **File Upload:** Node.js fs

## Persyaratan

- **Node.js** v18 atau lebih baru
- **npm** v9 atau lebih baru
- Tidak memerlukan install database server (SQLite sudah embedded)

## Instalasi

```bash
# 1. Clone repository
git clone <url-repo>
cd web-lsp

# 2. Install dependencies
npm install
```

Database SQLite akan otomatis dibuat saat pertama kali server dijalankan, termasuk semua tabel dan user admin default.

## Menjalankan Aplikasi

```bash
# Development mode (hot reload)
npm run dev

# Production build
npm run build
npm start
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Login Default

| Username | Password | Role  |
| -------- | -------- | ----- |
| `admin`  | `admin`  | admin |

User baru bisa ditambahkan langsung dari database SQLite di `data/lsp_denso.db`.

## Struktur Project

```
web-lsp/
├── app/
│   ├── api/                        # Backend API routes
│   │   ├── login/                  # Autentikasi
│   │   ├── test-db/                # Test koneksi database
│   │   ├── dashboard-stats/        # Statistik dashboard
│   │   ├── skema-sertifikasi/      # CRUD skema + unit kompetensi
│   │   ├── asesor-kompetensi/      # CRUD asesor
│   │   ├── tempat-uji-kompetensi/  # CRUD TUK
│   │   ├── jadwal-sertifikasi/     # CRUD jadwal + manajemen peserta
│   │   ├── pendaftaran-sertifikasi/# CRUD pendaftaran
│   │   ├── hasil-sertifikasi/      # Input & update hasil
│   │   ├── history-sertifikasi/    # Riwayat + input sertifikat
│   │   ├── summary-report/         # Laporan rekapitulasi
│   │   └── struktur-organisasi/    # Struktur organisasi (gambar)
│   ├── admin/                      # Halaman admin
│   │   ├── outline-lsp/            # Skema, asesor, TUK, dll
│   │   └── sertifikasi/            # Jadwal, pendaftaran, hasil, history
│   ├── user/                       # Halaman user (struktur sama dengan admin)
│   ├── login/                      # Halaman login
│   ├── layout.js                   # Root layout
│   ├── page.js                     # Landing page
│   └── globals.css                 # Global styles
├── lib/
│   └── db.js                       # Koneksi SQLite + auto-init schema
├── public/
│   ├── image/                      # Gambar statis (asesor, skema, struktur org)
│   └── uploads/                    # File upload runtime
├── data/
│   └── lsp_denso.db                # Database SQLite (otomatis dibuat)
├── script.sql                      # Schema SQL Server (referensi)
├── package.json
├── .env.local                      # Konfigurasi environment
└── next.config.js
```

## Fitur Utama

| Modul                   | Deskripsi                                                |
| ----------------------- | -------------------------------------------------------- |
| **Dashboard**           | Ringkasan jumlah skema, asesor, dan TUK                  |
| **Skema Sertifikasi**   | CRUD skema beserta unit kompetensi terkait               |
| **Asesor Kompetensi**   | CRUD data asesor dengan penugasan ke skema               |
| **TUK**                 | CRUD tempat uji kompetensi dengan penugasan ke skema     |
| **Jadwal Sertifikasi**  | Buat/edit/hapus jadwal, assign & remove peserta          |
| **Pendaftaran**         | Pendaftaran peserta sertifikasi                          |
| **Hasil Sertifikasi**   | Input dan update hasil (kompeten/tidak kompeten)         |
| **History & Sertifikat**| Riwayat sertifikasi + input nomor sertifikat & file      |
| **Summary Report**      | Laporan rekapitulasi data plan vs actual                 |

## Konfigurasi Environment

File `.env.local` berisi konfigurasi database (untuk referensi SQL Server lama, tidak digunakan oleh SQLite):

```env
# Konfigurasi ini tidak digunakan saat menggunakan SQLite
# Database SQLite otomatis dibuat di data/lsp_denso.db
```

## Database

Database SQLite tersimpan di `data/lsp_denso.db`. Schema diinisialisasi otomatically oleh `lib/db.js` saat pertama kali dijalankan, termasuk:

- 12 tabel (users, skema_sertifikasi, unit_kompetensi, skema_unit, asesor_kompetensi, asesor_skema, tempat_uji_kompetensi, tuk_skema, jadwal_sertifikasi, pendaftaran_sertifikasi, hasil_sertifikasi, sertifikat)
- User admin default (`admin` / `admin`)

Untuk melihat atau mengedit data langsung, bisa gunakan tools seperti [DB Browser for SQLite](https://sqlitebrowser.org/).

## Script Tersedia

| Command          | Deskripsi                           |
| ---------------- | ----------------------------------- |
| `npm run dev`    | Jalankan development server         |
| `npm run build`  | Build untuk production              |
| `npm start`      | Jalankan production server          |
| `npm run lint`   | Jalankan ESLint                     |
