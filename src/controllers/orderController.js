import * as orderService from '../services/orderService.js';
import ApiResponse from '../utils/ApiResponse.js';

async function createOrder(req, res) {
  const orderData = {
    store_id: req.body.store_id,
    shipping_cost: req.body.shipping_cost,
    products: req.body.products
  };
  const order = await orderService.createOrder(orderData, req.user.id);
  res.status(201).json(ApiResponse.success({ order }, 'Order created successfully'));
}

async function getOrder(req, res) {
  const { id } = req.params;
  const order = await orderService.getOrderById(id);
  res.json(ApiResponse.success({ order }));
}

async function getMyOrders(req, res) {
  const { page, limit } = req.query;
  const orders = await orderService.getUserOrders(req.user.id, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10
  });
  res.json(ApiResponse.success(orders));
}

async function getStoreOrders(req, res) {
  const { page, limit } = req.query;
  const orders = await orderService.getStoreOrders(req.params.storeId, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10
  });
  res.json(ApiResponse.success(orders));
}

async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
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