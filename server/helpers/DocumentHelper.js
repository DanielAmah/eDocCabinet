import omit from 'omit';

const DocumentHelper = {
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
    const validAccess = (request.body.access === 'public' || request.body.access === 'private' || request.body.access === 'role');
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
  DeleteDocumentLogic(DocumentNotExist, response, DeleteDatabaseError, document) {
    if (!document) {
      return DocumentNotExist(response);
    }
    return document
                .destroy()
                .then(() => response.status(200)
                  .send({ message: 'The Document has been deleted successfully.' }))
                 .catch(error => DeleteDatabaseError(response, error));
  },
  Validation(request) {
    request.checkBody('title', 'Enter a title for the document').isLength({ min: 1 });
    request.checkBody('content', 'Enter a content for the document').isLength({ min: 1 });
    request.checkBody('access', 'Enter an access for the document').isLength({ min: 1 });
  },
  ValidationErrorMessage(errors) {
    const exclude = ['param', 'value'];
    const error = errors.map(omit(exclude));
    const ErrorMessage = error;
    return ErrorMessage;
  }

};

export default DocumentHelper;
