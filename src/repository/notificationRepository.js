import models from '../models/index.js';
const { Notification } = models;

async function create(data) {
  return await Notification.create(data);
}

async function findByUser(userId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;

  const { rows, count } = await Notification.findAndCountAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    notifications: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      limit: parseInt(limit),
    },
  };
}

async function countUnread(userId) {
  return await Notification.count({ where: { user_id: userId, is_read: false } });
}

async function markRead(id, userId) {
  const notification = await Notification.findOne({ where: { id, user_id: userId } });
  if (!notification) {
    return null;
  }
  return await notification.update({ is_read: true });
}

async function markAllRead(userId) {
  const [affected] = await Notification.update(
    { is_read: true },
    { where: { user_id: userId, is_read: false } },
  );
  return affected;
}

export { create, findByUser, countUnread, markRead, markAllRead };
