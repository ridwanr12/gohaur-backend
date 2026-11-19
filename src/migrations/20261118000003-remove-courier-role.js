/**
 * Hapus role dan akun courier.
 *
 * Pengiriman sekarang dilakukan seller sendiri, jadi role courier tidak dipakai.
 * Tabel "Deliveries" dan kolom Orders.courier_id sengaja TIDAK dihapus agar
 * riwayat lama tidak hilang. Kode yang memakainya dihapus terpisah.
 */
export default {
  async up(queryInterface) {
    const q = sql => queryInterface.sequelize.query(sql);

    // Kumpulkan user yang punya role courier
    await q(`CREATE TEMP TABLE courier_users AS
      SELECT ur.user_id
      FROM user_roles ur
      JOIN "Roles" r ON r.id = ur.role_id
      WHERE r.name = 'courier';`);

    // Lepaskan referensi agar foreign key tidak menghalangi
    await q(`DELETE FROM "Deliveries"
      WHERE courier_id IN (SELECT user_id FROM courier_users);`);
    await q(`UPDATE "Orders" SET courier_id = NULL
      WHERE courier_id IN (SELECT user_id FROM courier_users);`);

    // Hapus pemetaan role courier
    await q(`DELETE FROM user_roles
      WHERE role_id = (SELECT id FROM "Roles" WHERE name = 'courier');`);

    // Hapus akun courier hanya kalau tidak punya order sebagai buyer
    // dan tidak punya role lain.
    await q(`DELETE FROM "Users" u
      WHERE u.id IN (SELECT user_id FROM courier_users)
        AND NOT EXISTS (SELECT 1 FROM "Orders" o WHERE o.user_id = u.id)
        AND NOT EXISTS (SELECT 1 FROM user_roles ur2 WHERE ur2.user_id = u.id);`);

    // Hapus role courier
    await q(`DELETE FROM "Roles" WHERE name = 'courier';`);
    await q('DROP TABLE courier_users;');
  },

  async down(queryInterface, Sequelize) {
    // Tidak bisa mengembalikan akun yang sudah dihapus.
    await queryInterface.bulkInsert(
      'Roles',
      [
        {
          id: '00000000-0000-4000-8000-00000000c001',
          name: 'courier',
        },
      ],
      {},
    );
  },
};
