# MusicJunction - New Features Documentation

## Overview
This document describes the newly implemented features for music rating, commenting, and playlist management.

---

## 🌟 Music Rating & Commenting

### Rating System

#### Features
- **5-Star Rating System**: Users can rate music tracks, playlists, and projects (1-5 stars)
- **Average Rating Display**: Automatic calculation and display of average ratings
- **Rating Distribution**: Shows breakdown of ratings (how many 1-star, 2-star, etc.)
- **Optional Reviews**: Users can include text reviews with their ratings
- **Helpful Votes**: Other users can mark ratings as helpful
- **Top-Rated Content**: Discover the highest-rated music on the platform

#### API Endpoints

##### Rate an Item
```
POST /api/ratings/:targetType/:targetId
Authorization: Bearer <token>

Body:
{
  "rating": 5,           // Required: 1-5
  "review": "Amazing!"   // Optional
}

targetType: "Music", "Playlist", or "Project"
```

##### Get All Ratings
```
GET /api/ratings/:targetType/:targetId?page=1&limit=20&sortBy=createdAt&order=desc

Response includes:
- ratings (array)
- pagination info
- statistics (average, count, distribution)
```

##### Get User's Rating
```
GET /api/ratings/:targetType/:targetId/user
Authorization: Bearer <token>
```

##### Delete Rating
```
DELETE /api/ratings/:targetType/:targetId
Authorization: Bearer <token>
```

##### Mark Rating as Helpful
```
POST /api/ratings/:ratingId/helpful
Authorization: Bearer <token>
```

##### Get Top-Rated Items
```
GET /api/ratings/top-rated?targetType=Music&limit=20&minRatings=5
```

---

### Commenting System

#### Features
- **Nested Comments**: Support for replies up to 5 levels deep
- **Comment Threads**: Organize discussions with parent-child relationships
- **Timestamped Comments**: Comment on specific points in music tracks
- **Like Comments**: Engage with other users' comments
- **Edit & Delete**: Users can manage their own comments
- **Pin Comments**: Content owners can pin important comments
- **Flag for Moderation**: Community-driven content moderation
- **Mentions & Hashtags**: Tag users and topics

#### API Endpoints

##### Create Comment
```
POST /api/comments/:targetType/:targetId
Authorization: Bearer <token>

Body:
{
  "content": "Great track!",     // Required
  "parentComment": "commentId",  // Optional: for replies
  "timestamp": 45,               // Optional: for time-based comments
  "mentions": ["userId"],        // Optional
  "hashtags": ["awesome"]        // Optional
}

targetType: "Music", "Playlist", "Project", or "User"
```

##### Get All Comments
```
GET /api/comments/:targetType/:targetId?page=1&limit=20&sortBy=createdAt&order=desc&parentOnly=false
```

##### Get Comment Replies
```
GET /api/comments/:commentId/replies?page=1&limit=10
```

##### Update Comment
```
PUT /api/comments/:commentId
Authorization: Bearer <token>

Body:
{
  "content": "Updated comment text"
}
```

##### Delete Comment
```
DELETE /api/comments/:commentId
Authorization: Bearer <token>
```

##### Like/Unlike Comment
```
POST /api/comments/:commentId/like
Authorization: Bearer <token>
```

##### Flag Comment
```
POST /api/comments/:commentId/flag
Authorization: Bearer <token>

Body:
{
  "reason": "Inappropriate content"
}
```

##### Pin/Unpin Comment
```
POST /api/comments/:commentId/pin
Authorization: Bearer <token>
(Only content owner can pin comments)
```

---

## 🎧 Playlist Management

### Features

#### Personal Playlists
- **Create & Manage**: Full CRUD operations for playlists
- **Track Management**: Add, remove, and reorder tracks
- **Custom Covers**: Upload custom playlist artwork
- **Privacy Controls**: Public, private, unlisted, or followers-only
- **Organization**: Categories, genres, moods, and tags
- **Statistics**: Track count, total duration, play counts

#### Collaborative Playlists
- **Multi-User Editing**: Add collaborators to any playlist
- **Shared Control**: Collaborators can add/remove tracks
- **Activity Tracking**: See who added each track and when
- **Flexible Permissions**: Owner retains full control

#### Social Features
- **Follow Playlists**: Keep track of your favorite playlists
- **Like System**: Show appreciation for great playlists
- **Sharing**: Share playlists with the community
- **Discovery**: Browse featured and popular playlists

### API Endpoints

#### Playlist CRUD

##### Create Playlist
```
POST /api/playlists
Authorization: Bearer <token>

Body:
{
  "name": "My Awesome Playlist",      // Required
  "description": "Best tracks ever",  // Optional
  "type": "user",                     // user, algorithmic, editorial, collaborative
  "category": "custom",               // favorites, custom, mood, genre, etc.
  "coverImage": "url",                // Optional
  "genre": "Rock",                    // Optional
  "mood": "Energetic",                // Optional
  "tags": ["workout", "morning"],     // Optional
  "isCollaborative": false,           // Optional
  "visibility": "public"              // public, private, unlisted, followers-only
}
```

##### Get All Playlists
```
GET /api/playlists?page=1&limit=20&sortBy=createdAt&order=desc&category=mood&genre=Rock&featured=true
```

