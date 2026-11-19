import { Op } from 'sequelize';
import models from '../models/index.js';
const { Store, User, Product, Rating, Order, Feedback } = models;

async function findById(id) {
  return await Store.findByPk(id, {
    include: [
      {
        model: User,
        attributes: ['id', 'username', 'email'],
      },
    ],
  });
}

async function findByUserId(userId) {
  return await Store.findOne({
    where: { user_id: userId },
    include: [
      {
        model: User,
        attributes: ['id', 'username', 'email'],
      },
      {
        model: Product,
        attributes: ['id', 'name', 'description', 'price', 'stock', 'images'],
      },
    ],
  });
}

async function create(storeData) {
  return await Store.create(storeData);
}

async function update(id, updateData) {
  const store = await findById(id);
  if (!store) return null;
  return await store.update(updateData);
}

async function remove(id) {
  const store = await findById(id);
  if (!store) return false;
  await store.destroy();
  return true;
}

async function findAll({
  page = 1,
  limit = 10,
  search = '',
  showProducts = false,
  showRating = false,
} = {}) {
  const offset = (page - 1) * limit;
  const where = search
    ? {
        name: { [Op.iLike]: `%${search}%` },
      }
    : {};

  const include = [
    {
      model: User,
      attributes: ['id', 'username', 'email'],
    },
  ];

  if (showProducts) {
    include.push({
      model: Product,
      attributes: ['id', 'name', 'description', 'price', 'stock', 'images'],
    });
  }

  if (showRating) {
    include.push({
      model: Rating,
      attributes: ['id', 'store_id', 'average_rating', 'amount', 'created_at'],
    });
  }

  const { rows: stores, count: total } = await Store.findAndCountAll({
    where,
    include,
    limit,
    offset,
  });

  return {
    stores,
    pagination: {
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      limit: parseInt(limit),
    },
  };
}

async function getStats(storeId) {
  const completedWhere = { store_id: storeId, status: 'completed' };

  const [completedOrders, uniqueBuyers, reviewCount, averageRating] = await Promise.all([
    Order.count({ where: completedWhere }),
    Order.count({ where: completedWhere, distinct: true, col: 'user_id' }),
    Feedback.count({ where: { store_id: storeId } }),
    Feedback.aggregate('rating', 'AVG', { where: { store_id: storeId } }),
  ]);

  return {
    completed_orders: completedOrders,
    unique_buyers: uniqueBuyers,
    review_count: reviewCount,
    average_rating: averageRating ? Number(Number(averageRating).toFixed(2)) : 0,
  };
}

export { findById, findByUserId, create, update, remove, findAll, getStats };
