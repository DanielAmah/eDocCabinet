import roleHelper from '../helpers/roleHelper';
import models from '../models/';

const Users = models.Users;
const Roles = models.Roles;

const roleController = {
  /**
   *  newRole: This allows admin to create a new role
   * @function newRole
   * @param {object} request sends a request to create a new role as an admin
   * @param {object} response get a response if
   * role is created successfully or throws an error
   * @return {object} - returns response status and json data
   */
  newRole(request, response) {
    roleHelper.validateTitle(request);
    const errors = request.validationErrors();
    if (errors) {
      response.status(400).send(roleHelper.validateErrorMessage(errors));
    } else {
      if (!roleHelper.isAdmin(request)) {
        return roleHelper.showAccessDeniedMessage(response);
      }
      return Roles.findOne({
        where: {
          title: request.body.title
        }
      }).then((checkuser) => {
        if (checkuser) {
          return roleHelper.ifRoleExistsErrorMessage(response);
        }
        return Roles.create({
          title: request.body.title.toLowerCase()
        })
          .then(role =>
            response.status(201).send({
              message: 'Role created successfully',
              title: role.title
            })
          )
          .catch(error => roleHelper.showDatabaseErrorMessage(response, error));
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
    if (!roleHelper.isAdmin(request)) {
      return roleHelper.showAccessDeniedMessage(response);
    }
    return Roles.findAll({
      attributes: ['id', 'title', 'createdAt']
    })
      .then(roles => response.status(200).send(roles))
      .catch(error => roleHelper.showListDatabaseErrorMessage(response, error));
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
    if (!roleHelper.isAdmin(request)) {
      return roleHelper.showAccessDeniedMessage(response);
    }
    return Roles.findAll({
      include: [
        {
          model: Users,
          as: 'users',
          attributes: ['id', 'username', 'email', 'roleId']
        }
      ]
    })
      .then(roles => response.status(200).send(roles))
      .catch(error =>
        roleHelper.ListRolesAndUsersDatabaseError(response, error)
      );
  }
};
export default roleController;
