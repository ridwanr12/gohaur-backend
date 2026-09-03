import * as orderService from '../services/orderService.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Membuat pesanan baru.
 * Fungsi ini bertugas menerima data dari request, lalu meneruskannya ke Service.
 * Jika sukses, akan mengembalikan status HTTP 201 (Created).
 * 
 * @param {Object} req - Express request object (berisi req.body dan req.user)
 * @param {Object} res - Express response object
 */
async function createOrder(req, res) {
  // Mengekstrak data yang dibutuhkan dari body request
  const orderData = {
    store_id: req.body.store_id,
    shipping_cost: req.body.shipping_cost,
    products: req.body.products,
    payment_proof: req.body.payment_proof // Menambahkan bukti pembayaran jika ada
  };
  
  // Memanggil logika bisnis (Service) untuk memproses pesanan
  // req.user.id didapat dari authMiddleware yang sudah mengecek token JWT
  const order = await orderService.createOrder(orderData, req.user.id);
  
  // Mengembalikan response sukses menggunakan utility ApiResponse
  res.status(201).json(ApiResponse.success({ order }, 'Order created successfully'));
}

/**
 * Mengambil detail sebuah pesanan berdasarkan ID.
 */
async function getOrder(req, res) {
  const { id } = req.params; // Mengambil parameter :id dari URL
  const order = await orderService.getOrderById(id);
  res.json(ApiResponse.success({ order }));
}

/**
 * Mengambil semua daftar pesanan milik pengguna yang sedang login (pembeli).
 * Mendukung pagination (halaman) melalui query parameters (misal: ?page=1&limit=10).
 */
async function getMyOrders(req, res) {
  const { page, limit } = req.query; // Mengambil query string dari URL
  const orders = await orderService.getUserOrders(req.user.id, {
    page: parseInt(page) || 1, // Jika tidak ada, default halaman 1
    limit: parseInt(limit) || 10 // Jika tidak ada, default tampilkan 10 data
  });
  res.json(ApiResponse.success(orders));
}

/**
 * Mengambil daftar pesanan yang masuk ke sebuah toko tertentu.
 * Hanya pemilik toko yang bersangkutan yang bisa mengakses ini (diatur di routes).
 */
async function getStoreOrders(req, res) {
  const { page, limit } = req.query;
  const orders = await orderService.getStoreOrders(req.params.storeId, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10
  });
  res.json(ApiResponse.success(orders));
}

/**
 * Mengubah status sebuah pesanan (misal: dari "pending" ke "approved").
 */
async function updateOrderStatus(req, res) {
  const { id } = req.params; // ID pesanan dari URL
  const { status } = req.body; // Status baru dari body request JSON
  
  // Meminta Service untuk melakukan update status
  const order = await orderService.updateOrderStatus(id, status);
  
  res.json(ApiResponse.success({ order }, 'Order status updated successfully'));
}

export {
  createOrder,
  getOrder,
  getMyOrders,
  getStoreOrders,
  updateOrderStatus
};