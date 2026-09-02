import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Store, { foreignKey: 'store_id' });
      Product.belongsToMany(models.Order, { 
        through: 'order_products',
        foreignKey: 'product_id',
        otherKey: 'order_id'
      });
    }
  }

  Product.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    store_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Stores',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 255]
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    images: {
      type: DataTypes.JSON,
      defaultValue: []
    }
  }, {
    sequelize,
    modelName: 'Product',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return Product;
};