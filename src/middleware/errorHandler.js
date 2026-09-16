const { errorResponse } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  const payload = process.env.NODE_ENV === 'production' ? null : err.stack;
  
  return errorResponse(res, err.message || 'Server Error', { stack: payload }, statusCode);
};

module.exports = errorHandler;
