/**
   * Defines Document model
   * @param {object} sequelize
   * @param {object} DataTypes
   * @return {object} - returns instance of the model
   */
export default (sequelize, DataTypes) => {
  const Documents = sequelize.define('Documents', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    access: {
      defaultValue: 'public',
      type: DataTypes.ENUM('public', 'private', 'role')
    },
    owner: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  Documents.associate = (models) => {
    Documents.belongsTo(models.Users, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    });
  };
  return Documents;
};
