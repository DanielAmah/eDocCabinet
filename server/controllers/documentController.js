import roleHelper from '../helpers/roleHelper';
import documentHelper from '../helpers/documentHelper';
import pageHelper from '../helpers/pageHelper';
import models from '../models';

const Documents = models.Documents;

const documentController = {
  /**
   * newDocument: This allows registered users create documents
   * @function newDocument
   * @param {object} request send a request to create a new document
   * @param {object} response receive a response if the document creation is
   *  successful or throws an error.
   * @return {object} - returns response status and json data
   */
  newDocument(request, response) {
    documentHelper.validateDocumentBody(request);
    const errors = request.validationErrors();
    if (errors) {
      response.status(400).send(documentHelper.validateErrorMessage(errors));
    } else {
      if (!documentHelper.validateAccess(request)) {
        return documentHelper.invalidDocumentAccessMessage(response);
      }
      documentHelper.checkDocumentContentType(request, response);
      return Documents.findOne({
        where: {
          title: request.body.title
        }
      }).then((checkdocument) => {
        if (checkdocument) {
          return response.status(409).send({
            message: 'A document with this title has been created'
          });
        }
        Documents.create(documentHelper.createDocument(request))
          .then(document =>
            response.status(201).send(documentHelper.createResponse(document))
          )
          .catch(error =>
            documentHelper.createDatabaseErrorMessage(response, error)
          );
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
    documentHelper.validateDocumentBody(request);
    const errors = request.validationErrors();
    if (errors) {
      response.status(400).send(documentHelper.validateErrorMessage(errors));
    } else {
      if (!Number.isInteger(Number(request.params.documentId))) {
        return documentHelper.checkIdErrorMessage(response);
      }
      documentHelper.checkDocumentContentType(request, response);
      return Documents.findOne({
        where: {
          title: request.body.title
        }
      }).then((checkdocument) => {
        if (checkdocument) {
          return response.status(409).send({
            message: 'A document with this title has been created'
          });
        }
        return Documents.find({
          where: {
            id: request.params.documentId,
            userId: request.decoded.userId
          }
        }).then((document) => {
          if (!document) {
            documentHelper.useDocumentNotExistMessage(response);
          }
          return document
            .update(documentHelper.updateDocument(request, document))
            .then(() =>
              response
                .status(200)
                .send(documentHelper.updateDocumentResponse(document))
            )
            .catch(error =>
              documentHelper.updateDatabaseErrorMessage(response, error)
            );
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
    if (
      isNaN(pageHelper.getLimit(request)) ||
      isNaN(pageHelper.getOffset(request))
    ) {
      return response.status(400).send({
        message: 'limit and offset must be an number'
      });
    }
    if (roleHelper.isAdmin(request) || roleHelper.isEditor(request)) {
      return Documents.findAndCountAll({
        attributes: ['id', 'title', 'content', 'access', 'owner', 'createdAt'],
        limit: pageHelper.getLimit(request),
        offset: pageHelper.getOffset(request)
      })
        .then((showDocuments) => {
          const pageMeta = pageHelper.getDocumentPageMeta(
            request,
            showDocuments,
            pageHelper.getLimit,
            pageHelper.getOffset
          );
          const documents = showDocuments.rows;
          response.status(200).send({ documents, pageMeta });
        })
        .catch(error =>
          documentHelper.listDatabaseErrorMessage(response, error)
        );
    }
    if (request.decoded.userId) {
      return Documents.findAndCountAll(
        documentHelper.showQueryDatabase(request)
      )
        .then((listDocuments) => {
          const meta = pageHelper.getDocumentPageMeta(
            request,
            listDocuments,
            pageHelper.getLimit,
            pageHelper.getOffset
          );
          const documents = listDocuments.rows;
          response.status(200).send({ documents, meta });
        })
        .catch(error =>
          documentHelper.listDatabaseErrorMessage(response, error)
        );
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
      return documentHelper.checkIdErrorMessage(response);
    }
    if (roleHelper.isAdmin(request) || roleHelper.isEditor(request)) {
      return Documents.find({
        where: { id: request.params.documentId },
        attributes: ['id', 'title', 'access', 'content', 'owner', 'createdAt']
      })
        .then((document) => {
          if (!document) {
            return documentHelper.useDocumentNotExistMessage(response);
          }
          return response.status(200).send(document);
        })
        .catch(error => documentHelper.FindDatabaseError(response, error));
    }
    return Documents.find(documentHelper.findQueryADocument(request))
      .then((document) => {
        if (!document) {
          return documentHelper.useDocumentNotExistMessage(response);
        }
        return response.status(200).send(document);
      })
      .catch(error => documentHelper.findDatabaseErrorMessage(response, error));
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
      return documentHelper.checkIdErrorMessage(response);
    }
    if (roleHelper.isAdmin(request) || roleHelper.isEditor(request)) {
      return Documents.find({
        where: {
          id: request.params.documentId
        }
      }).then(document =>
        documentHelper.deleteDocumentLogic(
          documentHelper.useDocumentNotExistMessage,
          response,
          documentHelper.deleteDatabaseErrorMessage,
          document
        )
      );
    }
    return Documents.find({
      where: {
        id: request.params.documentId,
        userId: request.decoded.userId
      }
    }).then((document) => {
      documentHelper.deleteDocumentLogic(
        documentHelper.useDocumentNotExistMessage,
        response,
        documentHelper.deleteDatabaseErrorMessage,
        document
      );
    });
  }
};
export default documentController;
