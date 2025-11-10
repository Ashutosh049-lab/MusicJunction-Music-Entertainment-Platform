# MongoDB Integration & Optimization Guide

## 📊 Schema Overview

MusicJunction uses optimized MongoDB schemas for scalability and performance:

### Core Models

1. **User** - Comprehensive user profiles with social features
2. **Music** - Advanced music metadata with multi-source support
3. **Comment** - Nested comments with moderation
4. **Project** - Collaboration projects with versioning
5. **Playlist** - Music collection management

---

## 🚀 Performance Optimizations

### Indexing Strategy

All models include compound indexes optimized for common query patterns:

#### User Model Indexes
```javascript
- { email: 1 } - Unique login
- { username: 1 } - Profile lookups
- { role: 1 } - Role-based queries
- { 'musicianProfile.genres': 1 } - Genre filtering
- { followersCount: -1 } - Leaderboards
- { 'stats.totalPlays': -1 } - Analytics
```

#### Music Model Indexes
```javascript
- { source: 1, externalId: 1 } - External source deduplication
- { uploadedBy: 1, createdAt: -1 } - User's uploads
- { genre: 1, playCount: -1 } - Genre popularity
- { trendingScore: -1 } - Trending tracks
- { tags: 1 } - Tag-based discovery
- Full-text search on title, artist, album
```

#### Comment Model Indexes
```javascript
- { targetType: 1, targetId: 1, createdAt: -1 } - Target comments
- { parentComment: 1 } - Nested replies
- { mentions: 1 } - User mentions
- { moderationStatus: 1, isFlagged: 1 } - Moderation queue
```

#### Project Model Indexes
```javascript
- { owner: 1, createdAt: -1 } - User's projects
- { 'collaborators.user': 1 } - Collaboration access
- { lastActivityAt: -1 } - Recent activity
- Full-text search on title, description, tags
```

#### Playlist Model Indexes
```javascript
- { owner: 1, createdAt: -1 } - User's playlists
- { visibility: 1, followersCount: -1 } - Popular public playlists
- { 'tracks.music': 1 } - Track membership queries
- { lastPlayedAt: -1 } - Recently played
```

---

## 📈 Scalability Features

### 1. Aggregated Counters
Instead of counting array lengths at query time, we store pre-calculated counts:

```javascript
// ❌ Slow - calculates on every query
const followersCount = user.followers.length;

// ✅ Fast - stored as field
const followersCount = user.followersCount;
```

**Implementation:**
- `likesCount`, `commentsCount`, `followersCount` stored as fields
- Updated via middleware and model methods
- Prevents expensive `$size` operations

### 2. Sparse Indexes
For optional fields with unique constraints:

```javascript
musicSchema.index({ source: 1, externalId: 1 }, { unique: true, sparse: true });
```

### 3. Partial Arrays
Limit array sizes to prevent document bloat:

```javascript
// User: recentlyPlayed limited to 50 items
// Comment: activities limited to 100 items
```

### 4. Virtual Fields
Computed fields that don't bloat database:

```javascript
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});
```

### 5. Select Optimization
Password excluded by default:

```javascript
password: { type: String, required: true, select: false }
```

---

## 🔍 Query Optimization Tips

### Use Projection
Only fetch needed fields:

```javascript
// ❌ Fetches entire document
const user = await User.findById(userId);

// ✅ Only fetch needed fields
const user = await User.findById(userId).select('name email avatarUrl');
```

### Leverage Indexes
Structure queries to use indexes:

```javascript
// ✅ Uses compound index
Music.find({ 
  visibility: 'public', 
  uploadStatus: 'active' 
}).sort({ popularity: -1 });

// ✅ Uses text index
Music.find({ $text: { $search: 'jazz fusion' } });
```

### Pagination
Use skip/limit with indexes:

```javascript
// ✅ Efficient pagination
const tracks = await Music.find({ genre: 'rock' })
  .sort({ playCount: -1 })
  .skip(page * limit)
  .limit(limit);
```

### Aggregation Pipeline
For complex queries:

```javascript
// Get top artists by total plays
const topArtists = await Music.aggregate([
  { $match: { visibility: 'public' } },
  { $group: { 
    _id: '$artistId', 
    totalPlays: { $sum: '$playCount' } 
  }},
  { $sort: { totalPlays: -1 } },
  { $limit: 10 }
]);
```

