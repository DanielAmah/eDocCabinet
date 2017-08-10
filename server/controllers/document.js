import Pagination from '../utils/pagination';
import getRole from '../helpers/Helper';

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
    if (request.body.access === 'public'
          || request.body.access === 'private'
          || request.body.access === request.decoded.userRole) {
      return Documents
            .create({
              title: (request.body.title).toLowerCase(),
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
             .catch(error => response.status(400).send({
               error, message: 'An error occured while creating document'
             }));
    }
    return response.status(403).send({
      message:
            'Invalid document access, save document with your role'
    });
  },
   /**
   * updateDocument: This allows registered users update saved documents
   * @function updateDocument
   * @param {object} request sends a request to update save documents in the document table
   * @param {object} response receive a response if the document was updated successfully
   * or throw an error
   * @return {object} - returns response status and json data
   */
  updateDocument(request, response) {
    if (!Number.isInteger(Number(request.params.documentId))) {
      return response.status(400).json({
        message: 'Invalid document ID'
      });
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
          return response.status(404).send({
            message: 'The Document Does not Exist',
          });
        }
        if (request.body.title) {
          request.body.title = (request.body.title).toLowerCase();
        }
        return document
          .update(request.body, { fields: Object.keys(request.body) })
          .then(() => response.status(200).send({
            message: 'The Document has been successfully updated',
            documentId: document.id,
            title: document.title,
            content: document.content,
            owner: document.owner,
          }))
           .catch(error => response.status(400).send({ error,
             message: 'Error updating document'
           }));
      });
  },
    /**
   * showDocuments: This allows registered users get saved documents,
   * where role = "user's role" and public documents.
   * It gets all available documents both privates and public for admin users
   * @function listDocuments
   * @param {object} request send a request that retrieve all documents
   * @param {object} response get a response that list all documents or throws an error.
   * @return {object} - returns response status and json data
   */
  showDocuments(request, response) {
    if (getRole.isAdmin(request) || getRole.isEditor(request)) {
      const limit = request.query && request.query.limit ? request.query.limit : 10;
      const offset = request.query && request.query.offset ? request.query.offset : 0;
      return Documents
            .findAndCountAll({
              attributes: ['id', 'title', 'content', 'access', 'owner', 'createdAt'],
              limit,
              offset,
            })
              .then((documents) => {
                const totalUserCount = documents.count;
                const pageSize = Pagination.getPageSize(limit);
                const pageCount = Pagination.getPageCount(totalUserCount, limit);
                const currentPage = Pagination.getCurrentPage(limit, offset);
                const meta = {
                  totalUserCount,
                  pageSize,
                  pageCount,
                  currentPage,
                };
                const listDocuments = documents.rows;
                response.status(200).send({ listDocuments, meta });
              })
            .catch(error => response.status(400).send({ error, message: 'Error occurred while retrieving documents'
            }));
    }
    return Documents
          .findAll({
            where: { access: [request.decoded.userRole, 'public'] },
            attributes: ['id', 'title', 'access', 'content', 'owner', 'createdAt']
          })
          .then(documents => response.status(200).send(documents))
          .catch(error => response.status(400).send({ error, message: 'Error occurred while retrieving documents'
          }));
  },
   /**
   * findDocument: This allows registered users get documents by ID
   * where role = "user's role" and public documents,
   * Its gets document either private or public for admin user
   * @function findDocument
   * @param {object} request send a request to find a document in the document table
   * @param {object} response get a response if the document is retrieve or throws an error
   * @return {object} - returns response status and json data
   */
  findDocument(request, response) {
    if (!Number.isInteger(Number(request.params.documentId))) {
      return response.json({
        message: 'Invalid document ID'
      });
    }
    if (getRole.isAdmin(request) || getRole.isEditor(request)) {
      return Documents
            .find({
              where: { id: request.params.documentId },
              attributes: ['id', 'title', 'access', 'content', 'owner', 'createdAt']
            })
            .then((document) => {
              if (!document) {
                return response.status(404).send({
                  message: 'Document Not Found',
                });
              }
              return response.status(200).send(document);
            })
            .catch(error => response.status(400).send({ error, message: 'Error occurred while retrieving documents'
            }));
    }
    return Documents
          .find({
            where: {
              id: request.params.documentId,
              access: [request.decoded.userRole, 'public']
            },
            attributes: ['id', 'title', 'access', 'content', 'owner', 'createdAt']
          })
          .then((document) => {
            if (!document) {
              return response.status(404).send({
                message: 'Document Not Found',
              });
            }
            return response.status(200).send(document);
          })
          .catch(error => response.status(400).send({ error, message: 'Error occurred while retrieving documents'
          }));
  },

   /**
   * deleteDocument:
   * This allows registered users to delete thier documents by ID
   * Admin users can also delete user's documents with by just ID
   * @function deleteDocument
   * @param {object} request  send a request to delete a document from the database
   * @param {object} response get a response if deletion is successful or it throws an error
   * @return {object} - returns response status and json data
   */
  deleteDocument(request, response) {
    if (!Number.isInteger(Number(request.params.documentId))) {
      return response.status(400).send({
        message: 'Invalid document ID'
      });
    }
    if (getRole.isAdmin(request) || getRole.isEditor(request)) {
      return Documents
            .find({
              where: {
                id: request.params.documentId
              }
            })
            .then((document) => {
              if (!document) {
                return response.status(404).send({
                  message: 'Document Not Found',
                });
              }
              return document
                .destroy()
                .then(() => response.status(200)
                  .send({ message: 'The Document has been deleted successfully.' }))
                 .catch(error => response.status(400).send({ error, message: 'Error occurred while deleting documents'
                 }));
            });
    }
    return Documents
          .find({
            where: {
              id: request.params.documentId,
              userId: request.decoded.userId
            }
          })
          .then((document) => {
            if (!document) {
              return response.status(400).send({
                message: 'Document Not Found',
              });
            }
            return document
              .destroy()
              .then(() => response.status(200)
                .send({ message: 'The Document has been deleted successfully.' }))
               .catch(error => response.status(400).send({ error, message: 'Error occurred while deleting documents'
               }));
          });
  }
};
export default documentController;
