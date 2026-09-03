import 'express-async-errors'; // Memungkinkan penggunaan async/await tanpa harus try-catch di setiap route
import express from 'express'; // Framework utama untuk membuat server
import cors from 'cors'; // Agar API bisa diakses dari domain/port yang berbeda (Cross-Origin)
import dotenv from 'dotenv'; // Untuk membaca variabel lingkungan dari file .env
import swaggerUi from 'swagger-ui-express'; // Untuk menampilkan dokumentasi API interaktif
import swaggerSpec from './src/utils/swagger.js'; // Konfigurasi dokumentasi API
import errorHandler from './src/middlewares/errorHandler.js'; // Middleware untuk menangani semua error terpusat

// Import semua rute (routes)
import userRoutes from './src/routes/userRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import storeRoutes from './src/routes/storeRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import deliveryRoutes from './src/routes/deliveryRoutes.js';
import feedbackRoutes from './src/routes/feedbackRoutes.js';

dotenv.config(); // Memuat variabel dari .env

const app = express();
const port = process.env.PORT || 3000; // Menggunakan port dari .env atau 3000 sebagai fallback

// ==========================================
// Middleware Global
// ==========================================
app.use(cors()); // Izinkan semua akses CORS
app.use(express.json()); // Izinkan Express untuk mem-parsing request body berformat JSON
app.use(express.urlencoded({ extended: true })); // Izinkan URL-encoded body (misal: form submit)

// Basic route
// ==========================================
// Dokumentasi (Swagger UI)
// ==========================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ==========================================
// Registrasi Rute (Routing)
// ==========================================
// Mengarahkan URL tertentu ke file route masing-masing
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/feedback', feedbackRoutes);



// ==========================================
// Error Handling
// ==========================================
// Middleware error handler HARUS diletakkan paling bawah (setelah semua route)
// agar bisa menangkap semua error yang "dilempar" (throw) dari atas
app.use(errorHandler);

// Start server
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});