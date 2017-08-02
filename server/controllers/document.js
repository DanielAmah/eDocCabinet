import Pagination from '../../utils/pagination';

const Documents = require('../models').Documents;
const Roles = require('../models').Roles;


const documentController = {
   /**
   * newDocument: This allows registered users create documents
   * @function createDocument
   * @param {object} req request
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
  newDocument(req, res) {
    Roles.findById(req.decoded.userRole)
      .then(() => {
        if (req.body.access === 'public'
          || req.body.access === 'private'
          || req.body.access === req.decoded.userRole) {
          return Documents
            .create({
              title: (req.body.title).toLowerCase(),
              content: req.body.content,
              owner: req.decoded.userUsername,
              userId: req.decoded.userId,
              access: req.body.access,
            })
            .then(() => res.status(201).send({
              message: 'Document saved successfully'
            }))
            .catch(() => res.status(400).send('Connection Error'));
        }
        return res.status(400).send({
          message:
            'Invalid document access, save document with your role'
        });
      });
  },
   /**
   * updateDocument: This allows registered users update saved documents
   * @function updateDocument
   * @param {object} req request
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
  updateDocument(req, res) {
    if (!Number.isInteger(Number(req.params.documentId))) {
      return res.status(400).json({
        message: 'Invalid document ID'
      });
    }
    return Documents
      .find({
        where: {
          id: req.params.documentId,
          userId: req.decoded.userId
        },
      })
      .then((document) => {
        if (!document) {
          return res.status(404).send({
            message: 'The Document Does not Exist',
          });
        }
        if (req.body.title) {
          req.body.title = (req.body.title).toLowerCase();
        }
        return document
          .update(req.body, { fields: Object.keys(req.body) })
          .then(() => res.status(200).send({
            message: 'The Document has been successfully updated',
            documentId: document.id,
            title: document.title,
            content: document.content,
            owner: document.owner,
          }))
          .catch(() => res.status(400).send('Connection Error'));
      })
      .catch(() => res.status(400).send('Connection Error'));
  },
    /**
   * showDocuments: This allows registered users get saved documents,
   * where role = "user's role" and public documents.
   * It gets all available documents both privates and public for admin users
   * @function listDocuments
   * @param {object} req request
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
  showDocuments(req, res) {
    Roles.findById(req.decoded.userRole)
      .then(() => {
        if (req.decoded.userRole === 1 || req.decoded.userRole === 2) {
          const limit = req.query && req.query.limit ? req.query.limit : 10;
          const offset = req.query && req.query.offset ? req.query.offset : 0;
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
                }; res.status(200).send({ documents, meta });
              })
            .catch(() => res.status(400).send({ message: 'Connection Error. May be Internet challenges' }));
        }
        return Documents
          .findAll({
            where: { access: [req.decoded.userRole, 'public'] },
            attributes: ['id', 'title', 'access', 'content', 'owner', 'createdAt']
          })
          .then(documents => res.status(200).send(documents))
          .catch(() => res.status(400).send({ message: 'Connection Error. May be Internet challenges' }));
      });
  },
   /**
   * findDocument: This allows registered users get documents by ID
   * where role = "user's role" and public documents,
   * Its gets document either privates or public for admin user
   * @function findDocument
   * @param {object} req request
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
  findDocument(req, res) {
    if (!Number.isInteger(Number(req.params.documentId))) {
      return res.json({
        message: 'Invalid document ID'
      });
    }
    Roles.findById(req.decoded.userRole)
      .then(() => {
        if (req.decoded.userRole === 1 || req.decoded.userRole === 2) {
          return Documents
            .find({
              where: { id: req.params.documentId },
              attributes: ['id', 'title', 'access', 'content', 'owner', 'createdAt']
            })
            .then((document) => {
              if (!document) {
                return res.status(404).send({
                  message: 'Document Not Found',
                });
              }
              return res.status(200).send(document);
            })
            .catch(() => res.status(400).send({ message: 'Connection Error. May be Internet challenges' }));
        }
        return Documents
          .find({
            where: {
              id: req.params.documentId,
              access: [req.decoded.userRole, 'public']
            },
            attributes: ['id', 'title', 'access', 'content', 'owner', 'createdAt']
          })
          .then((document) => {
            if (!document) {
              return res.status(404).send({
                message: 'Document Not Found',
              });
            }
            return res.status(200).send(document);
          })
          .catch(() => res.status(400).send({ message: 'Connection Error. May be Internet challenges' }));
      });
  },
   /**
   * deleteDocument:
   * This allows registered users to delete thier documents by ID
   * Admin users can also delete user's documents with by just ID
   * @function deleteDocument
   * @param {object} req request
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
  deleteDocument(req, res) {
    if (!Number.isInteger(Number(req.params.documentId))) {
      return res.status(400).send({
        message: 'Invalid document ID'
      });
    }
    Roles.findById(req.decoded.userRole)
      .then(() => {
        if (req.decoded.userRole === 1 || req.decoded.userRole === 2) {
          return Documents
            .find({
              where: {
                id: req.params.documentId
              }
            })
            .then((document) => {
              if (!document) {
                return res.status(404).send({
                  message: 'Document Not Found',
                });
              }
              return document
                .destroy()
                .then(() => res.status(200)
                  .send({ message: 'The Document has been deleted successfully.' }))
                .catch(() => res.status(400).send({ message: 'Connection Error. May be Internet challenges' }));
            })
            .catch(() => res.status(400).send({ message: 'Connection Error. May be Internet challenges' }));
        }
        return Documents
          .find({
            where: {
              id: req.params.documentId,
              userId: req.decoded.userId
            }
          })
          .then((document) => {
            if (!document) {
              return res.status(400).send({
                message: 'Document Not Found',
              });
            }
            return document
              .destroy()
              .then(() => res.status(200)
                .send({ message: 'The Document has been deleted successfully.' }))
              .catch(() => res.status(400).send({ message: 'Connection Error. May be Internet challenges' }));
          })
          .catch(() => res.status(400).send({ message: 'Connection Error. May be Internet challenges' }));
      });
  }
};
export default documentController;
