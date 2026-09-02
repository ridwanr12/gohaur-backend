import models from '../models/index.js';
const { Feedback, User, Store, Order } = models;

async function create(feedbackData) {
  return await Feedback.create(feedbackData);
}

async function findById(id) {
  return await Feedback.findByPk(id, {
    include: [
      {
        model: User,
        attributes: ['id', 'username', 'email']
      },
      {
        model: Store,
        attributes: ['id', 'name', 'description']
      },
      {
        model: Order,
        attributes: ['id', 'status', 'total_price']
      }
    ]
  });
}

async function findByOrderId(orderId) {
  return await Feedback.findOne({
    where: { order_id: orderId },
    include: [
      {
        model: User,
        attributes: ['id', 'username', 'email']
      },
      {
        model: Store,
        attributes: ['id', 'name', 'description']
      }
    ]
  });
}

async function findByStoreId(storeId, { page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit;
  
  const { rows: feedbacks, count: total } = await Feedback.findAndCountAll({
    where: { store_id: storeId },
    include: [
      {
        model: User,
        attributes: ['id', 'username', 'email']
      },
      {
        model: Order,
        attributes: ['id', 'status', 'total_price']
      }
    ],
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });

  return {
    feedbacks,
    pagination: {
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      limit: parseInt(limit)
    }
  };
}

async function update(id, updateData) {
  const feedback = await Feedback.findByPk(id);
  if (!feedback) return null;
  return await feedback.update(updateData);
}

async function remove(id) {
  const feedback = await Feedback.findByPk(id);
  if (!feedback) return false;
  await feedback.destroy();
  return true;
}

export {
  create,
  findById,
  findByOrderId,
  findByStoreId,
  update,
  remove
};