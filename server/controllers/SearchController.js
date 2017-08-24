import RoleHelper from '../helpers/RoleHelper';
import UserHelper from '../helpers/UserHelper';
import DocumentHelper from '../helpers/DocumentHelper';
import models from '../models/';

const Users = models.Users;
const Documents = models.Documents;


const SearchController = {
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
    return Users
    .findAll(UserHelper.SearchQueryDatabase(request))
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
       .findAll(DocumentHelper.SearchQueryDatabase(request))
        .then((document) => {
          DocumentHelper.DocumentNotFound(response, document);
          return response.status(200).send(document);
        })
        .catch(error => DocumentHelper.SearchDatabaseError(
        response, error));
    }
    return Documents
      .findAll(DocumentHelper.FindQueryDatabase(request))
      .then((document) => {
        DocumentHelper.DocumentNotFound(response, document);
        return response.status(200).send(document);
      })
      .catch(error => DocumentHelper.SearchDatabaseError(response, error));
  },

};

export default SearchController;
