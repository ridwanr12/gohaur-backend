import * as orderService from '../services/orderService.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Membuat pesanan baru. Ongkir dan total dihitung di service.
 */
async function createOrder(req, res) {
  const orderData = {
    store_id: req.body.store_id,
    products: req.body.products,
    payment_proof: req.body.payment_proof,
    delivery_address: req.body.delivery_address,
    delivery_latitude: req.body.delivery_latitude,
    delivery_longitude: req.body.delivery_longitude,
  };

  const order = await orderService.createOrder(orderData, req.user.id);
  res.status(201).json(ApiResponse.success({ order }, 'Order created successfully'));
}

async function getOrder(req, res) {
  const order = await orderService.getOrderById(req.params.id, req.user);
  res.json(ApiResponse.success({ order }));
}

async function getMyOrders(req, res) {
  const { page, limit } = req.query;
  const orders = await orderService.getUserOrders(req.user.id, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
  });
  res.json(ApiResponse.success(orders));
}

async function getStoreOrders(req, res) {
  const { page, limit } = req.query;
  const orders = await orderService.getStoreOrders(req.params.storeId, req.user.id, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
  });
  res.json(ApiResponse.success(orders));
}

async function acceptOrder(req, res) {
  const order = await orderService.acceptOrder(req.params.id, req.user.id);
  res.json(ApiResponse.success({ order }, 'Order accepted'));
}

async function rejectOrder(req, res) {
  const order = await orderService.rejectOrder(
    req.params.id,
    req.user.id,
    req.body.rejection_reason,
  );
  res.json(ApiResponse.success({ order }, 'Order rejected'));
}

async function shipOrder(req, res) {
  const order = await orderService.shipOrder(req.params.id, req.user.id, {
    courier_name: req.body.courier_name,
    courier_plate: req.body.courier_plate,
  });
  res.json(ApiResponse.success({ order }, 'Order shipped'));
}

async function completeOrder(req, res) {
  const order = await orderService.completeOrder(req.params.id, req.user.id);
  res.json(ApiResponse.success({ order }, 'Order completed'));
}

async function markRefunded(req, res) {
  const order = await orderService.markRefunded(req.params.id, req.user.id, req.body.refund_note);
  res.json(ApiResponse.success({ order }, 'Refund marked as sent'));
}

export {
  createOrder,
  getOrder,
  getMyOrders,
  getStoreOrders,
  acceptOrder,
  rejectOrder,
  shipOrder,
  completeOrder,
  markRefunded,
};
