import { jest } from '@jest/globals';

const orderRepository = {
  findById: jest.fn(),
  findByStoreId: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  getRandomCourier: jest.fn(),
};

const storeRepository = {
  findById: jest.fn(),
};

const transaction = jest.fn();

jest.unstable_mockModule('../../repository/orderRepository.js', () => orderRepository);
jest.unstable_mockModule('../../repository/storeRepository.js', () => storeRepository);
jest.unstable_mockModule('../../models/index.js', () => ({
  default: {},
  sequelize: { transaction },
}));

const { getOrderById, getStoreOrders, updateOrderStatus } = await import(
  '../../services/orderService.js'
);

function fakeOrder(overrides = {}) {
  return {
    id: 'order-1',
    user_id: 'buyer-1',
    courier_id: null,
    store_id: 'store-1',
    status: 'pending',
    Store: { user_id: 'seller-1' },
    Products: [],
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('orderService.getStoreOrders', () => {
  it('menolak seller yang bukan pemilik toko (403)', async () => {
    storeRepository.findById.mockResolvedValue({ id: 'store-1', user_id: 'seller-1' });

    await expect(
      getStoreOrders('store-1', 'seller-lain', { page: 1, limit: 10 }),
    ).rejects.toMatchObject({
      statusCode: 403,
    });

    expect(orderRepository.findByStoreId).not.toHaveBeenCalled();
  });

  it('mengembalikan 404 kalau toko tidak ada', async () => {
    storeRepository.findById.mockResolvedValue(null);

    await expect(
      getStoreOrders('store-x', 'seller-1', { page: 1, limit: 10 }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('meneruskan request untuk pemilik toko', async () => {
    storeRepository.findById.mockResolvedValue({ id: 'store-1', user_id: 'seller-1' });
    orderRepository.findByStoreId.mockResolvedValue({ orders: [], pagination: {} });

    const options = { page: 1, limit: 10 };
    await getStoreOrders('store-1', 'seller-1', options);

    expect(orderRepository.findByStoreId).toHaveBeenCalledWith('store-1', options);
  });
});

describe('orderService.getOrderById', () => {
  it('mengizinkan pembeli melihat pesanannya sendiri', async () => {
    orderRepository.findById.mockResolvedValue(fakeOrder());

    const order = await getOrderById('order-1', { id: 'buyer-1', roles: ['buyer'] });

    expect(order.id).toBe('order-1');
  });

  it('mengizinkan pemilik toko melihat pesanan tokonya', async () => {
    orderRepository.findById.mockResolvedValue(fakeOrder());

    await expect(
      getOrderById('order-1', { id: 'seller-1', roles: ['seller'] }),
    ).resolves.toBeDefined();
  });

  it('mengizinkan kurir yang ditugaskan', async () => {
    orderRepository.findById.mockResolvedValue(fakeOrder({ courier_id: 'courier-1' }));

    await expect(
      getOrderById('order-1', { id: 'courier-1', roles: ['courier'] }),
    ).resolves.toBeDefined();
  });

  it('menolak user yang tidak terlibat (403)', async () => {
    orderRepository.findById.mockResolvedValue(fakeOrder());

    await expect(
      getOrderById('order-1', { id: 'orang-lain', roles: ['buyer'] }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe('orderService.updateOrderStatus', () => {
  it('menolak lompatan status pending ke completed', async () => {
    orderRepository.findById.mockResolvedValue(fakeOrder({ status: 'pending' }));

    await expect(
      updateOrderStatus('order-1', 'completed', { id: 'seller-1' }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Cannot change order status from "pending" to "completed"',
    });

    expect(transaction).not.toHaveBeenCalled();
  });

  it('menolak seller lain mengubah status pesanan', async () => {
    orderRepository.findById.mockResolvedValue(fakeOrder({ status: 'pending' }));

    await expect(
      updateOrderStatus('order-1', 'approved', { id: 'seller-lain' }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('mengembalikan pesanan apa adanya kalau status sama (idempotent)', async () => {
    const order = fakeOrder({ status: 'approved' });
    orderRepository.findById.mockResolvedValue(order);

    const result = await updateOrderStatus('order-1', 'approved', { id: 'seller-1' });

    expect(result).toBe(order);
    expect(transaction).not.toHaveBeenCalled();
  });
});
