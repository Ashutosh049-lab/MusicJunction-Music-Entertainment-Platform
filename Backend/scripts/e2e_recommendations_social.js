require('dotenv').config();
const request = require('supertest');
const connectDB = require('../config/db');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Music = require('../models/Music');

(async () => {
  try {
    await connectDB();

    // 1) Register a new user
    const email = `e2e_${Date.now()}@test.com`;
    const password = 'Passw0rd!';

    const username = `e2e_${Date.now()}`;
    let res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'E2E User', username, email, password, role: 'listener' });

    console.log('REGISTER ->', res.status);
    if (res.status !== 201) throw new Error('Register failed: ' + (res.body?.message || res.text));

    // 2) Login
    res = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    console.log('LOGIN ->', res.status);
    if (res.status !== 200) throw new Error('Login failed: ' + (res.body?.message || res.text));

    const token = res.body.token;
    const userId = res.body.user.id;

    // 3) Hit recommendations (should succeed, may be empty)
    res = await request(app)
      .get('/api/recommendations')
      .set('Authorization', `Bearer ${token}`);

    console.log('GET /api/recommendations ->', res.status, 'count:', res.body?.count);

    // 4) Create a Music doc, then track interaction
    const music = await Music.create({
      title: 'E2E Track',
      artist: 'E2E Artist',
      genre: 'Test',
      duration: 180,
      uploadedBy: userId,
      visibility: 'public',
      uploadStatus: 'active'
    });

    res = await request(app)
      .post('/api/recommendations/track')
      .set('Authorization', `Bearer ${token}`)
      .send({ musicId: music._id.toString(), interactionType: 'play', duration: 30, completionRate: 0.2 });

    console.log('POST /api/recommendations/track ->', res.status);

    // 5) Social share URLs for profile
    res = await request(app)
      .get(`/api/social/share-urls/profile/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    console.log('GET /api/social/share-urls/profile/:id ->', res.status);

    // 6) Create a social share for profile on twitter
    res = await request(app)
      .post('/api/social/share')
      .set('Authorization', `Bearer ${token}`)
      .send({ contentType: 'profile', contentId: userId, platform: 'twitter' });

    console.log('POST /api/social/share (profile/twitter) ->', res.status);

    // Done
    console.log('E2E flow completed successfully.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('E2E error:', err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();
