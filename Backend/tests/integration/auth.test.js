const request = require('supertest');

jest.mock('../../utils/spotifyService', () => ({
  searchTracks: jest.fn(async () => []),
  getTrackById: jest.fn(async () => ({})),
}));

const app = require('../../app');
const { generateTestToken } = require('../utils/token');

// Mock User model
jest.mock('../../models/User', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  create: jest.fn(),
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(async (pwd) => `hashed:${pwd}`),
  compare: jest.fn(async (a, b) => b === `hashed:${a}` || a === b),
}));

const User = require('../../models/User');

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/auth/register creates user', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: 'u1', name: 'A', email: 'a@a.com', role: 'listener' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'A', email: 'a@a.com', password: 'p1', role: 'listener' });

    expect(res.status).toBe(201);
    expect(User.create).toHaveBeenCalled();
    expect(res.body).toHaveProperty('token');
  });

  it('POST /api/auth/login returns token', async () => {
    // Simulate stored hashed password
    User.findOne.mockResolvedValue({ _id: 'u1', name: 'A', email: 'a@a.com', role: 'listener', password: 'hashed:p1' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@a.com', password: 'p1' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('GET /api/auth/me returns profile with token', async () => {
    const token = generateTestToken({ id: 'u1', role: 'listener', email: 'a@a.com' });
    User.findById = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: 'u1', name: 'A' }) });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ _id: 'u1', name: 'A' });
  });

  it('PUT /api/auth/me updates profile', async () => {
    const token = generateTestToken({ id: 'u1', role: 'listener', email: 'a@a.com' });
    User.findByIdAndUpdate.mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: 'u1', name: 'B' }) });

    const res = await request(app)
      .put('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'B' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
  });

  it('POST /api/auth/me/change-password succeeds', async () => {
    const token = generateTestToken({ id: 'u1', role: 'listener', email: 'a@a.com' });
    const userDoc = { password: 'hashed:old', save: jest.fn() };
    User.findById = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(userDoc) });

    const res = await request(app)
      .post('/api/auth/me/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ oldPassword: 'old', newPassword: 'new' });

    expect(res.status).toBe(200);
  });
});
