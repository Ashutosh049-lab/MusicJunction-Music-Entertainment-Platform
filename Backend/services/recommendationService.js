const Music = require('../models/Music');
const User = require('../models/User');
const Recommendation = require('../models/Recommendation');

class RecommendationService {
  
  /**
   * Generate personalized music recommendations for a user
   * @param {String} userId - User ID
   * @param {Object} options - Options for recommendation generation
   * @returns {Array} Array of recommended music tracks
   */
  async generateRecommendations(userId, options = {}) {
    const {
      limit = 20,
      offset = 0,
      refreshCache = false
    } = options;
    
    try {
      // Get or create recommendation profile
      let recProfile = await Recommendation.findOne({ userId });
      
      if (!recProfile) {
        recProfile = await this.createRecommendationProfile(userId);
      }
      
      // Check if we can use cached recommendations
      const cacheAge = recProfile.lastRecommendationGenerated 
        ? Date.now() - recProfile.lastRecommendationGenerated 
        : Infinity;
      
      // Use cache if less than 1 hour old and not forced refresh
      if (!refreshCache && cacheAge < 3600000 && recProfile.cachedRecommendations.length > 0) {
        return await this.getCachedRecommendations(recProfile, limit, offset);
      }
      
      // Generate new recommendations
      const recommendations = await this.computeRecommendations(userId, recProfile);
      
      // Update cache
      recProfile.cachedRecommendations = recommendations.map(rec => ({
        musicId: rec._id,
        score: rec.recommendationScore,
        reason: rec.recommendationReason,
        generatedAt: new Date()
      }));
      recProfile.lastRecommendationGenerated = new Date();
      await recProfile.save();
      
      return recommendations.slice(offset, offset + limit);
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }
  
  /**
   * Create initial recommendation profile for new user
   */
  async createRecommendationProfile(userId) {
    const user = await User.findById(userId);
    const favoriteGenres = user?.preferences?.favoriteGenres || [];
    
    const recProfile = new Recommendation({
      userId,
      preferences: {
        favoriteGenres: favoriteGenres.map(g => ({ genre: g, score: 1 })),
        favoriteArtists: [],
        audioFeaturePreferences: {},
        timeOfDayPreferences: {
          morning: [],
          afternoon: [],
          evening: [],
          night: []
        }
      }
    });
    
    return recProfile.save();
  }
  
  /**
   * Get cached recommendations
   */
  async getCachedRecommendations(recProfile, limit, offset) {
    const cached = recProfile.cachedRecommendations
      .slice(offset, offset + limit)
      .map(c => c.musicId);
    
    return await Music.find({ _id: { $in: cached } })
      .populate('uploadedBy', 'name username avatarUrl')
      .populate('artistId', 'name username')
      .exec();
  }
  
  /**
   * Compute recommendations using collaborative filtering and content-based filtering
   */
  async computeRecommendations(userId, recProfile) {
    const recommendations = new Map();
    
    // 1. Content-based recommendations (based on user's listening history)
    const contentBased = await this.getContentBasedRecommendations(userId, recProfile);
    contentBased.forEach(music => {
      recommendations.set(music._id.toString(), {
        ...music.toObject(),
        recommendationScore: music.recommendationScore || 1,
        recommendationReason: 'Based on your listening history'
      });
    });
    
    // 2. Collaborative filtering (based on similar users)
    const collaborative = await this.getCollaborativeRecommendations(userId, recProfile);
    collaborative.forEach(music => {
      const id = music._id.toString();
      if (recommendations.has(id)) {
        const existing = recommendations.get(id);
        existing.recommendationScore += music.recommendationScore || 1;
        existing.recommendationReason = 'Popular with users like you';
      } else {
        recommendations.set(id, {
          ...music.toObject(),
          recommendationScore: music.recommendationScore || 0.7,
          recommendationReason: 'Popular with similar users'
        });
      }
    });
    
    // 3. Trending tracks
    const trending = await this.getTrendingRecommendations();
    trending.forEach(music => {
      const id = music._id.toString();
      if (!recommendations.has(id)) {
        recommendations.set(id, {
          ...music.toObject(),
          recommendationScore: music.trendingScore / 100 || 0.5,
          recommendationReason: 'Trending now'
        });
      }
    });
    
    // Convert to array and sort by score
    const sorted = Array.from(recommendations.values())
      .sort((a, b) => b.recommendationScore - a.recommendationScore);
    
    return sorted;
  }
  
  /**
   * Content-based filtering: recommend similar tracks to what user has liked
   */
  async getContentBasedRecommendations(userId, recProfile) {
    const user = await User.findById(userId).populate('likedMusic');
    
    if (!user.likedMusic || user.likedMusic.length === 0) {
      return [];
    }
    
    // Extract genres and audio features from liked music
    const likedGenres = [...new Set(user.likedMusic.map(m => m.genre))];
    const likedArtists = [...new Set(user.likedMusic.map(m => m.artistId).filter(Boolean))];
    
    // Find similar tracks
    const query = {
      _id: { $nin: [...user.likedMusic.map(m => m._id), ...user.recentlyPlayed.map(r => r.music)] },
      visibility: 'public',
      uploadStatus: 'active',
      $or: [
        { genre: { $in: likedGenres } },
        { artistId: { $in: likedArtists } },
        { tags: { $in: user.likedMusic.flatMap(m => m.tags) } }
      ]
    };
    
    return Music.find(query)
      .limit(50)
      .sort({ popularity: -1, createdAt: -1 })
      .populate('uploadedBy', 'name username avatarUrl')
      .populate('artistId', 'name username');
  }
  
  /**
   * Collaborative filtering: find similar users and recommend their liked music
   */
  async getCollaborativeRecommendations(userId, recProfile) {
    const user = await User.findById(userId);
    
    // Find users with similar taste (same favorite genres)
    const similarUsers = await User.find({
      _id: { $ne: userId },
      'preferences.favoriteGenres': { 
        $in: user.preferences?.favoriteGenres || [] 
      }
    })
    .limit(20)
    .select('likedMusic');
    
    // Collect music liked by similar users
    const musicIds = new Set();
    similarUsers.forEach(u => {
      u.likedMusic?.forEach(m => musicIds.add(m.toString()));
    });
    
    // Exclude already liked music
    user.likedMusic?.forEach(m => musicIds.delete(m.toString()));
    
    return Music.find({
      _id: { $in: Array.from(musicIds) },
      visibility: 'public',
      uploadStatus: 'active'
    })
    .limit(30)
    .sort({ likesCount: -1 })
    .populate('uploadedBy', 'name username avatarUrl')
    .populate('artistId', 'name username');
  }
  
  /**
   * Get trending tracks
   */
  async getTrendingRecommendations() {
    return Music.find({
      visibility: 'public',
      uploadStatus: 'active',
      trendingScore: { $gt: 0 }
    })
    .limit(20)
    .sort({ trendingScore: -1 })
    .populate('uploadedBy', 'name username avatarUrl')
    .populate('artistId', 'name username');
  }
  
  /**
   * Track user interaction for improving recommendations
   */
  async trackInteraction(userId, musicId, interactionType, metadata = {}) {
    try {
      let recProfile = await Recommendation.findOne({ userId });
      
      if (!recProfile) {
        recProfile = await this.createRecommendationProfile(userId);
      }
      
      await recProfile.addInteraction(musicId, interactionType, metadata);
      
      // Update preferences asynchronously (don't wait)
      this.updatePreferences(userId, recProfile).catch(err => 
        console.error('Error updating preferences:', err)
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error tracking interaction:', error);
      throw error;
    }
  }
  
  /**
   * Update user preferences based on interaction history
   */
  async updatePreferences(userId, recProfile) {
    // Get recent interactions
    const recentInteractions = recProfile.interactions.slice(-100);
    
    // Count genre preferences
    const genreScores = {};
    const artistScores = {};
    
    for (const interaction of recentInteractions) {
      const music = await Music.findById(interaction.musicId);
      if (!music) continue;
      
      // Weight by interaction type
      const weight = this.getInteractionWeight(interaction.interactionType);
      
      // Update genre scores
      if (music.genre) {
        genreScores[music.genre] = (genreScores[music.genre] || 0) + weight;
      }
      
      // Update artist scores
      if (music.artistId) {
        const artistKey = music.artistId.toString();
        artistScores[artistKey] = (artistScores[artistKey] || 0) + weight;
      }
    }
    
    // Update recommendation profile
    recProfile.preferences.favoriteGenres = Object.entries(genreScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([genre, score]) => ({ genre, score }));
    
    recProfile.preferences.favoriteArtists = Object.entries(artistScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([artistId, score]) => ({ artistId, score }));
    
    await recProfile.save();
  }
  
  /**
   * Get weight for different interaction types
   */
  getInteractionWeight(interactionType) {
    const weights = {
      'play': 1,
      'like': 3,
      'skip': -1,
      'save': 2,
      'share': 4,
      'download': 5,
      'add_to_playlist': 3
    };
    return weights[interactionType] || 1;
  }
  
  /**
   * Get recommendations by genre
   */
  async getRecommendationsByGenre(userId, genre, limit = 20) {
    return Music.find({
      genre,
      visibility: 'public',
      uploadStatus: 'active'
    })
    .limit(limit)
    .sort({ popularity: -1, likesCount: -1 })
    .populate('uploadedBy', 'name username avatarUrl')
    .populate('artistId', 'name username');
  }
  
  /**
   * Get recommendations by mood/audio features
   */
  async getRecommendationsByMood(userId, mood, limit = 20) {
    // Map mood to audio feature ranges
    const moodProfiles = {
      'happy': { valence: { $gte: 0.6 }, energy: { $gte: 0.5 } },
      'sad': { valence: { $lte: 0.4 }, energy: { $lte: 0.5 } },
      'energetic': { energy: { $gte: 0.7 }, danceability: { $gte: 0.6 } },
      'calm': { energy: { $lte: 0.4 }, acousticness: { $gte: 0.5 } },
      'focus': { instrumentalness: { $gte: 0.5 }, energy: { $lte: 0.6 } }
    };
    
    const moodQuery = moodProfiles[mood] || {};
    const query = {
      visibility: 'public',
      uploadStatus: 'active',
      ...Object.entries(moodQuery).reduce((acc, [key, value]) => {
        acc[`audioFeatures.${key}`] = value;
        return acc;
      }, {})
    };
    
    return Music.find(query)
      .limit(limit)
      .sort({ popularity: -1 })
      .populate('uploadedBy', 'name username avatarUrl')
      .populate('artistId', 'name username');
  }
}

module.exports = new RecommendationService();
