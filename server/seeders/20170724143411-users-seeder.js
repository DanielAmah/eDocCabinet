module.exports = {
  up(queryInterface) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    return queryInterface.bulkInsert('Users', [{
      email: 'admin@admin.com',
      username: 'danielamah',
      password: 'edoccabinet',
      roleId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },
};
