export default {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    // Rekening toko: satu kolom gabungan + nama pemilik
    await queryInterface.addColumn('Stores', 'bank_account', {
      type: DataTypes.STRING(120),
      allowNull: true,
    });
    await queryInterface.addColumn('Stores', 'bank_account_holder', {
      type: DataTypes.STRING(150),
      allowNull: true,
    });

    // Rekening buyer: gabungan bank + nomor rekening
    await queryInterface.addColumn('Users', 'bank_account', {
      type: DataTypes.STRING(120),
      allowNull: true,
    });

    // Backfill dari kolom lama supaya data lama tidak hilang
    await queryInterface.sequelize.query(`
      UPDATE "Users"
      SET bank_account = TRIM(CONCAT(COALESCE(bank_name, ''), ' ', COALESCE(bank_account_number, '')))
      WHERE bank_account IS NULL
        AND (bank_name IS NOT NULL OR bank_account_number IS NOT NULL);
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Users', 'bank_account');
    await queryInterface.removeColumn('Stores', 'bank_account_holder');
    await queryInterface.removeColumn('Stores', 'bank_account');
  },
};
