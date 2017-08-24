import omit from 'omit';
import PageHelper from './PageHelper';

const DocumentHelper = {
  CreateDocument(request) {
    const createDocument = {
      title: request.body.title,
      content: request.body.content,
      owner: request.decoded.userUsername,
      userId: request.decoded.userId,
      access: request.body.access,
    };
    return createDocument;
  },
  CreateResponse(newDocument) {
    const createResponse = {
      title: newDocument.title,
      content: newDocument.content,
      owner: newDocument.owner,
      message: 'Document created successfully'
    };
    return createResponse;
  },
  DocumentCheck(request, response) {
    if (typeof request.body.title === 'number'
        || typeof request.body.content === 'number') {
      response.status(400).send({
        message: 'title must be characters not number' });
    }
  },
  UpdateDocument(request, document) {
    const update = {
      title: request.body.title || document.title,
      content: request.body.content || document.content,
      access: request.body.access || document.access
    };
    return update;
  },
  UpdateResponse(document) {
    const updateResponse = {
      message: 'The Document has been successfully updated',
      documentId: document.id,
      title: document.title,
      content: document.content,
      owner: document.owner,
    };
    return updateResponse;
  },
  SearchQueryDatabase(request) {
    const searchQuery = {
      where: {
        $or: [
          { title: {
            $iLike: `%${request.query.q}%`.toLowerCase()
          }
          }
        ]
      },
      attributes: ['id', 'title', 'access',
        'content', 'owner', 'createdAt']
    };
    return searchQuery;
  },
  FindQueryDatabase(request) {
    const findQuery = {
      where: {
        title: {
          $iLike: `%${request.query.q}%`.toLowerCase()
        },
        $or: [{ access: 'public' },
           { access: 'role', $and: { roleId: request.decoded.userRole } },
           { access: 'private', $and: { userId: request.decoded.userId } }]
      },
      attributes: ['id', 'title', 'access',
        'content', 'owner', 'createdAt']
    };
    return findQuery;
  },
  FindQueryADocument(request) {
    const findADocument = {
      where: {
        id: request.params.documentId,
        $or: [{ access: 'public' },
         { access: 'role', $and: { roleId: request.decoded.userRole } },
         { access: 'private', $and: { userId: request.decoded.userId } }]
      },
      attributes: ['id', 'title', 'access',
        'content', 'owner', 'createdAt']
    };
    return findADocument;
  },
  ShowQueryDatabase(request) {
    const showQuery = {
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
    };
    return showQuery;
  },
  DocumentNotFound(response, documents) {
    if (documents.length === 0) {
      return response.status(404).send({
        message: 'No document Found',
      });
    }
  },
  UpdateDocumentNotExist(response) {
    return response.status(404).send({
      message: 'The Document Does not Exist',
    });
  },
  DocumentNotExist(response) {
    return response.status(404).send({
      message: 'The Document Does not Exist',
    });
  },
  CheckQuery(response) {
    return response.send({
      message: 'No key word supplied'
    });
  },
  SearchDatabaseError(response) {
    response.status(500).send({
      message: 'Error occurred while retrieving document'
    });
  },
  InvalidDocumentAccess(response) {
    return response.status(403).send({
      message: 'Invalid document access, save document with your role'
    });
  },
  ValidAccess(request) {
    const validAccess = (request.body.access === 'public'
     || request.body.access === 'private' ||
      request.body.access === 'role');
    return validAccess;
  },
  CreateDatabaseError(response) {
    response.status(500).send({
      message: 'Error occurred while creating a new document'
    });
  },
  UpdateDatabaseError(response) {
    response.status(500).send({
      message: 'Error occurred while updating a document'
    });
  },
  ListDatabaseError(response) {
    response.status(500).send({
      message: 'Error occurred while listing documents'
    });
  },
  FindDatabaseError(response) {
    response.status(500).send({
      message: 'Error occurred while display a document'
    });
  },
  DeleteDatabaseError(response) {
    response.status(500).send({
      message: 'Error occurred while deleting a document'
    });
  },
  CheckIdIsNumber(response) {
    return response.status(400).send({
      message: 'Invalid Document ID'
    });
  },
  DeleteDocumentLogic(DocumentNotExist,
    response, DeleteDatabaseError, document) {
    if (!document) {
      return DocumentNotExist(response);
    }
    return document
                .destroy()
                .then(() => response.status(200)
                  .send({
                    message: 'The Document has been deleted successfully.' }))
                 .catch(error => DeleteDatabaseError(response, error));
  },
  Validation(request) {
    request.checkBody('title',
    'Enter a title for the document').isLength({ min: 1 });
    request.checkBody('content',
     'Enter a content for the document').isLength({ min: 1 });
    request.checkBody('access',
     'Enter an access for the document').isLength({ min: 1 });
  },
  ValidationErrorMessage(errors) {
    const exclude = ['param', 'value'];
    const error = errors.map(omit(exclude));
    const ErrorMessage = error;
    return ErrorMessage;
  }

};

export default DocumentHelper;
