import { v4 as uuidv4 } from 'uuid';

export default {
  async up(queryInterface, Sequelize) {
    const roles = ['buyer', 'seller', 'courier', 'admin'].map(role => ({
      id: uuidv4(),
      name: role
    }));

    await queryInterface.bulkInsert('Roles', roles, {});

    // Store role IDs in a table variable for reference in other seeders
    await queryInterface.sequelize.query(
      `CREATE TABLE IF NOT EXISTS "temp_role_ids" (
        name VARCHAR(255) PRIMARY KEY,
        id UUID NOT NULL
      );`
    );

    for (const role of roles) {
      await queryInterface.sequelize.query(
        `INSERT INTO "temp_role_ids" (name, id) VALUES (?, ?)`,
        {
          replacements: [role.name, role.id]
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', null, {});
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS "temp_role_ids";');
  }
};