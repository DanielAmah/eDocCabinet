import supertest from 'supertest';
import { expect } from 'chai';
import { TestHelper } from '../TestHelper';
import models from '../../server/models';
import JsonWebTokenHelper from '../../server/helpers/JsonWebTokenHelper';

const app = require('../../build/server');

const request = supertest.agent(app);

const adminUser = TestHelper.specUser1;
const subscriberUser = TestHelper.specUser3;
const document1 = TestHelper.specDocument1;
const specWrongEmail = TestHelper.specWrongEmail;
const invalidUser = TestHelper.invalidUser;
const specNoPassword = TestHelper.specNoPassword;
const specUpdateUser = TestHelper.specUpdateUser;

const adminToken = JsonWebTokenHelper(adminUser);
const subscriberToken = JsonWebTokenHelper(subscriberUser);

describe('Users Controller', () => {
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
  describe('Create User Endpoint - POST /api/v1/users/', () => {
    it('should be able to create an admin user', (done) => {
      request.post('/api/v1/users/').send(adminUser).end((error, response) => {
        expect(response.status).to.equal(201);
        expect(typeof response.body).to.equal('object');
        expect(response.body.newUser.userEmail).to.equal('admin@admin.com');
        expect(response.body.newUser.userUsername).to.equal('admin');
        done();
      });
    });
    it('should be able to create a subscriber user', (done) => {
      request
        .post('/api/v1/users/')
        .send(subscriberUser)
        .end((error, response) => {
          expect(response.status).to.equal(201);
          expect(typeof response.body).to.equal('object');
          expect(response.body.newUser.userEmail).to.equal('daniel@daniel.com');
          expect(response.body.newUser.userUsername).to.equal('daniel');
          done();
        });
    });
    it('should not create a user with an invalid email', (done) => {
      request
        .post('/api/v1/users/')
        .send(specWrongEmail)
        .end((error, response) => {
          expect(response.status).to.equal(400);
          expect(response.body[0].msg).to.equal(
            'Enter a valid email address (someone@organization.com)'
          );
          done();
        });
    });
    it('should not create a user with an empty email', (done) => {
      request
        .post('/api/v1/users/')
        .send(invalidUser)
        .end((error, response) => {
          expect(response.status).to.equal(400);
          expect(response.body[0].msg).to.equal(
            'Enter a valid email address (someone@organization.com)'
          );
          done();
        });
    });
    it('should not create a user with an empty password', (done) => {
      request
        .post('/api/v1/users/')
        .send(specNoPassword)
        .end((error, response) => {
          expect(response.status).to.equal(400);
          expect(response.body[0].msg).to.equal(
            'Enter a valid password of more than 5 characters'
          );
          done();
        });
    });
    it('should not create a user with an email that exists', (done) => {
      models.Users.create(adminUser).then(() => {});
      request.post('/api/v1/users/').send(adminUser).end((error, response) => {
        expect(response.status).to.equal(409);
        expect(response.body.message).to.equal(
          'Username / Email Already Exists'
        );
        done();
      });
    });
  });
  describe('Get Users Endpoint - GET /api/v1/users/', () => {
    beforeEach((done) => {
      models.Users.create(adminUser).then(() => {
        done();
      });
    });
    it('should successfully get all users with admin access', (done) => {
      request
        .get('/api/v1/users/')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.meta.page).to.equal(1);
          expect(response.body.meta.pageCount).to.equal(1);
          expect(response.body.meta.pageSize).to.equal(10);
          expect(response.body.meta.totalCount).to.equal(1);
          done();
        });
    });
    it('should not allow a subscriber to get list of all users', (done) => {
      request
        .get('/api/v1/users/')
        .set('Authorization', `${subscriberToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((error, response) => {
          expect(response.status).to.equal(401);
          expect(response.body.message).to.equal(
            'Access Denied. You can not see register subscribers'
          );
          done();
        });
    });
    it(
      'should validate the limit and offset parameters and' +
        'sends an error if limit and offset are not numbers',
      (done) => {
        request
          .get('/api/v1/users/?limit=q&offset=0')
          .set('Authorization', `${adminToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(400);
            expect(response.body.message).to.equal(
              'limit and offset must be an number'
            );
            done();
          });
      }
    );
    it('should successfully apply pagination to list of users', (done) => {
      request
        .get('/api/v1/users?limit=1&offset=0')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.userlist[0].email).to.equal(adminUser.email);
          expect(response.body.userlist[0].roleId).to.equal(1);
          expect(response.body.meta.pageCount).to.equal(1);
          expect(response.body.meta.pageSize).to.equal(1);
          expect(response.body.meta.page).to.equal(1);
          done();
        });
    });
    it(
      'should successfully list all users and documents on admin access',
      (done) => {
        request
          .get('/api/v1/users-docs/?limit=1&offset=0')
          .set('Authorization', `${adminToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(200);
            expect(response.body.userlist[0].email).to.equal(adminUser.email);
            expect(response.body.userlist[0].roleId).to.equal(1);
            expect(response.body.meta.page).to.equal(1);
            done();
          });
      }
    );
    it(
      'should not list all users and documents on subscriber access',
      (done) => {
        request
          .get('/api/v1/users-docs/')
          .set('Authorization', `${subscriberToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(401);
            expect(response.body.message).to.equal(
              'Access Denied. You can not see subscribers and their documents'
            );
            done();
          });
      }
    );
  });
  describe('Retrieve User Endpoint - GET /api/v1/users/id', () => {
    beforeEach((done) => {
      models.Users.create(adminUser).then(() => {
        done();
      });
    });
    it(
      "should return a message 'User not found' if " +
        'no user found to retrieve',
      (done) => {
        request
          .get('/api/v1/users/10')
          .set('Authorization', `${adminToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(404);
            expect(response.body.message).to.equal('User not found');
            done();
          });
      }
    );
    it('should successfuly return the user if found', (done) => {
      request
        .get('/api/v1/users/1')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.email).to.equal('admin@admin.com');
          expect(response.body.username).to.equal('admin');
          done();
        });
    });
    it('should not return if it is a subscriber access', (done) => {
      request
        .get('/api/v1/users/1')
        .set('Authorization', `${subscriberToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(401);
          expect(response.body.message).to.equal(
            'Access Denied. You can not find other register subscribers'
          );
          done();
        });
    });
    it('should not allow invalid UserId', (done) => {
      request
        .get('/api/v1/users/d')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal('Invalid User ID');
          done();
        });
    });
  });
  describe('Update User Endpoint - PUT /api/v1/users/id', () => {
    beforeEach((done) => {
      models.Users.bulkCreate([adminUser, subscriberUser]).then(() => {
        done();
      });
    });
    it('should return a 404 status if user not found to update', (done) => {
      request
        .put('/api/v1/users/10')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send(specUpdateUser)
        .end((err, response) => {
          expect(response.status).to.equal(404);
          expect(response.body.message).to.equal('User not found');
          done();
        });
    });
    it('should not allow users with invalid id to be updated', (done) => {
      request
        .put('/api/v1/users/p')
        .set('Authorization', `${subscriberToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send(specUpdateUser)
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal('Invalid User ID');
          done();
        });
    });
    it("should not other a subscriber to update someone's account", (done) => {
      request
        .put('/api/v1/users/1')
        .set('Authorization', `${subscriberToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send(specUpdateUser)
        .end((err, response) => {
          expect(response.status).to.equal(401);
          expect(response.body.message).to.equal(
            'Access Denied. You can not update other register subscribers'
          );
          done();
        });
    });
    it(
      'should not update a user role with a wrong used id parameter',
      (done) => {
        request
          .put('/api/v1/users-role/q')
          .set('Authorization', `${adminToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .send(specUpdateUser)
          .end((err, response) => {
            expect(response.status).to.equal(400);
            expect(response.body[0].msg).to.equal('Enter a valid role id');
            done();
          });
      }
    );

    it('should not update a user role without a role id', (done) => {
      models.Users.create(subscriberUser);
      request
        .put('/api/v1/users-role/1')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({ roleId: '' })
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body[0].msg).to.equal('Enter a valid role id');
          done();
        });
    });
    it('should successfully update an admin account', (done) => {
      request
        .put('/api/v1/users/1')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          email: 'administrator@edoc.com',
          password: 'admin',
          username: 'administrator'
        })
        .end((err, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.email).to.equal('administrator@edoc.com');
          expect(response.body.username).to.equal('administrator');

          done();
        });
    });
  });

  describe('Delete Users Endpoint - DELETE /api/v1/users/id', () => {
    beforeEach((done) => {
      models.Users.bulkCreate([adminUser, subscriberUser]).then(() => {
        done();
      });
    });
    it('should not allow a subscriber to delete a user', (done) => {
      request
        .delete('/api/v1/users/2')
        .set('Authorization', `${subscriberToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(401);
          expect(response.body.message).to.equal(
            'Access Denied. You can not remove other register subscribers'
          );
          done();
        });
    });
    it('should return a 404 status if user not found to delete', (done) => {
      request
        .delete('/api/v1/users/10')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(404);
          expect(response.body.message).to.equal('User not found');
          done();
        });
    });
    it('should successfully delete a user as an admin', (done) => {
      request
        .delete('/api/v1/users/1')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.message).to.equal('User deleted successfully.');
          done();
        });
    });
    it('should validate if user id is a number', (done) => {
      request
        .delete('/api/v1/users/q')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal('Invalid User ID');
          done();
        });
    });
  });
  describe('Get all documents of a user\'s Endpoint' +
  '- GET /api/v1/users/id/documents/', () => {
    beforeEach((done) => {
      models.Users.create(adminUser).then(() => {
        done();
      });
    });
    it('should return an empty object if no document is found', (done) => {
      request
        .get('/api/v1/users/1/documents')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(200);
          expect(typeof response.body).to.equal('object');
          done();
        });
    });
    it('should successfully return all documents found', (done) => {
      models.Documents.create(document1).then(() => {});
      request
        .get('/api/v1/users/1/documents')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(200);
          expect(typeof response.body).to.equal('object');
          expect(response.body[0].title).to.equal('My first document');
          expect(response.body[0].content).to.equal('The best content');
          done();
        });
    });
    it(
      'should not successfully return all documents' +
        'of a user with an invalid id',
      (done) => {
        models.Documents.create(document1).then(() => {});
        request
          .get('/api/v1/users/q/documents')
          .set('Authorization', `${adminToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(400);
            expect(response.body.message).to.equal('Invalid User ID');
            done();
          });
      }
    );
    it(
      'should not successfully return all documents of a' +
        'different user without authorization',
      (done) => {
        models.Documents.create(document1).then(() => {});
        request
          .get('/api/v1/users/1/documents')
          .set('Authorization', `${subscriberToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(401);
            expect(response.body.message).to.equal(
              'Access Denied.' +
                ' You can not see documents of other subscribers'
            );
            done();
          });
      }
    );
  });
});
