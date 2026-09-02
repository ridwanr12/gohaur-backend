import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Role extends Model {
    static associate(models) {
      Role.belongsToMany(models.User, {
        through: 'user_roles',
        foreignKey: 'role_id',
        otherKey: 'user_id'
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