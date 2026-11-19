export default {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    // Rekening refund buyer (diisi sekali di profil)
    await queryInterface.addColumn('Users', 'bank_name', {
      type: DataTypes.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'bank_account_number', {
      type: DataTypes.STRING(50),
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'bank_account_holder', {
      type: DataTypes.STRING(150),
      allowNull: true,
    });

    // Status refund manual (app tidak memegang dana)
    await queryInterface.addColumn('Orders', 'refund_status', {
      type: DataTypes.ENUM('not_required', 'pending', 'refunded'),
      allowNull: false,
      defaultValue: 'not_required',
    });
    await queryInterface.addColumn('Orders', 'refunded_at', {
      type: DataTypes.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Orders', 'refund_note', {
      type: DataTypes.TEXT,
      allowNull: true,
    });

    // Notifikasi in-app
    await queryInterface.createTable('Notifications', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      order_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Orders',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    await queryInterface.addIndex('Notifications', ['user_id', 'is_read']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Notifications');

    await queryInterface.removeColumn('Orders', 'refund_note');
    await queryInterface.removeColumn('Orders', 'refunded_at');
    await queryInterface.removeColumn('Orders', 'refund_status');

    await queryInterface.removeColumn('Users', 'bank_account_holder');
    await queryInterface.removeColumn('Users', 'bank_account_number');
    await queryInterface.removeColumn('Users', 'bank_name');
  },
};
