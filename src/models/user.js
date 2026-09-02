import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Store, { foreignKey: 'user_id' });
      User.belongsToMany(models.Role, { 
        through: 'user_roles',
        foreignKey: 'user_id',
        otherKey: 'role_id'
      });
      User.hasMany(models.Order, { 
        foreignKey: 'user_id',
        as: 'buyerOrders'
      });
      User.hasMany(models.Order, { 
        foreignKey: 'courier_id',
        as: 'courierOrders'
      });
      User.hasMany(models.Delivery, { 
        foreignKey: 'courier_id',
        as: 'deliveries'
      });
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 255]
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [8, 255]
      }
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        is: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/
      }
    },
    location: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return User;
};