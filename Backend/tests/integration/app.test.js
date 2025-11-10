const request = require('supertest');

// Mock spotify service used by musicController to avoid missing module
jest.mock('../../utils/spotifyService', () => ({
  searchTracks: jest.fn(async () => []),
  getTrackById: jest.fn(async () => ({})),
}));

const app = require('../../app');

describe('Root', () => {
  it('GET / should return welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Welcome to MusicJunction API');
  });
});
