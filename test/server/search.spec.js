import supertest from 'supertest';
import { expect } from 'chai';
import { testHelper } from '../testHelper';
import models from '../../server/models';
import jsonWebTokenHelper from '../../server/helpers/jsonWebTokenHelper';

const app = require('../../build/server');

const request = supertest.agent(app);

const adminUser = testHelper.specUser1;
const subscriberUser = testHelper.specUser3;
const document1 = testHelper.specDocument1;
const document2 = testHelper.specDocument2;

const adminToken = jsonWebTokenHelper(adminUser);
const subscriberToken = jsonWebTokenHelper(subscriberUser);

describe('Search Controller', () => {
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
  describe('Search Users Endpoint - GET /api/v1/search/users/', () => {
    it(
      'should display the message "User not found" when' +
        'querying the database for an unregistered user',
      (done) => {
        request
          .get('/api/v1/search/users/?q=antony')
          .set('Authorization', `${adminToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(200);
            expect(typeof response.body).to.equal('object');
            done();
          });
      }
    );
    it('should not display search result for user' +
     'with subscriber access', (done) => {
      models.Users.create(adminUser);
      request
        .get('/api/v1/search/users?q=admin')
        .set('Authorization', `${subscriberToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(403);
          expect(response.body.message).to.equal(
            'Access Denied. You can not see register subscribers'
          );
          done();
        });
    });
    it(
      'should display message " no key word supplied " if' +
        'no search term is used',
      (done) => {
        request
          .get('/api/v1/search/users')
          .set('Authorization', `${adminToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(400);
            expect(response.body.message).to.equal('No key word supplied');
            done();
          });
      }
    );
  });
  describe('Search Documents Endpoint - GET /api/v1/search/documents/', () => {
    beforeEach((done) => {
      models.Users.create(adminUser).then(() => {
        done();
      });
    });
    it('should return "no document Found" if no document', (done) => {
      request
        .get('/api/v1/search/documents?q=title')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(404);
          expect(response.body.message).to.equal('No document Found');
          done();
        });
    });
    it(
      'should successfully return a document if a document exists' +
        'and it is accessed by an admin',
      (done) => {
        models.Documents.BulkCreate([document1, document2]).then(() => {});
        request
          .get('/api/v1/search/documents/?q=Comp')
          .set('Authorization', `${adminToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(200);
            expect(response.body[0].title).to.equal('My first document');
            expect(response.body[0].access).to.equal('public');
            done();
          });
      }
    );
    it(
      'should display message "no key word supplied" if' +
        'no search term is used',
      (done) => {
        request
          .get('/api/v1/search/documents/')
          .set('Authorization', `${adminToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(400);
            expect(response.body.message).to.equal('No key word supplied');
            done();
          });
      }
    );
    it(
      'should return "No document found" if no document' +
        'found for subscriber',
      (done) => {
        request
          .get('/api/v1/search/documents?q=title')
          .set('Authorization', `${subscriberToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(404);
            expect(response.body.message).to.equal('No document Found');
            done();
          });
      }
    );
  });
});
