
const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  // Actor (user who performed the action)
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true
  },
  
  // Activity Type
  type: {
    type: String,
    enum: [
      // Music Activities
      'music_upload',
      'music_play',
      'music_like',
      'music_unlike',
      'music_share',
      'music_download',
      
      // Social Activities
      'user_follow',
      'user_unfollow',
      'user_join',
      
      // Collaboration Activities
      'project_create',
      'project_update',
      'project_join',
      'project_leave',
      'project_complete',
      
      // Engagement Activities
      'comment_create',
      'comment_reply',
      'comment_like',
      
      // Playlist Activities
      'playlist_create',
      'playlist_update',
      'playlist_follow',
      
      // Rating Activities
      'rating_create',
      'rating_update',
      
      // Achievement Activities
      'milestone_reached',
      'badge_earned',
      'level_up'
    ],
    required: true,
    index: true
  },
  
  // Action Description
  action: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 500
  },
  
  // Related Entity
  entityType: {
    type: String,
    enum: ['Music', 'Project', 'Comment', 'User', 'Playlist', 'Rating', null],
    default: null
  },
  entityId: { 
    type: mongoose.Schema.Types.ObjectId 
  },
  
  // Target User (for social activities like follow, mention, etc.)
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  // Additional Context
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Visibility
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public',
    index: true
  },
  
  // Engagement on Activity
  likesCount: { 
    type: Number, 
    default: 0 
  },
  commentsCount: { 
    type: Number, 
    default: 0 
  },
  
  // Activity Grouping (for activity feeds)
  groupId: {
    type: String,
    index: true
  },
  
  // Soft Delete
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  deletedAt: { 
    type: Date 
  }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound Indexes for Activity Feed Queries
activitySchema.index({ user: 1, createdAt: -1 }); // User's activities
activitySchema.index({ type: 1, createdAt: -1 }); // Activity by type
activitySchema.index({ entityType: 1, entityId: 1, createdAt: -1 }); // Entity activities
activitySchema.index({ targetUser: 1, createdAt: -1 }); // Activities targeting a user
activitySchema.index({ visibility: 1, createdAt: -1 }); // Public feed
activitySchema.index({ groupId: 1, createdAt: -1 }); // Grouped activities
activitySchema.index({ isDeleted: 1, createdAt: -1 });

// Virtual to populate entity details dynamically
activitySchema.virtual('entity', {
  refPath: 'entityType',
  localField: 'entityId',
  foreignField: '_id',
  justOne: true
});

// Static method to create activity
activitySchema.statics.createActivity = async function(data) {
  // Auto-generate groupId for similar activities
  if (!data.groupId && data.entityType && data.entityId) {
    data.groupId = `${data.type}_${data.entityType}_${data.entityId}`;
  }
  
  const activity = new this(data);
  await activity.save();
  
  return activity;
};

// Static method to get user's activity feed
activitySchema.statics.getUserFeed = async function(userId, options = {}) {
  const { 
    limit = 20, 
    skip = 0, 
    types = null,
    includePrivate = false 
  } = options;
  
  const query = {
    user: userId,
    isDeleted: false
  };
  
  if (!includePrivate) {
    query.visibility = { $ne: 'private' };
  }
  
  if (types && types.length > 0) {
    query.type = { $in: types };
  }
  
  return this.find(query)
    .populate('user', 'name username avatarUrl')
    .populate('targetUser', 'name username avatarUrl')
    .populate('entity')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

// Static method to get public feed (for discover/explore pages)
activitySchema.statics.getPublicFeed = async function(options = {}) {
  const { 
    limit = 50, 
    skip = 0,
    types = null 
  } = options;
  
  const query = {
    visibility: 'public',
    isDeleted: false
  };
  
  if (types && types.length > 0) {
    query.type = { $in: types };
  }
  
  return this.find(query)
    .populate('user', 'name username avatarUrl isVerified')
    .populate('targetUser', 'name username avatarUrl')
    .populate('entity')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

// Static method to get following feed (activities from users you follow)
activitySchema.statics.getFollowingFeed = async function(userId, followingIds, options = {}) {
  const { 
    limit = 30, 
    skip = 0 
  } = options;
  
  const query = {
    user: { $in: followingIds },
    visibility: { $in: ['public', 'followers'] },
    isDeleted: false
  };
  
  return this.find(query)
    .populate('user', 'name username avatarUrl isVerified')
    .populate('targetUser', 'name username avatarUrl')
    .populate('entity')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

// Static method to get activities related to an entity
activitySchema.statics.getEntityActivities = async function(entityType, entityId, options = {}) {
  const { 
    limit = 20, 
    skip = 0 
  } = options;
  
  return this.find({
    entityType,
    entityId,
    isDeleted: false
  })
    .populate('user', 'name username avatarUrl')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

// Method to soft delete
activitySchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.deletedAt = Date.now();
  return this.save();
};

// Clean up old activities (older than 90 days)
activitySchema.statics.cleanupOldActivities = async function(days = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    visibility: 'private'  // Only delete private activities
  });
};

module.exports = mongoose.model("Activity", activitySchema);
