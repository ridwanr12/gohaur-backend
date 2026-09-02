import { body } from 'express-validator';
import validateResult from './validateResult.js';

export const validateCreateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 3, max: 255 }).withMessage('Product name must be between 3 and 255 characters'),
  
  body('description')
    .optional()
    .trim(),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  
  body('images')
    .optional()
    .isArray().withMessage('Images must be an array'),
    
  validateResult
];

export const validateUpdateProduct = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 }).withMessage('Product name must be between 3 and 255 characters'),
  
  body('description')
    .optional()
    .trim(),
  
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  
  body('images')
    .optional()
    .isArray().withMessage('Images must be an array'),
    
  validateResult
];