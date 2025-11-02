const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware that allows both authenticated users and guest users
const authenticateTokenOrGuest = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // If no token, treat as guest user
  if (!token) {
    req.user = { isGuest: true };
    return next();
  }

  // If token provided, verify it
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // If token is invalid, treat as guest user
      req.user = { isGuest: true };
    } else {
      // Valid token, set authenticated user
      req.user = user;
    }
    next();
  });
};

module.exports = { authenticateToken, authenticateTokenOrGuest };