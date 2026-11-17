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
6. Transisi status order mengikuti tabel di `orderService.js`. Jangan tambah status baru tanpa memperbarui tabel itu.
7. Test menulis mock di `src/tests/services/`. Pakai `jest.unstable_mockModule` sebelum dynamic `import` (backend ESM).
8. Jangan commit `.env`, `node_modules`, atau `logs/`.

## Catatan Teknis

- Project memakai `"type": "module"`. Sequelize CLI dijalankan lewat script npm
  (tanpa `.sequelizerc`) karena file itu tidak kompatibel dengan ESM.
- Butuh Node.js >= 22.12 untuk menjalankan Sequelize CLI dengan migration ESM.
- Config `test` memakai `DB_NAME_TEST`. Buat database test terpisah sebelum
  menjalankan test yang menyentuh database.
- Dua migration lama masih bernama `YYYYMMDDHHMMSS-*` dan sudah tercatat di
  tabel `SequelizeMeta`. Jangan rename tanpa memperbarui tabel itu.
- Dokumentasi API: `http://localhost:3000/api-docs`.

## Definition of Done

`npm run verify` hijau, tidak ada `console.log` debug baru, dan perubahan
respons API didokumentasikan di JSDoc Swagger.
