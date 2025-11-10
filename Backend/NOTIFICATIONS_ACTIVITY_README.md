# Notification & Activity Feed System

## Overview

This system provides comprehensive notification and activity tracking functionality for the MusicJunction platform, including real-time alerts for collaborations, comments, updates, and a detailed activity feed to track user engagement.

---

## Features

### 🔔 Notifications
- **Real-time notifications** for:
  - New followers
  - Collaboration invitations and responses
  - Comments, replies, and mentions
  - Music likes and plays
  - New music uploads from followed artists
  - Project updates
  - System announcements
  - Account verifications
  - Milestones reached

- **Notification Management**:
  - Mark as read/unread
  - Delete notifications
  - Bulk operations
  - Filter by type
  - Unread count badge
  - Priority levels (low, normal, high, urgent)
  - Expiration support

- **Multi-Channel Delivery**:
  - In-app notifications
  - Email notifications (configurable)
  - Push notifications (configurable)

### 📊 Activity Feed
- **User Activity Feed**: Track a user's activities
- **Following Feed**: See activities from users you follow
- **Public Feed**: Global discover/explore feed
- **Entity Activity**: Activities related to specific content
- **Trending Activities**: Most engaged content
- **Activity Stats**: User engagement analytics

---

## API Endpoints

### Notification Endpoints

#### Get Notifications
```http
GET /api/notifications
Headers: Authorization: Bearer <token>
Query Params:
  - page: number (default: 1)
  - limit: number (default: 20)
  - type: string (optional - filter by notification type)
  - isRead: boolean (optional - filter by read status)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    },
    "unreadCount": 12
  }
}
```

#### Get Unread Count
```http
GET /api/notifications/unread-count
Headers: Authorization: Bearer <token>
```

#### Mark Notifications as Read
```http
POST /api/notifications/mark-read
Headers: Authorization: Bearer <token>
Body: {
  "notificationIds": ["id1", "id2", ...]
}
```

#### Mark Single Notification as Read
```http
PUT /api/notifications/:notificationId/read
Headers: Authorization: Bearer <token>
```

#### Mark All as Read
```http
PUT /api/notifications/mark-all-read
Headers: Authorization: Bearer <token>
```

#### Delete Notification
```http
DELETE /api/notifications/:notificationId
Headers: Authorization: Bearer <token>
```

#### Delete Multiple Notifications
```http
POST /api/notifications/delete-multiple
Headers: Authorization: Bearer <token>
Body: {
  "notificationIds": ["id1", "id2", ...]
}
```

#### Clear Read Notifications
```http
DELETE /api/notifications/clear-read
Headers: Authorization: Bearer <token>
```

#### Get Notification Preferences
```http
GET /api/notifications/preferences
Headers: Authorization: Bearer <token>
```

#### Update Notification Preferences
```http
PUT /api/notifications/preferences
Headers: Authorization: Bearer <token>
Body: {
  "emailNotifications": true,
  "pushNotifications": false
}
```

---

### Activity Feed Endpoints

#### Get Public Feed
```http
GET /api/notifications/activity/public
Query Params:
  - page: number (default: 1)
  - limit: number (default: 50)
  - types: string (comma-separated activity types)
```

#### Get Following Feed
```http
GET /api/notifications/activity/following
Headers: Authorization: Bearer <token>
Query Params:
  - page: number (default: 1)
  - limit: number (default: 30)
```

#### Get Trending Activities
```http
GET /api/notifications/activity/trending
Query Params:
  - page: number (default: 1)
  - limit: number (default: 20)
  - timeframe: string ('24h', '7d', '30d')
```

#### Get User Activity
```http
GET /api/notifications/activity/user/:userId
Headers: Authorization: Bearer <token>
Query Params:
  - page: number (default: 1)
  - limit: number (default: 20)
  - types: string (comma-separated activity types)
```

#### Get User Activity Stats
```http
GET /api/notifications/activity/user/:userId/stats
Headers: Authorization: Bearer <token>
```

