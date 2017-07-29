const Roles = require('../models').Roles;
const User = require('../models/').Users;

const roleController = {
  newRole(req, res) {
    Roles.findById(req.decoded.userRole)
      .then(() => {
        if (req.decoded.userRole === 1) {
          return Roles
            .create({
              title: (req.body.title).toLowerCase(),
            })
            .then(() => res.status(201).send({
              message: 'Roles created successfully'
            }))
            .catch(() => res.status(400).send('Connection Error'));
        }
        return res.status(400).send({
          message: 'Access Denied'
        });
      });
  },
  listRoles(req, res) {
    Roles.findById(req.decoded.userRole)
      .then(() => {
        if (req.decoded.userRole === 1) {
          return Roles
            .findAll({
              attributes: ['id', 'title', 'createdAt']
            })
            .then(roles => res.status(200).send(roles))
            .catch(() => res.status(400).send('Connection Error'));
        }
        return res.status(400).send({
          message: 'Access Denied'
        });
      });
  },

  listRolesAndUsers(req, res) {
    Roles.findById(req.decoded.userRole)
      .then(() => {
        if (req.decoded.userRole === 1) {
          return Roles
             .findAll({
               include: [{
                 model: User,
                 as: 'users'
               }]
             })
            .then(roles => res.status(200).send(roles))
            .catch(() => res.status(400).send('Connection Error'));
        }
        return res.status(400).send({
          message: 'Access Denied'
        });
      });
  },
};
export default roleController;
