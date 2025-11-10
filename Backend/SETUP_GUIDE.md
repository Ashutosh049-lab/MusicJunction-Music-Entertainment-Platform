# Setup Guide: AI Recommendations & Social Sharing

## Quick Start

### 1. Installation

All required dependencies are already included in `package.json`. The implementation uses existing packages:
- `axios` - for HTTP requests to social media APIs
- `mongoose` - for MongoDB models
- `express` - for API routes

No additional npm packages need to be installed!

### 2. Database Setup

The MongoDB models will automatically create collections on first use:
- `recommendations` - stores user interaction data and preferences
- `socialshares` - tracks social media shares and analytics

### 3. Environment Configuration

Update your `.env` file with the following (already added):

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

**Note:** Social media API credentials are optional. Without them, the system will generate share URLs that open platform-specific share dialogs instead of posting directly.

### 4. Start the Server

```bash
npm start
# or for development
npm run dev
```

The server will now have two new API route groups:
- `/api/recommendations` - AI music recommendation endpoints
- `/api/social` - Social sharing endpoints

### 5. Verify Installation

Test the endpoints:

```bash
# Test recommendations endpoint (requires authentication)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8085/api/recommendations

# Test social share URLs endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8085/api/social/share-urls/music/MUSIC_ID
```

## API Routes Added

### Recommendation Routes (`/api/recommendations`)
- `GET /` - Get personalized recommendations
- `GET /genre/:genre` - Get recommendations by genre
- `GET /mood/:mood` - Get recommendations by mood
- `GET /preferences` - Get user preferences
- `POST /track` - Track user interaction

### Social Sharing Routes (`/api/social`)
- `POST /share` - Create a social share
- `GET /share-urls/:contentType/:contentId` - Get platform share URLs
- `GET /analytics/user` - Get user share analytics
- `GET /analytics/:contentType/:contentId` - Get content analytics
- `POST /track/click/:shareId` - Track share clicks
- `POST /track/conversion/:shareId` - Track conversions

## Files Created

### Models
- `models/Recommendation.js` - User recommendation profile
- `models/SocialShare.js` - Social share tracking

### Services
- `services/recommendationService.js` - Recommendation algorithms
- `services/socialSharingService.js` - Social sharing logic

### Controllers
- `controllers/recommendationController.js` - Recommendation endpoints
- `controllers/socialSharingController.js` - Social sharing endpoints

### Routes
- `routes/recommendationRoutes.js` - Recommendation routes
- `routes/socialSharingRoutes.js` - Social sharing routes

### Documentation
- `AI_RECOMMENDATIONS_SOCIAL_SHARING.md` - Full feature documentation
- `SETUP_GUIDE.md` - This file

## Usage Examples

### Frontend: Display Recommendations

```javascript
// Fetch personalized recommendations
const response = await fetch('/api/recommendations?limit=20', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data } = await response.json();

// Display recommendations
data.forEach(track => {
  console.log(`${track.title} - ${track.artist}`);
  console.log(`Reason: ${track.recommendationReason}`);
});
```

### Frontend: Track Music Play

```javascript
// Track when user plays a song
const audioPlayer = document.getElementById('audio');
audioPlayer.addEventListener('ended', () => {
  fetch('/api/recommendations/track', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      musicId: currentTrack.id,
      interactionType: 'play',
      duration: audioPlayer.duration,
      completionRate: 1.0
    })
  });
});
```

### Frontend: Social Share Button

```javascript
async function shareTrack(musicId, platform) {
  const response = await fetch('/api/social/share', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contentType: 'music',
      contentId: musicId,
      platform: platform
    })
  });
  
  const { data } = await response.json();
  // Open share URL in new window
  window.open(data.shareUrl, '_blank', 'width=600,height=400');
}
```

## How It Works

### AI Recommendations

1. **Data Collection**: Tracks user interactions (plays, likes, skips)
2. **Preference Analysis**: Analyzes listening patterns to identify favorite genres, artists
3. **Hybrid Filtering**: 
   - Content-based: Finds similar tracks to what user liked
   - Collaborative: Finds tracks liked by similar users
   - Trending: Includes popular tracks
4. **Caching**: Stores recommendations for 1 hour to optimize performance
5. **Continuous Learning**: Updates preferences as user interacts with more music

### Social Sharing

1. **Content Selection**: User chooses content to share (music, playlist, project)
2. **URL Generation**: Creates shareable link and platform-specific URLs
3. **Platform Integration**: Opens native share dialogs or posts directly (if API configured)
4. **Analytics Tracking**: Records shares, clicks, and conversions
5. **Reporting**: Provides insights on sharing performance

## Performance Considerations

### Recommendations
- Uses caching to avoid regenerating recommendations on every request
- Limits interaction history to last 1000 items
- Indexes on MongoDB for fast queries
- Asynchronous preference updates to avoid blocking

### Social Sharing
- Minimal database writes
- Efficient aggregation queries for analytics
- Indexed fields for fast lookups

## Security Notes

- All endpoints require authentication (JWT token)
- Content ownership validation on shares
- Rate limiting should be added in production
- Social media credentials stored securely in environment variables

## Troubleshooting

### Recommendations not appearing?
- Ensure user has some interaction history (likes, plays)
- Check that Music tracks exist in database
- Verify authentication token is valid

### Social sharing not working?
- Check FRONTEND_URL environment variable
- Verify content exists (music, playlist, project)
- For direct posting, ensure API credentials are configured

### Database errors?
- Ensure MongoDB is running
- Check connection string in .env
- Verify collections are created (happens automatically)

## Next Steps

1. **Frontend Integration**: Build UI components for recommendations and sharing
2. **Testing**: Test with real user data and various scenarios
3. **Monitoring**: Add logging and analytics tracking
4. **Optimization**: Fine-tune recommendation algorithms based on user feedback
5. **Social APIs**: Configure Twitter/Facebook APIs for direct posting

## Support

For detailed API documentation, see `AI_RECOMMENDATIONS_SOCIAL_SHARING.md`

For issues:
- Check server logs for errors
- Verify MongoDB connection
- Ensure all environment variables are set
- Test with Postman or curl first
