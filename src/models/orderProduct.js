import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class OrderProduct extends Model {
    static associate(models) {
      // Through table associations are handled in Order and Product models
    }
  }

  OrderProduct.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    note: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'OrderProduct',
    tableName: 'order_products',
    timestamps: false
  });

  return OrderProduct;
};