const request = require('supertest');

jest.mock('../../utils/spotifyService', () => ({
  searchTracks: jest.fn(async () => []),
  getTrackById: jest.fn(async () => ({})),
}));

const app = require('../../app');
const { generateTestToken } = require('../utils/token');

jest.mock('../../models/Music', () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
}));

const Music = require('../../models/Music');

describe('Music API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/music returns paginated tracks', async () => {
    const tracks = [{ _id: 't1', title: 'Song 1' }];
    Music.find.mockReturnValue({
      populate: () => ({
        sort: () => ({
          skip: () => ({
            limit: jest.fn().mockResolvedValue(tracks),
          }),
        }),
      }),
    });
    Music.countDocuments.mockResolvedValue(1);

    const res = await request(app).get('/api/music');
    expect(res.status).toBe(200);
    expect(res.body.tracks).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it('GET /api/music/:id returns track by id', async () => {
    const track = { _id: 't1', title: 'Song 1', populate: () => track };
    // Chain populate twice
    Music.findById.mockReturnValue({
      populate: () => ({ populate: () => Promise.resolve({ _id: 't1', title: 'Song 1' }) })
    });

    const res = await request(app).get('/api/music/t1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id', 't1');
  });

  it('POST /api/music/:id/like toggles like', async () => {
    const token = generateTestToken({ id: 'u1', role: 'listener', email: 'u@u.com' });
    const doc = { _id: 't1', likes: [], save: jest.fn() };
    Music.findById.mockResolvedValue(doc);

    const res = await request(app)
      .post('/api/music/t1/like')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('liked', true);
  });

  it('GET /api/music/stream/:id redirects for non-local with previewUrl', async () => {
    Music.findById.mockResolvedValue({ _id: 't2', source: 'spotify', previewUrl: 'https://p/preview.mp3' });
    const res = await request(app).get('/api/music/stream/t2');
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('preview.mp3');
  });
});
