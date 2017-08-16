import bcrypt from 'bcrypt';
import model from '../models/';
import JsonWebTokenHelper from '../helpers/JsonWebTokenHelper';
import RoleHelper from '../helpers/RoleHelper';
import PageHelper from '../helpers/PageHelper';
import UserHelper from '../helpers/UserHelper';
import DocumentHelper from '../helpers/DocumentHelper';

require('dotenv').config();

const Users = model.Users;
const Documents = model.Documents;


  /**
   * signUp: To creating accounts for users
   * @function signUp
   * @param {object} request send a request to encrypt password with bcrypt
   * to create a new user
   * @param {object} response get response if signup is successful.
   * @return {object}  returns response status and json data
   */
const UserController = {
  signup(request, response) {
    UserHelper.Validation(request);
    const errors = request.validationErrors();
    if (errors) {
      response.status(400).send(UserHelper.ValidationErrorMessage(errors));
    } else {
      const password = bcrypt.hashSync(request.body.password, bcrypt.genSaltSync(10));
      return Users
     .findOne({
       where: {
         email: request.body.email
       }
     })
      .then((checkuser) => {
        UserHelper.IfEmailExists(checkuser, response);
        Users
      .create({
        email: request.body.email.toLowerCase(),
        username: request.body.username,
        password,
        roleId: request.body.roleId,
      })
      .then((user) => {
        const token = JsonWebTokenHelper(user);
        const newUser = UserHelper.newUser(user);
        response.status(201).send({ newUser, token });
      })
       .catch(error => UserHelper.CreateDatabaseError(response, error));
      });
    }
  },
    /**
   * listUsers: Enables users to get list of registered users
   * query parameters are offset and limit
   * default offset is 0 and default limit is 10
   * @function listUsers
   * @param {object} request send a request to list all registered users in the database
   * @param {object} response get a response if retrieving users is successful or not
   * @return {object}  returns response status and json data of all registered users
   */
   /**
   * getUserPage: Enables users to get list of registered users by page
   * @function getUserPage
   * @param {object} request request to list users by page
   * @param {object} response response
   * @return {object}  returns response status and json data
   */
  listUsers(request, response) {
    if (!RoleHelper.isAdmin(request)) {
      return UserHelper.AccessDenied(response);
    }
    return Users
            .findAndCountAll({
              attributes: ['id', 'email', 'username', 'roleId', 'createdAt'],
              limit: PageHelper.GetLimit(request),
              offset: PageHelper.GetOffset(request)
            })
            .then((users) => {
              const meta =
                PageHelper.GetPageMeta(request, users, PageHelper.GetLimit, PageHelper.GetOffset);
              const userlist = users.rows;
              response.status(200).send({ userlist, meta });
            })
             .catch(error => UserHelper.ListDatabaseError(response, error));
  },
     /**
   * listUsersAndDocuments: Enables users to get list of registered users with there documents
   * @function listUsersAndDocuments
   * @param {object} request send a request to retrieve list of users and documents
   * @param {object} response get a response of all users and documents or throws an error.
   * @return {object}  returns response status and json data
   */
  listUsersAndDocuments(request, response) {
    if (!RoleHelper.isAdmin(request)) {
      return UserHelper.UserAndDocumentAccessDenied(response);
    }
    return Users
        .findAndCountAll({
          attributes: ['id', 'email', 'username', 'roleId', 'createdAt'],
          include: [{
            model: Documents,
            as: 'myDocuments'
          }],
          limit: PageHelper.GetLimit(request),
          offset: PageHelper.GetOffset(request)
        })
        .then((users) => {
          const meta =
                PageHelper.GetPageMeta(request, users, PageHelper.GetLimit, PageHelper.GetOffset);
          const userlist = users.rows;
          response.status(200).send(
          { userlist, meta });
        })
       .catch(error => UserHelper.ListUserAndDocumentDatabaseError(response, error));
  },
    /**
   * updateUser: Enables users to update their information
   *  where email must be unique
   * @function updateUser
   * @param {object} request send a request to update users
   * @param {object} response receives response if update is successful or it threw an error
   * @return {object}  returns response status and json data
   */
  updateUsers(request, response) {
    UserHelper.Validation(request);
    const errors = request.validationErrors();
    if (errors) {
      response.status(400).send(UserHelper.ValidationErrorMessage(errors));
    } else {
      if (!Number.isInteger(Number(request.params.userId))) {
        return UserHelper.CheckIdIsNumber(response);
      }
      if (!(RoleHelper.isSubscriber(request) || RoleHelper.isAdmin(request))) {
        return UserHelper.UpdateAccessDenied(response);
      }
      Users.find({
        where: {
          $or: [
            {
              id: request.params.userId
            }
          ]
        }
      });
      return Users.findById(request.params.userId)
                  .then((user) => {
                    if (!user) {
                      UserHelper.UserNotFound(response);
                    }
                    const password = request.body.password ?
              bcrypt.hashSync(request.body.password,
                bcrypt.genSaltSync(10)) : null;
                    return user
                      .update({
                        username: request.body.username || user.username,
                        email: request.body.email || user.email,
                        password: password || user.password
                      })
                      .then(() => response.status(200).send({
                        email: user.email,
                        username: user.username,
                        role: user.roleId
                      }));
                  })
              .catch(error => UserHelper.UpdateDatabaseError(response, error));
    }
  },
   /**
   * updateUsersRole: Enables admin to update users role
   * @function updateUsersRole
   * @param {object} request send a request to update users role
   * @param {object} response receives response if update is successful or it threw an error
   * @return {object}  returns response status and json data
   */
  updateUsersRole(request, response) {
    UserHelper.RoleValidation(request);
    const errors = request.validationErrors();
    if (errors) {
      response.status(400).send(UserHelper.ValidationErrorMessage(errors));
    } else {
      UserHelper.ChangeToLowerCase(request);
      if (!RoleHelper.isAdmin(request)) {
        return UserHelper.UpdateAccessDenied(response);
      }
      Users.find({
        where: {
          $or: [
            {
              id: request.params.userId
            }
          ]
        }
      });
      return Users.findById(request.params.userId)
                  .then((user) => {
                    if (!user) {
                      UserHelper.UserNotFound(response);
                    }
                    return user
                      .update({
                        roleId: request.body.roleId || user.roleId
                      })
                      .then(() => response.status(200).send({
                        message: 'User role updated successfully',
                        role: user.roleId
                      }));
                  })
              .catch(error => UserHelper.UpdateRoleDatabaseError(response, error));
    }
  },
  /**
   * findUsers: Enables users to find other registered users
   * @function findUser
   * @param {object} request send request to find a registered user from the database.
   * @param {object} response get a response of a user from the database
   * @return {object}  returns response status and json data of the user retrieved
   */
  findUsers(request, response) {
    if (!Number.isInteger(Number(request.params.userId))) {
      return UserHelper.CheckIdIsNumber(response);
    }
    if (!(RoleHelper.isSubscriber(request) || RoleHelper.isAdmin(request))) {
      return UserHelper.FindUsersAccessDenied(response);
    }
    return Users
            .find({
              where: {
                id: request.params.userId,
              },
              attributes: ['id', 'email', 'username', 'createdAt'],
            })
            .then((user) => {
              if (!user) {
                UserHelper.UserNotFound(response);
              }
              return response.status(200).send(user);
            })
           .catch(error => UserHelper.FindUserDatabaseError(response, error));
  },
    /**
   * deleteUsers: Enables users and admin users to delete account by ID
   * @function deleteUser
   * @param {object} request sends a request to delete users from the user's database
   * @param {object} response get a response of delete successful or throw an error
   * @return {object}  returns response status and json data
   */
  deleteUsers(request, response) {
    if (!Number.isInteger(Number(request.params.userId))) {
      return UserHelper.CheckIdIsNumber(response);
    }
    if (!(RoleHelper.isSubscriber(request) || RoleHelper.isAdmin(request))) {
      UserHelper.DeleteAccessDenied(response);
    }
    return Users
            .findById(request.params.userId)
            .then((user) => {
              if (!user) {
                return UserHelper.UserNotFound(response);
              }
              return user
                .destroy()
                .then(() => response.status(200)
                  .send({ message: 'User deleted successfully.' }));
            })
            .catch(error => UserHelper.DeleteDatabaseError(response, error));
  },
   /**
   * findUserDocument: Enables users get documents that belongs to the user
   * @function findUserDocument
   * @param {object} request send a request to retrieve user document
   * @param {object} response get a response of all users and documents
   * @return {object}  returns response status and json data
   */
  findUserDocument(request, response) {
    if (!Number.isInteger(Number(request.params.userId))) {
      return UserHelper.CheckIdIsNumber(response);
    }
    if (!(RoleHelper.isSubscriber(request) || RoleHelper.isAdmin(request))) {
      return UserHelper.DocumentAccessDenied(response);
    }
    return Documents
            .findAll({
              where: {
                userId: request.params.userId,
              },
              attributes: ['id', 'title', 'access', 'content', 'owner', 'createdAt']
            })
            .then((documents) => {
              if (!documents) {
                DocumentHelper.DocumentNotFound(documents);
              }
              return response.status(200).send(documents);
            })
             .catch(error => UserHelper.FindUserDocDatabaseError(response, error));
  },
};

export default UserController;
