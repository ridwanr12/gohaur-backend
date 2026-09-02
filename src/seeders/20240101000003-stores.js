import { v4 as uuidv4 } from 'uuid';

export default {
  async up(queryInterface, Sequelize) {
    // Get seller users by joining with roles
    const sellers = await queryInterface.sequelize.query(
      `SELECT u.id 
       FROM "Users" u
       JOIN "user_roles" ur ON u.id = ur.user_id
       JOIN "Roles" r ON ur.role_id = r.id
       WHERE r.name = 'seller'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (sellers.length === 0) {
      console.log('No sellers found, skipping store creation');
      return;
    }

    const stores = sellers.map(seller => ({
      id: uuidv4(),
      user_id: seller.id,
      name: `${seller.username || 'Seller'}'s Store`,
      description: 'A great store with amazing products',
      created_at: new Date()
    }));

    await queryInterface.bulkInsert('Stores', stores, {});

    // Store store IDs for future seeders
    await queryInterface.sequelize.query(
      `CREATE TABLE IF NOT EXISTS "temp_store_ids" (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL
      );`
    );

    for (const store of stores) {
      await queryInterface.sequelize.query(
        `INSERT INTO "temp_store_ids" (id, user_id) VALUES (?, ?)`,
        {
          replacements: [store.id, store.user_id]
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Stores', null, {});
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS "temp_store_ids";');
  }
};