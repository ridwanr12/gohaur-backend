# GoHaur Backend

Ini adalah repositori backend (API) untuk aplikasi **GoHaur**, sebuah platform pemesanan dan pengiriman barang. Aplikasi ini dibangun menggunakan Node.js, Express, dan PostgreSQL dengan arsitektur berlapis (Layered Architecture).

## 🚀 Teknologi Utama (Tech Stack)

- **Runtime:** Node.js (Disarankan versi v18 LTS, v20 LTS, atau terbaru)
- **Framework:** Express.js (ES Modules)
- **Database:** PostgreSQL
- **ORM:** Sequelize
- **Autentikasi:** JSON Web Token (JWT)
- **Dokumentasi API:** Swagger UI

---

## 🛠️ Prasyarat (Prerequisites)

Sebelum mulai menjalankan aplikasi ini, pastikan Anda telah menginstal:
1. [Node.js](https://nodejs.org/) (Versi 18 atau ke atas)
2. [PostgreSQL](https://www.postgresql.org/) (Pastikan *service* database sudah menyala)

---

## ⚙️ Cara Instalasi & Setup (Setup Guide)

Ikuti langkah-langkah berikut untuk menjalankan aplikasi di mesin lokal Anda:

### 1. Kloning Repositori & Instal Dependensi
Buka terminal Anda, arahkan ke folder proyek, dan jalankan perintah berikut untuk menginstal semua *library* yang dibutuhkan:
```bash
npm install
```

### 2. Konfigurasi Environment Variables (.env)
Buat sebuah file bernama `.env` di folder utama aplikasi (root directory), lalu isikan konfigurasi berikut. Sesuaikan `DB_USERNAME` dan `DB_PASSWORD` dengan kredensial PostgreSQL di komputer Anda.

```env
PORT=3000
JWT_SECRET=rahasia_jwt_sangat_panjang_sekali_minimal_32_karakter
JWT_EXPIRES_IN=24h

# Database Configuration
DB_USERNAME=postgres
DB_PASSWORD=password_postgres_anda
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME_DEV=gohaur-dev
DB_NAME_TEST=gohaur-test
DB_NAME_PROD=gohaur-prod
```

### 3. Setup Database
Pastikan PostgreSQL Anda sudah menyala, lalu jalankan perintah berurutan berikut untuk membuat database, membuat tabel, dan mengisi data awal:

```bash
# 1. Membuat database baru (sesuai nama DB_NAME_DEV di .env)
npx sequelize-cli db:create

# 2. Menjalankan migrasi (membuat tabel-tabel di database)
npx sequelize-cli db:migrate

# 3. Menjalankan seeder (mengisi data dummy / data awal seperti akun Admin)
npx sequelize-cli db:seed:all
```

*(Catatan: Jika Anda mendapati error "Permission denied" saat menjalankan npx atau nodemon di MacOS/Linux, jalankan perintah `chmod +x node_modules/.bin/*` untuk memberikan izin eksekusi).*

---

## 🏃‍♂️ Cara Menjalankan Aplikasi

Setelah semua setup selesai, Anda bisa menjalankan server dalam mode *development* (otomatis me-restart server jika ada perubahan file):

```bash
npm run dev
```

Jika tidak ada error, Anda akan melihat tulisan:
```text
Server is running on port 3000
```

---

## 📖 Dokumentasi & Panduan

- **Dokumentasi API (Swagger):** Buka browser Anda dan kunjungi `http://localhost:3000/api-docs` untuk melihat dan mencoba langsung seluruh rute API.
- **Panduan Developer:** Untuk mempelajari alur kode, arsitektur, dan cara kerja aplikasi (terutama bagi tim developer baru), silakan baca file **`DEVELOPER_GUIDE.md`** yang ada di repositori ini.

---

## 🧪 Testing

Untuk menjalankan *unit test*, gunakan perintah:
```bash
npm run test
```
