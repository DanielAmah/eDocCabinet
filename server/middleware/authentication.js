import jwt from 'jsonwebtoken';

const authentication = {
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
