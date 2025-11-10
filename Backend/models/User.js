
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true, trim: true, maxlength: 100 },
  username: { type: String, required: true, unique: true, trim: true, lowercase: true, minlength: 3, maxlength: 30 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false }, // Don't return password by default
  
  // Profile Information
  role: { type: String, enum: ['musician', 'listener', 'producer', 'label'], default: 'listener' },
  bio: { type: String, default: '', maxlength: 500 },
  avatarUrl: { type: String, default: '' },
  coverImageUrl: { type: String, default: '' },
  location: { type: String, trim: true },
  
  // Social Links
  socialLinks: {
    spotify: { type: String, trim: true },
    soundcloud: { type: String, trim: true },
    youtube: { type: String, trim: true },
    instagram: { type: String, trim: true },
    twitter: { type: String, trim: true },
    website: { type: String, trim: true }
  },
  
  // Musician-specific fields
  musicianProfile: {
    genres: [{ type: String }],
    instruments: [{ type: String }],
    skills: [{ type: String }],
    yearsOfExperience: { type: Number, min: 0 },
    lookingForCollaboration: { type: Boolean, default: false },
    availableForHire: { type: Boolean, default: false }
  },
  
  // Social Network
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  
  // User Preferences
  preferences: {
    favoriteGenres: [{ type: String }],
    language: { type: String, default: 'en' },
    theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true }
  },
  
  // Statistics & Analytics
  stats: {
    totalPlays: { type: Number, default: 0 },
    totalUploads: { type: Number, default: 0 },
    totalCollaborations: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 }
  },
  
  // Account Status
  isVerified: { type: Boolean, default: false },
  isPremium: { type: Boolean, default: false },
  premiumExpiry: { type: Date },
  status: { type: String, enum: ['active', 'suspended', 'deactivated'], default: 'active' },
  
  // Security
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  
  // Engagement
  recentlyPlayed: [{
    music: { type: mongoose.Schema.Types.ObjectId, ref: 'Music' },
    playedAt: { type: Date, default: Date.now }
  }],
  
  likedMusic: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Music' }],
  savedPlaylists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }]
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance optimization
userSchema.index({ role: 1 });
userSchema.index({ 'musicianProfile.genres': 1 });
userSchema.index({ followersCount: -1 }); // For leaderboards
userSchema.index({ 'stats.totalPlays': -1 }); // For analytics
userSchema.index({ createdAt: -1 });

// Virtual for account locked status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // Lock account after 5 failed attempts for 2 hours
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: Date.now() },
    $unset: { lockUntil: 1 }
  });
};

// Keep recentlyPlayed limited to last 50 items
userSchema.pre('save', function(next) {
  if (this.recentlyPlayed && this.recentlyPlayed.length > 50) {
    this.recentlyPlayed = this.recentlyPlayed.slice(-50);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
