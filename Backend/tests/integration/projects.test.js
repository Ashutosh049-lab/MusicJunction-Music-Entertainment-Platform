const request = require('supertest');

jest.mock('../../utils/spotifyService', () => ({
  searchTracks: jest.fn(async () => []),
  getTrackById: jest.fn(async () => ({})),
}));

const app = require('../../app');
const { generateTestToken } = require('../utils/token');

jest.mock('../../models/Project', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
}));

jest.mock('../../models/User', () => ({
  findOne: jest.fn(),
}));

const Project = require('../../models/Project');
const User = require('../../models/User');

describe('Project API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/projects creates a project', async () => {
    const token = generateTestToken({ id: 'owner1', role: 'musician', email: 'o@o.com' });
    Project.create.mockResolvedValue({ _id: 'p1', title: 'T', owner: 'owner1' });

    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'T', description: 'D' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('project');
  });

  it('GET /api/projects returns my projects', async () => {
    const token = generateTestToken({ id: 'u1', role: 'musician', email: 'u@u.com' });
    const query = {
      populate: () => query,
      populate: () => query,
    };
    // Mock find to return a promise
    Project.find.mockReturnValue({
      populate: () => ({ populate: () => Promise.resolve([{ _id: 'p1' }]) })
    });

    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/projects/:id/invite invites a collaborator by email', async () => {
    const token = generateTestToken({ id: 'owner1', role: 'musician', email: 'o@o.com' });
    const projectDoc = {
      _id: 'p1',
      owner: 'owner1',
      collaborators: [],
      save: jest.fn(),
    };
    Project.findById.mockResolvedValue(projectDoc);
    User.findOne.mockResolvedValue({ _id: 'u2', name: 'User2', email: 'u2@x.com' });

    const res = await request(app)
      .post('/api/projects/p1/invite')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'u2@x.com', role: 'editor' });

    expect(res.status).toBe(200);
  });

  it('DELETE /api/projects/:id/collaborators/:userId removes a collaborator', async () => {
    const token = generateTestToken({ id: 'owner1', role: 'musician', email: 'o@o.com' });
    const projectDoc = {
      _id: 'p1',
      owner: 'owner1',
      collaborators: [{ user: { toString: () => 'u2' } }],
      save: jest.fn(),
    };
    Project.findById.mockResolvedValue(projectDoc);

    const res = await request(app)
      .delete('/api/projects/p1/collaborators/u2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
