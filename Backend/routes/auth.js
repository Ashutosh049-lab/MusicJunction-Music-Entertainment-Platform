
// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

// Public
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);

// Protected - requires Bearer token
router.get('/me', auth, authController.getProfile);
router.put('/me', auth, authController.updateProfile);
router.post('/me/change-password', auth, authController.changePassword);

module.exports = router;
