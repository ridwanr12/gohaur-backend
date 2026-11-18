import express from 'express';
import {
  createOrder,
  getOrder,
  getMyOrders,
  getStoreOrders,
  acceptOrder,
  rejectOrder,
  shipOrder,
  completeOrder,
  markRefunded,
} from '../controllers/orderController.js';
import {
  validateCreateOrder,
  validateRejectOrder,
  validateShipOrder,
} from '../middlewares/validators/validateOrder.js';
import authMiddleware from '../middlewares/auth.js';
import checkRole from '../middlewares/checkRole.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

router.use(authMiddleware);

// ==========================================
// Buyer
// ==========================================

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order (buyer)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [store_id, delivery_address, delivery_latitude, delivery_longitude, products]
 *             properties:
 *               store_id:
 *                 type: string
 *                 format: uuid
 *               delivery_address:
 *                 type: string
 *               delivery_latitude:
 *                 type: number
 *               delivery_longitude:
 *                 type: number
 *               payment_proof:
 *                 type: string
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [product_id, quantity]
 *                   properties:
 *                     product_id:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                     note:
 *                       type: string
 *     responses:
 *       201:
 *         description: Order created
 *       400:
 *         description: Invalid input, distance too far, or products from different stores
 */
router.post('/', checkRole(['buyer']), validateCreateOrder, createOrder);

router.get('/my-orders', checkRole(['buyer']), getMyOrders);

// Buyer menyatakan pesanan sudah diterima
router.put('/:id/complete', checkRole(['buyer']), completeOrder);

// Seller menandai refund manual sudah dikirim
router.put('/:id/refund', checkRole(['seller']), markRefunded);

// ==========================================
// Seller
// ==========================================

router.get('/store/:storeId', checkRole(['seller']), getStoreOrders);
router.put('/:id/accept', checkRole(['seller']), acceptOrder);
router.put('/:id/reject', checkRole(['seller']), validateRejectOrder, rejectOrder);
router.put('/:id/ship', checkRole(['seller']), validateShipOrder, shipOrder);

// Seller menandai refund manual sudah dikirim
router.put('/:id/refund', checkRole(['seller']), markRefunded);

// ==========================================
// Shared
// ==========================================

router.get('/:id', checkRole(['buyer', 'seller']), getOrder);

export default router;
