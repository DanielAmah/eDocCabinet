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

  // Test to create a new document

  it('should create a new document', (done) => {
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
              title: 'ES9',
              content: 'the future of Javascript',
              access: 'public'
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
                .end((err, res) => {
              expect(res.status).to.equal(201);
                  done();
                });
            });
        });
     });

     it('should not create a new document if no role is specified', (done) => {
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
              title: 'ES9',
              content: 'the future of Javascript',
            })
            .set('Authorization', `${token}`)
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

     it('should not save new document with wrong access', (done) => {
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
              title: 'ES9',
              content: 'the future of Javascript',
              access: 'Finance'
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
                .end((err, res) => {
              expect(res.body.message).to.equal('Invalid document access, save document with your role');
                  done();
                });
            });
        });
     });
      it('should not save a document with invalid role', (done) => {
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
              title: 'ES9',
              content: 'the future of Javascript',
              access: 'Finance'
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
                .end((err, res) => {
              expect(res.body.message).to.equal('Invalid document access, save document with your role');
                  done();
                });
            });
        });
     });

// test to retrieve documents

it('should retrieve a document successfully', (done) => {
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
            .get('/api/v1/documents/1')
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

it('should return invalid id when trying to retrieve a with non-existing id', (done) => {
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
            .get('/api/v1/documents/q')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
                .end((err, res) => {
              expect(res.body.message).to.equal('Invalid document ID');
                  done();
                });
            });
        });
     });
});

it('should return document does not exist', (done) => {
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
            .get('/api/v1/documents/2')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
                .end((err, res) => {
              expect(res.body.message).to.equal('Document Not Found');
                  done();
                });
            });
        });
     });
});

it('should successfully retrieve document when it is an editor', (done) => {
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
            .get('/api/v1/documents')
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
it('should successfully retrieve document', (done) => {
       const password = bcrypt.hashSync('jack', bcrypt.genSaltSync(10));
    request(app)
    User.create({
      email: 'daniel@jack.com',
      username: 'daniel',
      password: password,
      roleId: 2
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
            .get('/api/v1/documents')
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

it('should return connection error', (done) => {
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
            .get('/api/v1/documents')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
                .end((err, res) => {
              expect(res.status).to.equal(400);
                  done();
                });
            });
        });
     });
});

// test to update document 

it('should return invalid id when trying to update a document', (done) => {
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
            .put('/api/v1/documents/q')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
                .end((err, res) => {
              expect(res.body.message).to.equal('Invalid document ID');
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
            .put('/api/v1/search/documents/?q=doesnotexist')
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
it('should return document not found when trying to update a document that does not exist', (done) => {
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
            .put('/api/v1/documents/2')
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

it('should update a document successfully', (done) => {
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
            .put('/api/v1/documents/1')
            .send({
              title: 'another title'
            })
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

it('should find a document successfully', (done) => {
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
            .put('/api/v1/documents/1')
            .send({
              title: 'another title'
            })
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

it('should return access denied or no token provided', (done) => {
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
            .put('/api/v1/documents/1')
            .send({
              title: 'another title'
            })
            .set('Authorization', ``)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
                .end((err, res) => {
              expect(res.status).to.equal(401);
                  done();
                });
            });
        });
     });
});
 // Test for deleting documents

it('should return invalid id when deleting document', (done) => {
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
            .delete('/api/v1/documents/q')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
                .end((err, res) => {
              expect(res.body.message).to.equal('Invalid document ID');
              expect(res.status).to.equal(400);
                  done();
                });
            });
        });
     });
});

it('should delete document successfully', (done) => {
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
              expect(res.body.message).to.equal('The Document has been deleted successfully.');
                  done();
                });
            });
        });
     });
});

it('should delete document successfully', (done) => {
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
              expect(res.body.message).to.equal('The Document has been deleted successfully.');
                  done();
                });
            });
        });
     });
});
it('should show a message - document not found ', (done) => {
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
            .delete('/api/v1/documents/2')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
                .end((err, res) => {
              expect(res.body.message).to.equal('Document Not Found');
              expect(res.status).to.equal(404);
                  done();
                });
            });
        });
     });
});
 });
