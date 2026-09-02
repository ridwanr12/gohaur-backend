import { v4 as uuidv4 } from 'uuid';

export default {
  async up(queryInterface, Sequelize) {
    const stores = await queryInterface.sequelize.query(
      'SELECT id FROM "temp_store_ids";',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (stores.length === 0) {
      console.log('No stores found, skipping product creation');
      return;
    }

    const products = [];
    
    stores.forEach(store => {
      products.push(
        {
          id: uuidv4(),
          store_id: store.id,
          name: 'Nasi Goreng Special',
          description: 'Indonesian fried rice with chicken, shrimp, and vegetables',
          price: 25000,
          stock: 50,
          images: JSON.stringify([
            'nasi_goreng_1.jpg',
            'nasi_goreng_2.jpg'
          ]),
          created_at: new Date()
        },
        {
          id: uuidv4(),
          store_id: store.id,
          name: 'Mie Ayam Bakso',
          description: 'Chicken noodles with meatballs and fresh vegetables',
          price: 30000,
          stock: 40,
          images: JSON.stringify([
            'mie_ayam_1.jpg',
            'mie_ayam_2.jpg'
          ]),
          created_at: new Date()
        },
        {
          id: uuidv4(),
          store_id: store.id,
          name: 'Sate Ayam',
          description: 'Grilled chicken satay with peanut sauce, served with rice cake',
          price: 35000,
          stock: 35,
          images: JSON.stringify([
            'sate_ayam_1.jpg',
            'sate_ayam_2.jpg'
          ]),
          created_at: new Date()
        }
      );
    });

    await queryInterface.bulkInsert('Products', products, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Products', null, {});
  }
};