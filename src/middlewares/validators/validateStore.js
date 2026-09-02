import { body } from 'express-validator';
import validateResult from './validateResult.js';

export const validateCreateStore = [
  body('name')
    .trim()
    .notEmpty().withMessage('Store name is required')
    .isLength({ min: 3, max: 255 }).withMessage('Store name must be between 3 and 255 characters'),
  
  body('description')
    .optional()
    .trim(),
    
  validateResult
];

export const validateUpdateStore = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 }).withMessage('Store name must be between 3 and 255 characters'),
  
  body('description')
    .optional()
    .trim(),
    
  validateResult
];