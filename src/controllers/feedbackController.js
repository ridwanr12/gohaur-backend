import * as feedbackService from '../services/feedbackService.js';
import ApiResponse from '../utils/ApiResponse.js';

async function createFeedback(req, res) {
  const feedbackData = {
    order_id: req.body.order_id,
    rating: req.body.rating,
    description: req.body.description
  };
  
  const feedback = await feedbackService.createFeedback(feedbackData, req.user.id);
  res.status(201).json(ApiResponse.success({ feedback }, 'Feedback submitted successfully'));
}

async function getFeedback(req, res) {
  const { id } = req.params;
  const feedback = await feedbackService.getFeedbackById(id);
  res.json(ApiResponse.success({ feedback }));
}

async function getStoreFeedbacks(req, res) {
  const { storeId } = req.params;
  const { page, limit } = req.query;
  
  const result = await feedbackService.getStoreFeedbacks(storeId, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10
  });
  
  res.json(ApiResponse.success(result));
}

async function getOrderFeedback(req, res) {
  const { orderId } = req.params;
  const feedback = await feedbackService.getOrderFeedback(orderId);
  res.json(ApiResponse.success({ feedback }));
}

async function updateFeedback(req, res) {
  const { id } = req.params;
  const updateData = {
    rating: req.body.rating,
    description: req.body.description
  };
  
  const feedback = await feedbackService.updateFeedback(id, updateData, req.user.id);
  res.json(ApiResponse.success({ feedback }, 'Feedback updated successfully'));
}

async function deleteFeedback(req, res) {
  const { id } = req.params;
  await feedbackService.deleteFeedback(id, req.user.id);
  res.json(ApiResponse.success(null, 'Feedback deleted successfully'));
}

async function getStoreRating(req, res) {
  const { storeId } = req.params;
  const rating = await feedbackService.getStoreRating(storeId);
  res.json(ApiResponse.success({ rating }));
}

export {
  createFeedback,
  getFeedback,
  getStoreFeedbacks,
  getOrderFeedback,
  updateFeedback,
  deleteFeedback,
  getStoreRating
};