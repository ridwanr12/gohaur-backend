import * as storeService from '../services/storeService.js';
import ApiResponse from '../utils/ApiResponse.js';

async function getStore(req, res) {
  const { id } = req.params;
  const store = await storeService.getStoreById(id);
  res.json(ApiResponse.success({ store }));
}

async function getMyStore(req, res) {
  const store = await storeService.getStoreByUserId(req.user.id);
  res.json(ApiResponse.success({ store }));
}

async function createStore(req, res) {
  const storeData = {
    ...req.body,
    user_id: req.user.id
  };
  const store = await storeService.createStore(storeData);
  res.status(201).json(ApiResponse.success({ store }, 'Store created successfully'));
}

async function updateStore(req, res) {
  const { id } = req.params;
  const store = await storeService.updateStore(id, req.body);
  res.json(ApiResponse.success({ store }, 'Store updated successfully'));
}

async function deleteStore(req, res) {
  const { id } = req.params;
  await storeService.deleteStore(id);
  res.json(ApiResponse.success(null, 'Store deleted successfully'));
}

async function getAllStores(req, res) {
  const { page, limit, search, showProducts, showRating } = req.query;
  const stores = await storeService.getAllStores({ 
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    search,
    showProducts: showProducts == 'true',
    showRating: showRating == 'true'
  });
  res.json(ApiResponse.success(stores));
}

export {
  getStore,
  getMyStore,
  createStore,
  updateStore,
  deleteStore,
  getAllStores
};