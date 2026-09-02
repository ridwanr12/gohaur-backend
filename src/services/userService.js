import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import * as userRepository from '../repository/userRepository.js';
import AppError from '../utils/AppError.js';
import JwtUtils from '../utils/jwt.js';
import asyncHandler from '../middlewares/asyncHandler.js';

class UserDTO {
  constructor(data) {
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.phone = data.phone;
    this.location = data.location;
  }
}

async function register(userData) {
  const dto = new UserDTO(userData);
  const role = userData.role || "buyer";
  
  const existingUser = await userRepository.findByEmailOrUsername(dto.email, dto.username);
  if (existingUser) {
    throw new AppError('Email or username already exists', 400);
  }

  const hashedPassword = await bcrypt.hash(dto.password, 10);
  
  const user = await userRepository.create({
    id: uuidv4(),
    ...dto,
    password: hashedPassword
  });

  await userRepository.assignRole(user, role);

  const token = JwtUtils.generateToken({ 
    id: user.id,
    email: user.email,
    roles: [role]
  });

  return {
    user: sanitizeUser(user),
    token
  };
}

async function login(credentials) {
  const user = await userRepository.findByEmail(credentials.email, true);
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isValidPassword = await bcrypt.compare(credentials.password, user.password);
  if (!isValidPassword) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = JwtUtils.generateToken({
    id: user.id,
    email: user.email,
    roles: user.Roles.map(role => role.name)
  });

  return {
    user: sanitizeUser(user),
    token
  };
}

async function getProfile(userId) {
  const user = await userRepository.findById(userId, true);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return sanitizeUser(user);
}

async function updateProfile(userId, updateData) {
  const user = await userRepository.update(userId, updateData);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return sanitizeUser(user);
}

async function deleteAccount(userId) {
  const deleted = await userRepository.remove(userId);
  if (!deleted) {
    throw new AppError('User not found', 404);
  }
  return true;
}

async function getAllUsers(queryParams) {
  const result = await userRepository.findAll(queryParams);
  return {
    users: result.users.map(user => sanitizeUser(user)),
    pagination: result.pagination
  };
}

async function getUserById(id) {
  const user = await userRepository.findById(id, true);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return sanitizeUser(user);
}

async function updateUserRole(userId, roles) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  await userRepository.updateRoles(user, roles);
  const updatedUser = await userRepository.findById(userId, true);
  return sanitizeUser(updatedUser);
}

function sanitizeUser(user) {
    const sanitized = user.toJSON();
    delete sanitized.password;
    if (sanitized.Roles) {
      sanitized.roles = sanitized.Roles.map(role => role.name);
      delete sanitized.Roles;
    }
    return sanitized;
  }

export {
  register,
  login,
  getProfile,
  updateProfile,
  deleteAccount,
  getAllUsers,
  getUserById,
  updateUserRole,
  sanitizeUser
};