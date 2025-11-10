# Music Streaming Integration API Documentation

## Overview
The MusicJunction platform now supports both **local music uploads** and **third-party streaming integration** (Spotify). Users can upload their own tracks, search and link Spotify tracks, and stream all content seamlessly.

---

## Features Implemented

### ✅ Local Music Upload & Streaming
- Upload audio files (MP3, WAV, FLAC, AAC)
- Stream with HTTP range requests (seeking support)
- Play count tracking
- File size limit: 50MB

### ✅ Spotify Integration
- Search Spotify catalog
- Link Spotify tracks to user library
- Access 30-second previews
- Full track metadata (album art, duration, popularity)

### ✅ Track Management
- Like/Unlike tracks
- Delete tracks (with permission check)
- Filter tracks by source, genre, artist
- Search across all tracks
- Pagination support

---

## Setup Instructions

### 1. Get Spotify API Credentials
1. Visit [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Copy **Client ID** and **Client Secret**
4. Add redirect URI: `http://localhost:8085/api/music/spotify/callback`

### 2. Update `.env` File
```env
SPOTIFY_CLIENT_ID=your_actual_client_id
SPOTIFY_CLIENT_SECRET=your_actual_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:8085/api/music/spotify/callback
```

### 3. Restart Server
```bash
npm start
# or with nodemon
npx nodemon index.js
```

---

## API Endpoints

### 🎵 Local Upload Routes

#### **POST** `/api/music/upload`
Upload a local audio file.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body (form-data):**
- `music`: Audio file (required)
- `title`: Track title (required)
- `artist`: Artist name (required)
- `genre`: Genre (required)
- `album`: Album name (optional)

**Response:**
```json
{
  "_id": "...",
  "title": "My Song",
  "artist": "Artist Name",
  "genre": "Pop",
  "album": "Album Name",
  "source": "local",
  "fileUrl": "/uploads/1234567890.mp3",
  "fileSize": 5242880,
  "mimeType": "audio/mpeg",
  "uploadedBy": "...",
  "playCount": 0,
  "likes": [],
  "createdAt": "2025-11-08T..."
}
```

---

### 📚 Track Management Routes

#### **GET** `/api/music/`
Get all tracks with optional filtering and pagination.

**Query Parameters:**
- `source`: Filter by source (`local`, `spotify`, `soundcloud`, `youtube`)
- `genre`: Filter by genre
- `artist`: Filter by artist name (case-insensitive)
- `search`: Search in title, artist, or album
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Example:**
```
GET /api/music?source=local&genre=Pop&page=1&limit=10
```

**Response:**
```json
{
  "tracks": [...],
  "pagination": {
    "total": 45,
    "page": 1,
    "pages": 5
  }
}
```

#### **GET** `/api/music/:id`
Get a single track by ID.

**Response:**
```json
{
  "_id": "...",
  "title": "Track Title",
  "artist": "Artist Name",
  "genre": "Rock",
  "source": "local",
  "fileUrl": "/uploads/...",
  "uploadedBy": {
    "_id": "...",
    "name": "User Name",
    "email": "user@example.com"
  },
  "likes": [...],
  "playCount": 42
}
```

#### **DELETE** `/api/music/:id`
Delete a track (owner only).

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Track deleted successfully"
}
```

---

### 🎧 Streaming Routes

#### **GET** `/api/music/stream/:id`
Stream a track with HTTP range support (for seeking).

**Features:**
- Supports HTTP Range requests (206 Partial Content)
- Automatic play count increment
- For local tracks: streams the file
- For Spotify tracks: redirects to 30-second preview

**Example:**
```
GET /api/music/stream/674c5a2e3f8b1a0012345678
```

**HTML5 Audio Example:**
```html
<audio controls>
  <source src="http://localhost:8085/api/music/stream/674c5a2e3f8b1a0012345678" type="audio/mpeg">
</audio>
```

---

### ❤️ Engagement Routes

#### **POST** `/api/music/:id/like`
Like or unlike a track (toggle).

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Track liked",
  "liked": true,
  "likesCount": 15
}
```

---

### 🎵 Spotify Integration Routes

#### **GET** `/api/music/spotify/search`
Search for tracks on Spotify.

**Query Parameters:**
- `query`: Search query (required)
- `limit`: Number of results (default: 20, max: 50)

**Example:**
```
GET /api/music/spotify/search?query=imagine%20dragons&limit=10
```

**Response:**
```json
{
  "tracks": [
    {
      "externalId": "3a1lNhkSLSkpJE4MSHpDu9",
      "title": "Believer",
      "artist": "Imagine Dragons",
      "album": "Evolve",
      "duration": 204,
      "coverImage": "https://i.scdn.co/image/...",
      "releaseDate": "2017-02-01",
      "previewUrl": "https://p.scdn.co/mp3-preview/...",
      "externalUrl": "https://open.spotify.com/track/...",
      "popularity": 89,
      "isrc": "USUM71700411",
      "source": "spotify"
    },
    ...
  ]
}
```

