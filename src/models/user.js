import { Model, DataTypes } from 'sequelize';

export default sequelize => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Store, { foreignKey: 'user_id' });
      User.belongsToMany(models.Role, {
        through: models.UserRole,
        foreignKey: 'user_id',
        otherKey: 'role_id',
        timestamps: false,
      });
      User.hasMany(models.Order, {
        foreignKey: 'user_id',
        as: 'buyerOrders',
      });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 255],
        },
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [8, 255],
        },
      },
      phone: {
        type: DataTypes.STRING,
        validate: {
          is: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
        },
      },
      location: {
        type: DataTypes.TEXT,
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 7),
      },
      longitude: {
        type: DataTypes.DECIMAL(10, 7),
      },
      bank_name: {
        type: DataTypes.STRING(100),
      },
      bank_account_number: {
        type: DataTypes.STRING(50),
      },
      bank_account_holder: {
        type: DataTypes.STRING(150),
      },
      bank_account: {
        type: DataTypes.STRING(120),
      },
    },
    {
      sequelize,
      modelName: 'User',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    },
  );

  return User;
};
