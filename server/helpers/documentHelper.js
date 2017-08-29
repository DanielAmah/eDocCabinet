import omit from 'omit';
import PageHelper from './pageHelper';

const documentHelper = {
  createDocument(request) {
    const createDocument = {
      title: request.body.title,
      content: request.body.content,
      owner: request.decoded.userUsername,
      userId: request.decoded.userId,
      access: request.body.access
    };
    return createDocument;
  },
  createResponse(document) {
    const createResponse = {
      title: document.title,
      content: document.content,
      owner: document.owner,
      message: 'Document created successfully'
    };
    return createResponse;
  },
  checkDocumentContentType(request, response) {
    if (
      typeof request.body.title === 'number' ||
      typeof request.body.content === 'number'
    ) {
      response.status(400).send({
        message: 'title must be characters not number'
      });
    }
  },
  updateDocument(request, document) {
    const update = {
      title: request.body.title || document.title,
      content: request.body.content || document.content,
      access: request.body.access || document.access
    };
    return update;
  },
  updateDocumentResponse(document) {
    const updateResponse = {
      message: 'The Document has been successfully updated',
      documentId: document.id,
      title: document.title,
      content: document.content,
      owner: document.owner
    };
    return updateResponse;
  },
  searchQueryDatabase(request) {
    const searchQuery = {
      where: {
        $or: [
          {
            title: {
              $iLike: `%${request.query.q}%`.toLowerCase()
            }
          }
        ]
      },
      attributes: ['id', 'title', 'access', 'content', 'owner', 'createdAt']
    };
    return searchQuery;
  },
  findQueryDatabase(request) {
    const findQuery = {
      where: {
        title: {
          $iLike: `%${request.query.q}%`.toLowerCase()
        },
        $or: [
          { access: 'public' },
          { access: 'role', $and: { roleId: request.decoded.userRole } },
          { access: 'private', $and: { userId: request.decoded.userId } }
        ]
      },
      attributes: ['id', 'title', 'access', 'content', 'owner', 'createdAt']
    };
    return findQuery;
  },
  findQueryADocument(request) {
    const findADocument = {
      where: {
        id: request.params.documentId,
        $or: [
          { access: 'public' },
          { access: 'role', $and: { roleId: request.decoded.userRole } },
          { access: 'private', $and: { userId: request.decoded.userId } }
        ]
      },
      attributes: ['id', 'title', 'access', 'content', 'owner', 'createdAt']
    };
    return findADocument;
  },
  showQueryDatabase(request) {
    const showQuery = {
      where: {
        $or: [
          { access: 'public' },
          {
            access: 'role',
            $and: { roleId: request.decoded.userRole }
          },
          {
            access: 'private',
            $and: { userId: request.decoded.userId }
          }
        ]
      },
      attributes: ['id', 'title', 'access', 'content', 'owner', 'createdAt'],
      limit: PageHelper.getLimit(request),
      offset: PageHelper.getOffset(request)
    };
    return showQuery;
  },
  checkDocumentNotFound(response, document) {
    if (document.length === 0) {
      return response.status(404).send({
        message: 'No document Found'
      });
    }
  },

  useDocumentNotExistMessage(response) {
    return response.status(404).send({
      message: 'The Document Does not Exist'
    });
  },
  checkQuery(response) {
    return response.status(400).send({
      message: 'No key word supplied'
    });
  },
  searchDatabaseErrorMessage(response) {
    return response.status(500).send({
      message: 'Error occurred while retrieving document'
    });
  },
  invalidDocumentAccessMessage(response) {
    return response.status(400).send({
      message: 'Invalid document access, save document with your role'
    });
  },
  validateAccess(request) {
    const validAccess =
      request.body.access === 'public' ||
      request.body.access === 'private' ||
      request.body.access === 'role';
    return validAccess;
  },
  createDatabaseErrorMessage(response) {
    return response.status(500).send({
      message: 'Error occurred while creating a new document'
    });
  },
  updateDatabaseErrorMessage(response) {
    return response.status(500).send({
      message: 'Error occurred while updating a document'
    });
  },
  listDatabaseErrorMessage(response) {
    return response.status(500).send({
      message: 'Error occurred while listing documents'
    });
  },
  findDatabaseErrorMessage(response) {
    return response.status(500).send({
      message: 'Error occurred while display a document'
    });
  },
  deleteDatabaseErrorMessage(response) {
    return response.status(500).send({
      message: 'Error occurred while deleting a document'
    });
  },
  checkIdErrorMessage(response) {
    return response.status(400).send({
      message: 'Invalid Document ID'
    });
  },
  deleteDocumentLogic(
    useDocumentNotExistMessage,
    response,
    deleteDatabaseErrorMessage,
    document
  ) {
    if (!document) {
      return useDocumentNotExistMessage(response);
    }
    return document
      .destroy()
      .then(() =>
        response.status(200).send({
          message: 'The Document has been deleted successfully.'
        })
      )
      .catch(error => deleteDatabaseErrorMessage(response, error));
  },
  validateDocumentBody(request) {
    request
      .checkBody('title', 'Enter a title for the document')
      .isLength({ min: 1 });
    request
      .checkBody('content', 'Enter a content for the document')
      .isLength({ min: 1 });
    request
      .checkBody('access', 'Enter an access for the document')
      .isLength({ min: 1 });
  },
  validateErrorMessage(errors) {
    const exclude = ['param', 'value'];
    const error = errors.map(omit(exclude));
    const ErrorMessage = error;
    return ErrorMessage;
  }
};

export default documentHelper;
