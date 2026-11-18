const EARTH_RADIUS_KM = 6371;

/**
 * Jarak garis lurus antara dua titik di permukaan bumi (Haversine).
 *
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} jarak dalam kilometer
 */
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = value => (Number(value) * Math.PI) / 180;

  const dLat = toRad(lat2) - toRad(lat1);
  const dLon = toRad(lon2) - toRad(lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Batas maksimum jarak pengiriman (km). */
export const MAX_DELIVERY_DISTANCE_KM = 5;

/** Biaya pengemasan tetap per pesanan. */
export const PACKAGING_FEE = 2000;

/**
 * Tarif ongkir per rentang jarak. Batas atas bersifat eksklusif
 * (contoh: 1 km tepat masuk tarif 1-2 km).
 */
export const SHIPPING_TIERS = [
  { maxKm: 1, cost: 8000 },
  { maxKm: 2, cost: 10000 },
  { maxKm: 3, cost: 12500 },
  { maxKm: 4, cost: 15000 },
  { maxKm: 5, cost: 18000 },
];

/** Bulatkan jarak ke 2 desimal supaya batas tier konsisten dengan yang ditampilkan. */
export function roundDistanceKm(value) {
  return Math.round(Number(value) * 100) / 100;
}

/**
 * @param {number} distanceKm
 * @returns {number|null} ongkir, atau null kalau di luar jangkauan
 */
export function getShippingCost(distanceKm) {
  const km = roundDistanceKm(distanceKm);
  const tier = SHIPPING_TIERS.find(item => km < item.maxKm);
  return tier ? tier.cost : null;
}
