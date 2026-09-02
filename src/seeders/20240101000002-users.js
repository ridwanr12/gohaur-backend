import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export default {
  async up(queryInterface, Sequelize) {
    // Get role IDs from temp table
    const roleIds = await queryInterface.sequelize.query(
      'SELECT name, id FROM "temp_role_ids";',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const roleIdMap = roleIds.reduce((acc, role) => {
      acc[role.name] = role.id;
      return acc;
    }, {});

    // Create test users
    const users = [
      {
        id: uuidv4(),
        username: 'admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        phone: '+6281234567890',
        location: 'Jakarta, Indonesia',
        created_at: new Date()
      },
      {
        id: uuidv4(),
        username: 'seller1',
        email: 'seller@example.com',
        password: await bcrypt.hash('seller123', 10),
        phone: '+6281234567891',
        location: 'Bandung, Indonesia',
        created_at: new Date()
      },
      {
        id: uuidv4(),
        username: 'buyer1',
        email: 'buyer@example.com',
        password: await bcrypt.hash('buyer123', 10),
        phone: '+6281234567892',
        location: 'Surabaya, Indonesia',
        created_at: new Date()
      },
      {
        id: uuidv4(),
        username: 'courier1',
        email: 'courier@example.com',
        password: await bcrypt.hash('courier123', 10),
        phone: '+6281234567893',
        location: 'Medan, Indonesia',
        created_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('Users', users, {});

    // Assign roles to users
    const userRoles = [
      {
        id: uuidv4(),
        user_id: users[0].id,
        role_id: roleIdMap.admin,
        assigned_at: new Date()
      },
      {
        id: uuidv4(),
        user_id: users[1].id,
        role_id: roleIdMap.seller,
        assigned_at: new Date()
      },
      {
        id: uuidv4(),
        user_id: users[2].id,
        role_id: roleIdMap.buyer,
        assigned_at: new Date()
      },
      {
        id: uuidv4(),
        user_id: users[3].id,
        role_id: roleIdMap.courier,
        assigned_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('user_roles', userRoles, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_roles', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};