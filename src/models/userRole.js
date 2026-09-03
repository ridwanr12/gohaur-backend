import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class UserRole extends Model {
    static associate(models) {
      // Through table associations are handled in User and Role models
    }
  }

  UserRole.init({
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
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Roles',
        key: 'id'
      }
    },
    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'UserRole',
    tableName: 'user_roles',
    timestamps: false
  });

  return UserRole;
};
