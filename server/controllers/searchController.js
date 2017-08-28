import roleHelper from '../helpers/roleHelper';
import userHelper from '../helpers/userHelper';
import documentHelper from '../helpers/documentHelper';
import models from '../models/';

const Users = models.Users;
const Documents = models.Documents;

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
    if (!roleHelper.isAdmin(request)) {
      return userHelper.accessDeniedMessage(response);
    }
    return Users.findAll(userHelper.searchQueryDatabase(request))
      .then((user) => {
        if (!user) {
          userHelper.showUserNotFoundMessage(response);
        }
        return response.status(200).send(user);
      })
      .catch(error => userHelper.searchDatabaseErrorMessage(response, error));
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
      documentHelper.checkQuery(response);
    }
    if (roleHelper.isAdmin(request) || roleHelper.isEditor(request)) {
      return Documents.findAll(documentHelper.searchQueryDatabase(request))
        .then((document) => {
          if (document.length === 0) {
            return response.status(404).send({
              message: 'No document Found'
            });
          }
          return response.status(200).send(document);
        })
        .catch(error =>
          documentHelper.searchDatabaseErrorMessage(response, error)
        );
    }
    return Documents.findAll(documentHelper.findQueryDatabase(request))
      .then((document) => {
        documentHelper.checkDocumentNotFound(response, document);
        return response.status(200).send(document);
      })
      .catch(error =>
        documentHelper.searchDatabaseErrorMessage(response, error)
      );
  }
};

export default searchController;
