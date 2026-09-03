import models, { sequelize } from '../models/index.js';
const { Order, User, Store, Product, OrderProduct, Delivery } = models;

/**
 * Menyimpan data pesanan utama ke tabel Orders.
 * Fungsi ini bisa menerima objek transaksi (transaction) agar prosesnya atomik.
 */
async function create(orderData, transaction) {
  return await Order.create(orderData, { transaction });
}

/**
 * Menyimpan data barang-barang (produk) yang dipesan ke tabel OrderProducts.
 * Menggunakan bulkCreate untuk menyimpan array of objects sekaligus dalam satu query.
 */
async function createOrderProducts(orderProducts, transaction) {
  return await OrderProduct.bulkCreate(orderProducts, { transaction });
}

/**
 * Mencari pesanan berdasarkan ID.
 * Melakukan "JOIN" (include) ke tabel User (sebagai pembeli dan kurir), Store, Product, dan Delivery.
 * Tujuannya agar data yang direturn sudah lengkap, tidak cuma ID-ID saja.
 */
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

/**
 * Mencari semua pesanan milik seorang pembeli (user_id).
 * Digunakan untuk halaman "My Orders" di aplikasi.
 * Dilengkapi dengan fitur pagination (findAndCountAll).
 */
async function findByUserId(userId, { page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit; // Menghitung data yang dilewati (offset)
  
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

/**
 * Mencari semua pesanan yang masuk ke sebuah toko (store_id).
 * Digunakan untuk halaman "Pesanan Toko Saya" bagi seller.
 */
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

/**
 * Mengubah data pesanan berdasarkan ID.
 * Biasanya dipakai untuk mengupdate status pesanan.
 */
async function update(id, updateData, transaction) {
  // Cari dulu pesanannya ada atau tidak
  const order = await Order.findByPk(id, { transaction });
  if (!order) return null;
  // Jika ada, lakukan update
  return await order.update(updateData, { transaction });
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