---

## 🛡️ Security Best Practices

### 1. Input Validation
Always validate before database operations:

```javascript
const sanitizedInput = validator.trim(userInput);
```

### 2. Rate Limiting
Prevent abuse with counters:

```javascript
// Login attempt tracking built into User model
user.incLoginAttempts();
```

### 3. Soft Deletes
Preserve data integrity:

```javascript
comment.softDelete(); // Sets isDeleted flag
```

---

## 📊 Monitoring & Maintenance

### Index Usage Analysis
```bash
# In MongoDB shell
db.users.getIndexes()
db.users.aggregate([{ $indexStats: {} }])
```

### Performance Profiling
```bash
# Enable profiling (development only)
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(5)
```

### Regular Maintenance Tasks

1. **Update Trending Scores** (daily)
```javascript
// Run via cron job
const tracks = await Music.find({ uploadStatus: 'active' });
await Promise.all(tracks.map(t => t.updateTrendingScore()));
```

2. **Clean Old Activities** (weekly)
```javascript
// Projects keep last 100 activities automatically
```

3. **Rebuild Indexes** (as needed)
```bash
db.music.reIndex()
```

---

## 🔄 Migration Strategy

### Adding New Indexes
```javascript
// In migration script
await User.collection.createIndex({ 'stats.totalPlays': -1 });
```

### Schema Changes
```javascript
// Use migrations for breaking changes
await User.updateMany(
  { username: { $exists: false } },
  { $set: { username: '$email' } } // Temporary, update properly
);
```

---

## 📝 Example Queries

### Get Trending Music
```javascript
const trending = await Music.find({
  visibility: 'public',
  uploadStatus: 'active',
  trendingScore: { $gt: 0 }
})
.sort({ trendingScore: -1 })
.limit(20)
.populate('uploadedBy', 'name username avatarUrl');
```

### Find Musicians for Collaboration
```javascript
const musicians = await User.find({
  role: 'musician',
  'musicianProfile.lookingForCollaboration': true,
  'musicianProfile.genres': { $in: ['rock', 'indie'] }
})
.select('name username musicianProfile bio')
.sort({ followersCount: -1 })
.limit(10);
```

### Get User's Activity Feed
```javascript
const following = await User.findById(userId).select('following');
const feed = await Music.find({
  uploadedBy: { $in: following },
  visibility: { $in: ['public', 'followers-only'] }
})
.sort({ createdAt: -1 })
.limit(50)
.populate('uploadedBy', 'name username avatarUrl');
```

### Comments with Nested Replies
```javascript
const comments = await Comment.find({
  targetType: 'Music',
  targetId: musicId,
  parentComment: null // Top-level only
})
.populate('author', 'name username avatarUrl')
.populate({
  path: 'replies',
  populate: { path: 'author', select: 'name username' }
})
.sort({ isPinned: -1, likesCount: -1 });
```

---

## 🎯 Best Practices Summary

✅ **DO:**
- Use indexes for all query patterns
- Store aggregated counts
- Limit array sizes
- Use projections to reduce data transfer
- Implement soft deletes
- Use virtuals for computed fields
- Leverage compound indexes

❌ **DON'T:**
- Store large arrays without limits
- Use `$where` or JavaScript in queries
- Fetch entire documents when not needed
- Forget to index foreign keys
- Store sensitive data without encryption
- Ignore index hit rates

---

## 🔧 Connection Configuration

Update your `config/db.js` for production:

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      // Connection pool
      maxPoolSize: 10,
      minPoolSize: 2,
      
      // Timeouts
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      
      // Other options
      retryWrites: true,
      w: 'majority'
    });
    
    console.log(`✅ MongoDB Connected Successfully`);
    
    // Enable query logging in development
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', true);
    }
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

## 📚 Additional Resources

- [MongoDB Indexing Strategies](https://docs.mongodb.com/manual/indexes/)
- [Mongoose Performance](https://mongoosejs.com/docs/guide.html#performance)
- [Schema Design Best Practices](https://docs.mongodb.com/manual/core/data-model-design/)
