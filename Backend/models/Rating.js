
const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  // User who rated
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  
  // Target (what is being rated)
  targetType: { 
    type: String, 
    enum: ['Music', 'Playlist', 'Project'], 
    required: true 
  },
  targetId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  
  // Rating value (1-5 stars)
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  
  // Optional review text
  review: { 
    type: String, 
    trim: true, 
    maxlength: 1000 
  },
  
  // Helpful votes
  helpfulVotes: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  votedBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  
  // Verification
  isVerified: { 
    type: Boolean, 
    default: false 
  }, // For verified purchases/listens
  
  // Moderation
  isFlagged: { 
    type: Boolean, 
    default: false 
  },
  moderationStatus: { 
    type: String, 
    enum: ['approved', 'pending', 'hidden'], 
    default: 'approved' 
  },
  
}, { 
  timestamps: true 
});

// Compound indexes
ratingSchema.index({ targetType: 1, targetId: 1, user: 1 }, { unique: true }); // One rating per user per target
ratingSchema.index({ targetType: 1, targetId: 1, rating: -1 }); // Get ratings for target
ratingSchema.index({ user: 1, createdAt: -1 }); // User's rating history
ratingSchema.index({ rating: 1 }); // Filter by rating value

// Update target's rating stats after save
ratingSchema.post('save', async function(doc) {
  await updateTargetRatingStats(doc.targetType, doc.targetId);
});

// Update target's rating stats after update
ratingSchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    await updateTargetRatingStats(doc.targetType, doc.targetId);
  }
});

// Update target's rating stats after delete
ratingSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await updateTargetRatingStats(doc.targetType, doc.targetId);
  }
});

// Helper function to update target rating statistics
async function updateTargetRatingStats(targetType, targetId) {
  const Rating = mongoose.model('Rating');
  const targetModel = mongoose.model(targetType);
  
  if (!targetModel) return;
  
  // Calculate average rating and count
  const stats = await Rating.aggregate([
    { 
      $match: { 
        targetType, 
        targetId: new mongoose.Types.ObjectId(targetId),
        moderationStatus: 'approved'
      } 
    },
    { 
      $group: { 
        _id: null, 
        averageRating: { $avg: "$rating" },
        ratingsCount: { $sum: 1 },
        ratingsDistribution: {
          $push: "$rating"
        }
      } 
    }
  ]);
  
  if (stats.length > 0) {
    const { averageRating, ratingsCount, ratingsDistribution } = stats[0];
    
    // Calculate distribution
    const distribution = {
      1: ratingsDistribution.filter(r => r === 1).length,
      2: ratingsDistribution.filter(r => r === 2).length,
      3: ratingsDistribution.filter(r => r === 3).length,
      4: ratingsDistribution.filter(r => r === 4).length,
      5: ratingsDistribution.filter(r => r === 5).length,
    };
    
    await targetModel.findByIdAndUpdate(targetId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      ratingsCount,
      ratingsDistribution: distribution
    });
  } else {
    // No ratings, reset to defaults
    await targetModel.findByIdAndUpdate(targetId, {
      averageRating: 0,
      ratingsCount: 0,
      ratingsDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    });
  }
}

module.exports = mongoose.model("Rating", ratingSchema);
