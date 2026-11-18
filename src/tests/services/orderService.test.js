import { jest } from '@jest/globals';

const orderRepository = {
  findById: jest.fn(),
  findByStoreId: jest.fn(),
  findByUserId: jest.fn(),
  create: jest.fn(),
  createOrderProducts: jest.fn(),
  update: jest.fn(),
};

const storeRepository = {
  findById: jest.fn(),
};

const productRepository = {
  findById: jest.fn(),
  decrementStock: jest.fn(),
  incrementStock: jest.fn(),
};

const notificationService = {
  notify: jest.fn(),
};

const commit = jest.fn();
const rollback = jest.fn();
const transaction = jest.fn();

jest.unstable_mockModule('../../repository/orderRepository.js', () => orderRepository);
jest.unstable_mockModule('../../repository/storeRepository.js', () => storeRepository);
jest.unstable_mockModule('../../repository/productRepository.js', () => productRepository);
jest.unstable_mockModule('../../services/notificationService.js', () => notificationService);
jest.unstable_mockModule('../../models/index.js', () => ({
  default: {},
  sequelize: { transaction },
}));

const {
  getOrderById,
  getStoreOrders,
  acceptOrder,
  rejectOrder,
  shipOrder,
  completeOrder,
  markRefunded,
  createOrder,
} = await import('../../services/orderService.js');

