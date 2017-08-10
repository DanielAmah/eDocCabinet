import bcrypt from 'bcrypt';
import Pagination from '../utils/pagination';
import model from '../models/';
import getUserToken from '../helpers/jwt';
import getRole from '../helpers/Helper';

require('dotenv').config();

const User = model.Users;
const Documents = model.Documents;


  /**
   * signUp: To creating accounts for users
   * @function signUp
   * @param {object} request send a request to encrypt password with bcrypt
   * to create a new user
   * @param {object} response get response if signup is successful.
   * @return {object}  returns response status and json data
   */
const userController = {
  signup(request, response) {
    const password = bcrypt.hashSync(request.body.password, bcrypt.genSaltSync(10));
    return User
     .findOne({
       where: {
         email: request.body.email
       }
     })
      .then((checkuser) => {
        if (checkuser) {
          return response.status(409).send({ message: 'User Already Exists' });
        }
        User
      .create({
        email: request.body.email,
        username: request.body.username,
        password,
        roleId: request.body.roleId,
      })
      .then((user) => {
        const token = getUserToken(user);
        const newUser = {
          success: true,
          userId: user.id,
          userEmail: user.email,
          userUsername: user.username
        };
        response.status(201).send({ newUser, token });
      })
       .catch(error => response.status(400).send({
         error, message: `Error creating ${request.body.name}` }));
      });
  },
    /**
   * listUsers: Enables users to get list of registered users
   * query parameters are offset and limit
   * default offset is 0 and default limit is 10
   * @function listUsers
   * @param {object} request send a request to list all registered users in the database
   * @param {object} response get a response if retrieving users is successful or not
   * @return {object}  returns response status and json data of all registered users
   */
   /**
   * getUserPage: Enables users to get list of registered users by page
   * @function getUserPage
   * @param {object} request request to list users by page
   * @param {object} response response
   * @return {object}  returns response status and json data
   */
  listUsers(request, response) {
    if (getRole.isAdmin(request)) {
      const limit = request.query && request.query.limit ? request.query.limit : 10;
      const offset = request.query && request.query.offset ? request.query.offset : 0;
      return User
            .findAndCountAll({
              attributes: ['id', 'email', 'username', 'roleId', 'createdAt'],
              limit,
              offset,
            })
            .then((users) => {
              const totalUserCount = users.count;
              const pageSize = Pagination.getPageSize(limit);
              const pageCount = Pagination.getPageCount(totalUserCount, limit);
              const currentPage = Pagination.getCurrentPage(limit, offset);
              const meta = {
                totalUserCount,
                pageSize,
                pageCount,
                currentPage,
              };
              const userlist = users.rows;
              response.status(200).send({ userlist, meta });
            })
             .catch(error => response.status(400).send({
               error, message: 'Error retrieving users' }));
    }
    return response.status(401).send({
      message: 'Access Denied. You can not see register subscribers'
    });
  },
     /**
   * listUsersAndDocuments: Enables users to get list of registered users with there documents
   * @function listUsersAndDocuments
   * @param {object} request send a request to retrieve list of users and documents
   * @param {object} response get a response of all users and documents or throws an error.
   * @return {object}  returns response status and json data
   */
  listUsersAndDocuments(request, response) {
    if (getRole.isAdmin(request)) {
      return User
        .findAll({
          attributes: ['id', 'email', 'username', 'roleId', 'createdAt'],
          include: [{
            model: Documents,
            as: 'myDocuments'
          }]
        })
        .then(users => response.status(200).send(
          users))
       .catch(error => response.status(400).send({
         error, message: 'Error retrieving users' }));
    }
    return response.status(401).send({
      message: 'Access Denied. You can not see registered subscribers'
    });
  },
    /**
   * updateUser: Enables users to update their information
   *  where email must be unique
   * @function updateUser
   * @param {object} request send a request to update users
   * @param {object} response receives response if update is successful or it threw an error
   * @return {object}  returns response status and json data
   */
  updateUsers(request, response) {
    if (!Number.isInteger(Number(request.params.userId))) {
      return response.status(400).send({
        message: 'Invalid User ID'
      });
    }
    if (getRole.isAdmin(request)) {
      User.find({
        where: {
          email: request.body.email
        }
      })
              .then(() => {
                if (request.body.username) {
                  request.body.username = (request.body.username).toLowerCase();
                }
                return User
                  .findById(request.params.userId)
                  .then((user) => {
                    if (!user) {
                      return response.status(404).send({
                        message: 'User Not Found',
                      });
                    }
                    const password = request.body.password ?
              bcrypt.hashSync(request.body.password,
                bcrypt.genSaltSync(10)) : null;
                    return user
                      .update({
                        username: request.body.username || user.username,
                        email: request.body.email || user.email,
                        password: password || user.password,
                        roleId: request.body.roleId || user.roleId
                      })
                      .then(() => response.status(200).send({
                        email: user.email,
                        username: user.username,
                        role: user.roleId
                      }));
                  })
                  .catch(error => response.status(404).send({ error, message: 'ID not found in the database' }));
              })
              .catch(error => response.status(400).send({ error, message: 'Error updating user' }));

      return User
            .findById(request.params.userId)
            .then((user) => {
              if (!user) {
                return response.status(404).send({
                  message: 'User Not Found',
                });
              }
              if (request.body.username) {
                request.body.username = (request.body.username).toLowerCase();
              }
              const password = request.body.password ?
              bcrypt.hashSync(request.body.password,
                bcrypt.genSaltSync(10)) : null;
              return user
                .update({
                  username: request.body.username || user.username,
                  email: request.body.email || user.email,
                  password: password || user.password,
                  roleId: request.body.roleId || user.roleId
                })
                .then(() => response.status(200).send({
                  email: user.email,
                  username: user.username,
                  role: user.roleId
                }));
            })
            .catch(error => response.status(400).send({ error, message: 'Error updating user' }));
    }
    if (request.body.email) {
      User.find({
        where: {
          email: request.body.email
        }
      })
            .then(() => {
              if (request.body.username) {
                request.body.username = (request.body.username).toLowerCase();
              }
              if (request.body.role) {
                request.body.roleId = request.decoded.userRole;
              }
              return User
                .findById(request.params.userId)
                .then((user) => {
                  if (!user) {
                    return response.status(404).send({
                      message: 'User Not Found',
                    });
                  }
                  const password = request.body.password ?
              bcrypt.hashSync(request.body.password,
                bcrypt.genSaltSync(10)) : null;
                  return user
                    .update({
                      username: request.body.username || user.username,
                      email: request.body.email || user.email,
                      password: password || user.password,
                      roleId: request.body.roleId || user.roleId
                    })
                    .then(() => response.status(200).send({
                      email: user.email,
                      username: user.username,
                      role: user.roleId
                    }));
                })
                .catch(error => response.status(404).send({ error, message: 'ID not found in the database' }));
            })
             .catch(error => response.status(400).send({ error, message: 'Error updating user' }));
    }
    return User
          .findById(request.params.userId)
          .then((user) => {
            if (!user) {
              return response.status(404).send({
                message: 'User Not Found',
              });
            }
            if (request.body.username) {
              request.body.username = (request.body.username).toLowerCase();
            }
            if (request.body.role) {
              request.body.roleId = request.decoded.userRole;
            }
            const password = request.body.password ?
              bcrypt.hashSync(request.body.password,
                bcrypt.genSaltSync(10)) : null;
            return user
              .update({
                username: request.body.username || user.username,
                email: request.body.email || user.email,
                password: password || user.password,
                roleId: request.body.roleId || user.roleId
              })
              .then(() => response.status(200).send({
                email: user.email,
                username: user.username,
                role: user.roleId
              }));
          })
          .catch(error => response.status(400).send({ error, message: 'Error updating user' }));
  },
  /**
   * findUsers: Enables users to find other registered users
   * @function findUser
   * @param {object} request send request to find a registered user from the database.
   * @param {object} response get a response of a user from the database
   * @return {object}  returns response status and json data of the user retrieved
   */
  findUsers(request, response) {
    if (!Number.isInteger(Number(request.params.userId))) {
      return response.status(400).send({
        message: 'Invalid User ID'
      });
    }
    if (getRole.isAdmin(request)) {
      return User
            .find({
              where: {
                id: request.params.userId,
              },
              attributes: ['id', 'email', 'username', 'createdAt'],
            })
            .then((user) => {
              if (!user) {
                return response.status(404).send({
                  message: 'User not found'
                });
              }
              return response.status(200).send(user);
            })
           .catch(error => response.status(400).send({ error, message: 'Error occurred while retrieving user' }));
    }
    return response.status(401).send({
      message: 'Access Denied'
    });
  },
    /**
   * deleteUsers: Enables users and admin users to delete account by ID
   * @function deleteUser
   * @param {object} request sends a request to delete users from the user's database
   * @param {object} response get a response of delete successful or throw an error
   * @return {object}  returns response status and json data
   */
  deleteUsers(request, response) {
    if (!Number.isInteger(Number(request.params.userId))) {
      return response.status(400).send({
        message: 'Invalid User ID'
      });
    }
    if (request.decoded.userId === Number(request.params.userId)
    || getRole.isAdmin(request)) {
      return User
            .findById(request.params.userId)
            .then((user) => {
              if (!user) {
                return response.status(404).send({
                  message: 'User Not Found',
                });
              }
              return user
                .destroy()
                .then(() => response.status(200)
                  .send({ message: 'User deleted successfully.' }));
            })
            .catch(error => response.status(400).send({ error, message: 'Error deleting user' }));
    }
    return response.status(401).send({ message: 'Unauthorized access' });
  },
   /**
   * findUserDocument: Enables users get documents that belongs to the user
   * @function findUserDocument
   * @param {object} request send a request to retrieve user document
   * @param {object} response get a response of all users and documents
   * @return {object}  returns response status and json data
   */
  findUserDocument(request, response) {
    if (request.decoded.userId === Number(request.params.userId)
    || getRole.isAdmin(request)) {
      if (!Number.isInteger(Number(request.params.userId))) {
        return response.status(400).send({
          message: 'Invalid User ID'
        });
      }
      return Documents
            .findAll({
              where: {
                userId: request.params.userId,
              },
              attributes: ['id', 'title', 'access', 'content', 'owner', 'createdAt']
            })
            .then((documents) => {
              if (documents.length === 0) {
                return response.status(404).send({
                  message: 'No document Found',
                });
              }
              return response.status(200).send(documents);
            })
             .catch(error => response.status(400).send({
               error, message: 'Error occurred while retrieving user document'
             }));
    }
    return response.status(401).send({ message: 'Unauthorized access' });
  },
};

export default userController;
