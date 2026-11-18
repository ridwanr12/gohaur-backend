export default {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    // Lokasi + foto toko
    await queryInterface.addColumn('Stores', 'image', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('Stores', 'address', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('Stores', 'latitude', {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    });
    await queryInterface.addColumn('Stores', 'longitude', {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    });

    // Titik lokasi buyer (alamat teks sudah ada di kolom location)
    await queryInterface.addColumn('Users', 'latitude', {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'longitude', {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    });

    // Snapshot alamat + jarak + info pengirim manual (courier digantikan seller)
    await queryInterface.addColumn('Orders', 'delivery_address', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('Orders', 'delivery_latitude', {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    });
    await queryInterface.addColumn('Orders', 'delivery_longitude', {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    });
    await queryInterface.addColumn('Orders', 'distance_km', {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('Orders', 'packaging_fee', {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 2000,
    });
    await queryInterface.addColumn('Orders', 'courier_name', {
      type: DataTypes.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('Orders', 'courier_plate', {
      type: DataTypes.STRING(50),
      allowNull: true,
    });
    await queryInterface.addColumn('Orders', 'rejection_reason', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('Orders', 'accepted_at', {
      type: DataTypes.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Orders', 'shipped_at', {
      type: DataTypes.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Orders', 'completed_at', {
      type: DataTypes.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Orders', 'rejected_at', {
      type: DataTypes.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Orders', 'rejected_at');
    await queryInterface.removeColumn('Orders', 'completed_at');
    await queryInterface.removeColumn('Orders', 'shipped_at');
    await queryInterface.removeColumn('Orders', 'accepted_at');
    await queryInterface.removeColumn('Orders', 'rejection_reason');
    await queryInterface.removeColumn('Orders', 'courier_plate');
    await queryInterface.removeColumn('Orders', 'courier_name');
    await queryInterface.removeColumn('Orders', 'packaging_fee');
    await queryInterface.removeColumn('Orders', 'distance_km');
    await queryInterface.removeColumn('Orders', 'delivery_longitude');
    await queryInterface.removeColumn('Orders', 'delivery_latitude');
    await queryInterface.removeColumn('Orders', 'delivery_address');

    await queryInterface.removeColumn('Users', 'longitude');
    await queryInterface.removeColumn('Users', 'latitude');

    await queryInterface.removeColumn('Stores', 'longitude');
    await queryInterface.removeColumn('Stores', 'latitude');
    await queryInterface.removeColumn('Stores', 'address');
    await queryInterface.removeColumn('Stores', 'image');
  },
};
