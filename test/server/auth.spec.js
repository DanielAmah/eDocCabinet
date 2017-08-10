import chai, { expect } from 'chai';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const User = require('../../server/models').Users;
const Document = require('../../server/models').Documents;
const Role = require('../../server/models').Roles;
const request = require('supertest');
const assert = require('chai').assert;
require('babel-register');
const app = require('../../build/server');

let token;

describe('Auth Controller ', () => {
  beforeEach((done) => {
    Role.destroy({
      where: {},
      truncate: true,
      cascade: true,
      restartIdentity: true
    }).then((error) => {
      if (!error) {
        Document
          .destroy({
            where: {},
            truncate: true,
            cascade: true,
            restartIdentity: true
          })
          .then((err) => {
            if (!err) {
              User.destroy({
                where: {},
                truncate: true,
                cascade: true,
                restartIdentity: true
              }).then((err) => {
                if (!err) {
                  Role.bulkCreate([
                    {
                      title: 'administrator'
                    },
                    {
                      title: 'editor'
                    },
                    {
                      title: 'subcriber'
                    }
                  ]).then((err) => {
                    if (!err) {
                    }
                    done();
                  });
                }
              });
            }
          });
      }
    });
  });
   it('should give a status code of 200 for a successful login', (done) => {
    const password = bcrypt.hashSync('admin', bcrypt.genSaltSync(10));
    User.create({
      email: 'admin@admin.com',
      username: 'admin',
      password: password,
      roleId: 1
    }).then((res) => {
      request(app)
      .post('/api/v1/users/login')
      .send({
        username: 'admin',
        password: 'admin',
      })
      .expect(200)
      .end((err, res) => {
          console.log(res.body);
        expect(res.status).to.equals(200);
        done();
      });
    });
  });
    it('should display password incorrect if wrong password was used', (done) => {
    const password = bcrypt.hashSync('admin', bcrypt.genSaltSync(10));
    User.create({
      email: 'admin@admin.com',
      username: 'admin',
      password: password,
      roleId: 1
    }).then((res) => {
      request(app)
      .post('/api/v1/users/login')
      .send({
        username: 'admin',
        password: 'jack',
      })
      .expect(200)
      .end((err, res) => {
          console.log(res.body);
        expect(res.body.message).to.equals('Password is incorrect');
        done();
      });
    });
  });
      
    it('should have a token for the user that are logged in', (done) => {
    const password = bcrypt.hashSync('jack', bcrypt.genSaltSync(10));
    User.create({
      email: 'daniel@daniel.com',
      username: 'daniel',
      password: password,
      roleId: 3
    }).then((res) => {
      request(app)
      .post('/api/v1/users/login')
      .send({
        username: 'daniel',
        password: 'jack',
      })
      .expect(200)
      .end((err, res) => {
          console.log(res.body);
        expect(res.body.token).to.exist;
        done();
      });
    });
  });

 it('should return User not found if no user in the database', (done) => {
    const password = bcrypt.hashSync('jack', bcrypt.genSaltSync(10));
      request(app)
      .post('/api/v1/users/login')
      .send({
        username: 'daniel',
        password: 'jack',
      })
      .expect(200)
      .end((err, res) => {
          console.log(res.body);
        expect(res.body.message).to.equal('User not found');
        done();
      });
  });
});
