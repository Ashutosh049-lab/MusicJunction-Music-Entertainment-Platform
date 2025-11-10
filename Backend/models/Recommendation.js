const mongoose = require('mongoose');

// Model to track user interactions for recommendation algorithm
const recommendationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  
  // Interaction History
  interactions: [{
    musicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Music' },
    interactionType: { 
      type: String, 
      enum: ['play', 'like', 'skip', 'save', 'share', 'download', 'add_to_playlist'],
      required: true 
    },
    timestamp: { type: Date, default: Date.now },
    duration: { type: Number }, // How long they listened (in seconds)
    completionRate: { type: Number, min: 0, max: 1 } // Percentage of track completed
  }],
  
  // Aggregated Preferences (computed periodically for performance)
  preferences: {
    favoriteGenres: [{
      genre: { type: String },
      score: { type: Number, default: 0 } // Higher = stronger preference
    }],
    favoriteArtists: [{
      artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      artistName: { type: String },
      score: { type: Number, default: 0 }
    }],
    audioFeaturePreferences: {
      preferredTempo: { type: Number }, // Average BPM preference
      preferredEnergy: { type: Number, min: 0, max: 1 },
      preferredValence: { type: Number, min: 0, max: 1 }, // Mood preference
      preferredDanceability: { type: Number, min: 0, max: 1 }
    },
    timeOfDayPreferences: {
      morning: [{ type: String }], // Genre preferences by time of day
      afternoon: [{ type: String }],
      evening: [{ type: String }],
      night: [{ type: String }]
    }
  },
  
  // Recommendation Cache (to avoid recalculating frequently)
  cachedRecommendations: [{
    musicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Music' },
    score: { type: Number },
    reason: { type: String }, // Why this was recommended
    generatedAt: { type: Date, default: Date.now }
  }],
  
  // Metadata
  lastUpdated: { type: Date, default: Date.now },
  lastRecommendationGenerated: { type: Date },
  totalInteractions: { type: Number, default: 0 }
  
}, { 
  timestamps: true 
});

// Indexes for query optimization
recommendationSchema.index({ userId: 1, 'interactions.timestamp': -1 });
recommendationSchema.index({ 'preferences.favoriteGenres.genre': 1 });
recommendationSchema.index({ lastRecommendationGenerated: 1 });

// Keep interactions limited to recent 1000 items
recommendationSchema.pre('save', function(next) {
  if (this.interactions && this.interactions.length > 1000) {
    this.interactions = this.interactions.slice(-1000);
  }
  next();
});

// Method to add an interaction
recommendationSchema.methods.addInteraction = async function(musicId, interactionType, metadata = {}) {
  this.interactions.push({
    musicId,
    interactionType,
    timestamp: new Date(),
    duration: metadata.duration,
    completionRate: metadata.completionRate
  });
  
  this.totalInteractions += 1;
  this.lastUpdated = new Date();
  
  return this.save();
};

module.exports = mongoose.model('Recommendation', recommendationSchema);
