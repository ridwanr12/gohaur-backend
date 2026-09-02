import * as feedbackRepository from '../repository/feedbackRepository.js';
import * as ratingRepository from '../repository/ratingRepository.js';
import * as orderRepository from '../repository/orderRepository.js';
import AppError from '../utils/AppError.js';

async function createFeedback(feedbackData, userId) {
  // Check if order exists and belongs to the user
  const order = await orderRepository.findById(feedbackData.order_id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  
  if (order.user_id !== userId) {
    throw new AppError('You can only provide feedback for your own orders', 403);
  }
  
  // Check if order is completed
  if (order.status !== 'completed') {
    throw new AppError('You can only provide feedback for completed orders', 400);
  }
  
  // Check if feedback already exists for this order
  const existingFeedback = await feedbackRepository.findByOrderId(feedbackData.order_id);
  if (existingFeedback) {
    throw new AppError('Feedback already exists for this order', 400);
  }
  
  // Create feedback
  const feedback = await feedbackRepository.create({
    ...feedbackData,
    user_id: userId,
    store_id: order.store_id
  });
  
  // Update store rating
  await ratingRepository.createOrUpdate(order.store_id, feedbackData.rating);
  
  return feedback;
}

async function getFeedbackById(id) {
  const feedback = await feedbackRepository.findById(id);
  if (!feedback) {
    throw new AppError('Feedback not found', 404);
  }
  return feedback;
}

async function getStoreFeedbacks(storeId, options) {
  return await feedbackRepository.findByStoreId(storeId, options);
}

async function getOrderFeedback(orderId) {
  const feedback = await feedbackRepository.findByOrderId(orderId);
  if (!feedback) {
    throw new AppError('Feedback not found', 404);
  }
  return feedback;
}

async function updateFeedback(id, updateData, userId) {
  const feedback = await feedbackRepository.findById(id);
  if (!feedback) {
    throw new AppError('Feedback not found', 404);
  }
  
  // Check if feedback belongs to the user
  if (feedback.user_id !== userId) {
    throw new AppError('You can only update your own feedback', 403);
  }
  
  // Store old rating for recalculation
  const oldRating = feedback.rating;
  
  // Update feedback
  const updatedFeedback = await feedbackRepository.update(id, updateData);
  
  // If rating changed, update store rating
  if (oldRating !== updateData.rating) {
    // Remove old rating
    await ratingRepository.recalculateOnDelete(feedback.store_id, oldRating);
    // Add new rating
    await ratingRepository.createOrUpdate(feedback.store_id, updateData.rating);
  }
  
  return updatedFeedback;
}

async function deleteFeedback(id, userId) {
  const feedback = await feedbackRepository.findById(id);
  if (!feedback) {
    throw new AppError('Feedback not found', 404);
  }
  
  // Check if feedback belongs to the user
  if (feedback.user_id !== userId) {
    throw new AppError('You can only delete your own feedback', 403);
  }
  
  // Remove rating contribution
  await ratingRepository.recalculateOnDelete(feedback.store_id, feedback.rating);
  
  // Delete feedback
  return await feedbackRepository.remove(id);
}

async function getStoreRating(storeId) {
  return await ratingRepository.findByStoreId(storeId);
}

export {
  createFeedback,
  getFeedbackById,
  getStoreFeedbacks,
  getOrderFeedback,
  updateFeedback,
  deleteFeedback,
  getStoreRating
};