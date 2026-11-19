import { Model, DataTypes } from 'sequelize';

export default sequelize => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.User, { foreignKey: 'user_id' });
      Notification.belongsTo(models.Order, { foreignKey: 'order_id' });
    }
  }

  Notification.init(
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
      order_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Orders',
          key: 'id',
        },
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Notification',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    },
  );

  return Notification;
};
