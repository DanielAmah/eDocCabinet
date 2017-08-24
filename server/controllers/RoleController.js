import RoleHelper from '../helpers/RoleHelper';
import models from '../models/';


const Users = models.Users;
const Roles = models.Roles;


const RoleController = {
  /**
   *  newRole: This allows admin to create a new role
   * @function newRole
   * @param {object} request sends a request to create a new role as an admin
   * @param {object} response get a response if
   * role is created successfully or throws an error
   * @return {object} - returns response status and json data
   */
  newRole(request, response) {
    RoleHelper.Validation(request);
    const errors = request.validationErrors();
    if (errors) {
      response.status(400).send(RoleHelper.ValidationErrorMessage(errors));
    } else {
      if (!RoleHelper.isAdmin(request)) {
        return RoleHelper.AccessDenied(response);
      }
      return Roles
        .findOne({
          where: {
            title: request.body.title
          }
        })
      .then((checkuser) => {
        if (checkuser) {
          return RoleHelper.IfRoleExists(response);
        }
        return Roles
        .create({
          title: (request.body.title).toLowerCase(),
        })
        .then(() => response.status(201).send({
          message: 'Roles created successfully'
        }))
        .catch(error => RoleHelper.DatabaseError(response, error));
      });
    }
  },


  /**
   * listRoles: This allows admin to list all roles
   * @function  listRoles
   * @param {object} request sends a request to
   * list all roles from the role table
   * @param {object} response get a response of
   *  all roles in the role table or throw an error
   * @return {object} - returns response status and json data
   */
  listRoles(request, response) {
    if (!RoleHelper.isAdmin(request)) {
      return RoleHelper.AccessDenied(response);
    }
    return Roles
      .findAll({
        attributes: ['id', 'title', 'createdAt']
      })
      .then(roles => response.status(200).send(roles))
      .catch(error => RoleHelper.ListDatabaseError(response, error));
  },

      /**
   * listRolesAndUsers: This allows admin to list all roles
   * @function  listRolesAndUsers
   * @param {object} request request send a request
   * to list all roles and users from the role table
   * @param {object} response get a response of all
   *  roles and users from the role table
   * @return {object} - returns response status and json data
   */

  listRolesAndUsers(request, response) {
    if (!RoleHelper.isAdmin(request)) {
      return RoleHelper.AccessDenied(response);
    }
    return Roles
      .findAll({
        include: [{
          model: Users,
          as: 'users',
          attributes: ['id', 'username', 'email', 'roleId']
        }]
      })
      .then(roles => response.status(200).send(roles))
      .catch(error => RoleHelper.ListRolesAndUsersDatabaseError(
      response, error));
  },
};
export default RoleController;
