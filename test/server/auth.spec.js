 /* eslint-disable no-unused-expressions */
 import supertest from 'supertest';
 import { expect } from 'chai';
 import { TestHelper, defaultPassword } from '../TestHelper';
 import models from '../../server/models';


 const app = require('../../build/server');

 const request = supertest.agent(app);


 const adminUser = TestHelper.specUser1;
 const specWrongUser = TestHelper.specWrongUser;


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
   describe('Login Endpoint', () => {
     beforeEach((done) => {
       models.Users.create(
        adminUser
      ).then(() => {
        done();
      });
     });
     it('should return a message "user not found" if user not found', (done) => {
       request.post('/api/v1/users/login')
        .send(specWrongUser)
        .end((err, response) => {
          expect(response.status).to.equal(404);
          expect(response.body.message).to.equal('User not found');
          done();
        });
     });
     it('should not log a user in with wrong password', (done) => {
       request.post('/api/v1/users/login')
        .send({
          username: adminUser.username,
          password: 'nothepassword'
        })
        .end((err, response) => {
          expect(response.status).to.equal(403);
          expect(response.body.message).to.equal('Password is incorrect');
          done();
        });
     });
     it('should successfully log a user in', (done) => {
       request.post('/api/v1/users/login')
        .send({
          username: adminUser.username,
          password: defaultPassword
        })
        .end((err, response) => {
          expect(response.status).to.equal(200);
          done();
        });
     });
   });
 });
