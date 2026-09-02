import models, { sequelize } from '../models/index.js';
const { Order, User, Store, Product, OrderProduct, Delivery } = models;

async function create(orderData) {
  return await Order.create(orderData);
}

async function createOrderProducts(orderProducts) {
  return await OrderProduct.bulkCreate(orderProducts);
}

async function findById(id) {
  return await Order.findByPk(id, {
    include: [
      {
        model: User,
        as: 'buyer',
        attributes: ['id', 'username', 'email']
      },
      {
        model: User,
        as: 'courier',
        attributes: ['id', 'username', 'email']
      },
      {
        model: Store,
        include: [{
          model: User,
          attributes: ['id', 'username', 'email']
        }]
      },
      {
        model: Product,
        through: {
          model: OrderProduct,
          attributes: ['quantity', 'price', 'note']
        }
      },
      {
        model: Delivery
      }
    ]
  });
}

async function findByUserId(userId, { page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit;
  
  const { rows: orders, count: total } = await Order.findAndCountAll({
    where: { user_id: userId },
    include: [
      {
        model: User,
        as: 'buyer',
        attributes: ['id', 'username', 'email']
      },
      {
        model: User,
        as: 'courier',
        attributes: ['id', 'username', 'email']
      },
      {
        model: Store,
        include: [{
          model: User,
          attributes: ['id', 'username', 'email']
        }]
      },
      {
        model: Product,
        through: {
          model: OrderProduct,
          attributes: ['quantity', 'price', 'note']
        }
      },
      {
        model: Delivery
      }
    ],
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });

  return {
    orders,
    pagination: {
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      limit: parseInt(limit)
    }
  };
}

async function findByStoreId(storeId, { page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit;
  
  const { rows: orders, count: total } = await Order.findAndCountAll({
    where: { store_id: storeId },
    include: [
      {
        model: User,
        as: 'buyer',
        attributes: ['id', 'username', 'email']
      },
      {
        model: User,
        as: 'courier',
        attributes: ['id', 'username', 'email']
      },
      {
        model: Store,
        include: [{
          model: User,
          attributes: ['id', 'username', 'email']
        }]
      },
      {
        model: Product,
        through: {
          model: OrderProduct,
          attributes: ['quantity', 'price', 'note']
        }
      },
      {
        model: Delivery
      }
    ],
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });

  return {
    orders,
    pagination: {
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      limit: parseInt(limit)
    }
  };
}

async function update(id, updateData) {
  const order = await Order.findByPk(id);
  if (!order) return null;
  return await order.update(updateData);
}

async function getRandomCourier() {
  const courier = await User.findOne({
    include: [{
      model: models.Role,
      where: { name: 'courier' },
      through: { attributes: [] }
    }],
    order: sequelize.literal('RANDOM()'),
    attributes: ['id', 'username', 'email']
  });
  return courier;
}

export {
  create,
  createOrderProducts,
  findById,
  findByUserId,
  findByStoreId,
  update,
  getRandomCourier
};