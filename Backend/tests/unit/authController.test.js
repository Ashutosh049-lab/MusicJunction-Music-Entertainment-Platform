jest.mock('../../models/User', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  create: jest.fn(),
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(async (pwd) => `hashed:${pwd}`),
  compare: jest.fn(async (a, b) => b === `hashed:${a}` || a === b),
}));

const User = require('../../models/User');
const authController = require('../../controllers/authController');

function createRes() {
  const res = {};
  res.statusCode = 200;
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  res.send = (b) => { res.body = b; return res; };
  return res;
}

describe('authController unit', () => {
  beforeEach(() => jest.clearAllMocks());

  it('register returns 201 when ok', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: 'u1', name: 'A', email: 'a@a.com', role: 'listener' });

    const req = { method: 'POST', body: { name: 'A', email: 'a@a.com', password: 'p1', role: 'listener' } };
    const res = createRes();
    await authController.register(req, res);
    expect(res.statusCode).toBe(201);
  });

  it('login returns 200 with token', async () => {
    User.findOne.mockResolvedValue({ _id: 'u1', password: 'hashed:p1', role: 'listener', email: 'a@a.com', name: 'A' });
    const req = { method: 'POST', body: { email: 'a@a.com', password: 'p1' } };
    const res = createRes();
    await authController.login(req, res);
    expect(res.statusCode).toBe(200);
  });
});
