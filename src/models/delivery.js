import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Delivery extends Model {
    static associate(models) {
      Delivery.belongsTo(models.Order, { foreignKey: 'order_id' });
      Delivery.belongsTo(models.User, { 
        foreignKey: 'courier_id',
        as: 'courier'
      });
    }
  }

  Delivery.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'Orders',
        key: 'id'
      }
    },
    courier_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('order_received', 'out_for_delivery', 'completed'),
      defaultValue: 'order_received'
    }
  }, {
    sequelize,
    modelName: 'Delivery',
    timestamps: true,
    createdAt: false,
    updatedAt: 'updated_at'
  });

  return Delivery;
};