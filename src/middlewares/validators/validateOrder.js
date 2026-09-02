import { body } from 'express-validator';
import validateResult from './validateResult.js';

export const validateCreateOrder = [
  body('store_id')
    .notEmpty().withMessage('Store ID is required')
    .isUUID().withMessage('Invalid store ID format'),
  
  body('shipping_cost')
    .notEmpty().withMessage('Shipping cost is required')
    .isFloat({ min: 0 }).withMessage('Shipping cost must be a positive number'),
  
  body('products')
    .isArray({ min: 1 }).withMessage('At least one product is required')
    .custom(products => {
      return products.every(product => 
        product.product_id && 
        product.quantity && 
        product.quantity > 0
      );
    }).withMessage('Each product must have a valid product_id and quantity'),
  
  validateResult
];

export const validateUpdateOrderStatus = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'approved', 'out_for_delivery', 'completed', 'canceled'])
    .withMessage('Invalid status'),
    
  validateResult
];