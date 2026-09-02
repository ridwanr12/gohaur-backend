import express from 'express';
import {
  getDelivery,
  getOrderDelivery,
  updateDeliveryStatus
} from '../controllers/deliveryController.js';
import { body } from 'express-validator';
import validateResult from '../middlewares/validators/validateResult.js';
import authMiddleware from '../middlewares/auth.js';
import checkRole from '../middlewares/checkRole.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Deliveries
 *   description: Delivery management endpoints
 */

router.use(authMiddleware);

// Validate delivery status update
const validateDeliveryStatus = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['order_received', 'out_for_delivery', 'completed'])
    .withMessage('Invalid delivery status'),
  validateResult
];

// Get delivery details (courier, seller, buyer can view)
router.get('/:id', checkRole(['courier', 'seller', 'buyer']), getDelivery);

// Get delivery by order ID (courier, seller, buyer can view)
router.get('/order/:orderId', checkRole(['courier', 'seller', 'buyer']), getOrderDelivery);

// Update delivery status (courier only)
router.put('/:id/status', 
  checkRole(['courier']), 
  validateDeliveryStatus, 
  updateDeliveryStatus
);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Delivery:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         order_id:
 *           type: string
 *           format: uuid
 *         courier_id:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [order_received, out_for_delivery, completed]
 */

/**
 * @swagger
 * /api/deliveries/{id}:
 *   get:
 *     summary: Get delivery by ID
 *     tags: [Deliveries]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Delivery details
 *       404:
 *         description: Delivery not found
 * 
 * /api/deliveries/order/{orderId}:
 *   get:
 *     summary: Get delivery by order ID
 *     tags: [Deliveries]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Delivery details
 *       404:
 *         description: Delivery not found
 * 
 * /api/deliveries/{id}/status:
 *   put:
 *     summary: Update delivery status
 *     tags: [Deliveries]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [order_received, out_for_delivery, completed]
 *     responses:
 *       200:
 *         description: Delivery status updated
 *       404:
 *         description: Delivery not found
 */