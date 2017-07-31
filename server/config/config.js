module.exports = {
  development: {
    username: 'postgres',
    password: 'postgres',
    database: 'apitest',
    host: '127.0.0.1',
    dialect: 'postgres',
    logging: false
  },
  test: {
    use_env_variable: 'TEST_URL',
    dialect: 'postgres'
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres'
  }
};
