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

describe('Search Controller ', () => {
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

      it('should return a no key word supplied when no search term', (done) => {
       const password = bcrypt.hashSync('admin', bcrypt.genSaltSync(10));
    request(app)
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
          token = res.body.token;
          request(app)
            .get('/api/v1/search/users/')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(204)
                .end((err, res) => {
              expect(res.body.message).to.equal('No key word supplied');
                  done();
                });
            });
        });
     });

      it('should return the details of the user if a search term is keyed in', (done) => {
       const password = bcrypt.hashSync('admin', bcrypt.genSaltSync(10));
    request(app)
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
          token = res.body.token;
          request(app)
            .get('/api/v1/search/users/?q=admin')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(204)
                .end((err, res) => {
              expect(res.status).to.equal(200);
                  done();
                });
            });
        });
     });

        it('should return user does not exist', (done) => {
       const password = bcrypt.hashSync('admin', bcrypt.genSaltSync(10));
    request(app)
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
          token = res.body.token;
          request(app)
            .get('/api/v1/search/users/?q=daniel')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(204)
                .end((err, res) => {
              expect(res.status).to.equal(404);
              expect(res.body.message).to.equal('User does not exist')
                  done();
                });
            });
        });
     });


     it('should return access denied  if not admin', (done) => {
       const password = bcrypt.hashSync('jack', bcrypt.genSaltSync(10));
    request(app)
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
          token = res.body.token;
          request(app)
            .get('/api/v1/search/users/?q=admin')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(204)
                .end((err, res) => {
              expect(res.body.message).to.equal('Access Denied')
                  done();
                });
            });
        });
     });

      it('should return a no key word supplied', (done) => {
       const password = bcrypt.hashSync('admin', bcrypt.genSaltSync(10));
    request(app)
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
          token = res.body.token;
          request(app)
            .get('/api/v1/search/documents/')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(204)
                .end((err, res) => {
              expect(res.body.message).to.equal('No key word supplied');
                  done();
                });
            });
        });
     });


     it('should return document not found', (done) => {
       const password = bcrypt.hashSync('admin', bcrypt.genSaltSync(10));
    request(app)
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
          token = res.body.token;
          request(app)
            .get('/api/v1/search/documents/?q=ES9')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(204)
                .end((err, res) => {
              expect(res.status).to.equal(404);
                  done();
                });
            });
        });
     });



 it('should return document if it exist', (done) => {
       const password = bcrypt.hashSync('admin', bcrypt.genSaltSync(10));
    request(app)
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
        token = res.body.token;
        request(app)
          .post('/api/v1/documents/')
          .send({
            title: 'title',
            content: 'content',
            access: 'public'
          })
           .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(204)
      .end((err, res) => {
          request(app)
            .get('/api/v1/search/documents/?q=title')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
                .end((err, res) => {
              expect(res.status).to.equal(200);
                  done();
                });
            });
        });
     });
});


it('should return document not found', (done) => {
       const password = bcrypt.hashSync('admin', bcrypt.genSaltSync(10));
    request(app)
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
        token = res.body.token;
        request(app)
          .post('/api/v1/documents/')
          .send({
            title: 'title',
            content: 'content',
            access: 'public'
          })
           .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(204)
      .end((err, res) => {
          request(app)
            .get('/api/v1/search/documents/?q=doesnotexist')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
                .end((err, res) => {
              expect(res.status).to.equal(404);
                  done();
                });
            });
        });
     });
});

 });
