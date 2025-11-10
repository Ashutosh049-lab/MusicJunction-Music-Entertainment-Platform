
const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, maxlength: 500 },
  
  // Owner
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // Type & Category
  type: { 
    type: String, 
    enum: ['user', 'algorithmic', 'editorial', 'collaborative'], 
    default: 'user' 
  },
  category: { 
    type: String, 
    enum: ['favorites', 'custom', 'mood', 'genre', 'workout', 'focus', 'party', 'sleep', 'other'],
    default: 'custom'
  },
  
  // Tracks
  tracks: [
    {
      music: { type: mongoose.Schema.Types.ObjectId, ref: "Music", required: true },
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      addedAt: { type: Date, default: Date.now },
      position: { type: Number, required: true }, // Order in playlist
      note: { type: String, maxlength: 200 } // User's note about this track
    }
  ],
  
  // Visual
  coverImage: { type: String }, // Custom or auto-generated from tracks
  coverImageType: { type: String, enum: ['custom', 'auto'], default: 'auto' },
  
  // Metadata
  genre: { type: String, trim: true },
  mood: { type: String, trim: true }, // e.g., 'energetic', 'chill', 'sad'
  tags: [{ type: String, trim: true, lowercase: true }],
  
  // Collaborative Features
  isCollaborative: { type: Boolean, default: false },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  allowDuplicates: { type: Boolean, default: false },
  
  // Privacy & Access
  visibility: { 
    type: String, 
    enum: ['public', 'private', 'unlisted', 'followers-only'], 
    default: 'private' 
  },
  
  // Stats
  totalDuration: { type: Number, default: 0 }, // Total duration in seconds
  tracksCount: { type: Number, default: 0 },
  followersCount: { type: Number, default: 0 },
  playsCount: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0 },
  sharesCount: { type: Number, default: 0 },
  
  // Engagement
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  
  // Settings
  settings: {
    autoUpdate: { type: Boolean, default: false }, // For algorithmic playlists
    shuffleEnabled: { type: Boolean, default: false },
    repeatMode: { type: String, enum: ['off', 'playlist', 'track'], default: 'off' },
    downloadable: { type: Boolean, default: false }
  },
  
  // Algorithmic Playlist Configuration
  algorithmConfig: {
    seedTracks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Music" }],
    seedArtists: [{ type: String }],
    seedGenres: [{ type: String }],
    targetEnergy: { type: Number, min: 0, max: 1 },
    targetDanceability: { type: Number, min: 0, max: 1 },
    targetTempo: { type: Number },
    lastUpdated: { type: Date }
  },
  
  // Curation
  isCurated: { type: Boolean, default: false },
  curatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isFeatured: { type: Boolean, default: false },
  featuredOrder: { type: Number }, // For homepage ordering
  
  // Status
  isActive: { type: Boolean, default: true },
  isArchived: { type: Boolean, default: false },
  archivedAt: { type: Date },
  
  // Last played tracking
  lastPlayedAt: { type: Date },
  lastPlayedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
playlistSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.totalDuration / 3600);
  const minutes = Math.floor((this.totalDuration % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Indexes for Performance
playlistSchema.index({ owner: 1, createdAt: -1 }); // User's playlists
playlistSchema.index({ visibility: 1, isFeatured: -1, followersCount: -1 }); // Public featured playlists
playlistSchema.index({ type: 1, category: 1 }); // Browse by type/category
playlistSchema.index({ name: 'text', description: 'text', tags: 'text' }); // Search
playlistSchema.index({ genre: 1, mood: 1 }); // Filter by genre/mood
playlistSchema.index({ 'tracks.music': 1 }); // Find playlists containing a track
playlistSchema.index({ collaborators: 1 }); // Collaborative playlists
playlistSchema.index({ followers: 1 }); // User's followed playlists
playlistSchema.index({ playsCount: -1 }); // Most played playlists
playlistSchema.index({ followersCount: -1 }); // Most popular playlists
playlistSchema.index({ lastPlayedAt: -1 }); // Recently played
playlistSchema.index({ isActive: 1, isArchived: 1 });

// Methods

// Add track to playlist
playlistSchema.methods.addTrack = async function(musicId, userId, note = '') {
  // Check for duplicates if not allowed
  if (!this.allowDuplicates) {
    const exists = this.tracks.some(t => t.music.toString() === musicId.toString());
    if (exists) {
      throw new Error('Track already exists in playlist');
    }
  }
  
  // Calculate position
  const position = this.tracks.length > 0 
    ? Math.max(...this.tracks.map(t => t.position)) + 1 
    : 1;
  
  this.tracks.push({
    music: musicId,
    addedBy: userId,
    position,
    note,
    addedAt: Date.now()
  });
  
  await this.updateStats();
  return this.save();
};

// Remove track from playlist
playlistSchema.methods.removeTrack = async function(musicId) {
  this.tracks = this.tracks.filter(t => t.music.toString() !== musicId.toString());
  
  // Reorder positions
  this.tracks.forEach((track, index) => {
    track.position = index + 1;
  });
  
  await this.updateStats();
  return this.save();
};

// Reorder tracks
playlistSchema.methods.reorderTracks = async function(trackId, newPosition) {
  const trackIndex = this.tracks.findIndex(t => t.music.toString() === trackId.toString());
  if (trackIndex === -1) {
    throw new Error('Track not found in playlist');
  }
  
  const [track] = this.tracks.splice(trackIndex, 1);
  this.tracks.splice(newPosition - 1, 0, track);
  
  // Update positions
  this.tracks.forEach((t, index) => {
    t.position = index + 1;
  });
  
  return this.save();
};

// Update playlist stats
playlistSchema.methods.updateStats = async function() {
  this.tracksCount = this.tracks.length;
  this.followersCount = this.followers ? this.followers.length : 0;
  this.likesCount = this.likes ? this.likes.length : 0;
  
  // Calculate total duration (would need to populate tracks)
  // This is a placeholder - in practice, you'd populate and sum
  if (this.tracks.length > 0) {
    const Music = mongoose.model('Music');
    const tracks = await Music.find({ 
      _id: { $in: this.tracks.map(t => t.music) } 
    }).select('duration');
    
    this.totalDuration = tracks.reduce((sum, track) => sum + (track.duration || 0), 0);
  } else {
    this.totalDuration = 0;
  }
};

// Toggle follow
playlistSchema.methods.toggleFollow = async function(userId) {
  const index = this.followers.findIndex(f => f.toString() === userId.toString());
  
  if (index > -1) {
    // Unfollow
    this.followers.splice(index, 1);
    this.followersCount = Math.max(0, this.followersCount - 1);
  } else {
    // Follow
    this.followers.push(userId);
    this.followersCount += 1;
  }
  
  return this.save();
};

// Toggle like
playlistSchema.methods.toggleLike = async function(userId) {
  const index = this.likes.findIndex(l => l.toString() === userId.toString());
  
  if (index > -1) {
    // Unlike
    this.likes.splice(index, 1);
    this.likesCount = Math.max(0, this.likesCount - 1);
  } else {
    // Like
    this.likes.push(userId);
    this.likesCount += 1;
  }
  
  return this.save();
};

// Pre-save hook
playlistSchema.pre('save', async function(next) {
  // Auto-update counts if tracks changed
  if (this.isModified('tracks')) {
    this.tracksCount = this.tracks.length;
  }
  
  if (this.isModified('followers')) {
    this.followersCount = this.followers.length;
  }
  
  if (this.isModified('likes')) {
    this.likesCount = this.likes.length;
  }
  
  next();
});

module.exports = mongoose.model("Playlist", playlistSchema);
