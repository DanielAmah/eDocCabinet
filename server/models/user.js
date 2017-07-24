/**
   * Defines users model
   * @param {object} sequelize
   * @param {object} DataTypes
   * @return {object} - returns instance of the model
   */
module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'This email already exists'
      },
      validate: {
        isEmail: {
          args: true,
          msg: 'This email address is invalid'
        }
      }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'This username already exists'
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    roleId: {
      type: DataTypes.INTEGER,
      defaultValue: 2,
      references: {
        model: 'Roles',
        key: 'id',
        as: 'roleId',
      },
    },
  });
  Users.associate = (models) => {
    Users.belongsTo(models.Roles, {
      foreignKey: 'roleId'
    });
    Users.hasMany(models.Documents, {
      foreignKey: 'userId',
      as: 'myDocuments',
    });
  };


  return Users;
};
