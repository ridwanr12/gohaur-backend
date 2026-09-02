import express from 'express';
import {
  getProduct,
  getStoreProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts
} from '../controllers/productController.js';
import { validateCreateProduct, validateUpdateProduct } from '../middlewares/validators/validateProduct.js';
import authMiddleware from '../middlewares/auth.js';
import checkRole from '../middlewares/checkRole.js';

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a list of all products with optional pagination and search
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search products by name
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: string
 *         description: Filter products by store ID
 *     responses:
 *       200:
 *         description: List of products retrieved successfully
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: Retrieve a product by its ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/:id', getProduct);

/**
 * @swagger
 * /api/products/store/{storeId}:
 *   get:
 *     summary: Get store products
 *     description: Retrieve all products from a specific store
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Store products retrieved successfully
 *       404:
 *         description: Store not found
 */
router.get('/store/:storeId', getStoreProducts);

// Protected routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/products/store/{storeId}:
 *   post:
 *     summary: Create a new product
 *     description: Create a new product in a specific store
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 minimum: 0
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post('/store/:storeId',
  checkRole(['seller']),
  validateCreateProduct,
  createProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     description: Update an existing product
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 minimum: 0
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 */
router.put('/:id',
  checkRole(['seller']),
//   validateUpdateProduct,
  updateProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Delete a product (seller or admin only)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 */
router.delete('/:id',
  checkRole(['seller', 'admin']),
  deleteProduct
);

export default router;