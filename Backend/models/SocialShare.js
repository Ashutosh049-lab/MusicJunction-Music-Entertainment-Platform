const mongoose = require('mongoose');

// Model to track social media shares
const socialShareSchema = new mongoose.Schema({
  // User who shared
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  
  // Content being shared
  contentType: { 
    type: String, 
    enum: ['music', 'playlist', 'project', 'profile'], 
    required: true 
  },
  contentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'contentModel'
  },
  contentModel: {
    type: String,
    required: true,
    enum: ['Music', 'Playlist', 'Project', 'User']
  },
  
  // Platform details
  platform: { 
    type: String, 
    enum: ['instagram', 'twitter', 'facebook', 'whatsapp', 'telegram', 'email', 'copy_link'], 
    required: true,
    index: true
  },
  
  // Share metadata
  shareUrl: { type: String, required: true }, // Generated share link
  shareText: { type: String }, // Caption/message used
  hashtags: [{ type: String }],
  
  // Tracking
  clickCount: { type: Number, default: 0 }, // Times the shared link was clicked
  conversionCount: { type: Number, default: 0 }, // Times clicked link led to signup/engagement
  
  // External platform response (if available)
  externalPostId: { type: String }, // ID from social platform (Twitter tweet ID, etc.)
  externalPostUrl: { type: String }, // Direct link to the social media post
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failed'], 
    default: 'success' 
  },
  errorMessage: { type: String },
  
  // Analytics
  sharedAt: { type: Date, default: Date.now, index: true },
  lastClickedAt: { type: Date },
  
}, { 
  timestamps: true 
});

// Compound indexes for analytics queries
socialShareSchema.index({ userId: 1, sharedAt: -1 });
socialShareSchema.index({ contentType: 1, contentId: 1 });
socialShareSchema.index({ platform: 1, sharedAt: -1 });
socialShareSchema.index({ status: 1, createdAt: -1 });

// Virtual to check if share is recent (within 24 hours)
socialShareSchema.virtual('isRecent').get(function() {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.sharedAt > dayAgo;
});

// Method to record a click
socialShareSchema.methods.recordClick = async function() {
  this.clickCount += 1;
  this.lastClickedAt = new Date();
  return this.save();
};

// Method to record a conversion
socialShareSchema.methods.recordConversion = async function() {
  this.conversionCount += 1;
  return this.save();
};

// Static method to get share analytics for content
socialShareSchema.statics.getContentAnalytics = async function(contentType, contentId) {
  return this.aggregate([
    { $match: { contentType, contentId: mongoose.Types.ObjectId(contentId) } },
    { $group: {
        _id: '$platform',
        totalShares: { $sum: 1 },
        totalClicks: { $sum: '$clickCount' },
        totalConversions: { $sum: '$conversionCount' }
      }
    }
  ]);
};

module.exports = mongoose.model('SocialShare', socialShareSchema);
