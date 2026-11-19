import * as notificationService from '../services/notificationService.js';
import ApiResponse from '../utils/ApiResponse.js';

async function getNotifications(req, res) {
  const { page, limit } = req.query;
  const result = await notificationService.listNotifications(req.user.id, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
  });
  res.json(ApiResponse.success(result));
}

async function getUnreadCount(req, res) {
  const result = await notificationService.getUnreadCount(req.user.id);
  res.json(ApiResponse.success(result));
}

async function markRead(req, res) {
  const notification = await notificationService.markRead(req.params.id, req.user.id);
  res.json(ApiResponse.success({ notification }, 'Notification marked as read'));
}

async function markAllRead(req, res) {
  const result = await notificationService.markAllRead(req.user.id);
  res.json(ApiResponse.success(result, 'All notifications marked as read'));
}

export { getNotifications, getUnreadCount, markRead, markAllRead };
