import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import models from '../models/';
import jsonWebTokenHelper from '../helpers/jsonWebTokenHelper';
import roleHelper from '../helpers/roleHelper';
import pageHelper from '../helpers/pageHelper';
import userHelper from '../helpers/userHelper';
import documentHelper from '../helpers/documentHelper';

dotenv.config();

const Users = models.Users;
const Documents = models.Documents;

/**
   * signUp: To creating accounts for users
   * @function signUp
   * @param {object} request send a request to encrypt password with bcrypt
   * to create a new user
   * @param {object} response get response if signup is successful.
   * @return {object}  returns response status and json data
   */
const userController = {
  signup(request, response) {
    userHelper.validateUserDetails(request);
    const errors = request.validationErrors();
    if (errors) {
      response.status(400).send(userHelper.validateErrorMessage(errors));
    } else {
      return Users.findOne({
        where: {
          $or: [
            { email: request.body.email },
            { username: request.body.username }
          ]
        }
      }).then((checkuser) => {
        if (checkuser) {
          return userHelper.ifEmailExistsErrorMessage(response);
        }
        Users.create(userHelper.registerUser(request))
          .then((newUser) => {
            const token = jsonWebTokenHelper(newUser);
            const user = userHelper.newUser(newUser);
            response.status(201).send({ user, token });
          })
          .catch(error =>
            userHelper.createDatabaseErrorMessage(response, error)
          );
      });
    }
  },
  /**
   * listUsers: Enables users to get list of registered users
   * query parameters are offset and limit
   * default offset is 0 and default limit is 10
   * @function listUsers
   * @param {object} request send a request to list all
   * registered users in the database
   * @param {object} response get a response if retrieving
   *  users is successful or not
   * @return {object}  returns response status and json data
   *  of all registered users
   */
  /**
   * getUserPage: Enables users to get list of registered users by page
   * @function getUserPage
   * @param {object} request request to list users by page
   * @param {object} response response
   * @return {object}  returns response status and json data
   */
  listUsers(request, response) {
    if (
      isNaN(pageHelper.getLimit(request)) ||
      isNaN(pageHelper.getOffset(request))
    ) {
      return response.status(400).send({
        message: 'limit and offset must be an number'
      });
    }
    if (!roleHelper.isAdmin(request)) {
      return userHelper.accessDeniedMessage(response);
    }
    return Users.findAndCountAll({
      attributes: ['id', 'email', 'username', 'roleId', 'createdAt'],
      limit: pageHelper.getLimit(request),
      offset: pageHelper.getOffset(request)
    })
      .then((listUsers) => {
        const pageMeta = pageHelper.getPageMeta(
          request,
          listUsers,
          pageHelper.getLimit,
          pageHelper.getOffset
        );
        const users = listUsers.rows;
        response.status(200).send({ users, pageMeta });
      })
      .catch(error => userHelper.listDatabaseErrorMessage(response, error));
  },
  /**
   * listUsersAndDocuments: Enables users to get list of
   *  registered users with there documents
   * @function listUsersAndDocuments
   * @param {object} request send a request to retrieve list
   *  of users and documents
   * @param {object} response get a response of all users
   *  and documents or throws an error.
   * @return {object}  returns response status and json data
   */
  listUsersAndDocuments(request, response) {
    if (
      isNaN(pageHelper.getLimit(request)) ||
      isNaN(pageHelper.getOffset(request))
    ) {
      return response.status(400).send({
        message: 'limit and offset must be an number'
      });
    }
    if (!roleHelper.isAdmin(request)) {
      return userHelper.userAndDocumentAccessDeniedMessage(response);
    }
    return Users.findAndCountAll({
      attributes: ['id', 'email', 'username', 'roleId', 'createdAt'],
      include: [
        {
          model: Documents,
          as: 'myDocuments'
        }
      ],
      limit: pageHelper.getLimit(request),
      offset: pageHelper.getOffset(request)
    })
      .then((listUsers) => {
        const pageMeta = pageHelper.getPageMeta(
          request,
          listUsers,
          pageHelper.getLimit,
          pageHelper.getOffset
        );
        const users = listUsers.rows;
        response.status(200).send({ users, pageMeta });
      })
      .catch(error =>
        userHelper.listUserAndDocumentDatabaseErrorMessage(response, error)
      );
  },
  /**
   * updateUser: Enables users to update their information
   *  where email must be unique
   * @function updateUser
   * @param {object} request send a request to update users
   * @param {object} response receives response if
   *  update is successful or it threw an error
   * @return {object}  returns response status and json data
   */
  updateUsers(request, response) {
    userHelper.validateUserDetails(request);
    const errors = request.validationErrors();
    if (errors) {
      response.status(400).send(userHelper.ValidationErrorMessage(errors));
    } else {
      if (!Number.isInteger(Number(request.params.userId))) {
        return userHelper.checkIdIsNumberErrorMessage(response);
      }
      if (!(roleHelper.isSubscriber(request) || roleHelper.isAdmin(request))) {
        return userHelper.showUpdateAccessDeniedMessage(response);
      }
      return Users.findOne(
        userHelper.queryDatabaseEmailAndUsername(request)
      ).then((checkuser) => {
        if (checkuser) {
          return userHelper.ifEmailExistsErrorMessage(response);
        }
        Users.find(userHelper.queryDatabaseId(request));
        return Users.findById(request.params.userId)
          .then((user) => {
            if (!user) {
              userHelper.showUserNotFoundMessage(response);
            }
            const password = request.body.password
              ? bcrypt.hashSync(request.body.password, bcrypt.genSaltSync(10))
              : null;
            return user
              .update({
                username: request.body.username || user.username,
                email: request.body.email || user.email,
                password: password || user.password
              })
              .then(() =>
                response.status(200).send({
                  email: user.email,
                  username: user.username,
                  role: user.roleId
                })
              );
          })
          .catch(error =>
            userHelper.updateDatabaseErrorMessage(response, error)
          );
      });
    }
  },
  /**
   * updateUsersRole: Enables admin to update users role
   * @function updateUsersRole
   * @param {object} request send a request to update users role
   * @param {object} response receives response if update
   *  is successful or it threw an error
   * @return {object}  returns response status and json data
   */
  updateUsersRole(request, response) {
    userHelper.validateRoleId(request);
    const errors = request.validationErrors();
    if (errors) {
      response.status(400).send(userHelper.validateErrorMessage(errors));
    } else {
      userHelper.changeToLowerCase(request);
      if (!roleHelper.isAdmin(request)) {
        return userHelper.updateAccessDenied(response);
      }
      return Users.findOne(
        userHelper.QueryDatabaseTitle(request)
      ).then((checkrole) => {
        if (checkrole) {
          return userHelper.IfRoleExists(response);
        }
        Users.find(userHelper.QueryDatabaseId(request));
        return Users.findById(request.params.userId)
          .then((user) => {
            if (!user) {
              userHelper.showUserNotFoundMessage(response);
            }
            return user
              .update({
                roleId: request.body.roleId || user.roleId
              })
              .then(() =>
                response.status(200).send({
                  message: 'User role updated successfully',
                  role: user.roleId
                })
              );
          })
          .catch(error =>
            userHelper.updateRoleDatabaseErrorMessage(response, error)
          );
      });
    }
  },
  /**
   * findUsers: Enables users to find other registered users
   * @function findUser
   * @param {object} request send request to find a
   *  registered user from the database.
   * @param {object} response get a response of a user from the database
   * @return {object}  returns response status and
   *  json data of the user retrieved
   */
  findUsers(request, response) {
    if (!Number.isInteger(Number(request.params.userId))) {
      return userHelper.checkIdIsNumberErrorMessage(response);
    }
    if (!(roleHelper.isSubscriber(request) || roleHelper.isAdmin(request))) {
      return userHelper.findUsersAccessDeniedMessage(response);
    }
    return Users.find({
      where: {
        id: request.params.userId
      },
      attributes: ['id', 'email', 'username', 'createdAt']
    })
      .then((user) => {
        if (!user) {
          userHelper.showUserNotFoundMessage(response);
        }
        return response.status(200).send(user);
      })
      .catch(error => userHelper.FindUserDatabaseError(response, error));
  },
  /**
   * deleteUsers: Enables users and admin users to delete account by ID
   * @function deleteUser
   * @param {object} request sends a request to delete
   *  users from the user's database
   * @param {object} response get a response of delete
   *  successful or throw an error
   * @return {object}  returns response status and json data
   */
  deleteUsers(request, response) {
    if (!Number.isInteger(Number(request.params.userId))) {
      return userHelper.checkIdIsNumberErrorMessage(response);
    }
    if (!(roleHelper.isSubscriber(request) || roleHelper.isAdmin(request))) {
      userHelper.deleteAccessDeniedMessage(response);
    }
    return Users.findById(request.params.userId)
      .then((user) => {
        userHelper.deleteUserLogic(user, response);
      })
      .catch(error => userHelper.deleteAccessDeniedMessage(response, error));
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
      return userHelper.checkIdIsNumberErrorMessage(response);
    }
    if (!(roleHelper.isSubscriber(request) || roleHelper.isAdmin(request))) {
      return userHelper.documentAccessDeniedMessage(response);
    }
    return Documents.findAll({
      where: {
        userId: request.params.userId
      },
      attributes: ['id', 'title', 'access', 'content', 'owner', 'createdAt']
    })
      .then((document) => {
        if (!document) {
          documentHelper.showUserNotFoundMessage(document);
        }
        return response.status(200).send(document);
      })
      .catch(error =>
        userHelper.findUserDocDatabaseErrorMessage(response, error)
      );
  }
};

export default userController;
