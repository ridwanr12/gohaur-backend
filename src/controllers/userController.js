import * as userService from '../services/userService.js';
import ApiResponse from '../utils/ApiResponse.js';

async function register(req, res) {
  const result = await userService.register(req.body);
  res.status(201).json(ApiResponse.success(result, 'User registered successfully'));
}

async function login(req, res) {
  const result = await userService.login(req.body);
  res.json(ApiResponse.success(result, 'Login successful'));
}

async function getProfile(req, res) {
  const user = await userService.getProfile(req.params.id);
  res.json(ApiResponse.success({ user }));
}

async function updateProfile(req, res) {
  const user = await userService.updateProfile(req.user.id, req.body);
  res.json(ApiResponse.success({ user }, 'Profile updated successfully'));
}

async function deleteAccount(req, res) {
  await userService.deleteAccount(req.user.id);
  res.json(ApiResponse.success(null, 'Account deleted successfully'));
}

export {
  register,
  login,
  getProfile,
  updateProfile,
  deleteAccount
};