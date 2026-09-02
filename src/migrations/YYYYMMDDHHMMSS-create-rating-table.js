export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('ratings', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    store_id: {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'Stores',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    average_rating: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    amount: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('ratings');
}