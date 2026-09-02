import express from 'express';
import { 
  getStore,
  getMyStore,
  createStore,
  updateStore,
  deleteStore,
  getAllStores
} from '../controllers/storeController.js';
import { validateCreateStore, validateUpdateStore } from '../middlewares/validators/validateStore.js';
import authMiddleware from '../middlewares/auth.js';
import checkRole from '../middlewares/checkRole.js';

const router = express.Router();

/**
 * @swagger
 * /api/stores:
 *   get:
 *     summary: Get all stores
 *     description: Retrieve a list of all stores with optional pagination and search
 *     tags: [Stores]
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
 *         description: Search stores by name
 *       - in: query
 *         name: showProducts
 *         schema:
 *           type: boolean
 *         description: Include store products in response
 *       - in: query
 *         name: showRating
 *         schema:
 *           type: boolean
 *         description: Include store rating in response
 *     responses:
 *       200:
 *         description: List of stores retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', getAllStores);

/**
 * @swagger
 * /api/stores/{id}:
 *   get:
 *     summary: Get store by ID
 *     description: Retrieve a store by its ID
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Store ID
 *     responses:
 *       200:
 *         description: Store retrieved successfully
 *       404:
 *         description: Store not found
 */
router.get('/:id', getStore);

// Protected routes (requires authentication)
router.use(authMiddleware);

/**
 * @swagger
 * /api/stores/my/store:
 *   get:
 *     summary: Get seller's own store
 *     description: Retrieve the authenticated seller's store
 *     tags: [Stores]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Store retrieved successfully
 *       404:
 *         description: Store not found
 */
router.get('/my/store', checkRole(['seller']), getMyStore);

/**
 * @swagger
 * /api/stores:
 *   post:
 *     summary: Create a new store
 *     description: Create a new store for authenticated seller
 *     tags: [Stores]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Store created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', 
//   checkRole(['seller', 'admin']), 
  validateCreateStore, 
  createStore
);

/**
 * @swagger
 * /api/stores/{id}:
 *   put:
 *     summary: Update a store
 *     description: Update an existing store
 *     tags: [Stores]
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
 *     responses:
 *       200:
 *         description: Store updated successfully
 *       404:
 *         description: Store not found
 */
router.put('/:id', 
  checkRole(['seller']), 
  validateUpdateStore, 
  updateStore
);

/**
 * @swagger
 * /api/stores/{id}:
 *   delete:
 *     summary: Delete a store
 *     description: Delete a store (seller or admin only)
 *     tags: [Stores]
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
 *         description: Store deleted successfully
 *       404:
 *         description: Store not found
 */
router.delete('/:id', 
  checkRole(['seller', 'admin']), 
  deleteStore
);

export default router;