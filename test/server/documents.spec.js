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
let newToken;

describe('Document Controller ', () => {
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
                      title: 'subscriber'
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


  it('throws a 400 if users try to create an incorrect document', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'seyi@seyi.com',
        username: 'seyi',
        password: 'seyi',
        roleId: 2
      })
      .expect(201)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .post('/api/v1/documents/')
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

  it('returns a 404 if users try to find a document that doesn\'t exist', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'seyi@seyi.com',
        username: 'seyi',
        password: 'seyi',
        roleId: 2
      })
      .expect(404)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .get('/api/v1/documents/100')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, res) => {
            expect((res.body.message)).to.equals('Document Not Found');
            done();
          });
      });
  });

  it('returns a 200 if users try to find documents that belong to them and exist', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'seyi@seyi.com',
        username: 'seyi',
        password: 'seyi',
        roleId: 2
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
          .expect(200)
          .end((err, res) => {
            request(app)
              .get('/api/v1/documents/1')
              .set('Authorization', `${token}`)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .end((err, res) => {
                expect((res.body.title)).to.equals('title');
                expect(res.status).to.equal(200);
                done();
              });
          });
      });
  });

  it('returns a 404 if you try to access anothers user\'s document', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'seyi@seyi.com',
        username: 'seyi',
        password: 'seyi',
        roleId: 2
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
          .expect(200)
          .end((err, res) => {
            request(app)
              .post('/api/v1/users/')
              .send({
                email: 'tolu@tolu.com',
                username: 'tolu',
                password: 'tolu',
                roleId: 2
              })
              .expect(200)
              .end((err, res) => {
                newToken = res.body.token;
                request(app)
                  .get('/api/v1/documents/1')
                  .set('Authorization', `${newToken}`)
                  .set('Accept', 'application/json')
                  .expect('Content-Type', /json/)
                  .expect(404)
                  .end((err, res) => {
                    assert(res.body.message === undefined);
                    expect(res.status).to.equal(200);
                    done();
                  });
              });
          });
      });
  });

  it('returns a 404 if a user tries to update a document that doesn\'t exist', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'seyi@seyi.com',
        username: 'seyi',
        password: 'seyi',
        roleId: 2
      })
      .expect(200)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .put('/api/v1/documents/100')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .end((err, res) => {
            expect((res.body.message)).to.equals('The Document Does not Exist');
            expect(res.status).to.equal(404);
            done();
          });
      });
  });

  it('returns a 404 if a user tries to update another users document', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'seyi@seyi.com',
        username: 'seyi',
        password: 'seyi',
        roleId: 2
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
          .expect(200)
          .end((err, res) => {
            request(app)
              .post('/api/v1/users/')
              .send({
                email: 'tolu@tolu.com',
                username: 'tolu',
                password: 'tolu',
                roleId: 2
              })
              .expect(200)
              .end((err, res) => {
                newToken = res.body.token;
                request(app)
                  .put('/api/v1/documents/1')
                  .set('Authorization', `${newToken}`)
                  .set('Accept', 'application/json')
                  .expect('Content-Type', /json/)
                  .expect(404)
                  .end((err, res) => {
                    expect((res.body.message)).to.equals('The Document Does not Exist');
                    expect(res.status).to.equal(404);
                    done();
                  });
              });
          });
      });
  });

  it('lets users update their documents', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'seyi@seyi.com',
        username: 'seyi',
        password: 'seyi',
        roleId: 2
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
          .expect(200)
          .end((err, res) => {
            request(app)
              .put('/api/v1/documents/1')
              .send({
                title: 'another title'
              })
              .set('Authorization', `${token}`)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .end((err, res) => {
                expect((res.body.title)).to.equals('another title');
                done();
              });
          });
      });
  });

  it('returns a 404 if a user tries to delete a document that doesn\'t exist', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'seyi@seyi.com',
        username: 'seyi',
        password: 'seyi',
        roleId: 2
      })
      .expect(404)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .delete('/api/v1/documents/100')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, res) => {
            expect(res.status).to.equals(400);
            done();
          });
      });
  });

  it('returns a 204 if a user deletes a document belonging to them', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'seyi@seyi.com',
        username: 'seyi',
        password: 'seyi',
        roleId: 2
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
              .delete('/api/v1/documents/1')
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

  it('returns a 404 if a user tries to delete another users document', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'seyi@seyi.com',
        username: 'seyi',
        password: 'seyi',
        roleId: 2
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
          .expect(200)
          .end((err, res) => {
            request(app)
              .post('/api/v1/users')
              .send({
                email: 'tolu@tolu.com',
                username: 'tolu',
                password: 'tolu',
                roleId: 2
              })
              .expect(200)
              .end((err, res) => {
                newToken = res.body.token;
                request(app)
                  .delete('/api/v1/documents/1')
                  .set('Authorization', `${newToken}`)
                  .set('Accept', 'application/json')
                  .expect('Content-Type', /json/)
                  .expect(404)
                  .end((err, res) => {
                    expect(res.status).to.equal(200);
                    done();
                  });
              });
          });
      });
  });

  it('returns a 400 if a user searches for a document that doesn\'t exist', (done) => {
    request(app)
      .post('/api/v1/users')
      .send({
        email: 'seyi@seyi.com',
        username: 'seyi',
        password: 'seyi',
        roleId: 2
      })
      .expect(400)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .get('/api/v1/search/documents/?q=idontexist')
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