#### Get Entity Activities
```http
GET /api/notifications/activity/:entityType/:entityId
Query Params:
  - page: number (default: 1)
  - limit: number (default: 20)
```

#### Delete Activity
```http
DELETE /api/notifications/activity/:activityId
Headers: Authorization: Bearer <token>
```

---

## Notification Types

| Type | Description |
|------|-------------|
| `follow` | Someone followed you |
| `unfollow` | Someone unfollowed you |
| `collaboration_invite` | Invited to collaborate on a project |
| `collaboration_accepted` | Collaboration invite accepted |
| `collaboration_declined` | Collaboration invite declined |
| `project_update` | Project has been updated |
| `project_file_added` | New file added to project |
| `project_comment` | New comment on project |
| `comment` | New comment on your content |
| `comment_reply` | Reply to your comment |
| `comment_mention` | Mentioned in a comment |
| `comment_like` | Someone liked your comment |
| `music_like` | Someone liked your music |
| `music_play_milestone` | Music reached play milestone |
| `playlist_follow` | Someone followed your playlist |
| `new_music_upload` | Artist you follow uploaded new music |
| `music_featured` | Your music was featured |
| `system_announcement` | System-wide announcement |
| `account_verified` | Account verification completed |
| `premium_activated` | Premium subscription activated |
| `premium_expiring` | Premium subscription expiring soon |
| `content_flagged` | Your content was flagged |
| `content_removed` | Your content was removed |
| `account_warning` | Account warning issued |

---

## Activity Types

| Type | Description |
|------|-------------|
| `music_upload` | User uploaded music |
| `music_play` | User played a track |
| `music_like` | User liked a track |
| `music_unlike` | User unliked a track |
| `music_share` | User shared music |
| `music_download` | User downloaded music |
| `user_follow` | User followed someone |
| `user_unfollow` | User unfollowed someone |
| `user_join` | New user joined platform |
| `project_create` | User created a project |
| `project_update` | User updated a project |
| `project_join` | User joined a project |
| `project_leave` | User left a project |
| `project_complete` | Project marked as complete |
| `comment_create` | User created a comment |
| `comment_reply` | User replied to a comment |
| `comment_like` | User liked a comment |
| `playlist_create` | User created a playlist |
| `playlist_update` | User updated a playlist |
| `playlist_follow` | User followed a playlist |
| `rating_create` | User rated content |
| `rating_update` | User updated a rating |
| `milestone_reached` | User reached a milestone |
| `badge_earned` | User earned a badge |
| `level_up` | User leveled up |

---

## Using the Notification Service

The `NotificationService` provides centralized methods for creating notifications throughout your application.

### Example: Notify on Follow

```javascript
const NotificationService = require('./services/notificationService');

// In your follow controller
async function followUser(req, res) {
  const follower = req.user;
  const targetUser = await User.findById(req.params.userId);
  
  // ... add follower logic ...
  
  // Create notification
  await NotificationService.notifyFollow(follower, targetUser);
  
  res.json({ success: true });
}
```

### Example: Notify on Comment

```javascript
const NotificationService = require('./services/notificationService');

// In your comment controller
async function createComment(req, res) {
  const commenter = req.user;
  const music = await Music.findById(req.body.musicId);
  const musicOwner = await User.findById(music.uploadedBy);
  
  const comment = await Comment.create({
    content: req.body.content,
    author: commenter._id,
    targetType: 'Music',
    targetId: music._id
  });
  
  // Notify music owner
  await NotificationService.notifyComment(
    commenter, 
    musicOwner, 
    comment, 
    'Music', 
    music
  );
  
  res.json({ success: true, data: comment });
}
```

### Example: Notify on Music Upload

```javascript
const NotificationService = require('./services/notificationService');

// In your music controller
async function uploadMusic(req, res) {
  const uploader = req.user;
  
  const music = await Music.create({
    title: req.body.title,
    uploadedBy: uploader._id,
    // ... other fields
  });
  
  // Notify all followers
  await NotificationService.notifyNewMusicUpload(uploader, music);
  
  res.json({ success: true, data: music });
}
```

