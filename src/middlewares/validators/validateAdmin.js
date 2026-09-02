import { body } from 'express-validator';
import validateResult from './validateResult.js';

export const validateUpdateRole = [
  body('roles')
    .isArray()
    .withMessage('Roles must be an array')
    .custom(roles => {
      const validRoles = ['buyer', 'seller', 'courier', 'admin'];
      return roles.every(role => validRoles.includes(role));
    })
    .withMessage('Invalid role(s) provided'),
  validateResult
];