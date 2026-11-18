import * as orderRepository from '../repository/orderRepository.js';
import * as productRepository from '../repository/productRepository.js';
import * as storeRepository from '../repository/storeRepository.js';
import AppError from '../utils/AppError.js';
import { sequelize } from '../models/index.js';
import {
  haversineDistanceKm,
  MAX_DELIVERY_DISTANCE_KM,
  PACKAGING_FEE,
  getShippingCost,
} from '../utils/geo.js';

/**
 * Membuat pesanan baru.
 *
 * Ongkir dan total dihitung di sini (bukan dari client), termasuk validasi
 * jarak Haversine antara titik toko dan titik kirim buyer.
 *
 * @param {Object} orderData
 * @param {string} userId
 */
async function createOrder(orderData, userId) {
  const products = await Promise.all(
    orderData.products.map(async item => {
      const product = await productRepository.findById(item.product_id);
      if (!product) {
        throw new AppError(`Product with id ${item.product_id} not found`, 404);
      }
      if (product.stock < item.quantity) {
        throw new AppError(`Product "${product.name}" does not have enough stock`, 400);
      }
      return product;
    }),
  );

  if (!products.every(p => p.store_id === orderData.store_id)) {
    throw new AppError('All products must be from the same store', 400);
  }

  const store = await storeRepository.findById(orderData.store_id);
  if (!store) {
    throw new AppError('Store not found', 404);
  }
  if (store.latitude == null || store.longitude == null) {
    throw new AppError('Store location is not set yet', 400);
  }

  const deliveryLat = Number(orderData.delivery_latitude);
  const deliveryLng = Number(orderData.delivery_longitude);

  if (!Number.isFinite(deliveryLat) || !Number.isFinite(deliveryLng)) {
    throw new AppError('Delivery location is required', 400);
  }
  if (Math.abs(deliveryLat) > 90 || Math.abs(deliveryLng) > 180) {
    throw new AppError('Delivery location is invalid', 400);
  }
  if (!orderData.delivery_address || !orderData.delivery_address.trim()) {
    throw new AppError('Delivery address is required', 400);
  }

  const distanceKm = haversineDistanceKm(store.latitude, store.longitude, deliveryLat, deliveryLng);

  if (distanceKm >= MAX_DELIVERY_DISTANCE_KM) {
    throw new AppError(
      `Delivery distance is too far (${distanceKm.toFixed(
        2,
      )} km, max ${MAX_DELIVERY_DISTANCE_KM} km)`,
      400,
    );
  }

  const shippingCost = getShippingCost(distanceKm);
  if (shippingCost == null) {
    throw new AppError('Delivery distance is out of range', 400);
  }

  const productTotal = orderData.products.reduce((sum, item) => {
    const product = products.find(p => p.id === item.product_id);
    return sum + parseFloat(product.price) * item.quantity;
  }, 0);

  const totalPrice = productTotal + shippingCost + PACKAGING_FEE;

  const t = await sequelize.transaction();

  try {
    const order = await orderRepository.create(
      {
        user_id: userId,
        store_id: orderData.store_id,
        shipping_cost: shippingCost,
        packaging_fee: PACKAGING_FEE,
        total_price: totalPrice,
        payment_proof: orderData.payment_proof,
        delivery_address: orderData.delivery_address.trim(),
        delivery_latitude: deliveryLat,
        delivery_longitude: deliveryLng,
        distance_km: Number(distanceKm.toFixed(2)),
        status: 'pending',
      },
      t,
    );

    await orderRepository.createOrderProducts(
      orderData.products.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: parseFloat(products.find(p => p.id === item.product_id).price) * item.quantity,
        note: item.note,
      })),
      t,
    );

    await t.commit();
    return await orderRepository.findById(order.id);
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

async function getOrderById(id, requester) {
  const order = await orderRepository.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (requester) {
    assertCanViewOrder(order, requester);
  }

  return order;
}

/**
 * Hanya pihak yang terlibat dalam pesanan yang boleh melihat detailnya.
 * Tanpa pengecekan ini, user mana pun yang punya ID pesanan bisa membaca
 * pesanan orang lain (IDOR).
 */
