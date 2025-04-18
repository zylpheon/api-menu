const jwt = require('jsonwebtoken');
const config = require('../config/secret');

// Middleware untuk verifikasi role
module.exports = function(requiredRole) {
  return function(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    
    // Check if bearer is undefined
    if(typeof bearerHeader !== 'undefined') {
      // Split at the space
      const bearer = bearerHeader.split(' ');
      // Get token from array
      const bearerToken = bearer[1];
      
      // Verify token
      jwt.verify(bearerToken, config.secret, function(err, decoded) {
        if(err) {
          return res.status(401).json({
            status: 401,
            message: 'Token tidak valid'
          });
        } else {
          // Check role
          if(requiredRole && decoded.role !== requiredRole) {
            return res.status(403).json({
              status: 403,
              message: 'Akses ditolak, role tidak sesuai'
            });
          }
          
          // Set user data to request
          req.auth = decoded;
          next();
        }
      });
    } else {
      // Forbidden
      return res.status(403).json({
        status: 403,
        message: 'Tidak ada token yang tersedia'
      });
    }
  }
};