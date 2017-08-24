import dotenv from 'dotenv';
import JsonWebTokenHelper from '../helpers/JsonWebTokenHelper';
import UserHelper from '../helpers/UserHelper';
import AuthHelper from '../helpers/AuthHelper';
import models from '../models';


const Users = models.Users;

dotenv.config();

  /**
   * login: Enables users to login to their accounts
   * @function login
   * @param {object} request send a request to login a registered user
   * @param {object} response receive a response if login is successful
   * throws an error.
   * @return {object}  returns response status and json data
   */
const AuthController = {
  login(request, response) {
    UserHelper.LoginValidation(request);
    const errors = request.validationErrors();
    if (errors) {
      response.status(400).send(UserHelper.ValidationErrorMessage(errors));
    } else {
      return Users
          .findOne({
            where: {
              username: request.body.username
            }
          }).then((user) => {
            AuthHelper.Auth(user, request, JsonWebTokenHelper, response);
          })
        .catch(error => UserHelper.DatabaseError(response, error));
    }
  }
};

export default AuthController;
