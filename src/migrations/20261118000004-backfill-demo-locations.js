/**
 * Isi koordinat untuk data demo lama yang belum punya lokasi.
 *
 * Tanpa ini, toko lama tidak bisa menerima pesanan karena validasi jarak
 * membutuhkan titik toko dan titik buyer.
 */
export default {
  async up(queryInterface) {
    const q = sql => queryInterface.sequelize.query(sql);

    // Toko demo di Bandung
    await q(`UPDATE "Stores"
      SET latitude = -6.8950000, longitude = 107.6180000,
          address = COALESCE(address, 'Jl. Raya Pancuh No. 21, Bandung, Jawa Barat')
      WHERE latitude IS NULL OR longitude IS NULL;`);

    // Buyer demo
    await q(`UPDATE "Users"
      SET latitude = -6.8930000, longitude = 107.6160000,
          location = COALESCE(location, 'Jl. Dipatiukur No. 20, Bandung')
      WHERE email = 'buyer@example.com'
        AND (latitude IS NULL OR longitude IS NULL);`);
  },

  async down() {
    // Data demo tidak dikembalikan ke NULL; tidak ada efek samping kalau dibiarkan.
  },
};
