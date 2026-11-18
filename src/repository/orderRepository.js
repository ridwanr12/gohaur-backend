import models from '../models/index.js';
const { Order, User, Store, Product, OrderProduct } = models;

const ORDER_INCLUDES = [
  {
    model: User,
    as: 'buyer',
    attributes: ['id', 'username', 'email'],
  },
  {
    model: Store,
    include: [
      {
        model: User,
        attributes: ['id', 'username', 'email'],
      },
    ],
  },
  {
    model: Product,
    through: {
      model: OrderProduct,
      attributes: ['quantity', 'price', 'note'],
    },
  },
];

/**
 * Menyimpan data pesanan utama ke tabel Orders.
 * Menerima objek transaksi agar prosesnya atomik.
 */
async function create(orderData, transaction) {
  return await Order.create(orderData, { transaction });
}

/**
 * Menyimpan rincian produk pesanan sekaligus (bulk insert).
 */
async function createOrderProducts(orderProducts, transaction) {
  return await OrderProduct.bulkCreate(orderProducts, { transaction });
}

/**
 * Mencari pesanan berdasarkan ID beserta pembeli, toko, dan produknya.
 */
async function findById(id) {
  return await Order.findByPk(id, { include: ORDER_INCLUDES });
}

async function findByUserId(userId, { page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit;

  const { rows: orders, count: total } = await Order.findAndCountAll({
    where: { user_id: userId },
    include: ORDER_INCLUDES,
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return {
    orders,
    pagination: {
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      limit: parseInt(limit),
    },
  };
}

async function findByStoreId(storeId, { page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit;

  const { rows: orders, count: total } = await Order.findAndCountAll({
    where: { store_id: storeId },
    include: ORDER_INCLUDES,
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return {
    orders,
    pagination: {
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      limit: parseInt(limit),
    },
  };
}

async function update(id, updateData, transaction) {
  const order = await Order.findByPk(id, { transaction });
  if (!order) return null;
  return await order.update(updateData, { transaction });
}

export { create, createOrderProducts, findById, findByUserId, findByStoreId, update };
