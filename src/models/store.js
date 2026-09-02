import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Store extends Model {
    static associate(models) {
      Store.belongsTo(models.User, { foreignKey: 'user_id' });
      Store.hasMany(models.Product, { foreignKey: 'store_id' });
      Store.hasMany(models.Order, { foreignKey: 'store_id' });
      Store.hasOne(models.Rating, { foreignKey: 'store_id' });
    }
  }

  Store.init({
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
    }
  }, {
    sequelize,
    modelName: 'Store',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return Store;
};