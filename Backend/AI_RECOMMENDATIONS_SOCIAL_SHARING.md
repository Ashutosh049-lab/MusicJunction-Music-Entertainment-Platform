# AI Music Recommendations & Social Sharing Integration

## Overview

This document describes the implementation of two optional enhancements for the MusicJunction platform:

1. **AI Music Recommendations**: Personalized track recommendations based on user behavior and preferences
2. **Social Sharing Integration**: Share music projects directly to social platforms (Instagram, Twitter, Facebook, WhatsApp, Telegram)

---

## 🎵 AI Music Recommendations

### Features

- **Personalized Recommendations**: AI-powered suggestions based on listening history, likes, and playlists
- **Content-Based Filtering**: Recommendations similar to tracks the user has liked
- **Collaborative Filtering**: Recommendations based on users with similar tastes
- **Genre-Based Recommendations**: Discover music by specific genres
- **Mood-Based Recommendations**: Find music matching your current mood
- **Interaction Tracking**: Track user behavior to improve recommendations over time

### Architecture

#### Models

**Recommendation Model** (`models/Recommendation.js`)
- Tracks user interactions (plays, likes, skips, saves, shares)
- Stores computed preferences (favorite genres, artists, audio features)
- Caches recommendations for performance

#### Services

**RecommendationService** (`services/recommendationService.js`)
- Generates personalized recommendations using hybrid filtering
- Combines content-based and collaborative filtering algorithms
- Provides genre and mood-based recommendations
- Tracks and analyzes user interactions

### API Endpoints

#### 1. Get Personalized Recommendations

