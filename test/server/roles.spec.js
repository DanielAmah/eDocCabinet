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
  it('throws a 400 if users try to create an incorrect role', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'admin@admin.com',
        username: 'admin',
        password: 'edoccabinet',
        roleId: 1
      })
      .expect(201)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .post('/api/v1/roles/')
          .send()
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end((err, res) => {
            expect(res.status).to.equal(400);
          });
        done();
      });
  });
    it('throws a 201 if admin try to create a new role', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'admin@admin.com',
        username: 'admin',
        password: 'edoccabinet',
        roleId: 1
      })
      .expect(201)
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
            expect(res.status).to.equal(201);
          });
        done();
      });
  });
      it('throws a 400 if other roles try to create a new role', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'test@test.com',
        username: 'test',
        password: 'test',
        roleId: 2
      })
      .expect(400)
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
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equals('Access Denied');
          });
        done();
      });
  });
      it('throws a 201 if admin try to list all roles', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'admin@admin.com',
        username: 'admin',
        password: 'edoccabinet',
        roleId: 1
      })
      .expect(201)
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
            //expect(res.body.message).to.equals('Roles created successfully');
          });
        done();
      });
  });
        it('throws a 201 if admin try to list all roles with users', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'admin@admin.com',
        username: 'admin',
        password: 'edoccabinet',
        roleId: 1
      })
      .expect(201)
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
            //expect(res.body.message).to.equals('Roles created successfully');
          });
        done();
      });
  });
        it('throws a 400 if any other role tries to list all roles', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'test@test.com',
        username: 'test',
        password: 'test',
        roleId: 2
      })
      .expect(201)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .get('/api/v1/roles')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end((err, res) => {
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equals('Access Denied');
          });
        done();
      });
  });
  
  it('returns a 404 if users try to find a role that doesn\'t exist', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'admin@admin.com',
        username: 'admin',
        password: 'edoccabinet',
        roleId: 1
      })
      .expect(404)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .get('/api/v1/roles/100')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, res) => {
            expect((res.body.status)).to.equals(undefined);
            done();
          });
      });
  });
    it('returns a 404 if a user tries to delete a role that doesn\'t exist', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'admin@admin.com',
        username: 'admin',
        password: 'edoccabinet',
        roleId: 1
      })
      .expect(404)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .delete('/api/v1/roles/100')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, res) => {
            expect(res.status).to.equals(404);
            done();
          });
      });
  });
});
