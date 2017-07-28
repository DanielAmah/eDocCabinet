import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

require('dotenv').config();


const User = require('../models/').Users;
const Documents = require('../models').Documents;
const Roles = require('../models').Roles;

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

  login(req, res) {
    return User
      .findOne({
        where: {
          username: req.body.username
        }
      }).then((user) => {
        if (!user) {
          res.status(400).send({ message: 'User not found' });
        }
        const passkey = bcrypt.compareSync(req.body.password, user.password);
        if (passkey) {
          const token = jwt.sign({
            userId: user.id,
            userRole: user.roleId,
            userUsername: user.username,
            userEmail: user.email,
          }, process.env.SECRET, {
            expiresIn: '2h'
          });
          res.status(200).send({
            success: true,
            message: `Login Successful. Token generated. Welcome back!! ${user.username}`,
            userId: user.id,
            token,
          });
        } else {
          res.status(400).send({ message: 'Password is incorrect' });
        }
      })
      .catch(error => res.send(error));
  },
  listUsers(req, res) {
    Roles.findById(req.decoded.userRole)
      .then(() => {
        if (req.decoded.userRole === 1) {
          return User
            .findAll({
              attributes: ['id', 'email', 'username', 'roleId', 'createdAt'],
            })
            .then(user => res.status(200).send(user))
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
  listUsersPage(req, res) {
    Roles.findById(req.decoded.userRole)
      .then(() => {
        if (req.decoded.userRole === 1) {
          const limit = req.query && req.query.limit ? req.query.limit : 0;
          const offset = req.query && req.query.offset ? req.query.offset : 0;
          return User
            .findAll({
              attributes: ['id', 'email', 'username', 'roleId', 'createdAt'],
              limit,
              offset,
            })
            .then(user => res.status(200).send(user))
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
                      .catch(() => res.status(400).send({ message: 'Connection Error' }));
                  })
                  .catch(() => res.status(400).send({ message: 'Connection Error' }));
              })
              .catch(() => res.status(400).send({ message: 'Connection Error' }));
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
                .catch(() => res.status(400).send({ message: 'Connection Error' }));
            })
            .catch(() => res.status(400).send({ message: 'Connection Error' }));
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
                    .catch(() => res.status(400).send({ message: 'Connection Error' }));
                })
                .catch(() => res.status(400).send({ message: 'Connection Error' }));
            })
            .catch(() => res.status(400).send({ message: 'Connection Error' }));
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
              .catch(() => res.status(400).send({ message: 'Connection Error' }));
          })
          .catch(() => res.status(400).send({ message: 'Connection Error' }));
      });
  },
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
                .catch(() => res.status(400).send({ message: 'Connection Error' }));
            })
            .catch(() => res.status(400).send({ message: 'Connection Error' }));
        }
        return res.status(400).send({
          message: 'Access Denied',
        });
      });
  },
  searchUsers(req, res) {
    if (!req.query.q) {
      return res.send({
        message: 'No key word supplied'
      });
    }
    Roles.findById(req.decoded.userRole)
      .then(() => {
        if (req.decoded.userRole === 1) {
          return User
            .findAll({
              where: {
                username: (req.query.q).toLowerCase()
              }
            })
            .then((user) => {
              if (user.length === 0) {
                return res.status(404).send({
                  message: 'User does not exist',
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
            .catch(() => res.status(400).send({ message: 'Connection Error' }));
        }
        return res.status(400).send({
          message: 'Access Denied'
        });
      });
  },
};

export default userController;
