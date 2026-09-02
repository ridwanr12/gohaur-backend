import express from 'express';
import {
  createFeedback,
  getFeedback,
  getStoreFeedbacks,
  getOrderFeedback,
  updateFeedback,
  deleteFeedback,
  getStoreRating
} from '../controllers/feedbackController.js';
import { validateCreateFeedback, validateUpdateFeedback } from '../middlewares/validators/validateFeedback.js';
import authMiddleware from '../middlewares/auth.js';
import checkRole from '../middlewares/checkRole.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Feedback
 *   description: Feedback and rating management endpoints
 */

// Public routes
router.get('/store/:storeId', getStoreFeedbacks);
router.get('/store/:storeId/rating', getStoreRating);
router.get('/order/:orderId', getOrderFeedback);
router.get('/:id', getFeedback);

// Protected routes
router.use(authMiddleware);

// Buyer routes (only buyers can create/update/delete feedback)
router.post('/', 
  checkRole(['buyer']), 
  validateCreateFeedback, 
  createFeedback
);

router.put('/:id', 
  checkRole(['buyer']), 
  validateUpdateFeedback, 
  updateFeedback
);

router.delete('/:id', 
  checkRole(['buyer']), 
  deleteFeedback
);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Feedback:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         store_id:
 *           type: string
 *           format: uuid
 *         order_id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *     Rating:
 *       type: object
 *       properties:
 *         store_id:
 *           type: string
 *           format: uuid
 *         average_rating:
 *           type: number
 *           format: float
 *         amount:
 *           type: integer
 */

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Create a new feedback
 *     tags: [Feedback]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *               - rating
 *             properties:
 *               order_id:
 *                 type: string
 *                 format: uuid
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Feedback created successfully
 *       400:
 *         description: Invalid input or feedback already exists
 *       404:
 *         description: Order not found
 * 
 * /api/feedback/{id}:
 *   get:
 *     summary: Get feedback by ID
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Feedback details
 *       404:
 *         description: Feedback not found
 *   put:
 *     summary: Update feedback
 *     tags: [Feedback]
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
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback updated successfully
 *       403:
 *         description: Not authorized to update this feedback
 *       404:
 *         description: Feedback not found
 *   delete:
 *     summary: Delete feedback
 *     tags: [Feedback]
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
 *         description: Feedback deleted successfully
 *       403:
 *         description: Not authorized to delete this feedback
 *       404:
 *         description: Feedback not found
 * 
 * /api/feedback/store/{storeId}:
 *   get:
 *     summary: Get store feedbacks
 *     tags: [Feedback]
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
 *         description: List of store feedbacks
 * 
 * /api/feedback/store/{storeId}/rating:
 *   get:
 *     summary: Get store rating
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Store rating details
 * 
 * /api/feedback/order/{orderId}:
 *   get:
 *     summary: Get order feedback
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order feedback details
 *       404:
 *         description: Feedback not found
 */