/**
   * Defines user model
   * @param {object} sequelize - use sequelize.define to
   * define the Roles schema
   * @param {object} DataTypes - shows the type of data
   * for each field.
   * @return {object} - returns instance of the Roles model
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
      as: 'users'
    });
  };
  return Roles;
};
