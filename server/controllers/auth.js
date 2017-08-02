import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

require('dotenv').config();


const User = require('../models/').Users;
  /**
   * login: Enables users to login to their accounts
   * @function login
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
const authController = {
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
  }
};

export default authController;
