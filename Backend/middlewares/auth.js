
// middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) console.warn('⚠️ JWT_SECRET not set');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Provide both id and _id to satisfy controllers expecting either shape
    req.user = { id: decoded.id, _id: decoded.id, role: decoded.role, email: decoded.email };
    next();
  } catch (err) {
    console.error('auth middleware error', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
