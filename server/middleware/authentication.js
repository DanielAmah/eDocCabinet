import jwt from 'jsonwebtoken';

const authentication = {
 /**
* verifyToken: This verifies all routes that starts with /api
   *  It checks if there is token and check if the token is valid
   *  if the token is valid then it decodes it and send to the next routes
   * @function verifyUser
   * @param {object} req request
   * @param {object} res response
   * @param {object} next response
   * @return {object}  returns response status and json data
   */
  verifyUser(req, res, next) {
    const token = req.headers['x-access-token'] || req.headers.authorization;
    if (token) {
      jwt.verify(token, 'edoccabinet', (err, decoded) => {
        if (err) {
          return res.json({
            success: false,
            message: 'Token is no longer valid'
          });
        }
        req.decoded = decoded;
        next();
      });
    } else {
      return res.status(403).send({
        success: false,
        message: 'No token provided'
      });
    }
  }
};

export default authentication;
