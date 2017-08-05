import getRole from '../helpers/Helper';
import model from '../models/';

require('dotenv').config();


const User = model.Users;
const Documents = model.Documents;


const searchController = {
/**
   * searchUsers: Enables users to search for other registered users
   * @function searchUser
   * @param {object} request request
   * @param {object} response response
   * @return {object}  returns response status and json data
   */
  searchUsers(request, response) {
    if (!request.query.q) {
      return response.send({
        message: 'No key word supplied'
      });
    }
    if (getRole.isAdmin(request)) {
      return User
            .findAll({
              where: {
                $or: [
                  { email: {
                    $iLike: `%${request.query.q}%`.toLowerCase()
                  },
                    username: {
                      $iLike: `%${request.query.q}%`.toLowerCase()
                    } }
                ]
              },
              attributes: ['id', 'email', 'username', 'roleId', 'createdAt']
            })
            .then((user) => {
              if (user.length === 0) {
                return response.status(404).send({
                  message: 'User does not exist',
                });
              }
              return response.status(200).send(user);
            })
             .catch(error => response.status(400).send({ error, message: 'Error occurred while retrieving Users' }));
    }
    return response.status(401).send({
      message: 'Access Denied'
    });
  },
    /**
   * searchDocument: This allows registered users get documents by search key
   * where role = "user's role" and userId = "user's ID"  and
   * public & private document.
   * Its gets document either privates or public for admin user
   * @function searchDocument
   * @param {object} request send a request that queries the document database
   * and search for documents
   * @param {object} response get a response of queried documents or throws an error
   * @return {object} - returns response status and json data
   */
  searchDocument(request, response) {
    if (!request.query.q) {
      return response.send({
        message: 'No key word supplied'
      });
    }
    if (getRole.isAdmin(request) || getRole.Editor(request)) {
      return Documents
            .findAll({
              where: {
                $or: [
                  { title: {
                    $iLike: `%${request.query.q}%`.toLowerCase()
                  }
                  }
                ]
              },
              attributes: ['id', 'title', 'access', 'content', 'owner', 'createdAt']
            })
            .then((document) => {
              if (document.length === 0) {
                return response.status(404).send({
                  message: 'Document Not Found',
                });
              }
              return response.status(200).send(document);
            })
            .catch(error => response.status(400).send({ error, message: 'Error occurred while retrieving documents' }));
    }
    return Documents
          .findAll({
            where: {
              userId: request.decoded.userId,
              title: {
                $iLike: `%${request.query.q}%`.toLowerCase()
              },
              access: [request.decoded.userRole, 'private', 'public'],
            },
            attributes: ['id', 'title', 'access', 'content', 'owner', 'createdAt']
          })
          .then((document) => {
            if (document.length === 0) {
              return response.status(404).send({
                message: 'Document Not Found',
              });
            }
            return response.status(200).send(document);
          })
           .catch(error => response.status(400).send({ error, message: 'Error occurred while retrieving documents' }));
  },

};

export default searchController;
