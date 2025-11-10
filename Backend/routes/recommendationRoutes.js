const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const auth = require('../middlewares/auth');

// All routes require authentication
router.use(auth);

/**
 * @route   GET /api/recommendations
 * @desc    Get personalized music recommendations
 * @access  Private
 * @query   limit - Number of recommendations (default: 20)
 * @query   offset - Offset for pagination (default: 0)
 * @query   refresh - Force refresh cache (default: false)
 */
router.get('/', recommendationController.getRecommendations);

/**
 * @route   GET /api/recommendations/genre/:genre
 * @desc    Get recommendations by genre
 * @access  Private
 * @param   genre - Genre name
 * @query   limit - Number of recommendations (default: 20)
 */
router.get('/genre/:genre', recommendationController.getRecommendationsByGenre);

/**
 * @route   GET /api/recommendations/mood/:mood
 * @desc    Get recommendations by mood
 * @access  Private
 * @param   mood - Mood (happy, sad, energetic, calm, focus)
 * @query   limit - Number of recommendations (default: 20)
 */
router.get('/mood/:mood', recommendationController.getRecommendationsByMood);

/**
 * @route   GET /api/recommendations/preferences
 * @desc    Get user's recommendation preferences
 * @access  Private
 */
router.get('/preferences', recommendationController.getPreferences);

/**
 * @route   POST /api/recommendations/track
 * @desc    Track user interaction with music
 * @access  Private
 * @body    musicId - ID of the music track
 * @body    interactionType - Type of interaction (play, like, skip, etc.)
 * @body    duration - Duration of interaction in seconds (optional)
 * @body    completionRate - Percentage of track completed (optional)
 */
router.post('/track', recommendationController.trackInteraction);

module.exports = router;
