import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
} from '../controllers/notificationController.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notifikasi in-app
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Daftar notifikasi milik user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 */
router.get('/', getNotifications);

router.get('/unread-count', getUnreadCount);

// Harus didaftarkan sebelum '/:id/read'
router.patch('/read-all', markAllRead);

router.patch('/:id/read', markRead);

export default router;
