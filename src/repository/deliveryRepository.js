import models from '../models/index.js';
const { Delivery, Order, User } = models;

async function create(deliveryData) {
  return await Delivery.create(deliveryData);
}

async function findById(id) {
  return await Delivery.findByPk(id, {
    include: [
      {
        model: Order,
        include: [{
          model: User,
          as: 'buyer',
          attributes: ['id', 'username', 'email']
        }]
      },
      {
        model: User,
        attributes: ['id', 'username', 'email']
      }
    ]
  });
}

async function findByOrderId(orderId) {
  return await Delivery.findOne({
    where: { order_id: orderId },
    include: [
      {
        model: Order,
        include: [{
          model: User,
          as: 'buyer',
          attributes: ['id', 'username', 'email']
        }]
      },
      {
        model: User,
        attributes: ['id', 'username', 'email']
      }
    ]
  });
}

async function update(id, updateData) {
  const delivery = await Delivery.findByPk(id);
  if (!delivery) return null;
  return await delivery.update(updateData);
}

export {
  create,
  findById,
  findByOrderId,
  update
};