const recommendationService = require('../services/recommendationService');

/**
 * Get personalized recommendations for user
 */
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0, refresh = false } = req.query;
    
    const recommendations = await recommendationService.generateRecommendations(
      userId, 
      { 
        limit: parseInt(limit), 
        offset: parseInt(offset),
        refreshCache: refresh === 'true'
      }
    );
    
    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
};

/**
 * Get recommendations by genre
 */
exports.getRecommendationsByGenre = async (req, res) => {
  try {
    const userId = req.user.id;
    const { genre } = req.params;
    const { limit = 20 } = req.query;
    
    const recommendations = await recommendationService.getRecommendationsByGenre(
      userId, 
      genre,
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      genre,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    console.error('Error getting genre recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get genre recommendations',
      error: error.message
    });
  }
};

/**
 * Get recommendations by mood
 */
exports.getRecommendationsByMood = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mood } = req.params;
    const { limit = 20 } = req.query;
    
    const validMoods = ['happy', 'sad', 'energetic', 'calm', 'focus'];
    if (!validMoods.includes(mood)) {
      return res.status(400).json({
        success: false,
        message: `Invalid mood. Valid moods: ${validMoods.join(', ')}`
      });
    }
    
    const recommendations = await recommendationService.getRecommendationsByMood(
      userId, 
      mood,
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      mood,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    console.error('Error getting mood recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get mood recommendations',
      error: error.message
    });
  }
};

/**
 * Track user interaction with music
 */
exports.trackInteraction = async (req, res) => {
  try {
    const userId = req.user.id;
    let { musicId, interactionType, duration, completionRate } = req.body;
    
    if (!musicId || !interactionType) {
      return res.status(400).json({
        success: false,
        message: 'musicId and interactionType are required'
      });
    }
    
    const validInteractions = ['play', 'like', 'skip', 'save', 'share', 'download', 'add_to_playlist'];
    if (!validInteractions.includes(interactionType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid interaction type. Valid types: ${validInteractions.join(', ')}`
      });
    }
    
    // Normalize completionRate to 0..1 if provided
    if (typeof completionRate === 'number') {
      if (completionRate > 1) completionRate = completionRate / 100;
      if (completionRate < 0) completionRate = 0;
      if (completionRate > 1) completionRate = 1;
    }
    
    const result = await recommendationService.trackInteraction(
      userId,
      musicId,
      interactionType,
      { duration, completionRate }
    );
    
    res.status(200).json({
      success: true,
      message: 'Interaction tracked successfully',
      data: result
    });
  } catch (error) {
    console.error('Error tracking interaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track interaction',
      error: error.message
    });
  }
};

/**
 * Get user's recommendation preferences
 */
exports.getPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const Recommendation = require('../models/Recommendation');
    
    const recProfile = await Recommendation.findOne({ userId });
    
    if (!recProfile) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation profile not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        preferences: recProfile.preferences,
        totalInteractions: recProfile.totalInteractions,
        lastUpdated: recProfile.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error getting preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get preferences',
      error: error.message
    });
  }
};