function assertCanViewOrder(order, requester) {
  const roles = requester.roles || [];
  const isAdmin = roles.includes('admin');
  const isBuyer = order.user_id === requester.id;
  const isStoreOwner = Boolean(order.Store && order.Store.user_id === requester.id);

  if (!isAdmin && !isBuyer && !isStoreOwner) {
    throw new AppError('You are not allowed to view this order', 403);
  }
}

async function getUserOrders(userId, options) {
  return await orderRepository.findByUserId(userId, options);
}

/**
 * Seller hanya boleh melihat pesanan dari toko miliknya sendiri.
 */
async function getStoreOrders(storeId, userId, options) {
  const store = await storeRepository.findById(storeId);
  if (!store) {
    throw new AppError('Store not found', 404);
  }
  if (store.user_id !== userId) {
    throw new AppError('You are not allowed to view this store orders', 403);
  }
  return await orderRepository.findByStoreId(storeId, options);
}

function assertStoreOwner(order, userId) {
  if (!order.Store || order.Store.user_id !== userId) {
    throw new AppError('You are not allowed to update this order', 403);
  }
}

/**
 * Seller menerima pesanan. Stok dipotong di sini, bukan saat buyer membuat order.
 */
async function acceptOrder(id, userId) {
  const order = await orderRepository.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  assertStoreOwner(order, userId);

  if (order.status !== 'pending') {
    throw new AppError(`Only pending orders can be accepted (current: ${order.status})`, 400);
  }

  const orderProducts = order.Products || [];
  orderProducts.forEach(product => {
    const quantity = product.order_products?.quantity ?? 0;
    if (product.stock < quantity) {
      throw new AppError(`Product "${product.name}" does not have enough stock`, 400);
    }
  });

  const t = await sequelize.transaction();
  try {
    await Promise.all(
      orderProducts.map(product =>
        productRepository.decrementStock(product.id, product.order_products?.quantity ?? 0, t),
      ),
    );

    await orderRepository.update(id, { status: 'accepted', accepted_at: new Date() }, t);
    await t.commit();
    return await orderRepository.findById(id);
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

/**
 * Seller menolak pesanan. Alasan opsional.
 */
async function rejectOrder(id, userId, reason) {
  const order = await orderRepository.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  assertStoreOwner(order, userId);

  if (order.status !== 'pending') {
    throw new AppError(`Only pending orders can be rejected (current: ${order.status})`, 400);
  }

  await orderRepository.update(id, {
    status: 'rejected',
    rejected_at: new Date(),
    rejection_reason: reason ? String(reason).trim() : null,
  });

  return await orderRepository.findById(id);
}

/**
 * Seller mengirim pesanan. Nama pengirim dan plat nomor wajib diisi
 * supaya buyer tahu siapa yang mengantar.
 */
async function shipOrder(id, userId, { courier_name, courier_plate }) {
  const order = await orderRepository.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  assertStoreOwner(order, userId);

  if (order.status !== 'accepted') {
    throw new AppError(`Only accepted orders can be shipped (current: ${order.status})`, 400);
  }

  const courierName = courier_name ? String(courier_name).trim() : '';
  const courierPlate = courier_plate ? String(courier_plate).trim() : '';

  if (!courierName) {
    throw new AppError('Courier name is required', 400);
  }
  if (!courierPlate) {
    throw new AppError('Courier plate number is required', 400);
  }

  await orderRepository.update(id, {
    status: 'shipped',
    shipped_at: new Date(),
    courier_name: courierName,
    courier_plate: courierPlate,
  });

  return await orderRepository.findById(id);
}

/**
 * Buyer menyatakan pesanan sudah diterima.
 */
async function completeOrder(id, userId) {
  const order = await orderRepository.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  if (order.user_id !== userId) {
    throw new AppError('You are not allowed to complete this order', 403);
  }
  if (order.status !== 'shipped') {
    throw new AppError('Only shipped orders can be completed', 400);
  }

  await orderRepository.update(id, {
    status: 'completed',
    completed_at: new Date(),
  });

  return await orderRepository.findById(id);
}

export {
  createOrder,
  getOrderById,
  getUserOrders,
  getStoreOrders,
  acceptOrder,
  rejectOrder,
  shipOrder,
  completeOrder,
};
