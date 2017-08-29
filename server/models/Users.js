/**
   * Defines Users model
   * @param {object} sequelize - use sequelize.define to
   * define the User schema
   * @param {object} DataTypes - show the type of data for
   * each field
   * @return {object} - returns instance of the Users model
   */
export default (sequelize, DataTypes) => {
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
        },
        len: [5, 200]
      }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'This username already exists'
      },
      validate: {
        len: [5, 100]
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      },
      len: [5, 100]
    },
    roleId: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      references: {
        model: 'Roles',
        key: 'id',
        as: 'roleId'
      }
    }
  });
  Users.associate = (models) => {
    Users.belongsTo(models.Roles, {
      foreignKey: 'roleId'
    });
    Users.hasMany(models.Documents, {
      foreignKey: 'userId',
      as: 'myDocuments'
    });
  };

  return Users;
};
