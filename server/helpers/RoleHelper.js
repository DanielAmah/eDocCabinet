import omit from 'omit';
/**
 * controllers helper functions
 */
const RoleHelper = {
  /**
   * isAdmin - Verify if the requester is an admin
   * @param  {Object} request send a request to check
   *  of the role id is 1(administrator)
   * @param  {Object} response get a response if it 1 or another number.
   * @returns {Boolean} returns true or false
   */
  isAdmin(request) {
    return request.decoded.userRole === 1;
  },

  /**
   * isEditor - Verify if the requester is an editor
   * @param  {Object} request send a request to
   *  check of the role id is 2(editor)
   * @param  {Object} response get a response if it 2 or another number.
   * @returns {Boolean} returns true or false
   */
  isEditor(request) {
    return request.decoded.userRole === 2;
  },

  isSubscriber(request) {
    return request.decoded.userId === Number(request.params.userId);
  },
  AccessDenied(response) {
    return response.status(401).send({
      message: 'Access Denied. You can not create a new role'
    });
  },
  DatabaseError(response) {
    response.status(500).send({
      message: 'Error occurred while creating new role'
    });
  },
  ListDatabaseError(response) {
    response.status(500).send({
      message: 'Error occurred while listing roles'
    });
  },
  ListRolesAndUsersDatabaseError(response) {
    response.status(500).send({
      message: 'Error occurred while listing roles and users'
    });
  },
  Validation(request) {
    request.checkBody('title', 'Enter a valid role id').isLength({ min: 1 });
  },
  ValidationErrorMessage(errors) {
    const exclude = ['param', 'value'];
    const error = errors.map(omit(exclude));
    const ErrorMessage = error;
    return ErrorMessage;
  },
  IfRoleExists(response) {
    return response.status(409).send({
      message: 'Role Already Exists'
    });
  }
};

export default RoleHelper;
