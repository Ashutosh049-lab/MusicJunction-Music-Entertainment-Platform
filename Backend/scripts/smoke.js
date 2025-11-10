const request = require('supertest');
const app = require('../app');

(async () => {
  try {
    // Root health
    const rootRes = await request(app).get('/');
    console.log('GET / ->', rootRes.status, rootRes.text);

    // Recommendations requires auth -> expect 401
    const recRes = await request(app).get('/api/recommendations');
    console.log('GET /api/recommendations (no token) ->', recRes.status);

    // Social share urls requires auth -> expect 401
    const shareRes = await request(app).get('/api/social/share-urls/music/507f1f77bcf86cd799439011');
    console.log('GET /api/social/share-urls (no token) ->', shareRes.status);

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
