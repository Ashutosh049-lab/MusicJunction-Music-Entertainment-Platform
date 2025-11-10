
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  // Content
  content: { type: String, required: true, trim: true, maxlength: 2000 },
  
  // Author
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // Target (what is being commented on)
  targetType: { 
    type: String, 
    enum: ['Music', 'Project', 'User', 'Playlist', 'Comment'], 
    required: true 
  },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  
  // For nested comments/replies
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
  replyToUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // @mentions
  depth: { type: Number, default: 0, min: 0, max: 5 }, // Limit nesting depth
  
  // Engagement
  likesCount: { type: Number, default: 0, min: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  repliesCount: { type: Number, default: 0, min: 0 },
  
  // Content features
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Tagged users
  hashtags: [{ type: String, lowercase: true, trim: true }],
  
  // Timestamps for specific features
  timestamp: { type: Number }, // For commenting at specific time in music (seconds)
  
  // Moderation
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date },
  isFlagged: { type: Boolean, default: false },
  flagCount: { type: Number, default: 0 },
  flagReasons: [{ type: String }],
  moderationStatus: { 
    type: String, 
    enum: ['approved', 'pending', 'hidden', 'removed'], 
    default: 'approved' 
  },
  moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  moderatedAt: { type: Date },
  
  // Visibility
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  isPinned: { type: Boolean, default: false }, // For highlighting important comments
  
  // Spam detection
  spamScore: { type: Number, default: 0, min: 0, max: 1 },
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if comment is a reply
commentSchema.virtual('isReply').get(function() {
  return this.parentComment !== null;
});

// Compound Indexes for Performance
commentSchema.index({ targetType: 1, targetId: 1, createdAt: -1 }); // Get comments for a target
commentSchema.index({ author: 1, createdAt: -1 }); // User's comments
commentSchema.index({ parentComment: 1, createdAt: 1 }); // Replies to a comment
commentSchema.index({ targetType: 1, targetId: 1, isPinned: -1, likesCount: -1 }); // Pinned & popular comments
commentSchema.index({ moderationStatus: 1, isFlagged: 1 }); // Moderation queue
commentSchema.index({ mentions: 1, createdAt: -1 }); // User mentions
commentSchema.index({ hashtags: 1 }); // Hashtag search
commentSchema.index({ timestamp: 1 }); // Time-based comments (for music)

// Middleware to increment replies count on parent
commentSchema.post('save', async function(doc) {
  if (doc.parentComment && !doc.isDeleted) {
    await mongoose.model('Comment').findByIdAndUpdate(
      doc.parentComment,
      { $inc: { repliesCount: 1 } }
    );
  }
  
  // Update target's comment count
  const targetModel = mongoose.model(doc.targetType);
  if (targetModel && !doc.isDeleted) {
    await targetModel.findByIdAndUpdate(
      doc.targetId,
      { $inc: { commentsCount: 1 } }
    );
  }
});

// Method to soft delete comment
commentSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.deletedAt = Date.now();
  this.content = '[deleted]';
  
  // Update parent's reply count
  if (this.parentComment) {
    await mongoose.model('Comment').findByIdAndUpdate(
      this.parentComment,
      { $inc: { repliesCount: -1 } }
    );
  }
  
  // Update target's comment count
  const targetModel = mongoose.model(this.targetType);
  if (targetModel) {
    await targetModel.findByIdAndUpdate(
      this.targetId,
      { $inc: { commentsCount: -1 } }
    );
  }
  
  return this.save();
};

// Method to flag comment
commentSchema.methods.flag = async function(reason) {
  this.isFlagged = true;
  this.flagCount += 1;
  if (reason) this.flagReasons.push(reason);
  
  // Auto-hide if too many flags
  if (this.flagCount >= 5) {
    this.moderationStatus = 'hidden';
  }
  
  return this.save();
};

module.exports = mongoose.model("Comment", commentSchema);