function fakeOrder(overrides = {}) {
  return {
    id: 'order-1',
    user_id: 'buyer-1',
    store_id: 'store-1',
    status: 'pending',
    payment_proof: '/uploads/bukti.jpg',
    refund_status: 'not_required',
    Store: { user_id: 'seller-1', latitude: -6.895, longitude: 107.618 },
    Products: [
      {
        id: 'product-1',
        name: 'Kopi',
        stock: 10,
        price: '10000',
        OrderProduct: { quantity: 2 },
      },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  transaction.mockResolvedValue({ commit, rollback });
  productRepository.decrementStock.mockResolvedValue(true);
  productRepository.incrementStock.mockResolvedValue(true);
  storeRepository.findById.mockResolvedValue({ id: 'store-1', user_id: 'seller-1' });
});

describe('orderService.getStoreOrders', () => {
  it('menolak seller yang bukan pemilik toko (403)', async () => {
    storeRepository.findById.mockResolvedValue({ id: 'store-1', user_id: 'seller-1' });

    await expect(
      getStoreOrders('store-1', 'seller-lain', { page: 1, limit: 10 }),
    ).rejects.toMatchObject({ statusCode: 403 });

    expect(orderRepository.findByStoreId).not.toHaveBeenCalled();
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

  it('menolak user yang tidak terlibat (403)', async () => {
    orderRepository.findById.mockResolvedValue(fakeOrder());
    await expect(
      getOrderById('order-1', { id: 'orang-lain', roles: ['buyer'] }),
    ).rejects.toMatchObject({
      statusCode: 403,
    });
  });
});

describe('orderService.acceptOrder', () => {
  it('menolak seller lain mengubah pesanan', async () => {
    orderRepository.findById.mockResolvedValue(fakeOrder());
    await expect(acceptOrder('order-1', 'seller-lain')).rejects.toMatchObject({ statusCode: 403 });
  });

  it('menolak menerima pesanan yang bukan pending', async () => {
    orderRepository.findById.mockResolvedValue(fakeOrder({ status: 'shipped' }));
    await expect(acceptOrder('order-1', 'seller-1')).rejects.toMatchObject({ statusCode: 400 });
  });

  it('menerima pesanan dan memotong stok', async () => {
    orderRepository.findById.mockResolvedValue(fakeOrder());
    orderRepository.update.mockResolvedValue(true);

    await acceptOrder('order-1', 'seller-1');

    expect(productRepository.decrementStock).toHaveBeenCalledWith(
      'product-1',
      2,
      expect.anything(),
    );
    expect(orderRepository.update).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({ status: 'accepted' }),
      expect.anything(),
    );
    expect(commit).toHaveBeenCalled();
  });
});

describe('orderService.rejectOrder', () => {
  it('mewajibkan alasan penolakan', async () => {
    orderRepository.findById.mockResolvedValue(fakeOrder());
    await expect(rejectOrder('order-1', 'seller-1', '   ')).rejects.toMatchObject({
      statusCode: 400,
      message: 'Rejection reason is required',
    });
  });

  it('menolak pesanan pending tanpa mengubah stok dan menandai refund', async () => {
    orderRepository.findById.mockResolvedValue(fakeOrder());
    orderRepository.update.mockResolvedValue(true);

    await rejectOrder('order-1', 'seller-1', 'Stok habis');

    expect(productRepository.incrementStock).not.toHaveBeenCalled();
    expect(orderRepository.update).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({
        status: 'rejected',
        rejection_reason: 'Stok habis',
        refund_status: 'pending',
      }),
      expect.anything(),
    );
  });

  it('membatalkan pesanan accepted dan mengembalikan stok', async () => {
    orderRepository.findById.mockResolvedValue(fakeOrder({ status: 'accepted' }));
    orderRepository.update.mockResolvedValue(true);

    await rejectOrder('order-1', 'seller-1', 'Salah pencet');

    expect(productRepository.incrementStock).toHaveBeenCalledWith(
      'product-1',
      2,
      expect.anything(),
    );
    expect(orderRepository.update).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({ status: 'rejected', refund_status: 'pending' }),
      expect.anything(),
    );
  });

  it('tidak bisa membatalkan pesanan yang sudah dikirim', async () => {
    orderRepository.findById.mockResolvedValue(fakeOrder({ status: 'shipped' }));
    await expect(rejectOrder('order-1', 'seller-1', 'Batal')).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});

describe('orderService.shipOrder', () => {
  it('mewajibkan nama pengirim dan plat', async () => {
    orderRepository.findById.mockResolvedValue(fakeOrder({ status: 'accepted' }));

    await expect(
      shipOrder('order-1', 'seller-1', { courier_name: '', courier_plate: 'D 1234 AB' }),
    ).rejects.toMatchObject({ statusCode: 400 });

    await expect(
      shipOrder('order-1', 'seller-1', { courier_name: 'Budi', courier_plate: '' }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('mengirim pesanan dan menyimpan data pengirim', async () => {
    orderRepository.findById.mockResolvedValue(fakeOrder({ status: 'accepted' }));
    orderRepository.update.mockResolvedValue(true);

    await shipOrder('order-1', 'seller-1', {
      courier_name: 'Budi',
      courier_plate: 'D 1234 AB',
    });

    expect(orderRepository.update).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({
        status: 'shipped',
        courier_name: 'Budi',
        courier_plate: 'D 1234 AB',
      }),
    );
  });
});

describe('orderService.completeOrder', () => {
  it('hanya buyer pemilik pesanan yang boleh menyelesaikan', async () => {
    orderRepository.findById.mockResolvedValue(fakeOrder({ status: 'shipped' }));

    await expect(completeOrder('order-1', 'buyer-lain')).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it('hanya pesanan shipped yang bisa diselesaikan', async () => {
    orderRepository.findById.mockResolvedValue(fakeOrder({ status: 'accepted' }));

    await expect(completeOrder('order-1', 'buyer-1')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('menyelesaikan pesanan', async () => {
    orderRepository.findById.mockResolvedValue(fakeOrder({ status: 'shipped' }));
    orderRepository.update.mockResolvedValue(true);

    await completeOrder('order-1', 'buyer-1');

    expect(orderRepository.update).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({ status: 'completed' }),
    );
  });
});

describe('orderService.markRefunded', () => {
  it('menandai refund hanya untuk order rejected yang butuh refund', async () => {
    orderRepository.findById.mockResolvedValue(
      fakeOrder({ status: 'rejected', refund_status: 'pending' }),
    );
    orderRepository.update.mockResolvedValue(true);

    await markRefunded('order-1', 'seller-1', 'Transfer BCA');

    expect(orderRepository.update).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({ refund_status: 'refunded', refund_note: 'Transfer BCA' }),
    );
  });

  it('menolak kalau order belum ditolak', async () => {
    orderRepository.findById.mockResolvedValue(fakeOrder({ status: 'accepted' }));
    await expect(markRefunded('order-1', 'seller-1', 'x')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('menolak kalau tidak ada refund yang perlu dikirim', async () => {
    orderRepository.findById.mockResolvedValue(
      fakeOrder({ status: 'rejected', refund_status: 'not_required' }),
    );
    await expect(markRefunded('order-1', 'seller-1', 'x')).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});

describe('orderService.createOrder', () => {
  it('menolak kalau toko belum punya koordinat', async () => {
    productRepository.findById.mockResolvedValue({
      id: 'product-1',
      store_id: 'store-1',
      stock: 10,
      price: '10000',
      name: 'Kopi',
    });
    storeRepository.findById.mockResolvedValue({ id: 'store-1', latitude: null, longitude: null });

    await expect(
      createOrder(
        {
          store_id: 'store-1',
          products: [{ product_id: 'product-1', quantity: 1 }],
          delivery_address: 'Jl. Test',
          delivery_latitude: -6.893,
          delivery_longitude: 107.616,
        },
        'buyer-1',
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('menolak pesanan lebih dari 5 km', async () => {
    productRepository.findById.mockResolvedValue({
      id: 'product-1',
      store_id: 'store-1',
      stock: 10,
      price: '10000',
      name: 'Kopi',
    });
    // Toko di Bandung, buyer di Jakarta (~120 km)
    storeRepository.findById.mockResolvedValue({
      id: 'store-1',
      latitude: -6.895,
      longitude: 107.618,
    });

    await expect(
      createOrder(
        {
          store_id: 'store-1',
          products: [{ product_id: 'product-1', quantity: 1 }],
          delivery_address: 'Jakarta',
          delivery_latitude: -6.2088,
          delivery_longitude: 106.8456,
        },
        'buyer-1',
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('menghitung ongkir dan total di server, bukan dari client', async () => {
    productRepository.findById.mockResolvedValue({
      id: 'product-1',
      store_id: 'store-1',
      stock: 10,
      price: '20000',
      name: 'Kopi',
    });
    storeRepository.findById.mockResolvedValue({
      id: 'store-1',
      latitude: -6.895,
      longitude: 107.618,
    });
    orderRepository.create.mockImplementation(async data => ({ id: 'order-new', ...data }));
    orderRepository.createOrderProducts.mockResolvedValue([]);
    orderRepository.findById.mockResolvedValue(fakeOrder({ id: 'order-new' }));

    await createOrder(
      {
        store_id: 'store-1',
        products: [{ product_id: 'product-1', quantity: 2 }],
        delivery_address: 'Dekat toko',
        delivery_latitude: -6.8955,
        delivery_longitude: 107.6185,
        shipping_cost: 999999, // harus diabaikan
      },
      'buyer-1',
    );

    const created = orderRepository.create.mock.calls[0][0];
    expect(created.shipping_cost).toBe(8000);
    expect(created.packaging_fee).toBe(2000);
    expect(created.total_price).toBe(40000 + 8000 + 2000);
  });
});
