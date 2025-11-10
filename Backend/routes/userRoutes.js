const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users/:userId - public profile
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return a safe, public profile
    const profile = {
      id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      stats: user.stats,
    };

    res.json({ user: profile });
  } catch (err) {
    console.error('get user error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;