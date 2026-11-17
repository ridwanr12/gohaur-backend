import * as orderRepository from '../repository/orderRepository.js';
import * as productRepository from '../repository/productRepository.js';
import * as storeRepository from '../repository/storeRepository.js';
import AppError from '../utils/AppError.js';
import { sequelize } from '../models/index.js';

/**
 * Fungsi untuk membuat pesanan (Order) baru.
 * Di sinilah pusat validasi bisnis terjadi (cek stok, hitung total harga, dll).
 *
 * @param {Object} orderData - Data pesanan dari request body.
 * @param {string} userId - ID dari user yang sedang login (pembeli).
 */
async function createOrder(orderData, userId) {
  // 1. Verifikasi apakah semua produk yang dipesan benar-benar ada di database
  // Kita menggunakan Promise.all untuk mengambil data produk secara bersamaan agar lebih cepat
  const products = await Promise.all(
    orderData.products.map(async item => {
      const product = await productRepository.findById(item.product_id);
      if (!product) {
        throw new AppError(`Product with id ${item.product_id} not found`, 404);
      }

      // 2. Mengecek ketersediaan stok
      if (product.stock < item.quantity) {
        throw new AppError(`Product "${product.name}" does not have enough stock`, 404);
      }
      return product;
    }),
  );

  // 3. Memastikan semua produk yang dipesan berasal dari toko yang sama
  // (Sistem ini belum mendukung keranjang belanja dari berbagai toko secara bersamaan dalam 1 order)
  if (!products.every(p => p.store_id === orderData.store_id)) {
    throw new AppError('All products must be from the same store', 400);
  }

  // 4. Menghitung total harga seluruh pesanan (harga produk * kuantitas)
  const total_price = orderData.products.reduce((sum, item) => {
    const product = products.find(p => p.id === item.product_id);
    return sum + product.price * item.quantity;
  }, 0);

  // 5. Membuat "Transaksi Database" (Database Transaction).
  // Transaksi memastikan bahwa jika salah satu proses insert gagal, seluruh proses sebelumnya akan dibatalkan (rollback).
  // Ini mencegah terjadinya data yang setengah-setengah tersimpan di database.
  const t = await sequelize.transaction();

  try {
    // 6a. Simpan data utama ke tabel Orders
    // Kita mengirimkan objek 't' agar query ini berjalan di dalam transaksi
    const order = await orderRepository.create(
      {
        user_id: userId,
        store_id: orderData.store_id,
        shipping_cost: orderData.shipping_cost,
        total_price,
        payment_proof: orderData.payment_proof,
        status: 'pending', // Status awal pesanan selalu 'pending'
      },
      t,
    );

    // 6b. Simpan rincian produk yang dipesan ke tabel OrderProducts
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

    // 7. Jika semua berhasil, simpan permanen ke database (commit)
    await t.commit();

    // Kembalikan data pesanan yang baru saja dibuat
    return await orderRepository.findById(order.id);
  } catch (error) {
    // Jika ada error di tengah jalan, batalkan semua perubahan di database (rollback)
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
  const isCourier = order.courier_id === requester.id;
  const isStoreOwner = Boolean(order.Store && order.Store.user_id === requester.id);

  if (!isAdmin && !isBuyer && !isCourier && !isStoreOwner) {
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

/**
 * Alur status pesanan yang sah. Tujuannya mencegah lompatan status
 * (misal pending langsung completed) dan mencegah perubahan setelah selesai.
 */
const ALLOWED_TRANSITIONS = {
  pending: ['approved', 'canceled'],
  approved: ['out_for_delivery', 'canceled'],
  out_for_delivery: ['completed', 'canceled'],
  completed: [],
  canceled: [],
};

/**
 * Fungsi untuk memperbarui status pesanan.
 * Ini melibatkan logika kompleks seperti pemotongan stok dan penugasan kurir.
 */
async function updateOrderStatus(id, status, requester) {
  // 1. Ambil data pesanan saat ini dari database
  const orderBefore = await orderRepository.findById(id);
  if (!orderBefore) {
    throw new AppError('Order not found', 404);
  }

  // 2. Pastikan hanya pemilik toko yang boleh mengubah status pesanan
  if (requester && orderBefore.Store && orderBefore.Store.user_id !== requester.id) {
    throw new AppError('You are not allowed to update this order', 403);
  }

  const currentStatus = orderBefore.status;

  // 3. Idempotent: status sama tidak perlu diproses ulang
  if (currentStatus === status) {
    return orderBefore;
  }

  // 4. Validasi transisi status
  const allowedNextStatuses = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowedNextStatuses.includes(status)) {
    throw new AppError(`Cannot change order status from "${currentStatus}" to "${status}"`, 400);
  }

  // Membuat transaksi karena kita akan mengupdate 2 tabel (Orders dan Products)
  const t = await sequelize.transaction();

  try {
    let order;

    // Skenario 1: Pesanan disetujui oleh toko ('approved')
    if (status === 'approved') {
      // A. Cari kurir acak secara otomatis
      const courier = await orderRepository.getRandomCourier();
      if (!courier) {
        throw new AppError('No couriers available', 400);
      }

      const orderProducts = orderBefore.Products;

      // B. Validasi Ulang Stok: Pastikan stok masih ada sebelum memotongnya.
      orderProducts.forEach(prod => {
        if (prod.stock < prod.order_products.quantity) {
          throw new AppError(`Product "${prod.name}" does not have enough stock`, 404);
        }
      });

      // C. Potong Stok: Menggunakan fitur 'decrement' agar aman dari race condition
      await Promise.all(
        orderProducts.map(async prod => {
          await productRepository.decrementStock(prod.id, prod.order_products.quantity, t);
        }),
      );

      // D. Update status pesanan dan hubungkan kurir ke pesanan tersebut
      order = await orderRepository.update(id, { courier_id: courier.id, status }, t);
    }
    // Skenario 2: Pesanan dibatalkan ('canceled')
    else if (status === 'canceled') {
      // Jika pesanan sebelumnya sudah di-'approved' (sudah potong stok dan assign kurir),
      // maka kita harus MENGEMBALIKAN stok barang ke database.
      if (orderBefore.courier_id) {
        const orderProducts = orderBefore.Products;

        // Tambah kembali stok (increment)
        await Promise.all(
          orderProducts.map(async prod => {
            await productRepository.incrementStock(prod.id, prod.order_products.quantity, t);
          }),
        );
      }
      order = await orderRepository.update(id, { status }, t);
    }
    // Skenario 3: Perubahan status biasa (misal: 'out_for_delivery', 'completed')
    else {
      order = await orderRepository.update(id, { status }, t);
    }

    // Terapkan semua perubahan ke database
    await t.commit();
    return order;
  } catch (error) {
    // Batalkan perubahan jika ada error (stok tidak jadi terpotong, pesanan tidak jadi update)
    await t.rollback();
    throw error;
  }
}

export { createOrder, getOrderById, getUserOrders, getStoreOrders, updateOrderStatus };
