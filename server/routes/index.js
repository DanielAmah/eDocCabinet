import path from 'path';

import authentication from '../middleware/authentication';
import DocumentController from '../controllers/DocumentController';
import RoleController from '../controllers/RoleController';
import UserController from '../controllers/UserController';
import SearchController from '../controllers/SearchController';
import AuthController from '../controllers/AuthController';


const Routes = (app) => {
  app.post('/', (req, res) => res.status(200).send({
    message: 'Welcome to E-DocCabinet - A document management API',
  }));
  app.get('/', (req, res) => res.status(200).send({
    message: 'Welcome to E-DocCabinet - A document management API',
  }));
  // all user routes
  app.post('/api/v1/users/', UserController.signup);
  app.post('/api/v1/users/login', AuthController.login);
  app.use(authentication.verifyUser);
  app.get('/api/v1/users/', UserController.listUsers);
  app.get('/api/v1/users-docs/', UserController.listUsersAndDocuments);
  app.put('/api/v1/users/:userId', UserController.updateUsers);
  app.put('/api/v1/users-role/:userId', UserController.updateUsersRole);
  app.get('/api/v1/users/:userId', UserController.findUsers);
  app.delete('/api/v1/users/:userId', UserController.deleteUsers);
  app.get('/api/v1/search/users/', SearchController.searchUsers);
  app.get('/api/v1/users/:userId/documents/', UserController.findUserDocument);

  // all document routes
  app.post('/api/v1/documents/', DocumentController.newDocument);
  app.get('/api/v1/documents', DocumentController.showDocuments);
  app.put('/api/v1/documents/:documentId', DocumentController.updateDocument);
  app.get('/api/v1/documents/:documentId', DocumentController.findDocument);
  app.get('/api/v1/search/documents/', SearchController.searchDocument);
  app.delete('/api/v1/documents/:documentId', DocumentController.deleteDocument);

  // all Role routes
  app.post('/api/v1/roles/', RoleController.newRole);
  app.get('/api/v1/roles', RoleController.listRoles);
  app.get('/api/v1/roles-users/', RoleController.listRolesAndUsers);

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../public', 'index.html'));
  });
  app.post('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../public', 'index.html'));
  });
  app.delete('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../public', 'index.html'));
  });
  app.put('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../public', 'index.html'));
  });
};
export default Routes;
