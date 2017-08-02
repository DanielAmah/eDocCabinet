import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Pagination from '../../utils/pagination';

require('dotenv').config();


const User = require('../models/').Users;
const Documents = require('../models').Documents;
const Roles = require('../models').Roles;
  /**
   * signUp: To creating accounts for users
   * @function signUp
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
const userController = {
  signup(req, res) {
    const password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    return User
      .create({
        email: req.body.email,
        username: req.body.username,
        password,
        roleId: req.body.roleId,
      })
      .then((user) => {
        const token = jwt.sign({
          userId: user.id,
          userRole: user.roleId,
          userUsername: user.username,
          userEmail: user.email,
        }, process.env.SECRET, {
          expiresIn: '24h'
        });
        res.status(201).send({
          success: true,
          message: 'Token Generated. Signup successful',
          userId: user.id,
          token,
        });
      })
      .catch(error => res.status(400).send(error));
  },
    /**
   * listUsers: Enables users to get list of registered users
   * query parameters are offset and limit
   * default offset is 0 and default limit is 10
   * @function listUsers
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
   /**
   * getUserPage: Enables users to get list of registered users by page
   * @function getUserPage
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
  listUsers(req, res) {
    Roles.findById(req.decoded.userRole)
      .then(() => {
        if (req.decoded.userRole === 1) {
          const limit = req.query && req.query.limit ? req.query.limit : 10;
          const offset = req.query && req.query.offset ? req.query.offset : 0;
          return User
            .findAndCountAll({
              attributes: ['id', 'email', 'username', 'roleId', 'createdAt'],
              limit,
              offset,
            })
            .then((user) => {
              const totalUserCount = user.count;
              const pageSize = Pagination.getPageSize(limit);
              const pageCount = Pagination.getPageCount(totalUserCount, limit);
              const currentPage = Pagination.getCurrentPage(limit, offset);
              const meta = {
                totalUserCount,
                pageSize,
                pageCount,
                currentPage,
              };
              res.status(200).send({ user, meta });
            })
            .catch(() => res.status(400).send({ message: 'Connection Error' }));
        } else if (req.decoded.userRole === 2) {
          return res.status(400).send({
            message: 'As the Editor please contact the Administrator to grant you temporary access'
          });
        }
        return res.status(400).send({
          message: 'Access Denied. You can not see register subscribers'
        });
      });
  },
     /**
   * listUsersAndDocuments: Enables users to get list of registered users with there documents
   * @function listUsersAndDocuments
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
  listUsersAndDocuments(req, res) {
    Roles.findById(req.decoded.userRole)
    .then(() => {
      if (req.decoded.userRole === 1) {
        return User
        .findAll({
          include: [{
            model: Documents,
            as: 'myDocuments'
          }]
        })
        .then(user => res.status(200).send(user))
        .catch(() => res.status(400).send({ message: 'Connection Error' }));
      } else if (req.decoded.userRole === 2) {
        return res.status(400).send({
          message: 'Access Denied. You are the Editor. Contact the Administrator'
        });
      }
      return res.status(400).send({
        message: 'Access Denied. You can not see registered subscribers'
      });
    });
  },
    /**
   * updateUser: Enables users to update their information
   *  where email must be unique
   * @function updateUser
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
  updateUsers(req, res) {
    if (!Number.isInteger(Number(req.params.userId))) {
      return res.status(400).send({
        message: 'Invalid User ID'
      });
    }
    Roles.findById(req.decoded.userRole)
      .then(() => {
        if (req.decoded.userRole === 1) {
          if (req.body.email) {
            return User.find({
              where: {
                email: req.body.email
              }
            })
              .then((response) => {
                if (response) {
                  return res.status(400).send({
                    message: 'Email Already Exist'
                  });
                }
                if (req.body.username) {
                  req.body.username = (req.body.username).toLowerCase();
                }
                return User
                  .findById(req.params.userId)
                  .then((user) => {
                    if (!user) {
                      return res.status(400).send({
                        message: 'User Not Found',
                      });
                    }
                    return user
                      .update(req.body, { fields: Object.keys(req.body) })
                      .then(() => res.status(200).send({
                        message: 'Subscriber Account  Updated',
                        email: user.email,
                        username: user.username,
                        role: user.roleId
                      }))
                      .catch(() => res.status(400).send({ message: 'Connection Error. May be Internet challenges' }));
                  })
                  .catch(() => res.status(400).send({ message: 'Connection Error. May be Internet challenges' }));
              })
              .catch(() => res.status(400).send({ message: 'Connection Error. May be Internet challenges' }));
          }
          return User
            .findById(req.params.userId)
            .then((user) => {
              if (!user) {
                return res.status(404).send({
                  message: 'User Not Found',
                });
              }
              if (req.body.username) {
                req.body.username = (req.body.username).toLowerCase();
              }
              return user
                .update(req.body, { fields: Object.keys(req.body) })
                .then(() => res.status(200).send({
                  message: 'Account Updated',
                  email: user.email,
                  username: user.username,
                  role: user.roleId
                }))
                .catch(() => res.status(400).send({ message: 'Connection Error. May be Internet challenges' }));
            })
            .catch(() => res.status(400).send({ message: 'Connection Error. May be Internet challenges' }));
        }
        if (req.body.email) {
          return User.find({
            where: {
              email: req.body.email
            }
          })
            .then((response) => {
              if (response) {
                return res.status(400).send({
                  message: 'Email Already Exist'
                });
              }
              if (req.body.username) {
                req.body.username = (req.body.username).toLowerCase();
              }
              if (req.body.role) {
                req.body.roleId = req.decoded.userRole;
              }
              return User
                .findById(req.params.userId)
                .then((user) => {
                  if (!user) {
                    return res.status(400).send({
                      message: 'User Not Found',
                    });
                  }
                  return user
                    .update(req.body, { fields: Object.keys(req.body) })
                    .then(() => res.status(200).send({
                      message: 'Subscriber Account  Updated',
                      email: user.email,
                      username: user.username,
                      role: user.roleId
                    }))
                    .catch(() => res.status(400).send({ message: 'Connection Error. May be Internet challenges' }));
                })
                .catch(() => res.status(400).send({ message: 'Connection Error. May be Internet challenges' }));
            })
            .catch(() => res.status(400).send({ message: 'Connection Error. May be Internet challenges' }));
        }
        return User
          .findById(req.params.userId)
          .then((user) => {
            if (!user) {
              return res.status(404).send({
                message: 'User Not Found',
              });
            }
            if (req.body.username) {
              req.body.username = (req.body.username).toLowerCase();
            }
            if (req.body.role) {
              req.body.roleId = req.decoded.userRole;
            }
            return user
              .update(req.body, { fields: Object.keys(req.body) })
              .then(() => res.status(200).send({
                message: 'Account Updated',
                email: user.email,
                username: user.username,
                role: user.roleId
              }))
              .catch(() => res.status(400).send({ message: 'Connection Error. May be Internet challenges' }));
          })
          .catch(() => res.status(400).send({ message: 'Connection Error. May be Internet challenges' }));
      });
  },
  /**
   * findUsers: Enables users to find other registered users
   * @function findUser
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
  findUsers(req, res) {
    if (!Number.isInteger(Number(req.params.userId))) {
      return res.status(400).send({
        message: 'Invalid User ID'
      });
    }
    Roles.findById(req.decoded.userRole)
      .then(() => {
        if (req.decoded.userRole === 1) {
          return User
            .find({
              where: {
                id: req.params.userId,
              },
              attributes: ['id', 'email', 'username', 'createdAt'],
            })
            .then((user) => {
              if (!user) {
                return res.status(404).send({
                  message: 'User not found'
                });
              }
              return res.status(200).send(user);
            })
            .catch(() => res.status(400).send({ message: 'Connection Error' }));
        }
        return res.status(400).send({
          message: 'Access Denied'
        });
      });
  },
    /**
   * deleteUsers: Enables users and admin users to delete account by ID
   * @function deleteUser
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
  deleteUsers(req, res) {
    if (!Number.isInteger(Number(req.params.userId))) {
      return res.status(400).send({
        message: 'Invalid User ID'
      });
    }
    Roles.findById(req.decoded.userRole)
      .then(() => {
        if (req.decoded.userId === Number(req.params.userId)
    || req.decoded.userRole === 1) {
          return User
            .findById(req.params.userId)
            .then((user) => {
              if (!user) {
                return res.status(404).send({
                  message: 'User Not Found',
                });
              }
              return user
                .destroy()
                .then(() => res.status(200)
                  .send({ message: 'User deleted successfully.' }))
                .catch(() => res.status(400).send({ message: 'Connection Error. May be Internet challenges' }));
            })
            .catch(() => res.status(400).send({ message: 'Connection Error. May be Internet challenges' }));
        }
        return res.status(400).send({
          message: 'Access Denied',
        });
      });
  },
   /**
   * findUserDocument: Enables users get documents that belongs to the user
   * @function findUserDocument
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
  findUserDocument(req, res) {
    Roles.findById(req.decoded.userRole)
      .then(() => {
        if (req.decoded.userId === Number(req.params.userId)
    || req.decoded.userRole === 1) {
          if (!Number.isInteger(Number(req.params.userId))) {
            return res.status(400).send({
              message: 'Invalid User ID'
            });
          }
          return Documents
            .findAll({
              where: {
                userId: req.params.userId,
              },
              attributes: ['id', 'title', 'access', 'content', 'owner', 'createdAt']
            })
            .then((documents) => {
              if (documents.length === 0) {
                return res.status(404).send({
                  message: 'No document Found',
                });
              }
              return res.status(200).send(documents);
            })
            .catch(() => res.status(400).send({ message: 'Connection Error. May be Internet challenges' }));
        }
        return res.status(400).send({
          message: 'Access Denied'
        });
      });
  },
};

export default userController;
