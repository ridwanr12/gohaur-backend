import { body } from 'express-validator';
import validateResult from './validateResult.js';

export const validateCreateOrder = [
  body('store_id')
    .notEmpty()
    .withMessage('Store ID is required')
    .isUUID()
    .withMessage('Invalid store ID format'),

  body('delivery_address')
    .trim()
    .notEmpty()
    .withMessage('Delivery address is required')
    .isLength({ max: 500 })
    .withMessage('Delivery address is too long'),

  body('delivery_latitude')
    .notEmpty()
    .withMessage('Delivery latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid delivery latitude'),

  body('delivery_longitude')
    .notEmpty()
    .withMessage('Delivery longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid delivery longitude'),

  body('products')
    .isArray({ min: 1 })
    .withMessage('At least one product is required')
    .custom(products =>
      products.every(
        product => product.product_id && Number.isInteger(product.quantity) && product.quantity > 0,
      ),
    )
    .withMessage('Each product must have a valid product_id and quantity'),

  body('payment_proof').optional().isString(),

  validateResult,
];

export const validateRejectOrder = [
  body('rejection_reason')
    .optional({ nullable: true })
    .isString()
    .withMessage('Rejection reason must be a string')
    .isLength({ max: 500 })
    .withMessage('Rejection reason is too long'),

  validateResult,
];

export const validateShipOrder = [
  body('courier_name')
    .trim()
    .notEmpty()
    .withMessage('Courier name is required')
    .isLength({ max: 255 }),

  body('courier_plate')
    .trim()
    .notEmpty()
    .withMessage('Courier plate number is required')
    .isLength({ max: 50 }),

  validateResult,
];
