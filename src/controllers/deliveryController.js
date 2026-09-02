import * as deliveryService from '../services/deliveryService.js';
import ApiResponse from '../utils/ApiResponse.js';

async function getDelivery(req, res) {
  const { id } = req.params;
  const delivery = await deliveryService.getDeliveryById(id);
  res.json(ApiResponse.success({ delivery }));
}

async function getOrderDelivery(req, res) {
  const { orderId } = req.params;
  const delivery = await deliveryService.getDeliveryByOrderId(orderId);
  res.json(ApiResponse.success({ delivery }));
}

async function updateDeliveryStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const delivery = await deliveryService.updateDeliveryStatus(id, status);
  res.json(ApiResponse.success({ delivery }, 'Delivery status updated successfully'));
}

export {
  getDelivery,
  getOrderDelivery,
  updateDeliveryStatus
};