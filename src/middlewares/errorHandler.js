import logger from '../utils/logger.js';
import { ValidationError, UniqueConstraintError } from 'sequelize';

/**
 * Global Error Handler Middleware
 * Menangkap semua error yang "dilempar" (throw) atau diteruskan via next(err) dari Controllers/Services.
 * Berfungsi untuk menstandarisasi format error JSON yang dikembalikan ke client (Frontend/Mobile App).
 */
const errorHandler = (err, req, res, next) => {
    // 1. Catat error di log file atau console (menggunakan winston logger)
    // Supaya developer bisa melacak apa yang salah.
    logger.error({
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        timestamp: new Date().toISOString()
    });

    // 2. Tangani Error Duplikasi Data dari Database (Contoh: Email sudah terdaftar)
    if (err instanceof UniqueConstraintError) {
        return res.status(409).json({
            success: false,
            status: 409, // 409 Conflict
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            method: req.method,
            message: ['Resource already exists'], // Pesan umum untuk user
            details: err.errors.map(e => ({
                field: e.path, // Kolom yang duplikat (misal: 'email')
                message: e.message // Pesan spesifik dari database
            }))
        });
    }

    // 3. Tangani Error Validasi Data dari Database (Contoh: Kolom wajib tidak diisi, tipe data salah)
    if (err instanceof ValidationError) {
        const validationErrors = err.errors.map(error => ({
            field: error.path,
            message: error.message
        }));

        return res.status(400).json({
            success: false,
            status: 400,
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            method: req.method,
            message: ['SQL Validation failed'],
            details: validationErrors
        });
    }

    // 4. Siapkan struktur standar JSON untuk error yang tidak tertangkap oleh blok di atas
    // Bisa error HTTP biasa (AppError) atau error sistem 500 (Internal Server Error)
    const errorResponse = {
        success: false,
        status: err.statusCode || 500, // Jika ada status code khusus (misal 404 dari AppError), pakai itu. Jika tidak, anggap 500.
        timestamp: err.timestamp || new Date().toISOString(),
        path: req.originalUrl,
        method: req.method,
        // Pastikan format pesan selalu array, agar frontend lebih mudah mem-parsingnya
        message: Array.isArray(err.message) ? err.message : [err.message || 'Internal Server Error'],
        details: err.details || null
    };

    // 5. Khusus untuk error 400 (Bad Request / Validasi Gagal), 
    // sisipkan data yang dikirim user agar mereka tahu di mana letak kesalahannya
    if (err.statusCode >= 400 && err.statusCode < 500) {
        errorResponse.request = {
            body: req.body,
            query: req.query,
            params: req.params
        };
    }

    // 6. Kirim JSON error-nya ke client
    res.status(err.statusCode || 500).json(errorResponse);
};

export default errorHandler;
