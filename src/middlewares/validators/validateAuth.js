import { body } from 'express-validator';
import validateResult from './validateResult.js';

export const validateRegister = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),

  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['buyer', 'seller'])
    .withMessage('Role must be buyer or seller'),

  body('phone')
    .optional()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
    .withMessage('Invalid phone number format'),

  validateResult,
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),

  body('password').trim().notEmpty().withMessage('Password is required'),

  validateResult,
];

export const validateUpdateProfile = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),

  body('phone')
    .optional()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
    .withMessage('Invalid phone number format'),

  body('location').optional({ nullable: true }).isString().isLength({ max: 500 }),
  body('latitude').optional({ nullable: true }).isFloat({ min: -90, max: 90 }),
  body('longitude').optional({ nullable: true }).isFloat({ min: -180, max: 180 }),
  body('bank_name').optional({ nullable: true }).isString().isLength({ max: 100 }),
  body('bank_account_number').optional({ nullable: true }).isString().isLength({ max: 50 }),
  body('bank_account_holder').optional({ nullable: true }).isString().isLength({ max: 150 }),
  body('bank_account').optional({ nullable: true }).isString().isLength({ max: 120 }),

  validateResult,
];
