import JwtUtils from "../utils/jwt.js";
import AppError from "../utils/AppError.js";

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = JwtUtils.verifyToken(token);
    
    // Add user info to request object
    req.user = decoded;
    
    next();
};

export default authMiddleware;