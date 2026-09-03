import { v4 as uuidv4 } from 'uuid';

export default {
  async up(queryInterface, Sequelize) {
    const stores = await queryInterface.sequelize.query(
      'SELECT id, name FROM "temp_store_ids";',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (stores.length === 0) return;

    const products = [];
    
    stores.forEach(store => {
      if (store.name === 'Ayam Geprek Sambal Petir') {
        products.push(
          {
            id: uuidv4(), store_id: store.id,
            name: 'Paket Geprek Nasi', description: 'Nasi putih hangat dengan ayam geprek sambal bawang super pedas',
            price: 20000, stock: 100, images: JSON.stringify(['https://via.placeholder.com/300?text=Ayam+Geprek']), created_at: new Date()
          },
          {
            id: uuidv4(), store_id: store.id,
            name: 'Indomie Geprek', description: 'Indomie goreng dengan topping ayam geprek cincang',
            price: 22000, stock: 50, images: JSON.stringify(['https://via.placeholder.com/300?text=Indomie+Geprek']), created_at: new Date()
          },
          {
            id: uuidv4(), store_id: store.id,
            name: 'Es Teh Manis', description: 'Es teh manis segar ukuran jumbo',
            price: 5000, stock: 200, images: JSON.stringify(['https://via.placeholder.com/300?text=Es+Teh']), created_at: new Date()
          }
        );
      } else if (store.name === 'Kopi Kenangan Senja') {
        products.push(
          {
            id: uuidv4(), store_id: store.id,
            name: 'Kopi Susu Gula Aren', description: 'Kopi susu hits dengan legitnya gula aren asli',
            price: 18000, stock: 150, images: JSON.stringify(['https://via.placeholder.com/300?text=Kopi+Susu']), created_at: new Date()
          },
          {
            id: uuidv4(), store_id: store.id,
            name: 'Matcha Latte', description: 'Teh hijau matcha jepang dengan susu segar',
            price: 24000, stock: 80, images: JSON.stringify(['https://via.placeholder.com/300?text=Matcha']), created_at: new Date()
          }
        );
      } else {
         products.push(
          {
            id: uuidv4(), store_id: store.id,
            name: 'Nasi Goreng Special', description: 'Indonesian fried rice with chicken, shrimp, and vegetables',
            price: 25000, stock: 50, images: JSON.stringify(['nasi_goreng_1.jpg']), created_at: new Date()
          }
         );
      }
    });

    await queryInterface.bulkInsert('Products', products, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Products', null, {});
  }
};