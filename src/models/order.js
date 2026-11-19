import { Model, DataTypes } from 'sequelize';

export default sequelize => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'buyer',
      });
      Order.belongsTo(models.Store, { foreignKey: 'store_id' });
      Order.belongsToMany(models.Product, {
        through: models.OrderProduct,
        foreignKey: 'order_id',
        otherKey: 'product_id',
        timestamps: false,
      });
      Order.hasMany(models.Notification, { foreignKey: 'order_id' });
    }
  }

  Order.init(
    {
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
      },
      store_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Stores',
          key: 'id',
        },
      },
      courier_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'shipped', 'completed'),
        defaultValue: 'pending',
      },
      payment_proof: {
        type: DataTypes.TEXT,
      },
      delivery_address: {
        type: DataTypes.TEXT,
      },
      delivery_latitude: {
        type: DataTypes.DECIMAL(10, 7),
      },
      delivery_longitude: {
        type: DataTypes.DECIMAL(10, 7),
      },
      distance_km: {
        type: DataTypes.DECIMAL(6, 2),
      },
      packaging_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 2000,
      },
      courier_name: {
        type: DataTypes.STRING(255),
      },
      courier_plate: {
        type: DataTypes.STRING(50),
      },
      rejection_reason: {
        type: DataTypes.TEXT,
      },
      accepted_at: {
        type: DataTypes.DATE,
      },
      shipped_at: {
        type: DataTypes.DATE,
      },
      completed_at: {
        type: DataTypes.DATE,
      },
      rejected_at: {
        type: DataTypes.DATE,
      },
      refund_status: {
        type: DataTypes.ENUM('not_required', 'pending', 'refunded'),
        allowNull: false,
        defaultValue: 'not_required',
      },
      refunded_at: {
        type: DataTypes.DATE,
      },
      refund_note: {
        type: DataTypes.TEXT,
      },
      shipping_cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
    },
    {
      sequelize,
      modelName: 'Order',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    },
  );

  return Order;
};
