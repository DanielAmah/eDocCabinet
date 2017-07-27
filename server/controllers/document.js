const Documents = require('../models').Documents;
const Roles = require('../models').Roles;

const documentController = {
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
  showDocumentsPage(req, res) {
    const limit = req.query && req.query.limit ? req.query.limit : 0;
    const offset = req.query && req.query.offset ? req.query.offset : 0;
    Roles.findById(req.decoded.userRole)
      .then(() => {
        if (req.decoded.userRole === 1) {
          return Documents
            .findAll({
              attributes: ['id', 'title', 'content', 'access', 'owner', 'createdAt'],
              limit,
              offset,
            })
            .then(documents => res.status(200).send(documents))
            .catch(() => res.status(400).send('Connection Error'));
        }
        return Documents
          .findAll({
            where: { access: [req.decoded.userRole, 'public'] },
            attributes: ['id', 'title', 'content', 'access', 'owner', 'createdAt'],
            limit,
            offset,
          })
          .then(documents => res.status(200).send(documents))
          .catch(() => res.status(400).send('Connection Error'));
      });
  },
  showDocuments(req, res) {
    Roles.findById(req.decoded.userRole)
      .then(() => {
        if (req.decoded.userRole === 1) {
          return Documents
            .findAll({
              attributes: ['id', 'title', 'content', 'access', 'owner', 'createdAt']
            })
            .then(documents => res.status(200).send(documents))
            .catch(() => res.status(400).send('Connection Error'));
        }
        return Documents
          .findAll({
            where: { access: [req.decoded.userRole, 'public'] },
            attributes: ['id', 'title', 'access', 'content', 'owner', 'createdAt']
          })
          .then(documents => res.status(200).send(documents))
          .catch(() => res.status(400).send('Connection Error'));
      });
  },
  findDocument(req, res) {
    if (!Number.isInteger(Number(req.params.documentId))) {
      return res.json({
        message: 'Invalid document ID'
      });
    }
    Roles.findById(req.decoded.userRole)
      .then(() => {
        if (req.decoded.userRole === 1) {
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
            .catch(() => res.status(400).send('Connection Error'));
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
          .catch(() => res.status(400).send('Connection Error'));
      });
  },
  searchDocument(req, res) {
    if (!req.query.q) {
      return res.send({
        message: 'No key word supplied'
      });
    }
    Roles.findById(req.decoded.userRole)
      .then(() => {
        if (req.decoded.userRole === 1) {
          return Documents
            .findAll({
              where: {
                title: (req.query.q).toLowerCase()
              },
              attributes: ['id', 'title', 'access', 'content', 'owner', 'createdAt']
            })
            .then((document) => {
              if (document.length === 0) {
                return res.status(404).send({
                  message: 'Document Not Found',
                });
              }
              return res.status(200).send(document);
            })
            .catch(() => res.status(400).send('Connection Error'));
        }
        return Documents
          .findAll({
            where: {
              userId: req.decoded.userId,
              title: (req.query.q).toLowerCase(),
              access: [req.decoded.userRole, 'private', 'public'],
            },
            attributes: ['id', 'title', 'access', 'content', 'owner', 'createdAt']
          })
          .then((document) => {
            if (document.length === 0) {
              return res.status(404).send({
                message: 'Document Not Found',
              });
            }
            return res.status(200).send(document);
          })
          .catch(() => res.status(400).send('Connection Error'));
      });
  },
  deleteDocument(req, res) {
    if (!Number.isInteger(Number(req.params.documentId))) {
      return res.status(400).send({
        message: 'Invalid document ID'
      });
    }
    Roles.findById(req.decoded.userRole)
      .then(() => {
        if (req.decoded.userRole === 1) {
          return Documents
            .find({
              where: {
                id: req.params.documentId
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
                .catch(() => res.status(400).send('Connection Error'));
            })
            .catch(() => res.status(400).send('Connection Error'));
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
              .catch(() => res.status(400).send('Connection Error'));
          })
          .catch(() => res.status(400).send('Connection Error'));
      });
  }
};
export default documentController;
