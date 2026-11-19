import * as notificationRepository from '../repository/notificationRepository.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

/**
 * Membuat notifikasi in-app. Kegagalan notifikasi TIDAK boleh menggagalkan
 * aksi utama (misal order tetap diterima walau notifikasi gagal dibuat).
 */
async function notify({ userId, orderId = null, type, title, message }) {
  try {
    return await notificationRepository.create({
      user_id: userId,
      order_id: orderId,
      type,
      title,
      message,
      is_read: false,
    });
  } catch (error) {
    logger.error('Failed to create notification', {
      error: error.message,
      userId,
      orderId,
      type,
    });
    return null;
  }
}

async function listNotifications(userId, options) {
  const result = await notificationRepository.findByUser(userId, options);
  const unread = await notificationRepository.countUnread(userId);
  return { ...result, unread };
}

async function getUnreadCount(userId) {
  const unread = await notificationRepository.countUnread(userId);
  return { unread };
}

async function markRead(id, userId) {
  const notification = await notificationRepository.markRead(id, userId);
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }
  return notification;
}

async function markAllRead(userId) {
  const affected = await notificationRepository.markAllRead(userId);
  return { affected };
}

export { notify, listNotifications, getUnreadCount, markRead, markAllRead };
