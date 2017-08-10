import getRole from '../helpers/Helper';
import model from '../models/';

const User = model.Users;
const Roles = model.Roles;


const roleController = {
  /**
   *  newRole: This allows admin to create a new role
   * @function newRole
   * @param {object} request sends a request to create a new role as an admin
   * @param {object} response get a response if role is created successfully or throws an error
   * @return {object} - returns response status and json data
   */
  newRole(request, response) {
    if (getRole.isAdmin(request)) {
      return Roles
            .create({
              title: (request.body.title).toLowerCase(),
            })
            .then(() => response.status(201).send({
              message: 'Roles created successfully'
            }))
              .catch(error => response.status(400).send({
                error,
                message: 'Error creating new role'
              }));
    }
    return response.status(401).send({
      message: 'Access Denied'
    });
  },

  /**
   * listRoles: This allows admin to list all roles
   * @function  listRoles
   * @param {object} request sends a request to list all roles from the role table
   * @param {object} response get a response of all roles in the role table or throw an error
   * @return {object} - returns response status and json data
   */
  listRoles(request, response) {
    if (getRole.isAdmin(request)) {
      return Roles
            .findAll({
              attributes: ['id', 'title', 'createdAt']
            })
            .then(roles => response.status(200).send(roles))
             .catch(error => response.status(400).send({ error, message: 'Error retrieving all roles' }));
    }
    return response.status(401).send({
      message: 'Access Denied'
    });
  },

      /**
   * listRolesAndUsers: This allows admin to list all roles
   * @function  listRolesAndUsers
   * @param {object} request request send a request to list all roles and users from the role table
   * @param {object} response get a response of all roles and users from the role table
   * @return {object} - returns response status and json data
   */

  listRolesAndUsers(request, response) {
    if (getRole.isAdmin(request)) {
      return Roles
             .findAll({
               include: [{
                 model: User,
                 as: 'users',
                 attributes: ['id', 'username', 'email', 'roleId']
               }]
             })
            .then(roles => response.status(200).send(roles))
             .catch(error => response.status(400).send({
               error, message: 'Error occured while retrieving role'
             }));
    }
    return response.status(401).send({
      message: 'Access Denied'
    });
  },
};
export default roleController;
