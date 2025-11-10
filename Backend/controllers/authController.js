
// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 10;

if (!JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET is not set in .env — JWT will fail without it.');
}

const generateToken = (user) => {
  const payload = { id: user._id, role: user.role, email: user.email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, username: rawUsername, musicianKey: bodyMusicianKey } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });

    // Enforce musician secret for musician signup
    if (role === 'musician') {
      const headerKey = req.headers['x-musician-key'] || req.headers['X-Musician-Key'] || req.headers['x-musiciansecret'];
      const musicianKey = bodyMusicianKey || headerKey;
      const required = process.env.MUSICIAN_SECRET || process.env.MUSICIAN_SIGNUP_SECRET;
      if (!required) {
        return res.status(500).json({ message: 'Musician signup unavailable: missing server secret. Contact admin.' });
      }
      if (!musicianKey || musicianKey !== required) {
        return res.status(403).json({ message: 'Invalid musician secret key' });
      }
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered.' });

    // username: use provided or generate a safe default
    let username = rawUsername;
    if (!username) {
      const base = (name || email.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 20);
      username = `${base}_${Date.now().toString().slice(-5)}`;
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, username, email, password: hashed, role });

    const token = generateToken(user);
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    console.error('register error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, musicianKey: bodyMusicianKey } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    let user;
    const query = User.findOne({ email });
    if (query && typeof query.select === 'function') {
      user = await query.select('+password');
    } else {
      // Fallback for mocks not supporting .select
      user = await User.findOne({ email });
    }

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, (user.password || ''));
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    // req.user is attached by auth middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('getProfile error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = {};
    // Do NOT allow role changes here to prevent privilege escalation.
    const allowed = ['name', 'bio', 'avatarUrl'];
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    console.error('updateProfile error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Optional: change password endpoint
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Old and new passwords are required.' });

    const user = await User.findById(req.user.id).select('+password') || await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(401).json({ message: 'Old password incorrect' });

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('changePassword error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
