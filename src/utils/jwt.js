import jwt from 'jsonwebtoken';
import AppError from './AppError.js';

class JwtUtils {
    static generateToken(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        });
    }

    static verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new AppError('Invalid or expired token', 401);
        }
    }
}

export default JwtUtils;