jest.mock('../../models/Project', () => ({
  create: jest.fn(),
}));

const Project = require('../../models/Project');
const projectController = require('../../controllers/projectController');

function createRes() {
  const res = {};
  res.statusCode = 200;
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  res.send = (b) => { res.body = b; return res; };
  return res;
}

describe('projectController unit', () => {
  beforeEach(() => jest.clearAllMocks());

  it('createProject returns 201', async () => {
    Project.create.mockResolvedValue({ _id: 'p1', title: 'T' });
    const req = { method: 'POST', body: { title: 'T' }, user: { id: 'u1' } };
    const res = createRes();
    await projectController.createProject(req, res);
    expect(res.statusCode).toBe(201);
  });
});
