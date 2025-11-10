const socialSharingService = require('../services/socialSharingService');

/**
 * Create a social share
 */
exports.createShare = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contentType, contentId, platform, customText, hashtags } = req.body;
    
    // Validation
    if (!contentType || !contentId || !platform) {
      return res.status(400).json({
        success: false,
        message: 'contentType, contentId, and platform are required'
      });
    }
    
    const validContentTypes = ['music', 'playlist', 'project', 'profile'];
    if (!validContentTypes.includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid content type. Valid types: ${validContentTypes.join(', ')}`
      });
    }
    
    const validPlatforms = ['instagram', 'twitter', 'facebook', 'whatsapp', 'telegram', 'email', 'copy_link'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        message: `Invalid platform. Valid platforms: ${validPlatforms.join(', ')}`
      });
    }
    
    const result = await socialSharingService.createShare(
      userId,
      contentType,
      contentId,
      platform,
      { customText, hashtags }
    );
    
    res.status(201).json({
      success: true,
      message: 'Share created successfully',
      data: result
    });
  } catch (error) {
    console.error('Error creating share:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create share',
      error: error.message
    });
  }
};

/**
 * Get platform-specific share URLs
 */
exports.getShareUrls = async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    const { customText } = req.query;
    
    const validContentTypes = ['music', 'playlist', 'project', 'profile'];
    if (!validContentTypes.includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid content type. Valid types: ${validContentTypes.join(', ')}`
      });
    }
    
    const urls = await socialSharingService.getPlatformShareUrls(
      contentType,
      contentId,
      customText
    );
    
    res.status(200).json({
      success: true,
      data: urls
    });
  } catch (error) {
    console.error('Error getting share URLs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get share URLs',
      error: error.message
    });
  }
};

/**
 * Get user's share analytics
 */
exports.getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    
    const analytics = await socialSharingService.getUserShareAnalytics(
      userId,
      { startDate, endDate }
    );
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting user analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: error.message
    });
  }
};

/**
 * Get content share analytics
 */
exports.getContentAnalytics = async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    
    const analytics = await socialSharingService.getContentShareAnalytics(
      contentType,
      contentId
    );
    
    res.status(200).json({
      success: true,
      contentType,
      contentId,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting content analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get content analytics',
      error: error.message
    });
  }
};

/**
 * Track share click
 */
exports.trackClick = async (req, res) => {
  try {
    const { shareId } = req.params;
    
    const result = await socialSharingService.trackShareClick(shareId);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track click',
      error: error.message
    });
  }
};

/**
 * Track share conversion
 */
exports.trackConversion = async (req, res) => {
  try {
    const { shareId } = req.params;
    
    const result = await socialSharingService.trackShareConversion(shareId);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error tracking conversion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track conversion',
      error: error.message
    });
  }
};
