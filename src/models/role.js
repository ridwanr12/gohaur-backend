import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Role extends Model {
    static associate(models) {
      Role.belongsToMany(models.User, {
        through: models.UserRole,
        foreignKey: 'role_id',
        otherKey: 'user_id',
        timestamps: false
      });
    }
  }

  Role.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.ENUM('buyer', 'seller', 'courier', 'admin'),
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Role',
    timestamps: false
  });

  return Role;
};