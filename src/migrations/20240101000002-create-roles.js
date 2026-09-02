export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Roles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.ENUM('buyer', 'seller', 'courier', 'admin'),
        allowNull: false,
        unique: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Roles');
  }
};