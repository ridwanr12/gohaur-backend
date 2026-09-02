import { body } from 'express-validator';
import validateResult from './validateResult.js';

const validateCreateFeedback = [
  body('order_id')
    .notEmpty().withMessage('Order ID is required')
    .isUUID().withMessage('Invalid Order ID format'),
  
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),
  
  validateResult
];

const validateUpdateFeedback = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),
  
  validateResult
];

export {
  validateCreateFeedback,
  validateUpdateFeedback
};