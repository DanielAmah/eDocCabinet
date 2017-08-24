import omit from 'omit';
import bcrypt from 'bcrypt';

const UserHelper = {
  OldUser(user) {
    const LoginUser = {
      success: true,
      userId: user.id,
      userEmail: user.email
    };
    return LoginUser;
  },
  RegisterUser(request) {
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
  QueryDatabaseTitle(request) {
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
  QueryDatabaseId(request) {
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
  QueryDatabaseEmailAndUsername(request) {
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
  SearchQueryDatabase(request) {
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
  DatabaseError(response) {
    response.status(500).send({
      message: 'Error occurred while authenticating user'
    });
  },
  ListDatabaseError(response) {
    response.status(500).send({
      message: 'Error occurred while listing user'
    });
  },
  ListUserAndDocumentDatabaseError(response) {
    response.status(500).send({
      message: 'Error occurred while listing user with documents'
    });
  },
  UpdateDatabaseError(response) {
    response.status(500).send({
      message: 'Error occurred while updating user'
    });
  },
  UpdateRoleDatabaseError(response) {
    response.status(500).send({
      message: 'Error occurred while updating user role'
    });
  },
  FindUserDatabaseError(response) {
    response.status(500).send({
      message: 'Error occurred while retrieving a user'
    });
  },
  FindUserDocDatabaseError(response) {
    response.status(500).send({
      message: 'Error occurred while retrieving a user documents'
    });
  },
  DeleteDatabaseError(response) {
    response.status(500).send({
      message: 'Error occurred while deleting a user'
    });
  },
  CreateDatabaseError(response) {
    response.status(500).send({
      message: 'Error occurred while creating user'
    });
  },
  SearchDatabaseError(response) {
    response.status(500).send({
      message: 'Error occurred while retrieving user'
    });
  },
  InCorrectPassword(response) {
    response.status(403).send({ message: 'Password is incorrect' });
  },
  UserNotFound(response) {
    response.status(404).send({ message: 'User not found' });
  },
  AccessDenied(response) {
    return response.status(401).send({
      message: 'Access Denied. You can not see register subscribers'
    });
  },
  DocumentAccessDenied(response) {
    return response.status(401).send({
      message: 'Access Denied. You can not see documents of other subscribers'
    });
  },
  UserAndDocumentAccessDenied(response) {
    return response.status(401).send({
      message: 'Access Denied. You can not see subscribers and their documents'
    });
  },
  UpdateAccessDenied(response) {
    return response.status(401).send({
      message: 'Access Denied. You can not update other register subscribers'
    });
  },
  FindUsersAccessDenied(response) {
    return response.status(401).send({
      message: 'Access Denied. You can not find other register subscribers'
    });
  },
  DeleteAccessDenied(response) {
    return response.status(401).send({
      message: 'Access Denied. You can not remove other register subscribers'
    });
  },
  CheckIdIsNumber(response) {
    return response.status(400).send({
      message: 'Invalid User ID'
    });
  },
  ChangeToLowerCase(request) {
    if (request.body.username) {
      request.body.username = request.body.username.toLowerCase();
      request.body.email = request.body.email.toLowerCase();
    }
  },
  IfEmailExists(response) {
    return response.status(409).send({
      message: 'Username / Email Already Exists'
    });
  },
  IfRoleExists(response) {
    return response.status(409).send({
      message: 'Role Already Exists'
    });
  },
  CheckQuery(response) {
    response.status(400).send({
      message: 'No key word supplied'
    });
  },
  Validation(request) {
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
  LoginValidation(request) {
    request
      .checkBody('username', 'Enter a valid username of more than 5 characters')
      .isLength({ min: 5 });
    request
      .checkBody('password', 'Enter a valid password of more than 5 characters')
      .isLength({ min: 5 });
  },
  RoleValidation(request) {
    request.checkBody('roleId', 'Enter a valid role id').isInt();
    request
      .checkParams('userId', 'Enter a valid user id to update role')
      .notEmpty()
      .isInt();
  },
  ValidationErrorMessage(errors) {
    const exclude = ['param', 'value'];
    const error = errors.map(omit(exclude));
    const ErrorMessage = error;
    return ErrorMessage;
  },
  DeleteUserLogic(user, response) {
    if (!user) {
      return UserHelper.UserNotFound(response);
    }
    return user
      .destroy()
      .then(() =>
        response.status(200).send({ message: 'User deleted successfully.' })
      );
  }
};
export default UserHelper;
