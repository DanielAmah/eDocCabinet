import bcrypt from 'bcrypt';
import getUserToken from '../helpers/jwt';

require('dotenv').config();

const User = require('../models/').Users;
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
    return User
      .findOne({
        where: {
          username: request.body.username
        }
      }).then((user) => {
        if (!user) {
          response.status(404).send({ message: 'User not found' });
        }
        const passkey = bcrypt.compareSync(request.body.password, user.password);
        if (passkey) {
          const token = getUserToken(user);
          const oldUser = {
            success: true,
            userId: user.id,
            userEmail: user.email,
            
          };
          response.status(200).send({ oldUser, token });
        } else {
          response.status(401).send({ message: 'Password is incorrect' });
        }
      })
        .catch(error => response.status(400).send({
          error,
          message: 'Error occurred while authenticating user'
        }));
  }
};

export default authController;
