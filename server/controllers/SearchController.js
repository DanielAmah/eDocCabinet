import RoleHelper from '../helpers/RoleHelper';
import UserHelper from '../helpers/UserHelper';
import DocumentHelper from '../helpers/DocumentHelper';
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
      return response.status(400).send({
        message: 'No key word supplied'
      });
    }
    if (!RoleHelper.isAdmin(request)) {
      return UserHelper.AccessDenied(response);
    }
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
              UserHelper.UserNotFound(response, user);
              return response.status(200).send(user);
            })
             .catch(error => UserHelper.SearchDatabaseError(response, error));
  },
    /**
   * searchDocument: This allows registered users get documents by search key
   * where role = "user's role" and userId = "user's ID"  and
   * public & private document.
   * Its gets document either privates or public for admin user
   * @function searchDocument
   * @param {object} request send a request that queries the document database
   * and search for documents
   * @param {object} response get a response
   * of queried documents or throws an error
   * @return {object} - returns response status and json data
   */
  searchDocument(request, response) {
    if (!request.query.q) {
      return response.status(400).send({
        message: 'No key word supplied'
      });
    }
    if (RoleHelper.isAdmin(request) || RoleHelper.isEditor(request)) {
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
              attributes: ['id', 'title', 'access',
                'content', 'owner', 'createdAt']
            })
            .then((document) => {
              DocumentHelper.DocumentNotFound(response, document);
              return response.status(200).send(document);
            })
            .catch(error => DocumentHelper.SearchDatabaseError(
              response, error));
    }
    return Documents
          .findAll({
            where: {
              title: {
                $iLike: `%${request.query.q}%`.toLowerCase()
              },
              $or: [{ access: 'public' }, { access: 'role',
                $and: { roleId: request.decoded.userRole } }, {
                  access: 'private',
                  $and: { userId: request.decoded.userId } }]
            },
            attributes: ['id', 'title', 'access',
              'content', 'owner', 'createdAt']
          })
          .then((document) => {
            DocumentHelper.DocumentNotFound(response, document);
            return response.status(200).send(document);
          })
           .catch(error => DocumentHelper.SearchDatabaseError(response, error));
  },

};

export default searchController;
