import paginationUtil from '../utils/paginationUtil';

const pageHelper = {
  getLimit(request) {
    const limit = request.query && request.query.limit
      ? request.query.limit
      : 10;
    return limit;
  },
  getOffset(request) {
    const offset = request.query && request.query.offset
      ? request.query.offset
      : 0;
    return offset;
  },
  getPageMeta(request, listUsers, getLimit, getOffset) {
    const totalCount = listUsers.count;
    const pageSize = Number(paginationUtil.getPageSize(getLimit(request)));
    const pageCount = paginationUtil.getPageCount(
      totalCount,
      getLimit(request)
    );
    const page = paginationUtil.getCurrentPage(
      getLimit(request),
      getOffset(request)
    );
    const meta = {
      page,
      pageCount,
      pageSize,
      totalCount
    };
    return meta;
  },
  getDocumentPageMeta(request, documents, getLimit, getOffset) {
    const totalCount = documents.count;
    const pageSize = Number(paginationUtil.getPageSize(getLimit(request)));
    const pageCount = paginationUtil.getPageCount(
      totalCount,
      getLimit(request)
    );
    const page = paginationUtil.getCurrentPage(
      getLimit(request),
      getOffset(request)
    );
    const meta = {
      page,
      pageCount,
      pageSize,
      totalCount
    };
    return meta;
  }
};
export default pageHelper;
