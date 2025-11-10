const jwt = require('jsonwebtoken');

function generateTestToken(payload = { id: 'u1', role: 'musician', email: 'user@example.com' }) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

module.exports = { generateTestToken };
