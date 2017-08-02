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

describe('User Controller ', () => {
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
    it('Creates a new user', (done) => {
    const password = bcrypt.hashSync('jack', bcrypt.genSaltSync(10));
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'daniel@daniel.com',
        username: 'daniel',
        password: password,
        roleId: 3
      })
      .expect(201)
      .end((err, res) => {
        expect(res.status).to.equal(201);
        expect(res.body.message).to.equal('Token Generated. Signup successful');
        done();
      });
  });
     it('should not create a new user', (done) => {
       const password = bcrypt.hashSync('jack', bcrypt.genSaltSync(10));
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'daniel@daniel.com',
        username: '',
        password: password,
        roleId: ''
      })
      .expect(201)
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
  });
     it('should list all users if it is an admin', (done) => {
       const password = bcrypt.hashSync('admin', bcrypt.genSaltSync(10));
    request(app)
   User.create({
        email: 'admin@admin.com',
        username: 'admin',
        password: password,
        roleId: 1
      })
       .then((res) => {
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
            .get('/api/v1/users/')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
                .end((err, res) => {
              expect(typeof (res.body)).to.equals('object');
                  done();
                });
            });
        });
     });

     it('should list all users if it is an admin', (done) => {
       const password = bcrypt.hashSync('admin', bcrypt.genSaltSync(10));
    request(app)
   User.create({
        email: 'admin@admin.com',
        username: 'admin',
        password: password,
        roleId: 1
      })
       .then((res) => {
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
            .get('/api/v1/users/?limit=2&offset=0')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
                .end((err, res) => {
              expect(typeof (res.body)).to.equals('object');
                  done();
                });
            });
        });
     });

it('should not list all users if it is not an admin', (done) => {
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
            .get('/api/v1/users/')
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

     it('should not list all users if it is an editor', (done) => {
       const password = bcrypt.hashSync('jack', bcrypt.genSaltSync(10));
    request(app)
    User.create({
      email: 'daniel@daniel.com',
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
            .get('/api/v1/users/')
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

     it('should list all users and document if it an admin', (done) => {
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
            .get('/api/v1/users-docs/')
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

     it('should not list all users and document if it not an admin', (done) => {
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
            .get('/api/v1/users-docs/')
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
     it('should not list all users and document if it an editor', (done) => {
       const password = bcrypt.hashSync('jack', bcrypt.genSaltSync(10));
    request(app)
    User.create({
      email: 'daniel@daniel.com',
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
            .get('/api/v1/users-docs/')
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

     it('should update users if it an admin', (done) => {
       const password = bcrypt.hashSync('admin', bcrypt.genSaltSync(10));
    request(app)
    User.create({
      email: 'admin@admin.com',
      username: 'admin',
      password: password,
      roleId: 2
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
            .put('/api/v1/users/1')
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

      it('should update users if logged in as user', (done) => {
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
            .put('/api/v1/users/1')
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
     
     it('should update the email of a user', (done) => {
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
      .expect(400)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .put('/api/v1/users/1')
          .send({
            email: 'james@james.com',
          })
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.email).to.equal('james@james.com');
            done();
          });
          });
        });
     });

     it('should show a message user not found', (done) => {
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
      .expect(400)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .put('/api/v1/users/3')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).to.equal('User Not Found');
            done();
          });
          });
        });
     });
   it('should show a message email already exists when using same email', (done) => {
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
      .expect(400)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .put('/api/v1/users/1')
          .send({
            email: 'daniel@daniel.com',
          })
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).to.equal('Email Already Exist');
            done();
          });
          });
        });
     }); 
      it('should show Invalid User ID', (done) => {
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
      .expect(400)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .put('/api/v1/users/q')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).to.equal('Invalid User ID');
            done();
          });
          });
        });
     });   
     
      it('should show Invalid User ID', (done) => {
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
      .expect(400)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .put('/api/v1/users/q')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).to.equal('Invalid User ID');
            done();
          });
          });
        });
     }); 

      it('should show Invalid User ID when getting users', (done) => {
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
      .expect(400)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .get('/api/v1/users/q')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).to.equal('Invalid User ID');
            done();
          });
          });
        });
     });

           it('should a user when logged in as admin', (done) => {
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
      .expect(400)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .get('/api/v1/users/1')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.status).to.equal(200);
            done();
          });
          });
        });
     });  

     it('should show a message user not found', (done) => {
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
      .expect(400)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .put('/api/v1/users/3')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).to.equal('User Not Found');
            done();
          });
          });
        });
     });
     it('should show a message access denied', (done) => {
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
      .expect(400)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .get('/api/v1/users/1')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).to.equal('Access Denied');
            done();
          });
          });
        });
     });
     it('should show a message access denied', (done) => {
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
      .expect(400)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .get('/api/v1/users/1')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).to.equal('Access Denied');
            done();
          });
          });
        });
     });

     it('should show a message user not found', (done) => {
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
      .expect(400)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .delete('/api/v1/users/3')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).to.equal('User Not Found');
            done();
          });
          });
        });
     });

           it('should show Invalid User ID when getting users', (done) => {
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
      .expect(400)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .delete('/api/v1/users/q')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).to.equal('Invalid User ID');
            done();
          });
          });
        });
     });
     
       it('should delete  users successfully if admin', (done) => {
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
      .expect(400)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .delete('/api/v1/users/1')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).to.equal('User deleted successfully.');
            done();
          });
          });
        });
     });

      it('should show Invalid User ID when getting users', (done) => {
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
      .expect(400)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .get('/api/v1/users/q/documents/')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).to.equal('Invalid User ID');
            done();
          });
          });
        });
     });

      it('should show access denied', (done) => {
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
      .expect(400)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .get('/api/v1/users/q/documents/')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).to.equal('Access Denied');
            done();
          });
          });
        });
     });
          
      it('should no document found', (done) => {
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
      .expect(400)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .get('/api/v1/users/1/documents/')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).to.equal('No document Found');
            done();
          });
          });
        });
     });

     it('should no document found', (done) => {
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
      .expect(400)
      .end((err, res) => {
        token = res.body.token;
        request(app)
          .get('/api/v1/users/1/documents/')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).to.equal('No document Found');
            done();
          });
          });
        });
     });
     it('should get document of users', (done) => {
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
            .get('/api/v1/users/1/documents')
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
               
});
