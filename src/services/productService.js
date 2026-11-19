import * as productRepository from '../repository/productRepository.js';
import * as storeRepository from '../repository/storeRepository.js';
import AppError from '../utils/AppError.js';

const EDITABLE_FIELDS = ['name', 'description', 'price', 'stock', 'images'];

function pickEditableFields(updateData) {
  const picked = {};
  EDITABLE_FIELDS.forEach(field => {
    if (updateData[field] !== undefined) {
      picked[field] = updateData[field];
    }
  });
  return picked;
}

async function assertStoreOwner(storeId, userId) {
  const store = await storeRepository.findById(storeId);
  if (!store) {
    throw new AppError('Store not found', 404);
  }
  if (store.user_id !== userId) {
    throw new AppError('You are not allowed to manage this store products', 403);
  }
  return store;
}

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

async function createProduct(productData, userId) {
  await assertStoreOwner(productData.store_id, userId);

  return await productRepository.create({
    ...pickEditableFields(productData),
    store_id: productData.store_id,
  });
}

async function updateProduct(id, updateData, userId) {
  const product = await productRepository.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  await assertStoreOwner(product.store_id, userId);

  return await productRepository.update(id, pickEditableFields(updateData));
}

async function deleteProduct(id, requester) {
  const product = await productRepository.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const isAdmin = (requester.roles || []).includes('admin');
  if (!isAdmin) {
    await assertStoreOwner(product.store_id, requester.id);
  }

  return await productRepository.remove(id);
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
  getAllProducts,
};
