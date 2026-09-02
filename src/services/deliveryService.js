import * as deliveryRepository from '../repository/deliveryRepository.js';
import * as orderRepository from '../repository/orderRepository.js';
import AppError from '../utils/AppError.js';

async function getDeliveryById(id) {
  const delivery = await deliveryRepository.findById(id);
  if (!delivery) {
    throw new AppError('Delivery not found', 404);
  }
  return delivery;
}

async function getDeliveryByOrderId(orderId) {
  const delivery = await deliveryRepository.findByOrderId(orderId);
  if (!delivery) {
    throw new AppError('Delivery not found', 404);
  }
  return delivery;
}

async function updateDeliveryStatus(id, status) {
  const delivery = await deliveryRepository.findById(id);
  if (!delivery) {
    throw new AppError('Delivery not found', 404);
  }

  // Update order status when delivery status changes
  if (status === 'out_for_delivery') {
    await orderRepository.update(delivery.order_id, { status: 'out_for_delivery' });
  } else if (status === 'completed') {
    await orderRepository.update(delivery.order_id, { status: 'completed' });
  }

  return await deliveryRepository.update(id, { status });
}

export {
  getDeliveryById,
  getDeliveryByOrderId,
  updateDeliveryStatus
};