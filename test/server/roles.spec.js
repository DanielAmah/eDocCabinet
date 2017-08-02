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

describe('Role Controller ', () => {
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
   it('should create a new role', (done) => {
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
            .post('/api/v1/roles/')
            .send({
              title: 'publisher'
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
                .end((err, res) => {
              expect(res.body.message).to.equal('Roles created successfully');
                  done();
                });
            });
        });
     });

        it('should not create a new role if any one else logged in', (done) => {
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
            .post('/api/v1/roles/')
            .send({
              title: 'publisher'
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
                .end((err, res) => {
              expect(res.body.message).to.equal('Access Denied');
                  done();
                });
            });
        });
     });
     
     it('should not create a new role', (done) => {
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
            .post('/api/v1/roles/')
            .send({
              title: ''
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
                .end((err, res) => {
              expect(res.status).to.equal(400);
                  done();
                });
            });
        });
     });
it('should be list all roles as admin', (done) => {
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
            .get('/api/v1/roles')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
                .end((err, res) => {
              expect(res.status).to.equal(200);
                  done();
                });
            });
        });
     });
      it('should not get roles if any one else logged in', (done) => {
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
            .get('/api/v1/roles')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
                .end((err, res) => {
              expect(res.body.message).to.equal('Access Denied');
                  done();
                });
            });
        });
     });

     it('should be display a 404 code if the user goes to a wrong route', (done) => {
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
            .get('/api/v1/roles/1')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
                .end((err, res) => {
              expect(res.status).to.equal(404);
                  done();
                });
            });
        });
     });
     it('should be list all roles as admin', (done) => {
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
            .get('/api/v1/roles-users/')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
                .end((err, res) => {
              expect(res.status).to.equal(200);
                  done();
                });
            });
        });
     });
     it('should not get roles if any one else logged in', (done) => {
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
            .get('/api/v1/roles-users/')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
                .end((err, res) => {
              expect(res.body.message).to.equal('Access Denied');
                  done();
                });
            });
        });
     });
     it('should be display a 404 code if the user goes to a wrong route', (done) => {
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
            .get('/api/v1/roles-users/1')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
                .end((err, res) => {
              expect(res.status).to.equal(404);
                  done();
                });
            });
        });
     });

 it('should display no token provided', (done) => {
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
            .get('/api/v1/roles-users/1')
            .set('Authorization', ``)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
                .end((err, res) => {
              expect(res.status).to.equal(403);
                  done();
                });
            });
        });
     });
   it('should not display the roles and user for editors', (done) => {
       const password = bcrypt.hashSync('blessing', bcrypt.genSaltSync(10));
    request(app)
    User.create({
      email: 'blessing@blessing.com',
      username: 'blessing',
      password: password,
      roleId: 2
    }).then((res) => {
      request(app)
      .post('/api/v1/users/login')
      .send({
        username: 'blessing',
        password: 'blessing',
      })
      .expect(200)
      .end((err, res) => {
          token = res.body.token;
          request(app)
            .get('/api/v1/roles-users/1')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
                .end((err, res) => {
              expect(res.status).to.equal(404);
                  done();
                });
            });
        });
     });
       
});
