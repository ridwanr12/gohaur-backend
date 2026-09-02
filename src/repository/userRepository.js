import models from '../models/index.js';
const { User, Role } = models;
import { Op } from 'sequelize'; 

async function findByEmailOrUsername(email, username) {
  return await User.findOne({
    where: {
        [Op.or]: [{ email }, { username }]
    }
  });
}

async function findByEmail(email, includeRoles = false) {
  const options = {
    where: { email }
  };

  if (includeRoles) {
    options.include = [{
      model: Role,
      attributes: ['name'],
      through: { attributes: [] }
    }];
  }

  return await User.findOne(options);
}

async function findById(id, excludePassword = false) {
  const options = {
    where: { id }
  };

  if (excludePassword) {
    options.attributes = { exclude: ['password'] };
    options.include = [{
      model: Role,
      attributes: ['name'],
      through: { attributes: [] }
    }];
  }

  return await User.findByPk(id, options);
}

async function create(userData) {
  return await User.create(userData);
}

async function update(id, updateData) {
  const user = await findById(id);
  if (!user) return null;
  return await user.update(updateData);
}

async function remove(id) {
  const user = await findById(id);
  if (!user) return false;
  await user.destroy();
  return true;
}

async function assignRole(user, roleName) {
  const role = await Role.findOne({ where: { name: roleName } });
  if (!role) return false;
  await user.addRole(role);
  return true;
}

async function findAll({ 
  search = '', 
  page = 1, 
  limit = 10, 
  sortBy = 'created_at', 
  sortOrder = 'DESC' 
} = {}) {
  const offset = (page - 1) * limit;
  
  const whereClause = search ? {
    [Op.or]: [  // Use Op directly instead of models.Sequelize.Op
      { username: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } }
    ]
  } : {};

  const { rows: users, count: total } = await User.findAndCountAll({
    where: whereClause,
    attributes: { exclude: ['password'] },
    include: [{
      model: Role,
      attributes: ['name'],
      through: { attributes: [] }
    }],
    order: [[sortBy, sortOrder]],
    limit,
    offset
  });

  return {
    users,
    pagination: {
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      limit: parseInt(limit)
    }
  };
}

async function updateRoles(user, roleNames) {
  const roles = await Role.findAll({
    where: {
      name: roleNames
    }
  });
  
  await user.setRoles(roles);
  return true;
}

export {
  findByEmailOrUsername,
  findByEmail,
  findById,
  create,
  update,
  remove,
  assignRole,
  findAll,
  updateRoles
};