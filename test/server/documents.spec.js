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
const updateDocument = testHelper.specUpdateDocument;
const BadAccessDocument = testHelper.specBadAccessDocument;
const noTitleDocument = testHelper.noTitleDocument;
const noContentDocument = testHelper.noContentDocument;

const adminToken = jsonWebTokenHelper(adminUser);
const subscriberToken = jsonWebTokenHelper(subscriberUser);
const unauthorizedToken = '4nf30f';

describe('Document Controller', () => {
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
  describe('Create Documents Endpoint - POST /api/v1/document', () => {
    beforeEach((done) => {
      models.Users.bulkCreate([adminUser, subscriberUser]).then(() => {
        done();
      });
    });
    it('should not create a document with wrong document access', (done) => {
      request
        .post('/api/v1/documents/')
        .send(BadAccessDocument)
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal(
            'Invalid document access, save document with your role'
          );
          done();
        });
    });
    it('should not create a document with no title', (done) => {
      request
        .post('/api/v1/documents/')
        .send(noTitleDocument)
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body[0].msg).to.equal(
            'Enter a title for the document'
          );
          done();
        });
    });
    it('should not create a document with no content', (done) => {
      request
        .post('/api/v1/documents/')
        .send(noContentDocument)
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body[0].msg).to.equal(
            'Enter a content for the document'
          );
          done();
        });
    });
    it('it should not create document if it exists', (done) => {
      models.Documents.create(document2).then(() => {});
      request
        .post('/api/v1/documents/')
        .send(document2)
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(409);
          expect(response.body.message).to.equal(
            'A document with this title has been created'
          );
          done();
        });
    });
    it('should successfully create a new document', (done) => {
      request
        .post('/api/v1/documents/')
        .send(document2)
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(201);
          expect(response.body.message).to.equal(
            'Document created successfully'
          );
          expect(response.body.title).to.equal('Computer Science');
          expect(response.body.content).to.equal(
            'Computer science is the study of the theory,' +
              ' experimentation,and engineering that form the' +
              ' basis for the design and use of computers.'
          );
          done();
        });
    });
  });
  describe('Get Documents Endpoint - GET /api/v1/documents', () => {
    beforeEach((done) => {
      models.Users.bulkCreate([adminUser, subscriberUser]).then(() => {
        done();
      });
    });
    it('should successfully get all documents for an admin', (done) => {
      models.Documents.bulkCreate([document1, document2]).then(() => {});
      request
        .get('/api/v1/documents/')
        .set('Authorization', `${adminToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.documents[0].content).to.equal(
            'The best content'
          );
          expect(response.body.documents[1].title).to.equal('Computer Science');
          done();
        });
    });
    it(
      'should validate offset and limit parameters and throw ' +
        'an error if offset and limit is not a number',
      (done) => {
        request
          .get('/api/v1/documents/?limit=10&offset=q')
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
    it('should successfully get all documents a user has access to', (done) => {
      models.Documents.create(document1).then(() => {});
      request
        .get('/api/v1/documents/')
        .set('Authorization', `${subscriberToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.documents[0].title).to.equal(
            'My first document'
          );
          expect(response.body.documents[0].content).to.equal(
            'The best content'
          );
          done();
        });
    });
  });
  describe('Retrieve Document Endpoint - GET /api/v1/documents/id', () => {
    beforeEach((done) => {
      models.Users.bulkCreate([adminUser, subscriberUser]).then(() => {
        done();
      });
    });
    it(
      'should return a 404 status and error message if document is ' +
        'not found',
      (done) => {
        request
          .get('/api/v1/documents/10')
          .set('Authorization', `${adminToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(404);
            expect(response.body.message).to.equal(
              'The Document Does not Exist'
            );
            done();
          });
      }
    );
    it(
      'should through an error for user with invalid token trying to ' +
        'access document',
      (done) => {
        models.Documents.create(document2).then(() => {});
        request
          .get('/api/v1/documents/1')
          .set('Authorization', `${unauthorizedToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(401);
            expect(response.body.message).to.equal('Invalid Token');
            done();
          });
      }
    );
    it(
      'should successfully return the document found for ' +
        'an authorized admin',
      (done) => {
        models.Documents.create(document1);
        request
          .get('/api/v1/documents/1')
          .set('Authorization', `${adminToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(200);
            expect(response.body.title).to.equal('My first document');
            expect(response.body.content).to.equal('The best content');
            done();
          });
      }
    );
    it(
      'should not allow an invalid document id when' +
       'retrieving document',
      (done) => {
        request
          .get('/api/v1/documents/p')
          .set('Authorization', `${subscriberToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(400);
            expect(response.body.message).to.equal('Invalid Document ID');
            done();
          });
      }
    );

    it(
      'should successfuly return the document found for' +
        'an authorized subscriber',
      (done) => {
        models.Documents.create(document2);
        request
          .get('/api/v1/documents/1')
          .set('Authorization', `${subscriberToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(200);
            expect(response.body.title).to.equal('Computer Science');
            expect(response.body.content).to.equal(
              'Computer science is the study of the theory,' +
                ' experimentation,and engineering that form ' +
                'the basis for the design and use of computers.'
            );
            done();
          });
      }
    );
    it(
      'should not retrieve any document for an authorized subscriber' +
        'if document does not exist',
      (done) => {
        request
          .get('/api/v1/documents/3')
          .set('Authorization', `${subscriberToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(404);
            expect(response.body.message).to.equal(
              'The Document Does not Exist'
            );
            done();
          });
      }
    );
  });
  describe('Update Document Endpoint - PUT /api/v1/document/id', () => {
    beforeEach((done) => {
      models.Users.bulkCreate([adminUser, subscriberUser]).then(() => {
        done();
      });
    });
    it('should return a 404 error if document not found for update', (done) => {
      request
        .put('/api/v1/documents/10')
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
    it(
      'should not allow a user to update document ' +
        'with invalid document id',
      (done) => {
        request
          .put('/api/v1/documents/q')
          .set('Authorization', `${adminToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .send(updateDocument)
          .end((err, response) => {
            expect(response.status).to.equal(400);
            expect(response.body.message).to.equal('Invalid Document ID');
            done();
          });
      }
    );
    it('should allow a subscriber to update his own document', (done) => {
      models.Documents.create(document2).then(() => {});
      request
        .put('/api/v1/documents/1')
        .set('Authorization', `${subscriberToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send(updateDocument)
        .end((err, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.title).to.equal('updated title');
          expect(response.body.content).to.equal('another content');
          done();
        });
    });
    it('should not update document if title already exists', (done) => {
      models.Documents.create(document2).then(() => {});
      request
        .put('/api/v1/documents/1')
        .set('Authorization', `${subscriberToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send(document2)
        .end((err, response) => {
          expect(response.status).to.equal(409);
          expect(response.body.message).to.equal(
            'A document with this title has been created'
          );
          done();
        });
    });
  });

  describe('Delete Documents Endpoint - DELETE /api/v1/documents/id', () => {
    beforeEach((done) => {
      models.Users.bulkCreate([adminUser, subscriberUser]).then(() => {
        done();
      });
    });
    it(
      'should return a 404 error if no document found to delete' +
        'in the database',
      (done) => {
        request
          .delete('/api/v1/documents/10')
          .set('Authorization', `${adminToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(404);
            expect(response.body.message).to.equal(
              'The Document Does not Exist'
            );
            done();
          });
      }
    );
    it(
      'should return a bad request status if a user uses' +
        'an invalid id to delete document',
      (done) => {
        request
          .delete('/api/v1/documents/q')
          .set('Authorization', `${adminToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(400);
            expect(response.body.message).to.equal('Invalid Document ID');
            done();
          });
      }
    );
    it(
      'should allow an authorize admin to successfully' +
       'delete a document',
      (done) => {
        models.Documents.create(document2).then(() => {
          //
        });
        request
          .delete('/api/v1/documents/1')
          .set('Authorization', `${subscriberToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(200);
            expect(response.body.message).to.equal(
              'The Document has been deleted successfully.'
            );
            done();
          });
      }
    );
    it(
      'should allow an authorize subscriber' +
        ' to successfully delete his document ',
      (done) => {
        models.Documents.create(document2);
        request
          .delete('/api/v1/documents/1')
          .set('Authorization', `${subscriberToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(200);
            expect(response.body.message).to.equal(
              'The Document has been deleted successfully.'
            );
            done();
          });
      }
    );
  });
});
