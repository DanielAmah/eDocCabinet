const Roles = require('../models').Roles;
const User = require('../models/').Users;

const roleController = {
     /**
   *  newRole: This allows admin to create a new role
   * @function newRole
   * @param {object} req request
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
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
     /**
   * listRoles: This allows admin to list all roles
   * @function  listRoles
   * @param {object} req request
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
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

      /**
   * listRolesAndUsers: This allows admin to list all roles
   * @function  listRolesAndUsers
   * @param {object} req request
   * @param {object} res response
   * @return {object} - returns response status and json data
   */

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