---

## Integration with Existing Controllers

To integrate notifications into your existing code, add calls to `NotificationService` methods:

### In userController.js (Follow/Unfollow)
```javascript
const NotificationService = require('../services/notificationService');

// After successful follow
await NotificationService.notifyFollow(req.user, targetUser);
```

### In commentController.js (Comments & Replies)
```javascript
const NotificationService = require('../services/notificationService');

// After creating comment
await NotificationService.notifyComment(commenter, contentOwner, comment, entityType, entity);

// After creating reply
await NotificationService.notifyCommentReply(replier, originalCommenter, reply, parentComment);
```

### In projectController.js (Collaborations)
```javascript
const NotificationService = require('../services/notificationService');

// After inviting collaborator
await NotificationService.notifyCollaborationInvite(inviter, invitee, project);

// After accepting invitation
await NotificationService.notifyCollaborationAccepted(accepter, projectOwner, project);

// After project update
await NotificationService.notifyProjectUpdate(updater, project);
```

### In musicController.js (Likes & Uploads)
```javascript
const NotificationService = require('../services/notificationService');

// After liking music
await NotificationService.notifyMusicLike(liker, musicOwner, music);

// After uploading music
await NotificationService.notifyNewMusicUpload(uploader, music);

// When reaching play milestone
await NotificationService.notifyPlayMilestone(musicOwner, music, milestone);
```

---

## Database Models

### Notification Schema
- `recipient`: User receiving notification
- `sender`: User who triggered notification
- `type`: Notification type (enum)
- `title`: Notification title
- `message`: Notification message
- `entityType`: Related entity type
- `entityId`: Related entity ID
- `actionUrl`: URL to navigate to
- `isRead`: Read status
- `priority`: Priority level
- `deliveryChannels`: Delivery preferences
- `expiresAt`: Expiration date
- `isDeleted`: Soft delete flag

### Activity Schema
- `user`: User who performed action
- `type`: Activity type (enum)
- `action`: Description of action
- `entityType`: Related entity type
- `entityId`: Related entity ID
- `targetUser`: Target user (for social activities)
- `visibility`: public, followers, private
- `likesCount`: Engagement metric
- `commentsCount`: Engagement metric
- `groupId`: For grouping similar activities

---

## Indexes

Both models are optimized with compound indexes for common query patterns:

**Notification Indexes:**
- `{ recipient, isRead, createdAt }`
- `{ recipient, type, createdAt }`
- `{ sender, createdAt }`
- `{ entityType, entityId }`

**Activity Indexes:**
- `{ user, createdAt }`
- `{ type, createdAt }`
- `{ entityType, entityId, createdAt }`
- `{ visibility, createdAt }`
- `{ targetUser, createdAt }`

---

## Future Enhancements

- [ ] WebSocket integration for real-time push notifications
- [ ] Email notification templates
- [ ] Push notification service integration (Firebase, OneSignal)
- [ ] Notification grouping/batching
- [ ] Activity feed caching with Redis
- [ ] Scheduled cleanup cron jobs
- [ ] Notification preferences per type
- [ ] Smart notification throttling

---

## Testing

Example test cases to implement:

```javascript
// Test notification creation
test('should create notification on follow', async () => {
  await NotificationService.notifyFollow(follower, targetUser);
  const notification = await Notification.findOne({ 
    recipient: targetUser._id,
    type: 'follow'
  });
  expect(notification).toBeDefined();
});

// Test unread count
test('should return correct unread count', async () => {
  const count = await Notification.getUnreadCount(userId);
  expect(count).toBe(5);
});

// Test activity feed
test('should return user activity feed', async () => {
  const activities = await Activity.getUserFeed(userId);
  expect(activities.length).toBeGreaterThan(0);
});
```

---

## License

Part of the MusicJunction platform. All rights reserved.
