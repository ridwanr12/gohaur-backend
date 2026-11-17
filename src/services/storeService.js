import * as storeRepository from '../repository/storeRepository.js';
import AppError from '../utils/AppError.js';

async function getStoreById(id) {
  const store = await storeRepository.findById(id);
  if (!store) {
    throw new AppError('Store not found', 404);
  }
  return store;
}

async function getStoreByUserId(userId) {
  const store = await storeRepository.findByUserId(userId);
  if (!store) {
    throw new AppError('Store not found', 404);
  }
  return store;
}

async function createStore(storeData) {
  const existingStore = await storeRepository.findByUserId(storeData.user_id);
  if (existingStore) {
    throw new AppError('User already has a store', 400);
  }
  return await storeRepository.create(storeData);
}

async function updateStore(id, updateData, requesterId) {
  const existingStore = await storeRepository.findById(id);
  if (!existingStore) {
    throw new AppError('Store not found', 404);
  }
  if (existingStore.user_id !== requesterId) {
    throw new AppError('You are not allowed to update this store', 403);
  }
  return await storeRepository.update(id, updateData);
}

async function deleteStore(id, requesterId) {
  const existingStore = await storeRepository.findById(id);
  if (!existingStore) {
    throw new AppError('Store not found', 404);
  }
  if (existingStore.user_id !== requesterId) {
    throw new AppError('You are not allowed to delete this store', 403);
  }
  return await storeRepository.remove(id);
}

async function getAllStores({
  page,
  limit,
  search,
  showProducts = false,
  showRating = false,
} = {}) {
  return await storeRepository.findAll({ page, limit, search, showProducts, showRating });
}

export { getStoreById, getStoreByUserId, createStore, updateStore, deleteStore, getAllStores };
