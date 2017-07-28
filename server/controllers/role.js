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
  updateRole(req, res) {
    if (!Number.isInteger(Number(req.params.roleId))) {
      return res.status(400).json({
        message: 'Invalid role ID'
      });
    }
    Roles.findById(req.decoded.userRole)
      .then(() => {
        if (req.decoded.userRole === 1) {
          return Roles
            .find({
              where: {
                id: req.params.roleId,
                userId: req.decoded.userId
              },
            })
            .then((role) => {
              if (!role) {
                return res.status(404).send({
                  message: 'The Role does not Exist',
                });
              }
              if (req.body.title) {
                req.body.title = (req.body.title).toLowerCase();
              }
              return role
                .update(req.body, { fields: Object.keys(req.body) })
                .then(() => res.status(200).send({
                  message: 'The Role has been successfully updated',
                  roleId: role.id,
                  title: role.title,
                }))
                .catch(() => res.status(400).send('Connection Error'));
            })
            .catch(() => res.status(400).send('Connection Error'));
        }
        return res.status(400).send({
          message: 'Access Denied'
        });
      });
  },
  deleteRole(req, res) {
    if (!Number.isInteger(Number(req.params.roleId))) {
      return res.status(400).send({
        message: 'Invalid document ID'
      });
    }
    Roles.findById(req.decoded.userRole)
      .then(() => {
        if (req.decoded.userRole === '1') {
          return Roles
            .find({
              where: {
                id: req.params.roleId
              }
            })
            .then((role) => {
              if (!role) {
                return res.status(400).send({
                  message: 'Role Not Found',
                });
              }
              return document
                .destroy()
                .then(() => res.status(200)
                  .send({ message: 'The Role has been deleted successfully.' }))
                .catch(() => res.status(400).send('Connection Error'));
            })
            .catch(() => res.status(400).send('Connection Error'));
        }
      });
  }
};
export default roleController;
