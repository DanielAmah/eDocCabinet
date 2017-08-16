import omit from 'omit';

const UserHelper = {
  OldUser(user) {
    const LoginUser = {
      success: true,
      userId: user.id,
      userEmail: user.email
    };
    return LoginUser;
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
      request.body.username = (request.body.username).toLowerCase();
      request.body.email = (request.body.email).toLowerCase();
    }
  },
  IfEmailExists(checkuser, response) {
    if (checkuser) {
      return response.status(409).send({ message: 'User Already Exists' });
    }
  },
  CheckQuery(response) {
    response.status(400).send({
      message: 'No key word supplied'
    });
  },
  Validation(request) {
    request.checkBody('email', 'Enter a valid email address (someone@organization.com)').isEmail();
    request.checkBody('username', 'Enter a valid username of more than 5 characters').isLength({ min: 5 });
    request.checkBody('password', 'Enter a valid password of more than 5 characters').isLength({ min: 5 });
  },
  LoginValidation(request) {
    request.checkBody('username', 'Enter a valid username of more than 5 characters').isLength({ min: 5 });
    request.checkBody('password', 'Enter a valid password of more than 5 characters').isLength({ min: 5 });
  },
  RoleValidation(request) {
    request.checkBody('roleId', 'Enter a valid role id').isInt();
    request.checkParams('userId', 'Enter a valid user id to update role').notEmpty().isInt();
  },
  ValidationErrorMessage(errors) {
    const exclude = ['param', 'value'];
    const error = errors.map(omit(exclude));
    const ErrorMessage = error;
    return ErrorMessage;
  }
};
export default UserHelper;

