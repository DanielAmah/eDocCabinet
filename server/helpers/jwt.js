  import jwt from 'jsonwebtoken';
/**
* @function token
* @param  {object} user generate user token which is user for authentication
* @return {string} return a string of encoded data.
*/
  const token = user =>
    jwt.sign({
      userId: user.id,
      userRole: user.roleId,
      userUsername: user.username,
      userEmail: user.email,
    }, process.env.SECRET, {
      expiresIn: '72h'
    });
  export default token;

