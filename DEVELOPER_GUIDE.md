# Developer Guide: GoHaur Backend

Dokumen ini disusun untuk membantu Anda memahami cara kerja, struktur, dan pola kode (design pattern) yang digunakan di dalam repositori `gohaur-backend`.

## 1. Arsitektur Aplikasi (Layered Architecture)

Aplikasi ini dibangun menggunakan arsitektur berlapis (*Layered Architecture*), yang memisahkan tanggung jawab kode ke dalam beberapa tingkatan (folder). Tujuannya agar kode mudah dibaca, dirawat, dan dikembangkan.

Berikut adalah penjelasan setiap lapisannya (dari luar ke dalam):

### A. Routes (`src/routes/`)
- **Fungsi:** Menerima *request* dari *client* (seperti aplikasi mobile atau website) melalui URL tertentu (contoh: `POST /api/orders`).
- **Tugas:** Menentukan URL, metode HTTP (GET, POST, dll), memanggil *Middleware* (seperti cek login/otorisasi), dan akhirnya mengarahkan *request* ke **Controller** yang tepat.
- **Analogi:** Seperti resepsionis yang menerima tamu dan mengarahkannya ke ruangan yang benar.

### B. Controllers (`src/controllers/`)
- **Fungsi:** Menjembatani antara *Routes* dan *Services*.
- **Tugas:** Menerima data dari *request* (seperti `req.body`, `req.params`), memanggil **Service** untuk memproses data tersebut, lalu meracik data balasan (*response*) dan mengirimkannya kembali ke *client* (sebagai JSON). Di sinilah status code (200, 201, 400, dll) ditentukan.
- **Analogi:** Pelayan restoran yang mencatat pesanan dari tamu, memberikannya ke koki (Service), dan mengantar makanan kembali ke meja tamu.

### C. Services (`src/services/`)
- **Fungsi:** Pusat logika bisnis (*Business Logic*).
- **Tugas:** Di sinilah "otak" aplikasi berada. Melakukan perhitungan (seperti total harga), validasi bisnis (apakah stok cukup?), dan membuat keputusan. Service **TIDAK** boleh tahu menahu tentang *request/response* (req/res) HTTP. Service hanya fokus memproses data. Service memanggil **Repository** untuk urusan *database*.
- **Analogi:** Koki yang memasak makanan berdasarkan resep dan pesanan.

### D. Repository (`src/repository/`)
- **Fungsi:** Jembatan komunikasi langsung ke *Database*.
- **Tugas:** Berisi query *database* murni. Memanggil model Sequelize untuk melakukan proses CRUD (*Create, Read, Update, Delete*). Repository menyembunyikan kerumitan query dari Service.
- **Analogi:** Petugas gudang yang mencari dan mengambilkan bahan masakan yang diminta koki.

### E. Models (`src/models/`)
- **Fungsi:** Definisi tabel *Database*.
- **Tugas:** Mendefinisikan struktur tabel, tipe data (seperti `STRING`, `INTEGER`), dan relasi antar tabel (seperti `belongsTo`, `hasMany`). Ini dibuat menggunakan ORM Sequelize.

---

## 2. Alur Request (Contoh Pemesanan Barang)

Mari kita ikuti perjalanan data saat *user* menekan tombol "Beli" di aplikasi:

1. **Client (App)** mengirim request: `POST /api/orders` beserta data keranjang belanja (JSON).
2. **Routes** (`orderRoutes.js`) menerima request tersebut. Ia menyuruh `authMiddleware` memeriksa apakah *user* sudah login. Jika iya, request diteruskan ke `orderController.create`.
3. **Controller** (`orderController.js`) mengambil isi `req.body` dan ID user, lalu meminta bantuan `orderService.createOrder(...)`.
4. **Service** (`orderService.js`) menjalankan logika bisnis:
   - Mengecek ketersediaan stok produk melalui `productRepository`.
   - Menghitung total harga.
   - Menyuruh `orderRepository.create` membuat pesanan baru dalam satu "Transaksi" yang aman.
5. **Repository** (`orderRepository.js`) berbicara dengan PostgreSQL menggunakan perintah SQL (via Sequelize) untuk memasukkan data ke tabel `Orders` dan `OrderProducts`.
6. Jika sukses, data kembali dari **Repository** -> **Service** -> **Controller**.
7. **Controller** membungkus datanya dalam bentuk JSON dan membalas `res.status(201).json(...)` ke **Client**.

---

## 3. Konsep Penting Lainnya

- **JWT (JSON Web Token):** Digunakan untuk mengenali identitas pengguna setelah login. Token ini dikirimkan klien di *Header* setiap kali melakukan *request* yang membutuhkan privasi (berbelanja, melihat profil).
- **Error Handler (`errorHandler.js`):** Semua *error* yang terjadi di aplikasi akan bermuara ke sini. Ini memastikan aplikasi tidak tiba-tiba *crash*, melainkan membalas *error* dengan format JSON yang rapi (status 400, 404, 500, dll).
- **express-async-errors:** Library ini memungkinkan kita menggunakan `async/await` di dalam rute tanpa perlu repot menulis blok `try-catch` berulang-ulang di setiap *controller*. Jika ada *error*, akan langsung diteruskan ke Error Handler.

Untuk melihat contoh nyata bagaimana semua konsep ini diterapkan, silakan pelajari file kode yang berkaitan dengan `Order` (`orderRoutes`, `orderController`, `orderService`, `orderRepository`), di mana saya telah menambahkan penjelasan detail pada setiap baris kodenya.
