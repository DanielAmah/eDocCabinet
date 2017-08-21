import RoleHelper from '../helpers/RoleHelper';
import DocumentHelper from '../helpers/DocumentHelper';
import PageHelper from '../helpers/PageHelper';

import model from '../models';


const Documents = model.Documents;

const documentController = {
   /**
   * newDocument: This allows registered users create documents
   * @function createDocument
   * @param {object} request send a request to create a new document
   * @param {object} response receive a response if the document creation is
   *  successful or throws an error.
   * @return {object} - returns response status and json data
   */
  newDocument(request, response) {
    DocumentHelper.Validation(request);
    const errors = request.validationErrors();
    if (errors) {
      response.status(400).send(DocumentHelper.ValidationErrorMessage(errors));
    } else {
      if (!DocumentHelper.ValidAccess(request)) {
        return DocumentHelper.InvalidDocumentAccess(response);
      }
      return Documents
      .findOne({
        where: {
          title: request.body.title
        }
      })
      .then((checkdocument) => {
        if (checkdocument) {
          return response.status(409).send({
            message: 'A document with this title has been created' });
        }
        Documents
            .create({
              title: request.body.title,
              content: request.body.content,
              owner: request.decoded.userUsername,
              userId: request.decoded.userId,
              access: request.body.access,
            })
            .then(newDocument => response.status(201).send({
              title: newDocument.title,
              content: newDocument.content,
              owner: newDocument.owner,
              message: 'Document created successfully'
            }))
             .catch(error =>
             DocumentHelper.CreateDatabaseError(response, error));
      });
    }
  },
   /**
   * updateDocument: This allows registered users update saved documents
   * @function updateDocument
   * @param {object} request sends a request to update
   * save documents in the document table
   * @param {object} response receive a response if
   * the document was updated successfully
   * or throw an error
   * @return {object} - returns response status and json data
   */
  updateDocument(request, response) {
    DocumentHelper.Validation(request);
    const errors = request.validationErrors();
    if (errors) {
      response.status(400).send(DocumentHelper.ValidationErrorMessage(errors));
    } else {
      if (!Number.isInteger(Number(request.params.documentId))) {
        return DocumentHelper.CheckIdIsNumber(response);
      }
      return Documents
      .findOne({
        where: {
          title: request.body.title
        }
      })
      .then((checkdocument) => {
        if (checkdocument) {
          return response.status(409).send({
            message: 'A document with this title has been created' });
        }
        return Documents
      .find({
        where: {
          id: request.params.documentId,
          userId: request.decoded.userId
        },
      })
      .then((document) => {
        if (!document) {
          DocumentHelper.UpdateDocumentNotExist(response);
        }
        return document
          .update({
            title: request.body.title || document.title,
            content: request.body.content || document.content,
            access: request.body.access || document.access
          })
          .then(() => response.status(200).send({
            message: 'The Document has been successfully updated',
            documentId: document.id,
            title: document.title,
            content: document.content,
            owner: document.owner,
          }))
           .catch(error => DocumentHelper.UpdateDatabaseError(response, error));
      });
      });
    }
  },
    /**
   * showDocuments: This allows registered users get saved documents,
   * where role = "user's role" and public documents.
   * It gets all available documents both privates and public for admin users
   * @function listDocuments
   * @param {object} request send a request that
   * retrieve all documents
   * @param {object} response get a response that
   * list all documents or throws an error.
   * @return {object} - returns response status and json data
   */
  showDocuments(request, response) {
    if (isNaN(PageHelper.GetLimit(request)) ||
     isNaN(PageHelper.GetOffset(request))) {
      return response.status(400).send({
        message: 'limit and offset must be an number'
      });
    }
    if (RoleHelper.isAdmin(request) || RoleHelper.isEditor(request)) {
      return Documents
            .findAndCountAll({
              attributes: ['id', 'title', 'content',
                'access', 'owner', 'createdAt'],
              limit: PageHelper.GetLimit(request),
              offset: PageHelper.GetOffset(request)
            })
              .then((documents) => {
                const meta =
                PageHelper.GetDocumentPageMeta(request, documents,
                PageHelper.GetLimit, PageHelper.GetOffset);
                const listDocuments = documents.rows;
                response.status(200).send({ listDocuments, meta });
              })
            .catch(error => DocumentHelper.ListDatabaseError(response, error));
    }
    if (request.decoded.userId) {
      return Documents
          .findAndCountAll({
            where: {
              $or: [{ access: 'public' }, { access: 'role',
                $and: { roleId: request.decoded.userRole } },
                { access: 'private',
                  $and: { userId: request.decoded.userId } }]
            },
            attributes: ['id', 'title', 'access',
              'content', 'owner', 'createdAt'],
            limit: PageHelper.GetLimit(request),
            offset: PageHelper.GetOffset(request)
          })
          .then((documents) => {
            const meta =
                PageHelper.GetDocumentPageMeta(request, documents,
                PageHelper.GetLimit, PageHelper.GetOffset);
            const listDocuments = documents.rows;
            response.status(200).send({ listDocuments, meta });
          })
          .catch(error => DocumentHelper.ListDatabaseError(response, error));
    }
  },
   /**
   * findDocument: This allows registered users get documents by ID
   * where role = "user's role" and public documents,
   * Its gets document either private or public for admin user
   * @function findDocument
   * @param {object} request send a request to find
   *  a document in the document table
   * @param {object} response get a response
   * if the document is retrieve or throws an error
   * @return {object} - returns response status and json data
   */
  findDocument(request, response) {
    if (!Number.isInteger(Number(request.params.documentId))) {
      return DocumentHelper.CheckIdIsNumber(response);
    }
    if (RoleHelper.isAdmin(request) || RoleHelper.isEditor(request)) {
      return Documents
            .find({
              where: { id: request.params.documentId },
              attributes: ['id', 'title', 'access',
                'content', 'owner', 'createdAt']
            })
            .then((document) => {
              if (!document) {
                return DocumentHelper.DocumentNotExist(response);
              }
              return response.status(200).send(document);
            })
            .catch(error => DocumentHelper.FindDatabaseError(response, error));
    }
    return Documents
          .find({
            where: {
              id: request.params.documentId,
              $or: [{ access: 'public' }, { access: 'role',
                $and: { roleId: request.decoded.userRole } },
                { access: 'private',
                  $and: { userId: request.decoded.userId } }]
            },
            attributes: ['id', 'title', 'access',
              'content', 'owner', 'createdAt']
          })
          .then((document) => {
            if (!document) {
              return DocumentHelper.DocumentNotExist(response);
            }
            return response.status(200).send(document);
          })
          .catch(error => DocumentHelper.FindDatabaseError(response, error));
  },

   /**
   * deleteDocument:
   * This allows registered users to delete thier documents by ID
   * Admin users can also delete user's documents with by just ID
   * @function deleteDocument
   * @param {object} request  send a request to delete
   * a document from the database
   * @param {object} response get a response if deletion
   *  is successful or it throws an error
   * @return {object} - returns response status and json data
   */
  deleteDocument(request, response) {
    if (!Number.isInteger(Number(request.params.documentId))) {
      return DocumentHelper.CheckIdIsNumber(response);
    }
    if (RoleHelper.isAdmin(request) || RoleHelper.isEditor(request)) {
      return Documents
            .find({
              where: {
                id: request.params.documentId
              }
            })
            .then(document => DocumentHelper.DeleteDocumentLogic(
              DocumentHelper.DocumentNotExist,
              response, DocumentHelper.DeleteDatabaseError, document));
    }
    return Documents
          .find({
            where: {
              id: request.params.documentId,
              userId: request.decoded.userId
            }
          })
          .then((document) => {
            DocumentHelper.DeleteDocumentLogic(DocumentHelper.DocumentNotExist,
              response, DocumentHelper.DeleteDatabaseError, document);
          });
  }
};
export default documentController;