#### **POST** `/api/music/spotify/link`
Link a Spotify track to your library.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "spotifyId": "3a1lNhkSLSkpJE4MSHpDu9"
}
```

**Response:**
```json
{
  "message": "Spotify track linked successfully",
  "track": {
    "_id": "...",
    "externalId": "3a1lNhkSLSkpJE4MSHpDu9",
    "title": "Believer",
    "artist": "Imagine Dragons",
    "source": "spotify",
    "previewUrl": "https://p.scdn.co/mp3-preview/...",
    ...
  }
}
```

---

## Usage Examples

### Frontend Integration (JavaScript)

#### 1. Upload Local Track
```javascript
const uploadTrack = async (file, metadata) => {
  const formData = new FormData();
  formData.append('music', file);
  formData.append('title', metadata.title);
  formData.append('artist', metadata.artist);
  formData.append('genre', metadata.genre);
  
  const response = await fetch('http://localhost:8085/api/music/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return await response.json();
};
```

#### 2. Search Spotify
```javascript
const searchSpotify = async (query) => {
  const response = await fetch(
    `http://localhost:8085/api/music/spotify/search?query=${encodeURIComponent(query)}&limit=20`
  );
  return await response.json();
};
```

#### 3. Link Spotify Track
```javascript
const linkSpotifyTrack = async (spotifyId) => {
  const response = await fetch('http://localhost:8085/api/music/spotify/link', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ spotifyId })
  });
  
  return await response.json();
};
```

#### 4. Stream Track with Seek Support
```javascript
// HTML5 Audio Player
const audioPlayer = document.getElementById('audio-player');
audioPlayer.src = `http://localhost:8085/api/music/stream/${trackId}`;
audioPlayer.play();

// Seeking is automatically supported via HTTP range requests
audioPlayer.currentTime = 30; // Seek to 30 seconds
```

#### 5. Like a Track
```javascript
const toggleLike = async (trackId) => {
  const response = await fetch(`http://localhost:8085/api/music/${trackId}/like`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

#### 6. Get All Tracks with Filters
```javascript
const getTracks = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`http://localhost:8085/api/music?${params}`);
  return await response.json();
};

// Example usage
const localTracks = await getTracks({ source: 'local', genre: 'Rock' });
const spotifyTracks = await getTracks({ source: 'spotify', search: 'coldplay' });
```

---

## Database Schema

### Music Model
```javascript
{
  title: String (required),
  artist: String (required),
  genre: String (required),
  album: String,
  duration: Number, // seconds
  
  // Source info
  source: Enum ['local', 'spotify', 'soundcloud', 'youtube'],
  
  // Local uploads
  fileUrl: String,
  fileSize: Number,
  mimeType: String,
  
  // External sources
  externalId: String,
  externalUrl: String,
  previewUrl: String,
  
  // Metadata
  coverImage: String,
  releaseDate: Date,
  popularity: Number,
  isrc: String,
  
  // Engagement
  playCount: Number,
  likes: [ObjectId],
  
  uploadedBy: ObjectId (ref: User),
  
  timestamps: true
}
```

---

## Testing the API

### Using cURL

#### 1. Search Spotify
```bash
curl "http://localhost:8085/api/music/spotify/search?query=coldplay&limit=5"
```

#### 2. Upload Track
```bash
curl -X POST http://localhost:8085/api/music/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "music=@/path/to/song.mp3" \
  -F "title=My Song" \
  -F "artist=Artist Name" \
  -F "genre=Pop"
```

#### 3. Stream Track
```bash
curl "http://localhost:8085/api/music/stream/TRACK_ID" --output track.mp3
```

#### 4. Get All Tracks
```bash
curl "http://localhost:8085/api/music?source=local&page=1&limit=10"
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- **200**: Success
- **201**: Created (new resource)
- **206**: Partial Content (streaming with range)
- **400**: Bad Request (validation error)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

**Example Error Response:**
```json
{
  "message": "Track not found"
}
```

---

## Security Considerations

1. **Authentication**: Most endpoints require JWT authentication
2. **File Uploads**: 50MB size limit, audio-only validation
3. **Authorization**: Users can only delete their own tracks
4. **Rate Limiting**: Consider implementing rate limiting for API calls
5. **CORS**: Configured to allow frontend access

---

## Future Enhancements

### Planned Features:
- [ ] SoundCloud integration
- [ ] YouTube audio streaming
- [ ] Playlist management
- [ ] Audio waveform generation
- [ ] Collaborative playlists
- [ ] Real-time listening rooms
- [ ] Audio effects/equalizer
- [ ] Download original files (for local uploads)
- [ ] Lyrics integration
- [ ] Audio transcoding for better compatibility

---

## Troubleshooting

### Spotify Integration Not Working
1. Verify credentials in `.env` file
2. Check internet connection
3. Ensure Spotify app is approved in dashboard
4. Check console logs for specific errors

### Streaming Issues
1. Verify file exists in `uploads/` folder
2. Check file permissions
3. Ensure correct MIME type
4. Test with different audio formats

### Upload Failures
1. Check file size (must be < 50MB)
2. Verify audio format (MP3, WAV, FLAC, AAC)
3. Ensure `uploads/` directory exists and is writable
4. Check authentication token

---

## Support

For issues or questions:
- Check server logs for detailed error messages
- Verify MongoDB connection
- Test endpoints with Postman/cURL
- Review this documentation

---

**Happy Streaming! 🎵**
