import { Router } from 'express';
import { validateUpdateProfile } from '../middlewares/validators/validateAuth.js';
import authMiddleware from '../middlewares/auth.js';
import { 
  getProfile,
  updateProfile,
  deleteAccount
} from '../controllers/userController.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile management
 */

/**
 * @swagger
 * /api/users/profile/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user profile
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
 *         description: User profile retrieved successfully
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: User not found
 */
router.get('/profile/:id', authMiddleware, getProfile);

/**
 * @swagger
 * /api/users/profile/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user profile
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *               phone:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       403:
 *         description: Unauthorized access
 */
router.put('/profile/:id', authMiddleware, validateUpdateProfile, updateProfile);

/**
 * @swagger
 * /api/users/profile/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user account
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
 *         description: Account deleted successfully
 *       403:
 *         description: Unauthorized access
 */
router.delete('/profile/:id', authMiddleware, deleteAccount);

export default router;