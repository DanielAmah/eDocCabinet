import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';

const basename = path.basename(module.filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../../server/config/config.js')[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize('postgres://fwtmfhbj:vimJyjFmuKa0U3MsemOGr-_n1MjkDTlp@pellefant.db.elephantsql.com:5432/fwtmfhbj', {
    dialect: 'postgres'
  });
} else {
  sequelize = new Sequelize('postgres://fwtmfhbj:vimJyjFmuKa0U3MsemOGr-_n1MjkDTlp@pellefant.db.elephantsql.com:5432/fwtmfhbj', {
    dialect: 'postgres'
  }
  );
}

fs
  .readdirSync(__dirname)
  .filter(file =>
    (file.indexOf('.') !== 0) &&
    (file !== basename) &&
    (file.slice(-3) === '.js'))
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
