import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { 
        foreignKey: 'user_id',
        as: 'buyer'
      });
      Order.belongsTo(models.User, { 
        foreignKey: 'courier_id',
        as: 'courier'
      });
      Order.belongsTo(models.Store, { foreignKey: 'store_id' });
      Order.belongsToMany(models.Product, { 
        through: models.OrderProduct,
        foreignKey: 'order_id',
        otherKey: 'product_id',
        timestamps: false
      });
      Order.hasOne(models.Delivery, { foreignKey: 'order_id' });
    }
  }

  Order.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    store_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Stores',
        key: 'id'
      }
    },
    courier_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'out_for_delivery', 'completed', 'canceled'),
      defaultValue: 'pending'
    },
    payment_proof: {
      type: DataTypes.TEXT
    },
    shipping_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    }
  }, {
    sequelize,
    modelName: 'Order',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return Order;
};