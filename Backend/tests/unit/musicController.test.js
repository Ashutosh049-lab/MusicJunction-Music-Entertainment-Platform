// Mock deps before requiring controller
jest.mock('../../utils/spotifyService', () => ({
  searchTracks: jest.fn(async () => []),
  getTrackById: jest.fn(async () => ({})),
}));

jest.mock('../../models/Music', () => ({
  create: jest.fn(),
}));

const Music = require('../../models/Music');
const musicController = require('../../controllers/musicController');

function createRes() {
  const res = {};
  res.statusCode = 200;
  res.headers = {};
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  res.send = (b) => { res.body = b; return res; };
  return res;
}

describe('musicController unit', () => {
  beforeEach(() => jest.clearAllMocks());

  it('uploadTrack returns 400 without file', async () => {
    const req = { method: 'POST', body: { title: 'T', artist: 'A', genre: 'G' } };
    const res = createRes();
    await musicController.uploadTrack(req, res);
    expect(res.statusCode).toBe(400);
  });

  it('uploadTrack creates track with file', async () => {
    Music.create.mockResolvedValue({ _id: 't1' });
    const req = {
      method: 'POST',
      body: { title: 'T', artist: 'A', genre: 'G' },
      file: { filename: 'f.mp3', size: 10, mimetype: 'audio/mpeg' },
      user: { id: 'u1' },
    };
    const res = createRes();
    await musicController.uploadTrack(req, res);
    expect(res.statusCode).toBe(201);
  });
});
