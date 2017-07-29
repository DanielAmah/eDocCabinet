
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    host: process.env.HOST,
    port: 5432,
    dialect: 'postgres'

  },
  test: {
    username: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.TESTDATABASE,
    host: process.env.HOST,
    port: 5432,
    dialect: 'postgres'
  },
  production: {
    use_env_variable: process.env.DATABASE_URL,
    dialect: 'postgres'
  }
};