##### Get Specific Playlist
```
GET /api/playlists/:playlistId
(Authentication optional - depends on visibility)
```

##### Get User's Playlists
```
GET /api/playlists/user/:userId
(Shows public playlists, or all if requesting own)
```

##### Update Playlist
```
PUT /api/playlists/:playlistId
Authorization: Bearer <token>

Body:
{
  "name": "Updated Name",
  "description": "New description",
  "coverImage": "new_url",
  "visibility": "private",
  "isCollaborative": true,
  // ... other fields
}
```

##### Delete Playlist
```
DELETE /api/playlists/:playlistId
Authorization: Bearer <token>
```

#### Track Management

##### Add Track
```
POST /api/playlists/:playlistId/tracks
Authorization: Bearer <token>

Body:
{
  "musicId": "trackId",       // Required
  "note": "Love this song!"   // Optional
}
```

##### Remove Track
```
DELETE /api/playlists/:playlistId/tracks/:musicId
Authorization: Bearer <token>
```

##### Reorder Tracks
```
PUT /api/playlists/:playlistId/tracks/reorder
Authorization: Bearer <token>

Body:
{
  "musicId": "trackId",
  "newPosition": 3
}
```

#### Collaboration

##### Add Collaborator
```
POST /api/playlists/:playlistId/collaborators
Authorization: Bearer <token>

Body:
{
  "collaboratorId": "userId"
}
```

##### Remove Collaborator
```
DELETE /api/playlists/:playlistId/collaborators/:collaboratorId
Authorization: Bearer <token>
```

#### Engagement

##### Follow/Unfollow Playlist
```
POST /api/playlists/:playlistId/follow
Authorization: Bearer <token>
```

##### Like/Unlike Playlist
```
POST /api/playlists/:playlistId/like
Authorization: Bearer <token>
```

---

## Database Models

### Rating Model
- User reference
- Target (Music, Playlist, Project)
- Rating value (1-5)
- Optional review text
- Helpful votes
- Moderation status

### Comment Model
- Content
- Author reference
- Target (Music, Playlist, Project, User)
- Parent comment (for threading)
- Nested depth tracking
- Likes and replies count
- Timestamps, mentions, hashtags
- Moderation flags

### Updated Music Model
New fields added:
- `averageRating`: Number (0-5)
- `ratingsCount`: Number
- `ratingsDistribution`: Object {1, 2, 3, 4, 5}

### Playlist Model (Already Existed)
Enhanced with all collaborative and social features.

---

## Key Features Summary

### ⭐ Rating System
✅ 5-star ratings for Music, Playlists, Projects
✅ Automatic average calculation
✅ Rating distribution charts
✅ Review text with ratings
✅ Helpful votes on reviews
✅ Top-rated content discovery

### 💬 Comment System
✅ Multi-level threaded comments
✅ Time-based comments on tracks
✅ Like/unlike comments
✅ Edit and delete own comments
✅ Pin important comments
✅ Flag for moderation
✅ @mentions and #hashtags

### 🎵 Playlist Features
✅ Create personal playlists
✅ Collaborative playlists with multiple editors
✅ Add/remove/reorder tracks
✅ Custom playlist covers
✅ Privacy controls
✅ Follow and like playlists
✅ Share playlists
✅ Browse featured playlists
✅ Category and mood organization

---

## Usage Examples

### Rate a Music Track
```javascript
// Rate a track 5 stars with a review
POST /api/ratings/Music/60d5ec49f1b2c8b5e8c8e8e8
Authorization: Bearer <your_token>

{
  "rating": 5,
  "review": "This track is absolutely amazing! Great production quality."
}
```

### Add Comment to Track
```javascript
// Comment at 1:30 in the track
POST /api/comments/Music/60d5ec49f1b2c8b5e8c8e8e8
Authorization: Bearer <your_token>

{
  "content": "The drop at this point is incredible! 🔥",
  "timestamp": 90,
  "hashtags": ["epic", "drop"]
}
```

### Create Collaborative Playlist
```javascript
// Create a collaborative workout playlist
POST /api/playlists
Authorization: Bearer <your_token>

{
  "name": "Team Workout Mix",
  "description": "High-energy tracks for gym sessions",
  "category": "workout",
  "mood": "energetic",
  "tags": ["gym", "cardio", "motivation"],
  "isCollaborative": true,
  "visibility": "public"
}

// Then add collaborators
POST /api/playlists/:playlistId/collaborators
{
  "collaboratorId": "60d5ec49f1b2c8b5e8c8e8e9"
}
```

---

## Testing the Features

You can test these features using tools like:
- **Postman**: Import the endpoints and test with your JWT token
- **cURL**: Command-line testing
- **Thunder Client** (VS Code extension)
- Your frontend application

Make sure to:
1. Start your MongoDB server
2. Run the backend: `node index.js`
3. Get a JWT token by logging in/registering
4. Use the token in the Authorization header

---

## Notes

- All authenticated endpoints require a valid JWT token in the Authorization header
- Rating and comment statistics are automatically updated using Mongoose middleware
- Playlists support both personal and collaborative workflows
- All features include pagination for optimal performance
- Input validation is implemented on all endpoints
- Users can only edit/delete their own content (except content owners for pinning)

Enjoy building with these new features! 🎵
