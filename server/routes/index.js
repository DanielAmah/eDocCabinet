import authentication from '../middleware/authentication';

const userController = require('../controllers/user');

module.exports = (app) => {
  app.get('/', (req, res) => res.status(200).send({
    message: 'Welcome to E-DocCabinet - A document management API',
  }));

  app.post('/', (req, res) => res.status(200).send({
    message: 'Welcome to E-DocCabinet - A document management API',
  }));
  app.post('/api/v1/users/', userController.signup);
  app.post('/api/v1/users/login', userController.login);
  app.use(authentication.verifyUser);
  app.get('/api/v1/users/', userController.listUsers);

  app.get('*', (req, res) => res.status(404).send({
    message: 'The page you are looking for does not exist'
  }));

  app.post('*', (req, res) => res.status(404).send({
    message: 'The page you are looking for does not exist'
  }));
};
