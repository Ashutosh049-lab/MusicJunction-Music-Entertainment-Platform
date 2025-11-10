
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  // Recipient
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true
  },
  
  // Sender/Actor
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  
  // Notification Type
  type: {
    type: String,
    enum: [
      // Social
      'follow',
      'unfollow',
      
      // Collaboration
      'collaboration_invite',
      'collaboration_accepted',
      'collaboration_declined',
      'project_update',
      'project_file_added',
      'project_comment',
      
      // Engagement
      'comment',
      'comment_reply',
      'comment_mention',
      'comment_like',
      'music_like',
      'music_play_milestone',
      'playlist_follow',
      
      // Music
      'new_music_upload',
      'music_featured',
      
      // System
      'system_announcement',
      'account_verified',
      'premium_activated',
      'premium_expiring',
      
      // Moderation
      'content_flagged',
      'content_removed',
      'account_warning'
    ],
    required: true
  },
  
  // Message & Content
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  message: { 
    type: String,
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
  
  // Additional Data
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Action URL
  actionUrl: { 
    type: String,
    trim: true
  },
  
  // Status
  isRead: { 
    type: Boolean, 
    default: false,
    index: true
  },
  readAt: { 
    type: Date 
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Delivery
  deliveryChannels: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    push: { type: Boolean, default: false }
  },
  
  emailSent: { type: Boolean, default: false },
  pushSent: { type: Boolean, default: false },
  
  // Expiration
  expiresAt: { 
    type: Date 
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

// Compound Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 }); // Main query
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 }); // Filter by type
notificationSchema.index({ sender: 1, createdAt: -1 }); // Sender's notifications
notificationSchema.index({ entityType: 1, entityId: 1 }); // Entity lookup
notificationSchema.index({ expiresAt: 1 }, { sparse: true }); // Expiration cleanup
notificationSchema.index({ isDeleted: 1, createdAt: -1 });

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < Date.now();
});

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = Date.now();
    await this.save();
  }
  return this;
};

// Method to soft delete
notificationSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.deletedAt = Date.now();
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();
  
  // TODO: Emit to WebSocket if recipient is online
  // TODO: Send email if enabled
  // TODO: Send push notification if enabled
  
  return notification;
};

// Static method to mark multiple as read
notificationSchema.statics.markManyAsRead = async function(notificationIds, userId) {
  return this.updateMany(
    { 
      _id: { $in: notificationIds },
      recipient: userId,
      isRead: false
    },
    { 
      $set: { 
        isRead: true, 
        readAt: Date.now() 
      } 
    }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
    isDeleted: false,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: Date.now() } }
    ]
  });
};

// Auto-cleanup expired notifications (can be run as a cron job)
notificationSchema.statics.cleanupExpired = async function() {
  return this.deleteMany({
    expiresAt: { $lt: Date.now() }
  });
};

module.exports = mongoose.model("Notification", notificationSchema);
