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

// Membuat router Express baru untuk menangani rute terkait 'Orders'
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

// Semua rute di bawah ini wajib melewati pengecekan login (authMiddleware)
// Jika token JWT tidak valid/hilang, request akan langsung ditolak (401 Unauthorized)
router.use(authMiddleware);

// ==========================================
// Rute untuk Pembeli (Buyer)
// ==========================================

// Membuat pesanan baru. Hanya user dengan role 'buyer' yang bisa mengakses ini.
// Data yang dikirim (req.body) akan divalidasi dulu oleh 'validateCreateOrder' sebelum masuk ke 'createOrder' controller.
router.post('/', checkRole(['buyer']), validateCreateOrder, createOrder);

// Melihat daftar pesanan milik buyer yang sedang login.
router.get('/my-orders', checkRole(['buyer']), getMyOrders);

// ==========================================
// Rute untuk Penjual (Seller / Store Owner)
// ==========================================

// Melihat semua pesanan yang masuk ke toko tertentu (berdasarkan storeId).
// Hanya seller yang bisa mengakses ini.
router.get('/store/:storeId', checkRole(['seller']), getStoreOrders);

// ==========================================
// Rute Bersama (Shared)
// ==========================================

// Melihat detail satu pesanan spesifik (berdasarkan ID pesanan).
// Bisa diakses oleh buyer, seller, dan kurir (karena mereka semua butuh melihat detail pesanan).
router.get('/:id', checkRole(['buyer', 'seller', 'courier']), getOrder);

// ==========================================
// Rute Pembaruan Status
// ==========================================

// Mengubah status pesanan (misal: pending -> approved).
// Saat ini hanya seller yang diizinkan mengubah status. Data status baru akan divalidasi oleh 'validateUpdateOrderStatus'.
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