import models from '../models/index.js';
const { Product, Store, User } = models;

async function findById(id) {
  return await Product.findByPk(id, {
    include: [{
      model: Store,
      include: [{
        model: User,
        attributes: ['id', 'username', 'email']
      }]
    }]
  });
}

async function findByStoreId(storeId, { page = 1, limit = 10, search = '' } = {}) {
  const offset = (page - 1) * limit;
  const where = {
    store_id: storeId,
    ...(search && {
      name: { [models.Sequelize.Op.iLike]: `%${search}%` }
    })
  };

  const { rows: products, count: total } = await Product.findAndCountAll({
    where,
    limit,
    offset
  });

  return {
    products,
    pagination: {
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      limit: parseInt(limit)
    }
  };
}

async function create(productData) {
  return await Product.create(productData);
}

async function update(id, updateData) {
  const product = await findById(id);
  if (!product) return null;
  return await product.update(updateData);
}

async function remove(id) {
  const product = await findById(id);
  if (!product) return false;
  await product.destroy();
  return true;
}

async function incrementStock(id, quantity, transaction) {
  return await Product.increment('stock', { by: quantity, where: { id }, transaction });
}

async function decrementStock(id, quantity, transaction) {
  return await Product.decrement('stock', { by: quantity, where: { id }, transaction });
}

async function findAll({ page = 1, limit = 10, search = '', storeId = null } = {}) {
  const offset = (page - 1) * limit;
  const where = {
    ...(search && {
      name: { [models.Sequelize.Op.iLike]: `%${search}%` }
    }),
    ...(storeId && { store_id: storeId })
  };

  const { rows: products, count: total } = await Product.findAndCountAll({
    where,
    include: [{
      model: Store,
      include: [{
        model: User,
        attributes: ['id', 'username', 'email']
      }]
    }],
    limit,
    offset
  });

  return {
    products,
    pagination: {
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      limit: parseInt(limit)
    }
  };
}



export {
  findById,
  findByStoreId,
  create,
  update,
  remove,
  findAll,
  incrementStock,
  decrementStock
};