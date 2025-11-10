
const mongoose = require("mongoose");

const musicSchema = new mongoose.Schema({
  // Basic Information
  title: { type: String, required: true, trim: true, maxlength: 200 },
  artist: { type: String, required: true, trim: true, maxlength: 200 },
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Link to artist user if they're on platform
  featuredArtists: [{ type: String, trim: true }],
  genre: { type: String, required: true, trim: true },
  subGenres: [{ type: String, trim: true }],
  tags: [{ type: String, trim: true, lowercase: true }], // mood, style tags
  album: { type: String, trim: true },
  albumId: { type: String }, // Reference if album is a separate entity
  trackNumber: { type: Number, min: 1 },
  duration: { type: Number, required: true }, // duration in seconds
  
  // Source Information
  source: { 
    type: String, 
    enum: ['local', 'spotify', 'soundcloud', 'youtube', 'bandcamp'], 
    default: 'local',
    required: true 
  },
  
  // For Local Uploads
  fileUrl: { type: String }, // local file path or cloud storage URL
  fileSize: { type: Number }, // file size in bytes
  mimeType: { type: String }, // audio/mpeg, audio/wav, audio/flac, etc
  bitrate: { type: Number }, // in kbps
  sampleRate: { type: Number }, // in Hz (e.g., 44100)
  audioFormat: { type: String, enum: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'other'] },
  
  // For External Sources
  externalId: { type: String, sparse: true }, // Spotify track ID, SoundCloud ID, etc.
  externalUrl: { type: String }, // External streaming URL
  previewUrl: { type: String }, // 30-second preview URL
  embedUrl: { type: String }, // Embed player URL
  
  // Visual Metadata
  coverImage: { type: String }, // album art URL
  coverImageThumbnail: { type: String }, // smaller version for lists
  bannerImage: { type: String }, // wider banner for detail pages
  
  // Additional Metadata
  releaseDate: { type: Date },
  recordLabel: { type: String, trim: true },
  producer: { type: String, trim: true },
  composer: { type: String, trim: true },
  lyricist: { type: String, trim: true },
  language: { type: String, trim: true },
  country: { type: String, trim: true },
  isrc: { type: String, trim: true, uppercase: true }, // International Standard Recording Code
  upc: { type: String, trim: true }, // Universal Product Code
  
  // Content Details
  hasLyrics: { type: Boolean, default: false },
  lyrics: { type: String },
  description: { type: String, maxlength: 1000 },
  explicit: { type: Boolean, default: false },
  
  // Engagement Metrics (aggregated for performance)
  playCount: { type: Number, default: 0, min: 0 },
  uniqueListeners: { type: Number, default: 0, min: 0 },
  likesCount: { type: Number, default: 0, min: 0 },
  commentsCount: { type: Number, default: 0, min: 0 },
  sharesCount: { type: Number, default: 0, min: 0 },
  downloadsCount: { type: Number, default: 0, min: 0 },
  
  // Rating Metrics
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  ratingsCount: { type: Number, default: 0, min: 0 },
  ratingsDistribution: {
    1: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    5: { type: Number, default: 0 }
  },
  
  // For detailed analytics (store user references separately for reports)
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  
  // Popularity & Rankings
  popularity: { type: Number, default: 0, min: 0, max: 100 }, // 0-100 calculated score
  trendingScore: { type: Number, default: 0 }, // Time-decayed engagement score
  lastTrendingUpdate: { type: Date, default: Date.now },
  
  // Visibility & Access Control
  visibility: { 
    type: String, 
    enum: ['public', 'private', 'unlisted', 'followers-only'], 
    default: 'public' 
  },
  isDownloadable: { type: Boolean, default: false },
  isFree: { type: Boolean, default: true },
  price: { type: Number, min: 0 }, // if not free
  
  // Copyright & Rights
  copyright: { type: String },
  license: { 
    type: String, 
    enum: ['all-rights-reserved', 'creative-commons', 'public-domain', 'other'],
    default: 'all-rights-reserved'
  },
  
  // Upload & Status
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  uploadStatus: { 
    type: String, 
    enum: ['processing', 'active', 'failed', 'archived'], 
    default: 'active' 
  },
  processingProgress: { type: Number, min: 0, max: 100 }, // for upload processing
  
  // Moderation
  isFlagged: { type: Boolean, default: false },
  flagReason: { type: String },
  moderationStatus: { 
    type: String, 
    enum: ['approved', 'pending', 'rejected'], 
    default: 'approved' 
  },
  
  // Audio Analysis (can be populated later)
  audioFeatures: {
    tempo: { type: Number }, // BPM
    key: { type: String }, // Musical key (C, D, E, etc.)
    mode: { type: String, enum: ['major', 'minor'] },
    energy: { type: Number, min: 0, max: 1 },
    danceability: { type: Number, min: 0, max: 1 },
    valence: { type: Number, min: 0, max: 1 }, // positivity
    acousticness: { type: Number, min: 0, max: 1 },
    instrumentalness: { type: Number, min: 0, max: 1 },
    loudness: { type: Number }, // in dB
  },
  
  // Related Content
  relatedTracks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Music" }],
  remixOf: { type: mongoose.Schema.Types.ObjectId, ref: "Music" },
  coverOf: { type: mongoose.Schema.Types.ObjectId, ref: "Music" },
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted duration
musicSchema.virtual('formattedDuration').get(function() {
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Compound Indexes for Optimized Queries
// Unique constraint for external sources
musicSchema.index({ source: 1, externalId: 1 }, { unique: true, sparse: true });

// Full-text search
musicSchema.index({ 
  title: 'text', 
  artist: 'text', 
  album: 'text',
  tags: 'text',
  description: 'text'
}, {
  weights: {
    title: 10,
    artist: 8,
    album: 5,
    tags: 3,
    description: 1
  }
});

// Query optimization indexes
musicSchema.index({ uploadedBy: 1, createdAt: -1 }); // User's uploads
musicSchema.index({ genre: 1, playCount: -1 }); // Genre popularity
musicSchema.index({ visibility: 1, uploadStatus: 1 }); // Public active tracks
musicSchema.index({ popularity: -1, createdAt: -1 }); // Popular recent tracks
musicSchema.index({ trendingScore: -1, lastTrendingUpdate: -1 }); // Trending tracks
musicSchema.index({ artistId: 1, releaseDate: -1 }); // Artist discography
musicSchema.index({ tags: 1 }); // Tag-based discovery
musicSchema.index({ 'audioFeatures.tempo': 1 }); // BPM search
musicSchema.index({ 'audioFeatures.key': 1 }); // Key search
musicSchema.index({ releaseDate: -1 }); // Latest releases

// Middleware to update trending score periodically
musicSchema.methods.updateTrendingScore = function() {
  const now = Date.now();
  const ageInDays = (now - this.createdAt) / (1000 * 60 * 60 * 24);
  const decayFactor = Math.exp(-ageInDays / 7); // Decay over 7 days
  
  // Weighted score: plays (40%), likes (30%), comments (20%), shares (10%)
  const engagementScore = 
    (this.playCount * 0.4) + 
    (this.likesCount * 0.3) + 
    (this.commentsCount * 0.2) + 
    (this.sharesCount * 0.1);
  
  this.trendingScore = engagementScore * decayFactor;
  this.lastTrendingUpdate = now;
  
  return this.save();
};

// Pre-save hook to ensure counters don't go negative
musicSchema.pre('save', function(next) {
  if (this.playCount < 0) this.playCount = 0;
  if (this.likesCount < 0) this.likesCount = 0;
  if (this.commentsCount < 0) this.commentsCount = 0;
  if (this.sharesCount < 0) this.sharesCount = 0;
  next();
});

module.exports = mongoose.model("Music", musicSchema);
