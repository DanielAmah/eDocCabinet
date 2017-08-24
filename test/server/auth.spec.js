/* eslint-disable no-unused-expressions */
import supertest from 'supertest';
import { expect } from 'chai';
import { TestHelper, defaultPassword } from '../TestHelper';
import models from '../../server/models';

const app = require('../../build/server');

const request = supertest.agent(app);

const adminUser = TestHelper.specUser1;
const subscriberUser = TestHelper.specUser3;
const specWrongUser = TestHelper.specWrongUser;

describe('Authentication Controller', () => {
  beforeEach((done) => {
    models.Roles
      .destroy({
        where: {},
        truncate: true,
        cascade: true,
        restartIdentity: true
      })
      .then((err) => {
        if (!err) {
          models.Documents
            .destroy({
              where: {},
              truncate: true,
              cascade: true,
              restartIdentity: true
            })
            .then((err) => {
              if (!err) {
                models.Users
                  .destroy({
                    where: {},
                    truncate: true,
                    cascade: true,
                    restartIdentity: true
                  })
                  .then((err) => {
                    if (!err) {
                      models.Roles
                        .bulkCreate([
                          TestHelper.adminRole,
                          TestHelper.editorRole,
                          TestHelper.subscriberRole
                        ])
                        .then((err) => {
                          if (!err) {
                            //
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
  describe('Login Endpoint - POST /api/v1/users/login', () => {
    beforeEach((done) => {
      models.Users.bulkCreate([adminUser, subscriberUser]).then(() => {
        done();
      });
    });
    it(
      'should return a message "user not found" if' +
        ' a unknown user tries to login',
      (done) => {
        request
          .post('/api/v1/users/login')
          .send(specWrongUser)
          .end((err, response) => {
            expect(response.status).to.equal(404);
            expect(response.body.message).to.equal('User not found');
            done();
          });
      }
    );
    it('should not log a user in with wrong password', (done) => {
      request
        .post('/api/v1/users/login')
        .send({
          username: adminUser.username,
          password: 'notthepassword'
        })
        .end((err, response) => {
          expect(response.status).to.equal(403);
          expect(response.body.message).to.equal('Password is incorrect');
          done();
        });
    });
    it('should not log a user in without a password', (done) => {
      request
        .post('/api/v1/users/login')
        .send({
          username: adminUser.username,
          password: ''
        })
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body[0].msg).to.equal(
            'Enter a valid password of more than 5 characters'
          );
          done();
        });
    });
    it('should successfully log a user in the right credentials', (done) => {
      request
        .post('/api/v1/users/login')
        .send({
          username: adminUser.username,
          password: defaultPassword
        })
        .end((err, response) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
  });
});
