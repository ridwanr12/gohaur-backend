import { body } from 'express-validator';
import validateResult from './validateResult.js';

export const validateCreateStore = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Store name is required')
    .isLength({ min: 3, max: 255 })
    .withMessage('Store name must be between 3 and 255 characters'),

  body('description').optional().trim(),

  body('address').optional().trim().isLength({ max: 500 }),
  body('latitude').optional({ nullable: true }).isFloat({ min: -90, max: 90 }),
  body('longitude').optional({ nullable: true }).isFloat({ min: -180, max: 180 }),

  validateResult,
];

export const validateUpdateStore = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Store name must be between 3 and 255 characters'),

  body('description').optional().trim(),

  body('image').optional({ nullable: true }).isString(),
  body('address').optional({ nullable: true }).trim().isLength({ max: 500 }),
  body('latitude').optional({ nullable: true }).isFloat({ min: -90, max: 90 }),
  body('longitude').optional({ nullable: true }).isFloat({ min: -180, max: 180 }),
  body('bank_account').optional({ nullable: true }).isString().isLength({ max: 120 }),
  body('bank_account_holder').optional({ nullable: true }).isString().isLength({ max: 150 }),

  validateResult,
];
