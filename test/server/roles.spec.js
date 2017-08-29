import supertest from 'supertest';
import { expect } from 'chai';
import { testHelper } from '../testHelper';
import models from '../../server/models';
import jsonWebTokenHelper from '../../server/helpers/jsonWebTokenHelper';

const app = require('../../build/server');

const request = supertest.agent(app);
const adminUser = testHelper.specUser1;
const subscriberUser = testHelper.specUser3;

const adminToken = jsonWebTokenHelper(adminUser);
const subscriberToken = jsonWebTokenHelper(subscriberUser);

describe('Role Controller', () => {
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
                          testHelper.adminRole,
                          testHelper.editorRole,
                          testHelper.subscriberRole
                        ])
                        .then(() => {
                          done();
                        });
                    }
                  });
              }
            });
        }
      });
  });
  describe('Create Roles Endpoint - POST /api/v1/roles/', () => {
    it('should reject the request when not signed in', (done) => {
      request
        .post('/api/v1/roles/')
        .send({
          title: 'Editor'
        })
        .end((err, response) => {
          expect(response.status).to.equal(401);
          expect(response.body.message).to.equal('Not Authorized');
          done();
        });
    });
    it('should successfully create a new role with admin access', (done) => {
      request
        .post('/api/v1/roles/')
        .send({
          title: 'publisher'
        })
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(201);
          expect(response.body.message).to.equal('Role created successfully');
          expect(response.body.title).to.equal('publisher');

          done();
        });
    });
    it('should not successfully create a new role if no title', (done) => {
      request
        .post('/api/v1/roles/')
        .send({
          title: ''
        })
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body[0].msg).to.equal('Enter a valid role id');
          done();
        });
    });
    it('should not create a new role with a subscriber access', (done) => {
      request
        .post('/api/v1/roles/')
        .send({
          title: 'publisher'
        })
        .set('Authorization', `${subscriberToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(403);
          expect(response.body.message).to.equal(
            'Access Denied. You can not create a new role'
          );
          done();
        });
    });
  });
  describe('Get Roles Endpoint - GET /api/v1/roles/', () => {
    it('should reject the request when not signed in', (done) => {
      request.get('/api/v1/roles/').end((err, response) => {
        expect(response.status).to.equal(401);
        expect(response.body.message).to.equal('Not Authorized');
        done();
      });
    });
    it('should successfully get all roles for an admin access', (done) => {
      request
        .get('/api/v1/roles/')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(200);
          expect(response.body[0].title).to.equal('admin');
          expect(response.body[1].title).to.equal('editor');
          expect(response.body[2].title).to.equal('subscriber');
          done();
        });
    });

    it('should not get all roles with subscriber access', (done) => {
      request
        .get('/api/v1/roles/')
        .set('Authorization', `${subscriberToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(403);
          expect(response.body.message).to.equal(
            'Access Denied. You can not create a new role'
          );
          done();
        });
    });
  });
  describe('Get Roles-Users Endpoint - GET /api/v1/roles-users/', () => {
    it('should reject the request when not signed in', (done) => {
      request.get('/api/v1/roles-users/').end((err, response) => {
        expect(response.status).to.equal(401);
        expect(response.body.message).to.equal('Not Authorized');
        done();
      });
    });
    it('should successfully get all roles and users' +
     'with admin access', (done) => {
      request
        .get('/api/v1/roles-users/')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(200);
          expect(response.body[0].title).to.equal('admin');
          expect(response.body[1].title).to.equal('editor');
          expect(response.body[2].title).to.equal('subscriber');
          done();
        });
    });
    it(
      'should not successfully get all roles and users' +
        'with subscriber access',
      (done) => {
        request
          .get('/api/v1/roles-users/')
          .set('Authorization', `${subscriberToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(403);
            expect(response.body.message).to.equal(
              'Access Denied. You can not create a new role'
            );
            done();
          });
      }
    );
    it('should not create a new role if it already exists', (done) => {
      request
        .post('/api/v1/roles')
        .send({ title: 'subscriber' })
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(409);
          expect(response.body.message).to.equal('Role Already Exists');
          done();
        });
    });
  });
});
