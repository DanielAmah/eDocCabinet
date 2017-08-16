import bcrypt from 'bcrypt';
import JsonWebTokenHelper from '../helpers/JsonWebTokenHelper';
import UserHelper from '../helpers/UserHelper';

import model from '../models';


const Users = model.Users;

require('dotenv').config();

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
        if (user) {
          const passkey = bcrypt.compareSync(request.body.password, user.password);
          if (!passkey) {
            return UserHelper.InCorrectPassword(response);
          }
          const token = JsonWebTokenHelper(user);
          const oldUser = UserHelper.OldUser(user);
          response.status(200).send({ oldUser, token });
        } else {
          return UserHelper.UserNotFound(response);
        }
      })
        .catch(error => UserHelper.DatabaseError(response, error));
    }
  }
};

export default authController;
