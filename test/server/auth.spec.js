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
     it('responds with a 200 to a valid login request', (done) => {
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
        expect(res.body.message).to.equals('Login Successful. Token generated. Welcome back!! daniel');
        done();
      });
    });
  });
       it('responds with message - password incorrect', (done) => {
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
        it('responds with a 200 to a valid login request', (done) => {
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
        username: 'paul',
        password: '',
      })
      .expect(200)
      .end((err, res) => {
          console.log(res.body);
        expect(res.body.message).to.equals('User not found');
        done();
      });
    });
  });
})