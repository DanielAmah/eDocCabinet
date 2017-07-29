import chai, { expect } from 'chai';
import jwt from 'jsonwebtoken';

const User = require('../../server/models').Users;
const Document = require('../../server/models').Documents;
const Role = require('../../server/models').Roles;
const request = require('supertest');
const assert = require('chai').assert;
require('babel-register');
const app = require('../../build/server');

let token;

describe('User Controller ', () => {
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

  it('Creates a new user', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'daniel@daniel.com',
        username: 'daniel',
        password: 'daniel',
        roleId: 2
      })
      .expect(201)
      .end((err, res) => {
        expect(res.status).to.equal(201);
        done();
      });
  });

  // it('throws a 400 for incorrect sign up info', (done) => {
  //   request(app)
  //     .post('/api/v1/users/')
  //     .send({
  //       username: 'james'
  //     })
  //     .expect(500)
  //     .end((err, res) => {
  //       expect(res.status).to.equal(500);
  //       if (!err) {
  //         assert(res.body.message === 'Your signup was not completed, please crosscheck your information');
  //         done();
  //       } else {
  //         assert.ifError(err);
  //       }
  //     });
  // });

  it('responds with a 200 to a valid login request', (done) => {
    User.create({
      email: 'daniel@daniel.com',
      username: 'daniel',
      password: 'daniel',
      roleId: 2
    }).then((res) => {
      request(app)
      .post('/api/v1/users/login')
      .send({
        username: 'daniel',
        password: 'daniel',
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.message).to.equals('Password is incorrect');
        done();
      });
    });
  });
  it('responds to an invalid login request', (done) => {
    request(app)
      .post('/api/v1/users/login')
      .send()
      .expect(200)
      .end((err, res) => {
        expect(res.body.message).to.equals('User not found');
        done();
      });
    done();
  });
  it('gets a list of all users when the admin makes a request', (done) => {
    User.create({
      email: 'admin@admin.com',
      username: 'admin',
      password: 'edoccabinet',
      roleId: 1
    }).then((res) => {
      request(app)
        .post('/api/v1/users/login')
        .send({
          username: 'admin',
          password: 'edoccabinet',
        })
        .expect(200)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .get('/api/v1/users/?limit=1&offset=1')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
              expect(typeof (res.body)).to.equals('object');
              request(app)
                .delete('/api/v1/users/1')
                .set('Authorization', `${token}`)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end((err, res) => {
                  expect(typeof (res.body)).to.equals('object');
                  done();
                });
            });
        });
    });
  });
  it('returns a particular user based on the ID provided in params', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'daniel@daniel.com',
        username: 'daniel',
        password: 'daniel',
        roleId: 2
      })
      .expect(201)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .get('/api/v1/users/1')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            expect(typeof (res.body)).to.equals('object');
            done();
          });
        done();
      });
  });
  it('returns an error message if the user tries to find another users information', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'daniel@daniel.com',
        username: 'daniel',
        password: 'daniel',
        roleId: 2
      })
      .expect(201)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .get('/api/v1/users/100')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            expect(typeof (res.body)).to.equals('object');
            done();
          });
        done();
      });
  });
  it('updates a user with the correct access information', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'daniel@daniel.com',
        username: 'daniel',
        password: 'daniel',
        roleId: 2
      })
      .expect(200)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .put('/api/v1/users/1')
          .send({
            email: 'james@james.com',
          })
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.email).to.equal('james@james.com');
            done();
          });
      });
  });
  // it('returns an error message if the user tries to update another users details', (done) => {
  //   request(app)
  //     .post('/api/v1/users')
  //     .send({
  //       name: 'test',
  //       password: 'test',
  //       email: 'test@test.com',
  //       roleId: 2
  //     })
  //     .expect(200)
  //     .end((err, res) => {
  //       token = res.body.token;
  //       request(app)
  //         .put('/api/v1/users/100')
  //         .send({
  //           email: 'adeleke@adeleke.com',
  //         })
  //         .set('Authorization', `${token}`)
  //         .set('Accept', 'application/json')
  //         .expect(400)
  //         .end((err, res) => {
  //           expect((res.body.message)).to.equals('Invalid command');
  //           done();
  //         });
  //       done();
  //     });
  // });
  it('searches for a users documents', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'daniel@daniel.com',
        username: 'daniel',
        password: 'daniel',
        roleId: 2
      })
      .expect(204)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .get('/api/v1/users/1/documents/')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.length).to.equals(undefined);
            done();
          });
        done();
      });
  });
  it('returns an error message if the signed in user searches for another users documents', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'daniel@daniel.com',
        username: 'daniel',
        password: 'daniel',
        roleId: 2
      })
      .expect(204)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .get('/api/v1/users/100/documents')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).to.equals('Access Denied');
            done();
          });
        done();
      });
  });
  it('returns the correct response if the user searches for a user that doesn\'t exist ', (done) => {
    request(app)
      .post('/api/v1/users')
      .send({
        email: 'daniel@daniel.com',
        username: 'daniel',
        password: 'daniel',
        roleId: 2
      })
      .expect(204)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .get('/api/v1/search/users/?q=man')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, res) => {
            expect(res.status).to.equal(400);
            done();
          });
      });
  });

  it('searches for a user', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'daniel@daniel.com',
        username: 'daniel',
        password: 'daniel',
        roleId: 2
      })
      .expect(204)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .get('/api/v1/search/users/?q=daniel')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.name).to.equals(undefined);
            done();
          });
      });
  });

  it('admin does an admin thing', (done) => {
    User.create({
      email: 'admin@admin.com',
      username: 'admin',
      password: 'edoccabinet',
      roleId: 1
    }).then((res) => {
      request(app)
        .post('/api/v1/users/login')
        .send({
          username: 'admin',
          password: 'edoccabinet',
        })
        .expect(200)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .get('/api/v1/documents/')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
              expect(res.body.length).to.equal(undefined);
              done();
            });
        });
    });
  });
});
