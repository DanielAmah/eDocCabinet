import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const User = require('../models/').Users;
const Document = require('../models').Documents;

module.exports = {
  signup(req, res) {
    const password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    return User
      .create({
        email: req.body.email,
        username: req.body.username,
        password,
        roleId: req.body.roleId,
      })
      .then((user) => {
        const token = jwt.sign({
          userId: user.id
        }, 'edoccabinet', {
          expiresIn: '24h'
        });
        res.status(201).send({
          success: true,
          message: 'Token Generated. Signup successful',
          userId: user.id,
          token,
        });
      })
      .catch(error => res.status(400).send(error));
  },

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
            userId: user.id
          }, 'edoccabinet', {
            expiresIn: '2h'
          });
          res.status(200).send({
            success: true,
            message: 'Token generated. Login Successful',
            userId: user.id,
            token,
          });
        } else {
          res.status(400).send({ message: 'Password is incorrect' });
        }
      })
      .catch(error => res.send(error));
  },

  listUsers(req, res) {
    if (req.decoded.roleId === 1) {
      return User
        .findAll({
          include: [{
            model: Document,
            as: 'myDocuments',
            attributes: ['id', 'title', 'content', 'owner', 'createdAt']
          }],
          attributes: ['id', 'email', 'username', 'createdAt']
        })
        .then(user => res.status(200).send(user))
        .catch(error => res.status(400).send(error));
    }
    return User
      .findAll({ attributes: ['id', 'email', 'username', 'createdAt'] })
      .then(user => res.status(200).send(user))
      .catch(error => res.status(400).send(error));
  },
};
