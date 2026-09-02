import { validationResult } from 'express-validator';
import AppError from '../../utils/AppError.js';

const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));
    
    const error = new AppError('Validation failed', 400, { errors: validationErrors });
    return next(error);
  }
  
  next();
};

export default validateResult;