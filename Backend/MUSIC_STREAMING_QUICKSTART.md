# 🎵 Music Streaming Integration - Quick Start

## What's New?

Your MusicJunction platform now has **comprehensive music streaming capabilities**:

### ✅ Implemented Features

1. **Local Music Upload & Streaming**
   - Upload MP3, WAV, FLAC, AAC files (up to 50MB)
   - Stream with seeking support (HTTP range requests)
   - Automatic play count tracking

2. **Spotify Integration**
   - Search Spotify's entire catalog
   - Link tracks to your library
   - Access 30-second previews
   - Full metadata (album art, duration, popularity)

3. **Enhanced Track Management**
   - Like/Unlike tracks
   - Filter by source, genre, artist
   - Full-text search
   - Pagination
   - Delete tracks (with permissions)

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Spotify Credentials

1. Go to [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Log in or create a Spotify account
3. Click **"Create App"**
4. Fill in:
   - App name: `MusicJunction`
   - App description: `Music streaming platform`
   - Redirect URI: `http://localhost:8085/api/music/spotify/callback`
5. Accept terms and click **"Create"**
6. Click **"Settings"** and copy your **Client ID** and **Client Secret**

### Step 2: Update `.env` File

Open `Backend/.env` and replace the placeholder values:

```env
SPOTIFY_CLIENT_ID=paste_your_client_id_here
SPOTIFY_CLIENT_SECRET=paste_your_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:8085/api/music/spotify/callback
```

### Step 3: Restart Server

```bash
cd Backend
npx nodemon index.js
```

---

## 🧪 Test It Out

### Option 1: Use the Test Script

```bash
# Update test credentials in test-music-api.js first
node test-music-api.js
```

### Option 2: Manual Testing

#### 1. Search Spotify (No Auth Required)
```bash
curl "http://localhost:8085/api/music/spotify/search?query=coldplay&limit=5"
```

#### 2. Get All Tracks
```bash
curl "http://localhost:8085/api/music?page=1&limit=10"
```

#### 3. Upload a Track (Requires Auth)
```bash
curl -X POST http://localhost:8085/api/music/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "music=@/path/to/song.mp3" \
  -F "title=My Awesome Song" \
  -F "artist=My Band" \
  -F "genre=Rock"
```

---

## 📋 Key API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/music/spotify/search` | Search Spotify tracks | No |
| `POST` | `/api/music/spotify/link` | Link Spotify track to library | Yes |
| `POST` | `/api/music/upload` | Upload local audio file | Yes |
| `GET` | `/api/music/` | Get all tracks (with filters) | No |
| `GET` | `/api/music/:id` | Get single track | No |
| `GET` | `/api/music/stream/:id` | Stream track | No |
| `POST` | `/api/music/:id/like` | Like/unlike track | Yes |
| `DELETE` | `/api/music/:id` | Delete track | Yes |

---

## 💡 Usage Examples

### Frontend Integration

#### Search Spotify and Link Track
```javascript
// 1. Search Spotify
const results = await fetch(
  'http://localhost:8085/api/music/spotify/search?query=imagine+dragons&limit=10'
).then(res => res.json());

// 2. Link a track to user's library
const track = results.tracks[0];
const linked = await fetch('http://localhost:8085/api/music/spotify/link', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ spotifyId: track.externalId })
}).then(res => res.json());

console.log('Linked:', linked.track.title);
```

#### Upload and Stream Local Track
```javascript
// 1. Upload track
const formData = new FormData();
formData.append('music', audioFile);
formData.append('title', 'My Song');
formData.append('artist', 'My Band');
formData.append('genre', 'Rock');

const uploaded = await fetch('http://localhost:8085/api/music/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${userToken}` },
  body: formData
}).then(res => res.json());

// 2. Stream the track
const audio = new Audio(`http://localhost:8085/api/music/stream/${uploaded._id}`);
audio.play();
```

#### Like a Track
```javascript
const response = await fetch(`http://localhost:8085/api/music/${trackId}/like`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${userToken}` }
}).then(res => res.json());

console.log(response.liked ? '❤️ Liked!' : '🤍 Unliked');
console.log(`Total likes: ${response.likesCount}`);
```

---

## 🎯 What You Can Build

With this integration, you can now create:

- 🎵 **Music Player** - Stream local + Spotify tracks
- 📚 **Music Library** - Organize personal + external tracks
- 🔍 **Discovery Feature** - Search and save Spotify tracks
- ❤️ **Social Features** - Like, share, comment on tracks
- 📊 **Analytics** - Play counts, popular tracks
- 🎧 **Playlists** - Mix local and Spotify content
- 🎤 **Collaboration** - Share tracks with other musicians

---

## 📚 Full Documentation

For complete API reference, see:
- **[MUSIC_STREAMING_API.md](./MUSIC_STREAMING_API.md)** - Detailed API documentation
- Test script: `test-music-api.js`

---

## 🐛 Troubleshooting

### Spotify Search Returns Error
- ✅ Check Spotify credentials in `.env`
- ✅ Restart the server after updating `.env`
- ✅ Verify internet connection

### Streaming Not Working
- ✅ Ensure `uploads/` folder exists
- ✅ Check file permissions
- ✅ Verify track exists in database

### Upload Fails
- ✅ Check file size (< 50MB)
- ✅ Verify audio format (MP3, WAV, FLAC, AAC)
- ✅ Ensure valid JWT token

---

## 🎉 You're All Set!

Your music streaming platform is ready to go. Start building amazing features! 🚀

**Next Steps:**
1. Create a frontend music player
2. Build playlist management
3. Add social features
4. Implement recommendations

For questions or issues, check the logs or review the full API documentation.

**Happy Coding! 🎵**
