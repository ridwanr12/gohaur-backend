import * as orderRepository from '../repository/orderRepository.js';
import * as deliveryRepository from '../repository/deliveryRepository.js';
import * as productRepository from '../repository/productRepository.js';
import AppError from '../utils/AppError.js';

async function createOrder(orderData, userId) {
  // Verify all products exist and are from the same store
  const products = await Promise.all(
    orderData.products.map(async item => {
        const product = await productRepository.findById(item.product_id)
        if (product.stock < item.quantity) {
            throw new AppError(`Product "${product.name}" does not have enough stock`, 404);
        }
        return product
    })
  );

  // Check if all products exist
  if (products.some(p => !p)) {
    throw new AppError('One or more products not found', 404);
  }

  // Verify all products are from the same store
  if (!products.every(p => p.store_id === orderData.store_id)) {
    throw new AppError('All products must be from the same store', 400);
  }

  // Calculate total price
  const total_price = orderData.products.reduce((sum, item) => {
    const product = products.find(p => p.id === item.product_id);
    return sum + (product.price * item.quantity);
  }, 0);

  // Get random courier
//   const courier = await orderRepository.getRandomCourier();
//   if (!courier) {
//     throw new AppError('No couriers available', 400);
//   }

  // Create order
  const order = await orderRepository.create({
    user_id: userId,
    store_id: orderData.store_id,
    // courier_id: courier.id,
    shipping_cost: orderData.shipping_cost,
    total_price,
    payment_proof: orderData.payment_proof,
    status: 'pending'
  });

  // Create order products
  await orderRepository.createOrderProducts(
    orderData.products.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: parseFloat(products.find(p => p.id === item.product_id).price) * item.quantity,
      note: item.note
    }))
  );

  // Create delivery record
//   await deliveryRepository.create({
//     order_id: order.id,
//     courier_id: courier.id,
//     status: 'order_received'
//   });

  return await orderRepository.findById(order.id);
}

async function getOrderById(id) {
  const order = await orderRepository.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  return order;
}

async function getUserOrders(userId, options) {
  return await orderRepository.findByUserId(userId, options);
}

async function getStoreOrders(storeId, options) {
  return await orderRepository.findByStoreId(storeId, options);
}

async function updateOrderStatus(id, status) {
  const orderBefore = await orderRepository.findById(id);
  if (!orderBefore) {
    throw new AppError('Order not found', 404);
  }
//   if (orderBefore.status === status) {
//     throw new AppError('Order status is already ' + status, 400);
//   }
//   if (orderBefore.status === 'canceled') {
//     throw new AppError('Order status is already canceled', 400);
//   } 
  if (orderBefore.status === 'completed') {
    throw new AppError('Order status is already completed', 400);
  }

  let order;  

  if (status === 'approved') {
    const courier = await orderRepository.getRandomCourier();
    if (!courier) {
      throw new AppError('No couriers available', 400);
    }

    const orderProducts = orderBefore.Products
    console.log(orderProducts)

    // Check again if products are available
    orderProducts.forEach(prod => {
        if (prod.stock < prod.order_products.quantity) {
            throw new AppError(`Product "${prod.name}" does not have enough stock`, 404);
        }
    })

    await Promise.all(
        orderProducts.map(async prod => {
            await productRepository.update(prod.id, { stock: prod.stock - prod.order_products.quantity })
        })
    )


    order = await orderRepository.update(id, { courier_id: courier.id, status });
  } else if (status == "canceled") {
    // If courier is assinged (product is approved), then revert stock changes
    if (orderBefore.courier_id) {
        const orderProducts = orderBefore.Products
        await Promise.all(
            orderProducts.map(async prod => {
                await productRepository.update(prod.id, { stock: prod.stock + prod.order_products.quantity })
            })
        )
    }
    order = await orderRepository.update(id, { status });
  }
  else {
    order = await orderRepository.update(id, { status });
  }

  return order;
}

export {
  createOrder,
  getOrderById,
  getUserOrders,
  getStoreOrders,
  updateOrderStatus
};