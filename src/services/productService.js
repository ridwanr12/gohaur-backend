import * as productRepository from '../repository/productRepository.js';
import * as storeRepository from '../repository/storeRepository.js';
import AppError from '../utils/AppError.js';

async function getProductById(id) {
  const product = await productRepository.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return product;
}

async function getStoreProducts(storeId, options) {
  const store = await storeRepository.findById(storeId);
  if (!store) {
    throw new AppError('Store not found', 404);
  }
  return await productRepository.findByStoreId(storeId, options);
}

async function createProduct(productData) {
  const store = await storeRepository.findById(productData.store_id);
  if (!store) {
    throw new AppError('Store not found', 404);
  }
  return await productRepository.create(productData);
}

async function updateProduct(id, updateData) {
  const product = await productRepository.update(id, updateData);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return product;
}

async function deleteProduct(id) {
  const result = await productRepository.remove(id);
  if (!result) {
    throw new AppError('Product not found', 404);
  }
  return result;
}

async function getAllProducts(options) {
  return await productRepository.findAll(options);
}

export {
  getProductById,
  getStoreProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts
};