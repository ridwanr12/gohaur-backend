import express from 'express';
import {
  createOrder,
  getOrder,
  getMyOrders,
  getStoreOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { validateCreateOrder, validateUpdateOrderStatus } from '../middlewares/validators/validateOrder.js';
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

// Buyer routes
router.post('/', checkRole(['buyer']), validateCreateOrder, createOrder);
router.get('/my-orders', checkRole(['buyer']), getMyOrders);

// Store owner routes
router.get('/store/:storeId', checkRole(['seller']), getStoreOrders);

// Shared routes (buyer, seller, courier can view order details)
router.get('/:id', checkRole(['buyer', 'seller', 'courier']), getOrder);

// Seller and admin can update order status
router.put('/:id/status', 
  checkRole(['seller']), 
  validateUpdateOrderStatus, 
  updateOrderStatus
);

export default router;


/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         store_id:
 *           type: string
 *           format: uuid
 *         courier_id:
 *           type: string
 *           format: uuid
 *         shipping_cost:
 *           type: number
 *         total_price:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, approved, out_for_delivery, completed, canceled]
 *         products:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *               price:
 *                 type: number
 *               note:
 *                 type: string
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_id
 *               - shipping_cost
 *               - products
 *               - payment_proof
 *             properties:
 *               store_id:
 *                 type: string
 *                 format: uuid
 *               shipping_cost:
 *                 type: number
 *               payment_proof:
 *                 type: string
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                     - quantity
 *                   properties:
 *                     product_id:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                     note:
 *                       type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid input or products from different stores
 *       404:
 *         description: Products not found
 * /api/orders/my-orders:
 *   get:
 *     summary: Get my orders
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of orders
 * 
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
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
 *         description: Order details
 *       404:
 *         description: Order not found
 * 
 * /api/orders/store/{storeId}:
 *   get:
 *     summary: Get store orders
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of store orders
 * 
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
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
 *                 enum: [pending, approved, out_for_delivery, completed, canceled]
 *     responses:
 *       200:
 *         description: Order status updated
 *       404:
 *         description: Order not found
 */