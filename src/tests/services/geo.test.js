import { jest } from '@jest/globals';
import { haversineDistanceKm, getShippingCost, MAX_DELIVERY_DISTANCE_KM } from '../../utils/geo.js';

describe('haversineDistanceKm', () => {
  it('mengembalikan 0 untuk titik yang sama', () => {
    expect(haversineDistanceKm(-6.895, 107.618, -6.895, 107.618)).toBeCloseTo(0, 5);
  });

  it('menghitung jarak Bandung - Jakarta sekitar 120 km', () => {
    const distance = haversineDistanceKm(-6.9175, 107.6191, -6.2088, 106.8456);
    expect(distance).toBeGreaterThan(100);
    expect(distance).toBeLessThan(140);
  });

  it('simetris untuk dua titik', () => {
    const a = haversineDistanceKm(-6.895, 107.618, -6.9, 107.62);
    const b = haversineDistanceKm(-6.9, 107.62, -6.895, 107.618);
    expect(a).toBeCloseTo(b, 10);
  });
});

describe('getShippingCost', () => {
  it.each([
    [0, 8000],
    [0.99, 8000],
    [1, 10000],
    [1.99, 10000],
    [2, 12500],
    [3, 15000],
    [4, 18000],
    [4.99, 18000],
  ])('jarak %s km -> Rp %s', (distance, expected) => {
    expect(getShippingCost(distance)).toBe(expected);
  });

  it('menolak jarak tepat 5 km ke atas', () => {
    expect(getShippingCost(MAX_DELIVERY_DISTANCE_KM)).toBeNull();
    expect(getShippingCost(5.1)).toBeNull();
  });
});
