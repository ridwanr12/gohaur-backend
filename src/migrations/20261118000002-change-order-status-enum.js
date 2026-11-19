/**
 * Ubah status order:
 *   approved          -> accepted
 *   out_for_delivery  -> shipped
 *   canceled          -> rejected
 *
 * Alasan: kurir dihapus, pengiriman dilakukan seller, dan status dibuat
 * lebih jelas untuk kebutuhan skripsi.
 */
export default {
  async up(queryInterface) {
    const q = sql => queryInterface.sequelize.query(sql);

    await q('ALTER TABLE "Orders" ALTER COLUMN status DROP DEFAULT;');
    await q('ALTER TYPE "enum_Orders_status" RENAME TO "enum_Orders_status_old";');
    await q(`CREATE TYPE "enum_Orders_status" AS ENUM (
      'pending', 'accepted', 'rejected', 'shipped', 'completed'
    );`);
    await q(`ALTER TABLE "Orders"
      ALTER COLUMN status TYPE "enum_Orders_status"
      USING (
        CASE status::text
          WHEN 'approved' THEN 'accepted'
          WHEN 'out_for_delivery' THEN 'shipped'
          WHEN 'canceled' THEN 'rejected'
          ELSE status::text
        END
      )::"enum_Orders_status";`);
    await q(`ALTER TABLE "Orders" ALTER COLUMN status SET DEFAULT 'pending';`);
    await q('DROP TYPE "enum_Orders_status_old";');
  },

  async down(queryInterface) {
    const q = sql => queryInterface.sequelize.query(sql);

    await q('ALTER TABLE "Orders" ALTER COLUMN status DROP DEFAULT;');
    await q('ALTER TYPE "enum_Orders_status" RENAME TO "enum_Orders_status_new";');
    await q(`CREATE TYPE "enum_Orders_status" AS ENUM (
      'pending', 'approved', 'out_for_delivery', 'completed', 'canceled'
    );`);
    await q(`ALTER TABLE "Orders"
      ALTER COLUMN status TYPE "enum_Orders_status"
      USING (
        CASE status::text
          WHEN 'accepted' THEN 'approved'
          WHEN 'shipped' THEN 'out_for_delivery'
          WHEN 'rejected' THEN 'canceled'
          ELSE status::text
        END
      )::"enum_Orders_status";`);
    await q(`ALTER TABLE "Orders" ALTER COLUMN status SET DEFAULT 'pending';`);
    await q('DROP TYPE "enum_Orders_status_new";');
  },
};