```http
GET /api/recommendations
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of recommendations (default: 20)
- `offset` (optional): Pagination offset (default: 0)
- `refresh` (optional): Force cache refresh (default: false)

**Response:**
```json
{
  "success": true,
  "count": 20,
  "data": [
    {
      "_id": "music_id",
      "title": "Song Title",
      "artist": "Artist Name",
      "genre": "Pop",
      "coverImage": "url",
      "recommendationScore": 4.5,
      "recommendationReason": "Based on your listening history"
    }
  ]
}
```

#### 2. Get Recommendations by Genre

```http
GET /api/recommendations/genre/:genre
Authorization: Bearer <token>
```

**Example:**
```bash
GET /api/recommendations/genre/Rock?limit=10
```

#### 3. Get Recommendations by Mood

```http
GET /api/recommendations/mood/:mood
Authorization: Bearer <token>
```

**Available Moods:**
- `happy`: Uplifting, positive tracks
- `sad`: Melancholic, emotional tracks
- `energetic`: High-energy, danceable tracks
- `calm`: Relaxing, peaceful tracks
- `focus`: Instrumental, concentration-friendly tracks

**Example:**
```bash
GET /api/recommendations/mood/energetic?limit=15
```

#### 4. Track User Interaction

```http
POST /api/recommendations/track
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "musicId": "music_track_id",
  "interactionType": "play",
  "duration": 180,
  "completionRate": 0.85
}
```

**Interaction Types:**
- `play`: User played the track
- `like`: User liked the track
- `skip`: User skipped the track
- `save`: User saved the track
- `share`: User shared the track
- `download`: User downloaded the track
- `add_to_playlist`: User added to playlist

#### 5. Get User Preferences

```http
GET /api/recommendations/preferences
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "preferences": {
      "favoriteGenres": [
        { "genre": "Rock", "score": 15 },
        { "genre": "Pop", "score": 12 }
      ],
      "favoriteArtists": [
        { "artistId": "artist_id", "score": 20 }
      ],
      "audioFeaturePreferences": {
        "preferredTempo": 120,
        "preferredEnergy": 0.7,
        "preferredValence": 0.6
      }
    },
    "totalInteractions": 150,
    "lastUpdated": "2025-11-08T18:00:00.000Z"
  }
}
```

### Frontend Integration

#### Example: Fetch Recommendations

```javascript
async function fetchRecommendations() {
  const response = await fetch('http://localhost:5000/api/recommendations?limit=20', {
    headers: {
      'Authorization': `Bearer ${userToken}`
    }
  });
  
  const data = await response.json();
  
  if (data.success) {
    displayRecommendations(data.data);
  }
}
```

#### Example: Track Play Interaction

```javascript
async function trackPlay(musicId, duration, completionRate) {
  await fetch('http://localhost:5000/api/recommendations/track', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      musicId,
      interactionType: 'play',
      duration,
      completionRate
    })
  });
}
```

---

## 🔗 Social Sharing Integration

### Features

- **Multi-Platform Support**: Share to Instagram, Twitter, Facebook, WhatsApp, Telegram
- **Content Types**: Share music tracks, playlists, projects, and user profiles
- **Custom Messages**: Customize share text and hashtags
- **Analytics**: Track shares, clicks, and conversions
- **Share URLs**: Generate platform-specific share links

### Architecture

#### Models

**SocialShare Model** (`models/SocialShare.js`)
- Tracks all social media shares
- Records platform, content type, and share metadata
- Stores analytics (clicks, conversions)

#### Services

**SocialSharingService** (`services/socialSharingService.js`)
- Generates share links and texts
- Creates platform-specific share URLs
- Tracks share analytics
- Integrates with social media APIs

### API Endpoints

#### 1. Create a Share

```http
POST /api/social/share
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "contentType": "music",
  "contentId": "music_track_id",
  "platform": "twitter",
  "customText": "Check out this amazing track!",
  "hashtags": ["Music", "NewRelease"]
}
```

**Content Types:**
- `music`: Music tracks
- `playlist`: User playlists
- `project`: Music projects
- `profile`: User profiles

**Platforms:**
- `instagram`: Instagram Story
- `twitter`: Twitter/X
- `facebook`: Facebook
- `whatsapp`: WhatsApp
- `telegram`: Telegram
- `email`: Email
- `copy_link`: Copy direct link

**Response:**
```json
{
  "success": true,
  "message": "Share created successfully",
  "data": {
    "share": {
      "_id": "share_id",
      "shareUrl": "https://musicjunction.com/share/music/track_id",
      "platform": "twitter",
      "status": "success"
    },
    "shareUrl": "https://twitter.com/intent/tweet?text=..."
  }
}
```

#### 2. Get Share URLs

```http
GET /api/social/share-urls/:contentType/:contentId
Authorization: Bearer <token>
```

**Example:**
```bash
GET /api/social/share-urls/music/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "data": {
    "twitter": "https://twitter.com/intent/tweet?text=...",
    "facebook": "https://www.facebook.com/sharer/sharer.php?u=...",
    "whatsapp": "https://wa.me/?text=...",
    "telegram": "https://t.me/share/url?url=...",
    "copyLink": "https://musicjunction.com/share/music/track_id"
  }
}
```

#### 3. Get User Share Analytics

```http
GET /api/social/analytics/user
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (optional): Start date for analytics
- `endDate` (optional): End date for analytics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalShares": 45,
    "totalClicks": 120,
    "totalConversions": 15,
    "byPlatform": {
      "twitter": {
        "count": 20,
        "clicks": 50,
        "conversions": 8
      },
      "facebook": {
        "count": 15,
        "clicks": 40,
        "conversions": 5
      }
    },
    "byContentType": {
      "music": 30,
      "playlist": 10,
      "project": 5
    }
  }
}
```

#### 4. Get Content Share Analytics

```http
GET /api/social/analytics/:contentType/:contentId
Authorization: Bearer <token>
```

**Example:**
```bash
GET /api/social/analytics/music/507f1f77bcf86cd799439011
```

#### 5. Track Share Click

```http
POST /api/social/track/click/:shareId
```

Used to track when someone clicks a shared link.

#### 6. Track Share Conversion

```http
POST /api/social/track/conversion/:shareId
```

Used to track when a shared link leads to a signup or engagement.

### Frontend Integration

#### Example: Get Share URLs

```javascript
async function getShareUrls(contentType, contentId) {
  const response = await fetch(
    `http://localhost:5000/api/social/share-urls/${contentType}/${contentId}`,
    {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    }
  );
  
  const data = await response.json();
  return data.data;
}
```

#### Example: Share to Twitter

```javascript
async function shareToTwitter(musicId) {
  const response = await fetch('http://localhost:5000/api/social/share', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contentType: 'music',
      contentId: musicId,
      platform: 'twitter'
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Open Twitter share dialog
    window.open(data.data.shareUrl, '_blank');
  }
}
```

#### Example: Social Share Buttons Component

```javascript
function SocialShareButtons({ contentType, contentId }) {
  const [shareUrls, setShareUrls] = useState(null);
  
  useEffect(() => {
    fetchShareUrls();
  }, [contentType, contentId]);
  
  const fetchShareUrls = async () => {
    const urls = await getShareUrls(contentType, contentId);
    setShareUrls(urls);
  };
  
  const handleShare = (platform) => {
    if (platform === 'copy_link') {
      navigator.clipboard.writeText(shareUrls.copyLink);
      toast.success('Link copied!');
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };
  
  return (
    <div className="social-share-buttons">
      <button onClick={() => handleShare('twitter')}>
        <TwitterIcon /> Share on Twitter
      </button>
      <button onClick={() => handleShare('facebook')}>
        <FacebookIcon /> Share on Facebook
      </button>
      <button onClick={() => handleShare('whatsapp')}>
        <WhatsAppIcon /> Share on WhatsApp
      </button>
      <button onClick={() => handleShare('copy_link')}>
        <LinkIcon /> Copy Link
      </button>
    </div>
  );
}
```

---

## Environment Variables

Add these to your `.env` file:

```env
# Frontend URL for share links
FRONTEND_URL=http://localhost:3000

# Twitter/X API (optional - for direct posting)
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_USER_TOKEN=user_oauth_token

# Facebook API (optional - for direct posting)
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

---

## Database Indexes

The following indexes are automatically created for optimal performance:

### Recommendation Model
- `userId` (for user lookups)
- `userId + interactions.timestamp` (for recent interactions)
- `preferences.favoriteGenres.genre` (for genre-based queries)

### SocialShare Model
- `userId + sharedAt` (for user analytics)
- `contentType + contentId` (for content analytics)
- `platform + sharedAt` (for platform analytics)

---

## Testing

### Test Recommendations

```bash
# Get recommendations
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/recommendations

# Track interaction
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"musicId":"track_id","interactionType":"play","duration":180}' \
  http://localhost:5000/api/recommendations/track
```

### Test Social Sharing

```bash
# Create share
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"contentType":"music","contentId":"track_id","platform":"twitter"}' \
  http://localhost:5000/api/social/share

# Get share URLs
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/social/share-urls/music/track_id
```

---

## Best Practices

### Recommendations

1. **Track All Interactions**: Track plays, likes, skips to improve accuracy
2. **Refresh Cache Periodically**: Use `refresh=true` parameter for fresh recommendations
3. **Display Reasons**: Show users why tracks are recommended
4. **Mix Algorithms**: Combine personalized with trending for variety

### Social Sharing

1. **Customize Messages**: Allow users to edit share text before posting
2. **Track Analytics**: Monitor which platforms perform best
3. **Use UTM Parameters**: Add tracking parameters to share URLs
4. **Optimize Images**: Ensure cover images meet platform requirements
5. **Handle Errors Gracefully**: Show fallback options if sharing fails

---

## Future Enhancements

### Recommendations
- Deep learning models for audio feature analysis
- Real-time recommendation updates
- Playlist auto-generation
- Similar artist discovery
- Time-of-day personalization

### Social Sharing
- Direct Instagram API integration
- Automated posting with user consent
- Share preview cards
- Viral tracking and rewards
- Cross-platform campaigns

---

## Support

For issues or questions:
- Create an issue in the repository
- Contact: support@musicjunction.com
- Documentation: https://docs.musicjunction.com
