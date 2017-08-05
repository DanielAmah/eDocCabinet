
/**
 * controllers helper functions
 */
const Helpers = {
  /**
   * isAdmin - Verify if the requester is an admin
   * @param  {Object} request send a request to check of the role id is 1(administrator)
   * @param  {Object} response get a response if it 1 or another number.
   * @returns {Boolean} returns true or false
   */
  isAdmin(request) {
    return request.decoded.userRole === 1;
  },

  /**
   * isEditor - Verify if the requester is an editor
   * @param  {Object} request send a request to check of the role id is 2(editor)
   * @param  {Object} response get a response if it 2 or another number.
   * @returns {Boolean} returns true or false
   */
  isEditor(request) {
    return request.decoded.userRole === 2;
  },
};

export default Helpers;
