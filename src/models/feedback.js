import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Feedback extends Model {
    static associate(models) {
      // Define associations
      Feedback.belongsTo(models.Store, { foreignKey: 'store_id' });
      Feedback.belongsTo(models.Order, { foreignKey: 'order_id' });
      Feedback.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  Feedback.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    store_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'stores',
        key: 'id'
      }
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      },
      unique: true // One feedback per order
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Feedback',
    tableName: 'feedbacks',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return Feedback;
};
