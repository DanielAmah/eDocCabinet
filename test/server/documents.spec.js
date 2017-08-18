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
const document2 = TestHelper.specDocument2;
const updateDocument = TestHelper.specUpdateDocument;
const BadAccessDocument = TestHelper.specBadAccessDocument;
const noTitleDocument = TestHelper.noTitleDocument;
const noContentDocument = TestHelper.noContentDocument;

const adminToken = JsonWebTokenHelper(adminUser);
const subscriberToken = JsonWebTokenHelper(subscriberUser);
const unauthorizedToken = '4nf30f';

describe('Authentication Controller', () => {
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
  describe('Create Documents Endpoint', () => {
    beforeEach((done) => {
      models.Users.create(adminUser).then(() => {
        done();
      });
      done();
    });
    it('should not create a document with wrong access', (done) => {
      request.post('/api/v1/documents/')
        .send(BadAccessDocument)
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(403);
          expect(response.body.message).to.equal(
            'Invalid document access, save document with your role');
          done();
        });
    });
    it('should not create a document with no title', (done) => {
      request.post('/api/v1/documents/')
        .send(noTitleDocument)
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body[0].msg).to.equal(
            'Enter a title for the document');
          done();
        });
    });
    it('should not create a document with no content', (done) => {
      request.post('/api/v1/documents/')
        .send(noContentDocument)
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body[0].msg).to.equal(
            'Enter a content for the document');
          done();
        });
    });
    it('should successfully create a new document', (done) => {
      request.post('/api/v1/documents/')
        .send(document2)
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(201);
          expect(response.body.message).to.equal(
            'Document created successfully');
          done();
        });
    });
  });
  describe('Get Documents Endpoint', () => {
    beforeEach((done) => {
      models.Users.bulkCreate([adminUser, subscriberUser]).then(() => {
        done();
      });
    });
    it('should successfully get all documents for an admin', (done) => {
      models.Documents.create(document1);
      request.get('/api/v1/documents/')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.listDocuments[0].content).to.equal(
            'The best content');
          done();
        });
    });
    it('should not get all documents for an admin if limit is not a number', (done) => {
      models.Documents.create(document1);
      request.get('/api/v1/documents/?limit=10&offset=q')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal(
            'limit and offset must be an number');
          done();
        });
    });
    it('should successfully get all documents a user has access to', (done) => {
      models.Documents.bulkCreate([document1, document2]);
      request.get('/api/v1/documents/')
        .set('Authorization', `${subscriberToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(200);
          expect(typeof response.body).to.equal('object');
          done();
        });
    });
  });
  describe('Retrieve Document Endpoint', () => {
    beforeEach((done) => {
      models.Users.bulkCreate([adminUser, subscriberUser]).then(() => {
        models.Documents.bulkCreate([document1, document2]);
        done();
      });
    });
    it('should return a 404 error if document not found', (done) => {
      models.Documents.create(document1);
      request.get('/api/v1/documents/10')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(404);
          expect(response.body.message).to.equal('The Document Does not Exist');
          done();
        });
    });
    it('should not allow an user with invalid token' +
    'to get documents', (done) => {
      models.Documents.create(document1);
      request.get('/api/v1/documents/1')
        .set('Authorization', `${unauthorizedToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(401);
          expect(response.body.message).to.equal('Invalid Token');
          done();
        });
    });
    it('should successfuly return the document found for an authorized admin',
      (done) => {
        models.Documents.create(document1);
        request.get('/api/v1/documents/1')
          .set('Authorization', `${adminToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(200);
            expect(response.body.title).to.equal('My first document');
            done();
          });
      });
    it('should not allow an invalid document id when' +
    'retrieving document', (done) => {
      request.get('/api/v1/documents/p')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal(
            'Invalid Document ID');
          done();
        });
    });

    it('should successfuly return the document found for' +
    'an authorized subscriber',
      (done) => {
        models.Documents.create(document2);
        request.get('/api/v1/documents/2')
          .set('Authorization', `${subscriberToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(200);
            expect(response.body.title).to.equal('Computer Science');
            done();
          });
      });
    it('should not retrieve any document for an authorized subscriber',
      (done) => {
        request.get('/api/v1/documents/3')
          .set('Authorization', `${subscriberToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(404);
            expect(response.body.message).to.equal(
              'The Document Does not Exist');
            done();
          });
      });
  });
  describe('Update Document Endpoint', () => {
    beforeEach((done) => {
      models.Users.bulkCreate([adminUser, subscriberUser]).then(() => {
        models.Documents.bulkCreate([document1, document2]);
        done();
      });
    });
    it('should return a 404 error if document not found', (done) => {
      models.Documents.create(document1);
      request.put('/api/v1/documents/10')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send(updateDocument)
        .end((err, response) => {
          expect(response.status).to.equal(404);
          expect(response.body.message).to.equal('The Document Does not Exist');
          done();
        });
    });
    it('should not allow a user to update document ' +
    'with invalid document id', (done) => {
      request.put('/api/v1/documents/q')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send(updateDocument)
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal('Invalid Document ID');
          done();
        });
    });
    it('should allow an authorized subscriber to delete' +
    'a document created by user', (done) => {
      request.put('/api/v1/documents/2')
        .set('Authorization', `${subscriberToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send(updateDocument)
        .end((err, response) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
  });

  describe('Delete Documents Endpoint', () => {
    beforeEach((done) => {
      models.Users.bulkCreate([adminUser, subscriberUser]).then(() => {
        models.Documents.bulkCreate([document1, document2]);
        done();
      });
    });
    it('should return a 404 error if document not found' +
    'in the database', (done) => {
      models.Documents.create(document1);
      request.delete('/api/v1/documents/10')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(404);
          expect(response.body.message).to.equal('The Document Does not Exist');
          done();
        });
    });
    it('should return a bad request status if a user uses' +
    'a non numeric id to delete document', (done) => {
      request.delete('/api/v1/documents/q')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal('Invalid Document ID');
          done();
        });
    });
    it('should allow an authorize admin successfully' +
    'delete a document', (done) => {
      models.Documents.create(document1);
      request.delete('/api/v1/documents/1')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.message).to.equal(
            'The Document has been deleted successfully.');
          done();
        });
    });
    it('should allow an authorize subscriber' +
    'successfully delete a document ', (done) => {
      models.Documents.create(document2);
      request.delete('/api/v1/documents/2')
        .set('Authorization', `${subscriberToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.message).to.equal(
            'The Document has been deleted successfully.');
          done();
        });
    });
  });
});

