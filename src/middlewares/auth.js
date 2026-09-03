import JwtUtils from "../utils/jwt.js";
import AppError from "../utils/AppError.js";
import models from "../models/index.js";

/**
 * Middleware untuk mengecek apakah user sudah login atau belum.
 * Middleware ini menempel pada rute-rute yang butuh keamanan (seperti membuat pesanan).
 * 
 * @param {Object} req - Request (berisi header yang dikirim client)
 * @param {Object} res - Response
 * @param {Function} next - Fungsi untuk melanjutkan ke controller (atau middleware berikutnya)
 */
const authMiddleware = async (req, res, next) => {
    // 1. Ambil token dari HTTP Headers (Authorization)
    const authHeader = req.headers.authorization;
    
    // 2. Pastikan tokennya ada dan formatnya benar ("Bearer <token>")
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('No token provided', 401); // 401: Unauthorized
    }

    // 3. Pisahkan kata "Bearer" dan ambil murni tokennya saja
    const token = authHeader.split(' ')[1];
    
    // 4. Verifikasi validitas token (apakah belum expired? apakah rahasianya benar?)
    const decoded = JwtUtils.verifyToken(token);
    
    // 5. Cek ke database apakah user pemegang token ini MASIH ADA
    // Mencegah kasus di mana akun sudah dihapus tapi token masih berlaku.
    const user = await models.User.findByPk(decoded.id);
    if (!user) {
        throw new AppError('The user belonging to this token no longer exists.', 401);
    }
    
    // 6. Jika semua lolos, simpan data user yang login ke dalam objek `req.user`
    // Supaya controller nanti gampang ngambil ID user yang sedang login (misal: req.user.id)
    req.user = decoded;
    
    // 7. Lanjut ke proses berikutnya
    next();
};

export default authMiddleware;