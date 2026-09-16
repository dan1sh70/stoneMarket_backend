/**
 * Standard API Response Formatter
 */

exports.successResponse = (res, message, data = {}, meta = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    errors: null,
    meta
  });
};

exports.errorResponse = (res, message, errors = null, statusCode = 400, meta = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors,
    meta
  });
};

exports.authResponse = (res, message, user, token, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      user,
      token,
      token_type: 'Bearer'
    },
    errors: null,
    meta: {}
  });
};
