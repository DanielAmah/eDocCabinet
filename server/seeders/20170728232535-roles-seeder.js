

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
    return queryInterface.bulkInsert('Roles', [{
      title: 'administrator',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'editor',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'subscriber',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    ], {});
  },

};
