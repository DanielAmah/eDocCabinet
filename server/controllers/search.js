
require('dotenv').config();


const User = require('../models/').Users;
const Documents = require('../models').Documents;
const Roles = require('../models').Roles;


const searchController = {
/**
   * searchUsers: Enables users to search for other registered users
   * @function searchUser
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
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
    /**
   * searchDocument: This allows registered users get documents by search key
   * where role = "user's role" and userId = "user's ID"  and
   * public & private document.
   * Its gets document either privates or public for admin user
   * @function searchDocument
   * @param {object} req request
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
  searchDocument(req, res) {
    if (!req.query.q) {
      return res.send({
        message: 'No key word supplied'
      });
    }
    Roles.findById(req.decoded.userRole)
      .then(() => {
        if (req.decoded.userRole === 1 || req.decoded.userRole === 2) {
          return Documents
            .findAll({
              where: {
                title: (req.query.q).toLowerCase()
              },
              attributes: ['id', 'title', 'access', 'content', 'owner', 'createdAt']
            })
            .then((document) => {
              if (document.length === 0) {
                return res.status(404).send({
                  message: 'Document Not Found',
                });
              }
              return res.status(200).send(document);
            })
            .catch(() => res.status(400).send('Connection Error'));
        }
        return Documents
          .findAll({
            where: {
              userId: req.decoded.userId,
              title: (req.query.q).toLowerCase(),
              access: [req.decoded.userRole, 'private', 'public'],
            },
            attributes: ['id', 'title', 'access', 'content', 'owner', 'createdAt']
          })
          .then((document) => {
            if (document.length === 0) {
              return res.status(404).send({
                message: 'Document Not Found',
              });
            }
            return res.status(200).send(document);
          })
          .catch(() => res.status(400).send('Connection Error'));
      });
  },

};

export default searchController;
