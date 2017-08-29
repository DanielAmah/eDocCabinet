const paginationUtil = {
  getPageSize(limit) {
    return limit;
  },

  getPageCount(totalDataCount, limit) {
    return Math.ceil(totalDataCount / paginationUtil.getPageSize(limit));
  },

  getCurrentPage(limit, offset) {
    if (offset * 1 === 0) {
      return Math.ceil(offset / limit) + 1;
    }
    return Math.ceil(offset / limit) + 1;
  }
};
module.exports = paginationUtil;
