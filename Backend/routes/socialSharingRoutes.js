const express = require('express');
const router = express.Router();
const socialSharingController = require('../controllers/socialSharingController');
const auth = require('../middlewares/auth');

// All routes require authentication except tracking endpoints
router.use(auth);

/**
 * @route   POST /api/social/share
 * @desc    Create a social media share
 * @access  Private
 * @body    contentType - Type of content (music, playlist, project, profile)
 * @body    contentId - ID of the content
 * @body    platform - Platform to share to (instagram, twitter, facebook, etc.)
 * @body    customText - Custom text for the share (optional)
 * @body    hashtags - Array of hashtags (optional)
 */
router.post('/share', socialSharingController.createShare);

/**
 * @route   GET /api/social/share-urls/:contentType/:contentId
 * @desc    Get platform-specific share URLs for content
 * @access  Private
 * @param   contentType - Type of content
 * @param   contentId - ID of the content
 * @query   customText - Custom text for shares (optional)
 */
router.get('/share-urls/:contentType/:contentId', socialSharingController.getShareUrls);

/**
 * @route   GET /api/social/analytics/user
 * @desc    Get user's share analytics
 * @access  Private
 * @query   startDate - Start date for analytics (optional)
 * @query   endDate - End date for analytics (optional)
 */
router.get('/analytics/user', socialSharingController.getUserAnalytics);

/**
 * @route   GET /api/social/analytics/:contentType/:contentId
 * @desc    Get share analytics for specific content
 * @access  Private
 * @param   contentType - Type of content
 * @param   contentId - ID of the content
 */
router.get('/analytics/:contentType/:contentId', socialSharingController.getContentAnalytics);

/**
 * @route   POST /api/social/track/click/:shareId
 * @desc    Track share link click
 * @access  Public (tracked via link)
 * @param   shareId - ID of the share
 */
router.post('/track/click/:shareId', socialSharingController.trackClick);

/**
 * @route   POST /api/social/track/conversion/:shareId
 * @desc    Track share conversion
 * @access  Public (tracked via link)
 * @param   shareId - ID of the share
 */
router.post('/track/conversion/:shareId', socialSharingController.trackConversion);

module.exports = router;
