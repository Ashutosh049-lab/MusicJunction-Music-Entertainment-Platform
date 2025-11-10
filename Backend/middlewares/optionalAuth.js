// Backend/middlewares/optionalAuth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ') && JWT_SECRET) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
    } catch (err) {
      // ignore invalid/expired token to keep route public
    }
  }
  next();
};
