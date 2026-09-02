import AppError from '../utils/AppError.js';

const checkRole = (allowedRoles) => (req, res, next) => {
    let hasAccess = req.user.roles.some(role => allowedRoles.includes(role));

    if(req.user.roles.includes("admin")) {
        hasAccess = true
    }

    if (!hasAccess) {
        throw new AppError('Access forbidden', 403);
    }
    next();
};

export default checkRole;