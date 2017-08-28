import dotenv from 'dotenv';
import jsonWebTokenHelper from '../helpers/jsonWebTokenHelper';
import userHelper from '../helpers/userHelper';
import authHelper from '../helpers/authHelper';
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
const authController = {
  login(request, response) {
    userHelper.validateLogin(request);
    const errors = request.validationErrors();
    if (errors) {
      response.status(400).send(userHelper.validateErrorMessage(errors));
    } else {
      return Users.findOne({
        where: {
          username: request.body.username
        }
      })
        .then((user) => {
          authHelper.auth(user, request, jsonWebTokenHelper, response);
        })
        .catch(error => userHelper.loginDatabaseErrorMessage(response, error));
    }
  }
};

export default authController;
