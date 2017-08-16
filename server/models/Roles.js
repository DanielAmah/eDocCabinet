/**
   * Defines user model
   * @param {object} sequelize
   * @param {object} DataTypes
   * @return {object} - returns instance of the model
   */
export default (sequelize, DataTypes) => {
  const Roles = sequelize.define('Roles', {
    title: {
      type: DataTypes.STRING,
      unique: false,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  });
  Roles.associate = (models) => {
    Roles.hasMany(models.Users, {
      foreignKey: 'roleId',
      as: 'users',
    });
  };
  return Roles;
};
