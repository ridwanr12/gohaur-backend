import { jest } from '@jest/globals';
import { getAllUsers } from '../../services/userService.js';

const mockUserRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByEmailOrUsername: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  assignRole: jest.fn(),
  updateRoles: jest.fn()
};

// Gunakan jest.mock langsung agar module digantikan dengan mockUserRepository
jest.mock('../../repository/userRepository.js', () => ({
  __esModule: true,
  default: mockUserRepository,
}));

import * as userRepository from '../../repository/userRepository.js';

describe('getAllUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return users and pagination with default parameters', async () => {
    const mockUsers = [
      { id: '1', username: 'user1', email: 'user1@test.com', Roles: [{ name: 'buyer' }] },
      { id: '2', username: 'user2', email: 'user2@test.com', Roles: [{ name: 'seller' }] }
    ];

    const mockResult = {
      users: mockUsers,
      pagination: {
        total: 2,
        page: 1,
        totalPages: 1,
        limit: 10
      }
    };

    mockUserRepository.findAll.mockResolvedValue(mockResult);

    const result = await getAllUsers({});

    expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1); // Pastikan fungsi dipanggil
    expect(mockUserRepository.findAll).toHaveBeenCalledWith({}); // Pastikan parameternya benar
    expect(result).toEqual({
      users: mockUsers.map(user => ({
        ...user,
        roles: user.Roles.map(role => role.name),
        Roles: undefined
      })),
      pagination: mockResult.pagination
    });
  });

  it('should handle search and pagination parameters', async () => {
    const queryParams = {
      search: 'test',
      page: 2,
      limit: 5,
      sortBy: 'username',
      sortOrder: 'ASC'
    };

    const mockUsers = [
      { id: '3', username: 'test3', email: 'test3@test.com', Roles: [{ name: 'buyer' }] }
    ];

    const mockResult = {
      users: mockUsers,
      pagination: {
        total: 6,
        page: 2,
        totalPages: 2,
        limit: 5
      }
    };

    mockUserRepository.findAll.mockResolvedValue(mockResult);

    const result = await getAllUsers(queryParams);

    expect(mockUserRepository.findAll).toHaveBeenCalledWith(queryParams);
    expect(result).toEqual({
      users: mockUsers.map(user => ({
        ...user,
        roles: user.Roles.map(role => role.name),
        Roles: undefined
      })),
      pagination: mockResult.pagination
    });
  });

  it('should handle empty result', async () => {
    const mockResult = {
      users: [],
      pagination: {
        total: 0,
        page: 1,
        totalPages: 0,
        limit: 10
      }
    };

    mockUserRepository.findAll.mockResolvedValue(mockResult);

    const result = await getAllUsers({});

    expect(mockUserRepository.findAll).toHaveBeenCalledWith({});
    expect(result).toEqual({
      users: [],
      pagination: mockResult.pagination
    });
  });

  it('should handle repository errors', async () => {
    mockUserRepository.findAll.mockRejectedValue(new Error('Database error'));

    await expect(getAllUsers({})).rejects.toThrow('Database error');
    expect(mockUserRepository.findAll).toHaveBeenCalledWith({});
  });
});
