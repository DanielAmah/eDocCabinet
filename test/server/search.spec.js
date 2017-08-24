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


const adminToken = JsonWebTokenHelper(adminUser);
const subscriberToken = JsonWebTokenHelper(subscriberUser);

describe('Search Controller', () => {
  beforeEach((done) => {
    models.Roles.destroy({
      where: {},
      truncate: true,
      cascade: true,
      restartIdentity: true
    }).then((err) => {
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
              models.Users.destroy({
                where: {},
                truncate: true,
                cascade: true,
                restartIdentity: true
              }).then((err) => {
                if (!err) {
                  models.Roles.bulkCreate([
                    TestHelper.adminRole,
                    TestHelper.editorRole,
                    TestHelper.subscriberRole
                  ]).then(() => {
                    done();
                  });
                }
              });
            }
          });
      }
    });
  });
  describe('Search Users Endpoint', () => {
    it('should display the message "User not found" when' +
    'querying the database for an unregistered user', (done) => {
      request.get('/api/v1/search/users?q=antony')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(404);
          expect(response.body.message).to.equal('User not found');
          done();
        });
    });
    it('should not display search result for user with ' +
     'subscriber access', (done) => {
      models.Users.create(adminUser);
      request.get('/api/v1/search/users?q=admin')
        .set('Authorization', `${subscriberToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(401);
          expect(response.body.message).to.equal(
            'Access Denied. You can not see register subscribers');
          done();
        });
    });
    it('should display message " no key word supplied " if' +
    'no search term is used', (done) => {
      request.get('/api/v1/search/users')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal('No key word supplied');
          done();
        });
    });
  });
  describe('Search Documents Endpoint', () => {
    beforeEach((done) => {
      models.Users.create(adminUser).then(() => {
        done();
      });
    });
    it('should return "no document Found" if no document', (done) => {
      request.get('/api/v1/search/documents?q=title')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(404);
          expect(response.body.message).to.equal('No document Found');
          done();
        });
    });
    it('should successfully return a document if a document exists' +
     'and it is accessed by an admin',
      (done) => {
        models.Documents.create(document1).then(() => {
        });
        request.get('/api/v1/search/documents/?q=My first document')
          .set('Authorization', `${adminToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(200);
            expect(response.body[0].title).to.equal('My first document');
            expect(response.body[0].content).to.equal('The best content');
            expect(response.body[0].access).to.equal('public');
            done();
          });
      });
    it('should display message "no key word supplied" if' +
    'no search term is used',
      (done) => {
        request.get('/api/v1/search/documents/')
          .set('Authorization', `${adminToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(400);
            expect(response.body.message).to.equal('No key word supplied');
            done();
          });
      });
    it('should return "No document found" if no document' +
    'found for subscriber', (done) => {
      request.get('/api/v1/search/documents?q=title')
        .set('Authorization', `${subscriberToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(404);
          expect(response.body.message).to.equal('No document Found');
          done();
        });
    });
  });
});

