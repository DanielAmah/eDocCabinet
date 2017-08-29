import omit from 'omit';
import bcrypt from 'bcrypt';

const userHelper = {
  oldUser(user) {
    const LoginUser = {
      success: true,
      userId: user.id,
      userEmail: user.email
    };
    return LoginUser;
  },
  registerUser(request) {
    const password = bcrypt.hashSync(
      request.body.password,
      bcrypt.genSaltSync(10)
    );
    const registerUser = {
      email: request.body.email.toLowerCase(),
      username: request.body.username,
      password,
      roleId: request.body.roleId
    };
    return registerUser;
  },
  newUser(user) {
    const RegisterUser = {
      success: true,
      userId: user.id,
      userEmail: user.email,
      userUsername: user.username
    };
    return RegisterUser;
  },
  queryDatabaseTitle(request) {
    const queryDatabase = {
      where: {
        $or: [
          {
            title: request.body.title
          }
        ]
      }
    };
    return queryDatabase;
  },
  queryDatabaseId(request) {
    const queryDatabase = {
      where: {
        $or: [
          {
            id: request.params.userId
          }
        ]
      }
    };
    return queryDatabase;
  },
  queryDatabaseEmailAndUsername(request) {
    const queryDatabase = {
      where: {
        $or: [
          {
            email: request.body.email
          },
          {
            username: request.body.username
          }
        ]
      }
    };
    return queryDatabase;
  },
  searchQueryDatabase(request) {
    const searchQuery = {
      where: {
        $or: [
          {
            email: {
              $iLike: `%${request.query.q}%`.toLowerCase()
            },
            username: {
              $iLike: `%${request.query.q}%`.toLowerCase()
            }
          }
        ]
      },
      attributes: ['id', 'email', 'username', 'roleId', 'createdAt']
    };
    return searchQuery;
  },
  loginDatabaseErrorMessage(response) {
    response.status(500).send({
      message: 'Error occurred while authenticating user'
    });
  },
  listDatabaseErrorMessage(response) {
    response.status(500).send({
      message: 'Error occurred while listing user'
    });
  },
  listUserAndDocumentDatabaseErrorMessage(response) {
    response.status(500).send({
      message: 'Error occurred while listing user with documents'
    });
  },
  updateDatabaseErrorMessage(response) {
    response.status(500).send({
      message: 'Error occurred while updating user'
    });
  },
  updateRoleDatabaseErrorMessage(response) {
    response.status(500).send({
      message: 'Error occurred while updating user role'
    });
  },
  findUserDatabaseErrorMessage(response) {
    response.status(500).send({
      message: 'Error occurred while retrieving a user'
    });
  },
  findUserDocDatabaseErrorMessage(response) {
    response.status(500).send({
      message: 'Error occurred while retrieving a user documents'
    });
  },
  deleteDatabaseErrorMessage(response) {
    response.status(500).send({
      message: 'Error occurred while deleting a user'
    });
  },
  createDatabaseErrorMessage(response) {
    response.status(500).send({
      message: 'Error occurred while creating user'
    });
  },
  searchDatabaseErrorMessage(response) {
    response.status(500).send({
      message: 'Error occurred while retrieving user'
    });
  },
  inCorrectPasswordMessage(response) {
    response.status(401).send({ message: 'Wrong email/password' });
  },
  showUserNotFoundMessage(response) {
    response.status(404).send({ message: 'User not found' });
  },
  accessDeniedMessage(response) {
    return response.status(403).send({
      message: 'Access Denied. You can not see register subscribers'
    });
  },
  documentAccessDeniedMessage(response) {
    return response.status(403).send({
      message: 'Access Denied. You can not see documents of other subscribers'
    });
  },
  userAndDocumentAccessDeniedMessage(response) {
    return response.status(403).send({
      message: 'Access Denied. You can not see subscribers and their documents'
    });
  },
  showUpdateAccessDeniedMessage(response) {
    return response.status(403).send({
      message: 'Access Denied. You can not update other register subscribers'
    });
  },
  findUsersAccessDeniedMessage(response) {
    return response.status(403).send({
      message: 'Access Denied. You can not find other register subscribers'
    });
  },
  deleteAccessDeniedMessage(response) {
    return response.status(403).send({
      message: 'Access Denied. You can not remove other register subscribers'
    });
  },
  checkIdIsNumberErrorMessage(response) {
    return response.status(400).send({
      message: 'Invalid User ID'
    });
  },
  changeToLowerCase(request) {
    if (request.body.username) {
      request.body.username = request.body.username.toLowerCase();
      request.body.email = request.body.email.toLowerCase();
    }
  },
  ifEmailExistsErrorMessage(response) {
    return response.status(409).send({
      message: 'Username / Email Already Exists'
    });
  },
  ifRoleExistsErrorMessage(response) {
    return response.status(409).send({
      message: 'Role Already Exists'
    });
  },
  checkQueryMessage(response) {
    response.status(400).send({
      message: 'No key word supplied'
    });
  },
  validateUserDetails(request) {
    request
      .checkBody(
        'email',
        'Enter a valid email address (someone@organization.com)'
      )
      .isEmail();
    request
      .checkBody('username', 'Enter a valid username of more than 5 characters')
      .isLength({ min: 5 });
    request
      .checkBody('password', 'Enter a valid password of more than 5 characters')
      .isLength({ min: 5 });
  },
  validateLogin(request) {
    request
      .checkBody('username', 'Enter a valid username of more than 5 characters')
      .isLength({ min: 5 });
    request
      .checkBody('password', 'Enter a valid password of more than 5 characters')
      .isLength({ min: 5 });
  },
  validateRoleId(request) {
    request.checkBody('roleId', 'Enter a valid role id').isInt();
    request
      .checkParams('userId', 'Enter a valid user id to update role')
      .notEmpty()
      .isInt();
  },
  validateErrorMessage(errors) {
    const exclude = ['param', 'value'];
    const error = errors.map(omit(exclude));
    const ErrorMessage = error;
    return ErrorMessage;
  },
  deleteUserLogic(user, response) {
    if (!user) {
      return userHelper.showUserNotFoundMessage(response);
    }
    return user
      .destroy()
      .then(() =>
        response.status(200).send({ message: 'User deleted successfully.' })
      );
  }
};
export default userHelper;
