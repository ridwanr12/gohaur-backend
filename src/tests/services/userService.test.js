import { jest } from '@jest/globals';

const findAll = jest.fn();
const findById = jest.fn();
const findByEmail = jest.fn();
const findByEmailOrUsername = jest.fn();
const create = jest.fn();
const update = jest.fn();
const remove = jest.fn();
const assignRole = jest.fn();
const updateRoles = jest.fn();

// ESM: mock harus didaftarkan sebelum module yang memakainya di-import.
jest.unstable_mockModule('../../repository/userRepository.js', () => ({
  findAll,
  findById,
  findByEmail,
  findByEmailOrUsername,
  create,
  update,
  remove,
  assignRole,
  updateRoles,
}));

const mockUserRepository = {
  findAll,
  findById,
  findByEmail,
  findByEmailOrUsername,
  create,
  update,
  remove,
  assignRole,
  updateRoles,
};

const { getAllUsers, getProfile, updateProfile, register } = await import(
  '../../services/userService.js'
);

/**
 * Repository mengembalikan instance Sequelize (punya toJSON), jadi mock harus
 * meniru bentuk itu. Tanpa toJSON, sanitizeUser akan gagal.
 */
function fakeUser(data) {
  return { ...data, toJSON: () => ({ ...data }) };
}

describe('userService.getAllUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('mengembalikan user tanpa password beserta pagination', async () => {
    mockUserRepository.findAll.mockResolvedValue({
      users: [
        fakeUser({
          id: '1',
          username: 'user1',
          email: 'user1@test.com',
          password: 'secret',
          Roles: [{ name: 'buyer' }],
        }),
      ],
      pagination: { total: 1, page: 1, totalPages: 1, limit: 10 },
    });

    const result = await getAllUsers({});

    expect(mockUserRepository.findAll).toHaveBeenCalledWith({});
    expect(result.users).toHaveLength(1);
    expect(result.users[0].password).toBeUndefined();
    expect(result.users[0].roles).toEqual(['buyer']);
    expect(result.users[0].Roles).toBeUndefined();
    expect(result.pagination).toEqual({ total: 1, page: 1, totalPages: 1, limit: 10 });
  });

  it('mengembalikan daftar kosong dengan aman', async () => {
    mockUserRepository.findAll.mockResolvedValue({
      users: [],
      pagination: { total: 0, page: 1, totalPages: 0, limit: 10 },
    });

    const result = await getAllUsers({});

    expect(result.users).toEqual([]);
    expect(result.pagination.total).toBe(0);
  });
});

describe('userService.getProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('melempar 404 saat user tidak ditemukan', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(getProfile('missing-id')).rejects.toMatchObject({
      statusCode: 404,
      message: 'User not found',
    });
  });

  it('tidak membocorkan password', async () => {
    mockUserRepository.findById.mockResolvedValue(
      fakeUser({
        id: 'u1',
        username: 'ridwan',
        email: 'ridwan@test.com',
        password: 'hashed',
        Roles: [{ name: 'seller' }],
      }),
    );

    const result = await getProfile('u1');

    expect(result.password).toBeUndefined();
    expect(result.roles).toEqual(['seller']);
  });
});

describe('userService.updateProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('melempar 404 saat user tidak ditemukan', async () => {
    mockUserRepository.update.mockResolvedValue(null);

    await expect(updateProfile('missing', { username: 'baru' })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('mengembalikan data user yang sudah disanitasi', async () => {
    mockUserRepository.update.mockResolvedValue(
      fakeUser({ id: 'u1', username: 'baru', password: 'hashed' }),
    );

    const result = await updateProfile('u1', { username: 'baru' });

    expect(result.username).toBe('baru');
    expect(result.password).toBeUndefined();
  });
});

describe('userService.register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('menolak email atau username yang sudah dipakai', async () => {
    mockUserRepository.findByEmailOrUsername.mockResolvedValue({ id: 'existing' });

    await expect(
      register({
        username: 'ridwan',
        email: 'ridwan@test.com',
        password: 'password123',
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Email or username already exists',
    });

    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });
});
