import * as userService from '../services/userService.js';
import ApiResponse from '../utils/ApiResponse.js';

async function getAllUsers(req, res) {
  const { search, page, limit, sortBy, sortOrder } = req.query;
  const users = await userService.getAllUsers({ 
    search, 
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sortBy: sortBy || 'created_at',
    sortOrder: (sortOrder || 'DESC').toUpperCase()
  });
  res.json(ApiResponse.success(users));
}

async function getUser(req, res) {
  const { id } = req.params;
  const user = await userService.getUserById(id);
  res.json(ApiResponse.success({ user }));
}

async function updateUserRole(req, res) {
  const { id } = req.params;
  const { roles } = req.body;
  
  const user = await userService.updateUserRole(id, roles);
  res.json(ApiResponse.success({ user }, 'User roles updated successfully'));
}

export {
  getAllUsers,
  getUser,
  updateUserRole
};