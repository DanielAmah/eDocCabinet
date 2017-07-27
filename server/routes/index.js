import authentication from '../middleware/authentication';

const userController = require('../controllers/user');
const documentController = require('../controllers/document');
const roleController = require('../controllers/role');

module.exports = (app) => {
  app.get('/', (req, res) => res.status(200).send({
    message: 'Welcome to E-DocCabinet - A document management API',
  }));

  app.post('/', (req, res) => res.status(200).send({
    message: 'Welcome to E-DocCabinet - A document management API',
  }));
  // all user routes
  app.post('/api/v1/users/', userController.signup);
  app.post('/api/v1/users/login', userController.login);
  app.use(authentication.verifyUser);
  app.get('/api/v1/users/page', userController.listUsersPage);
  app.get('/api/v1/users/', userController.listUsers);
  app.put('/api/v1/users/:userId', userController.updateUsers);
  app.get('/api/v1/users/:userId', userController.findUsers);
  app.delete('/api/v1/users/:userId', userController.deleteUsers);
  app.get('/api/v1/search/users/', userController.searchUsers);
  app.get('/api/v1/users/:userId/documents/', userController.findUserDocument);

  // all document routes
  app.post('/api/v1/documents/', documentController.newDocument);
  app.get('/api/v1/documents/page', documentController.showDocumentsPage);
  app.get('/api/v1/documents', documentController.showDocuments);
  app.put('/api/v1/documents/:documentId', documentController.updateDocument);
  app.get('/api/v1/documents/:documentId', documentController.findDocument);
  app.get('/api/v1/search/documents/', documentController.searchDocument);
  app.delete('/api/v1/documents/:documentId', documentController.deleteDocument);

  // all Role routes
  app.post('/api/v1/roles/', roleController.newRole);
  app.get('/api/v1/roles', roleController.listRoles);
  app.get('*', (req, res) => res.status(404).send({
    message: 'The page you are looking for does not exist'
  }));

  app.post('*', (req, res) => res.status(404).send({
    message: 'The page you are looking for does not exist'
  }));
};
