import * as productService from '../services/productService.js';
import ApiResponse from '../utils/ApiResponse.js';

async function getProduct(req, res) {
  const { id } = req.params;
  const product = await productService.getProductById(id);
  res.json(ApiResponse.success({ product }));
}

async function getStoreProducts(req, res) {
  const { storeId } = req.params;
  const { page, limit, search } = req.query;
  const result = await productService.getStoreProducts(storeId, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    search
  });
  res.json(ApiResponse.success(result));
}

async function createProduct(req, res) {
  const productData = {
    ...req.body,
    store_id: req.params.storeId
  };
  const product = await productService.createProduct(productData);
  res.status(201).json(ApiResponse.success({ product }, 'Product created successfully'));
}

async function updateProduct(req, res) {
  const { id } = req.params;
  const product = await productService.updateProduct(id, req.body);
  res.json(ApiResponse.success({ product }, 'Product updated successfully'));
}

async function deleteProduct(req, res) {
  const { id } = req.params;
  await productService.deleteProduct(id);
  res.json(ApiResponse.success(null, 'Product deleted successfully'));
}

async function getAllProducts(req, res) {
  const { page, limit, search, storeId } = req.query;
  const products = await productService.getAllProducts({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    search,
    storeId
  });
  res.json(ApiResponse.success(products));
}

export {
  getProduct,
  getStoreProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts
};