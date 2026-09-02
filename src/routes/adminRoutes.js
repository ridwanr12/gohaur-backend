import { Router } from 'express';
import authMiddleware from '../middlewares/auth.js';
import checkRole from '../middlewares/checkRole.js';
import { validateUpdateRole } from '../middlewares/validators/validateAdmin.js';
import {
  getAllUsers,
  getUser,
  updateUserRole
} from '../controllers/adminController.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Application management endpoints for admin
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users with pagination and search
 *     description: Retrieve a list of users. Requires admin role.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by username or email
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, username, email]
 *           default: created_at
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *       403:
 *         description: Not authorized as admin
 */
router.use(authMiddleware, checkRole('admin'));
router.get('/users', getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get user by ID
 *     description: Retrieve a specific user by their ID. Requires admin role.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       403:
 *         description: Not authorized as admin
 *       404:
 *         description: User not found
 */
router.get('/users/:id', getUser);

/**
 * @swagger
 * /api/admin/users/{id}/roles:
 *   put:
 *     tags: [Admin]
 *     summary: Update user roles
 *     description: Update roles for a specific user. Requires admin role.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roles
 *             properties:
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [buyer, seller, courier, admin]
 *                 example: ["buyer", "seller"]
 *     responses:
 *       200:
 *         description: User roles updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid role(s) provided
 *       403:
 *         description: Not authorized as admin
 *       404:
 *         description: User not found
 */
router.put('/users/:id/roles', validateUpdateRole, updateUserRole);

export default router;