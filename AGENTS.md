# AGENTS.md — GoHaur Backend

Panduan untuk AI agent / developer yang mengerjakan repo ini.

## Ringkasan

REST API GoHaur: Node.js + Express (ES Modules) + PostgreSQL + Sequelize.
Arsitektur berlapis: `routes → controllers → services → repository → models`.

## Perintah Penting

```bash
npm install
npm run dev            # nodemon
npm start              # production-style
npm test               # Jest (ESM, mock repository)
npm run lint           # ESLint
npm run format         # Prettier
npm run verify         # lint + test
npm run db:create
npm run db:migrate
npm run db:migrate:status
npm run db:seed
```

Butuh `.env` (salin dari `.env.example`). `JWT_SECRET` minimal 32 karakter,
kalau tidak server menolak start.

## Peta Folder

```text
app.js                     # entry point, registrasi route + error handler
src/config/config.js       # konfigurasi DB per environment
src/routes/                # definisi endpoint + Swagger JSDoc
src/controllers/           # parsing req → panggil service → response
src/services/              # business logic, TIDAK boleh tahu req/res
src/repository/            # query Sequelize
src/models/                # definisi model + asosiasi
src/middlewares/           # auth JWT, checkRole, validators, errorHandler
src/tests/services/        # unit test service (mock repository)
src/migrations|seeders/    # Sequelize CLI
src/utils/                 # ApiResponse, AppError, jwt, logger, swagger
```

## Aturan yang Wajib Diikuti

1. `service` tidak boleh menyentuh `req`/`res`. Data masuk sebagai argumen, error dilempar sebagai `AppError`.
2. `controller` tidak boleh berisi query database. Semua lewat `service`.
3. Semua response sukses memakai `ApiResponse.success(...)`. Semua error memakai `AppError` agar ditangani `errorHandler`.
4. Semua rute privat wajib `authMiddleware`; rute per-role wajib `checkRole([...])`.
5. Setiap akses data milik user lain wajib dicek kepemilikannya (contoh: `getStoreOrders` mengecek `store.user_id`).
6. Alur status order: `pending -> accepted -> shipped -> completed`, plus `rejected`.
   Transisi dijaga di `orderService.js` (accept/reject/ship/complete). Jangan
   menambah status tanpa migration enum + update frontend.
7. Test menulis mock di `src/tests/services/`. Pakai `jest.unstable_mockModule` sebelum dynamic `import` (backend ESM).
8. Jangan commit `.env`, `node_modules`, `logs/`, atau `uploads/`.
9. Ongkir dan jarak dihitung server (`src/utils/geo.js`). Nominal dari client diabaikan.
   Tier: <1 km 8.000; <2 10.000; <3 12.500; <4 15.000; <5 18.000; >=5 ditolak.
10. Biaya pengemasan tetap Rp 2.000 (`PACKAGING_FEE`).
11. Upload gambar: `POST /api/uploads` (multer, max 2 MB, field `file`).
    File disimpan di `uploads/` dan disajikan di `/uploads/<nama>`.
12. Role courier sudah dihapus. Tabel `Deliveries` dan kolom `Orders.courier_id`
    masih ada untuk riwayat, tapi jangan dipakai di kode baru.

## Catatan Teknis

- Project memakai `"type": "module"`. Sequelize CLI dijalankan lewat script npm
  (tanpa `.sequelizerc`) karena file itu tidak kompatibel dengan ESM.
- Butuh Node.js >= 22.12 untuk menjalankan Sequelize CLI dengan migration ESM.
- Config `test` memakai `DB_NAME_TEST`. Buat database test terpisah sebelum
  menjalankan test yang menyentuh database.
- Dua migration lama masih bernama `YYYYMMDDHHMMSS-*` dan sudah tercatat di
  tabel `SequelizeMeta`. Jangan rename tanpa memperbarui tabel itu.
- Dokumentasi API: `http://localhost:3000/api-docs`.

## Endpoint Order

| Method | Path | Role |
|---|---|---|
| POST | `/api/orders` | buyer |
| GET | `/api/orders/my-orders` | buyer |
| GET | `/api/orders/store/:storeId` | seller (pemilik toko) |
| GET | `/api/orders/:id` | buyer terkait, seller pemilik, admin |
| PUT | `/api/orders/:id/accept` | seller |
| PUT | `/api/orders/:id/reject` | seller |
| PUT | `/api/orders/:id/ship` | seller (nama pengirim + plat) |
| PUT | `/api/orders/:id/complete` | buyer |

## Endpoint Upload

| Method | Path | Keterangan |
|---|---|---|
| POST | `/api/uploads` | multipart, field `file`, max 2 MB |

## Definition of Done

`npm run verify` hijau, tidak ada `console.log` debug baru, dan perubahan
respons API didokumentasikan di JSDoc Swagger.
