const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/apiResponse');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'fallback_super_secret_key_for_testing';
      const decoded = jwt.verify(token, secret);
      
      req.user = decoded; 
      
      return next();
    } catch (error) {
      console.error(error);
      return errorResponse(res, 'Not authorized, token failed', null, 401);
    }
  }

  if (!token) {
    return errorResponse(res, 'Not authorized, no token', null, 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, `User role ${req.user.role} is not authorized to access this route`, null, 403);
    }
    next();
  };
};

module.exports = { protect, authorize };
