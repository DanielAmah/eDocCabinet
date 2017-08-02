import path from 'path';

import authentication from '../middleware/authentication';
import documentController from '../controllers/document';
import roleController from '../controllers/role';
import userController from '../controllers/user';
import searchController from '../controllers/search';
import authController from '../controllers/auth';


const Routes = (app) => {
  app.post('/', (req, res) => res.status(200).send({
    message: 'Welcome to E-DocCabinet - A document management API',
  }));
  // all user routes
  app.post('/api/v1/users/', userController.signup);
  app.post('/api/v1/users/login', authController.login);
  app.use(authentication.verifyUser);
  app.get('/api/v1/users/', userController.listUsers);
  app.get('/api/v1/users-docs/', userController.listUsersAndDocuments);
  app.put('/api/v1/users/:userId', userController.updateUsers);
  app.get('/api/v1/users/:userId', userController.findUsers);
  app.delete('/api/v1/users/:userId', userController.deleteUsers);
  app.get('/api/v1/search/users/', searchController.searchUsers);
  app.get('/api/v1/users/:userId/documents/', userController.findUserDocument);

  // all document routes
  app.post('/api/v1/documents/', documentController.newDocument);
  app.get('/api/v1/documents', documentController.showDocuments);
  app.put('/api/v1/documents/:documentId', documentController.updateDocument);
  app.get('/api/v1/documents/:documentId', documentController.findDocument);
  app.get('/api/v1/search/documents/', searchController.searchDocument);
  app.delete('/api/v1/documents/:documentId', documentController.deleteDocument);

  // all Role routes
  app.post('/api/v1/roles/', roleController.newRole);
  app.get('/api/v1/roles', roleController.listRoles);
  app.get('/api/v1/roles-users/', roleController.listRolesAndUsers);

  app.get('*', (req, res) => res.status(404).send({
    message: 'The page you are looking for does not exist'
  }));

  app.post('*', (req, res) => res.status(404).send({
    message: 'The page you are looking for does not exist'
  }));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../public', 'index.html'));
  });
  app.post('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../public', 'index.html'));
  });
};
export default Routes;
