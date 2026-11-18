import { v4 as uuidv4 } from 'uuid';

export default {
  async up(queryInterface, Sequelize) {
    const sellers = await queryInterface.sequelize.query(
      `SELECT u.id, u.username 
       FROM "Users" u
       JOIN "user_roles" ur ON u.id = ur.user_id
       JOIN "Roles" r ON ur.role_id = r.id
       WHERE r.name = 'seller'`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    if (sellers.length === 0) return;

    const storeNames = ['Ayam Geprek Sambal Petir', 'Kopi Kenangan Senja'];

    const stores = sellers.map((seller, index) => ({
      id: uuidv4(),
      user_id: seller.id,
      name: storeNames[index] || `${seller.username}'s Store`,
      description:
        index === 0
          ? 'Ayam geprek super pedas dengan resep rahasia. Transfer ke BCA 1234567890 a/n Toko GoHaur'
          : 'Kopi susu gula aren premium. Transfer ke BCA 0987654321 a/n Kopi Kenangan Senja',
      address:
        index === 0
          ? 'Jl. Raya Pancuh No. 21, Bandung, Jawa Barat'
          : 'Jl. Dipatiukur No. 20, Bandung, Jawa Barat',
      latitude: index === 0 ? -6.895 : -6.9,
      longitude: index === 0 ? 107.618 : 107.62,
      created_at: new Date(),
    }));

    await queryInterface.bulkInsert('Stores', stores, {});

    // Store store IDs for future seeders
    await queryInterface.sequelize.query(
      `CREATE TABLE IF NOT EXISTS "temp_store_ids" (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        user_id UUID NOT NULL
      );`,
    );

    for (const store of stores) {
      await queryInterface.sequelize.query(
        `INSERT INTO "temp_store_ids" (id, name, user_id) VALUES (?, ?, ?)`,
        { replacements: [store.id, store.name, store.user_id] },
      );
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Stores', null, {});
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS "temp_store_ids";');
  },
};
