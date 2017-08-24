import PaginationUtil from '../utils/PaginationUtil';

const PageHelper = {
  GetLimit(request) {
    const limit = request.query && request.query.limit
      ? request.query.limit
      : 10;
    return limit;
  },
  GetOffset(request) {
    const offset = request.query && request.query.offset
      ? request.query.offset
      : 0;
    return offset;
  },
  GetPageMeta(request, users, GetLimit, GetOffset) {
    const totalCount = users.count;
    const pageSize = Number(PaginationUtil.getPageSize(GetLimit(request)));
    const pageCount = PaginationUtil.getPageCount(
      totalCount,
      GetLimit(request)
    );
    const page = PaginationUtil.getCurrentPage(
      GetLimit(request),
      GetOffset(request)
    );
    const meta = {
      page,
      pageCount,
      pageSize,
      totalCount
    };
    return meta;
  },
  GetDocumentPageMeta(request, documents, GetLimit, GetOffset) {
    const totalCount = documents.count;
    const pageSize = Number(PaginationUtil.getPageSize(GetLimit(request)));
    const pageCount = PaginationUtil.getPageCount(
      totalCount,
      GetLimit(request)
    );
    const page = PaginationUtil.getCurrentPage(
      GetLimit(request),
      GetOffset(request)
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
export default PageHelper;
