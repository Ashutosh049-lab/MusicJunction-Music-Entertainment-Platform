// Test file for Music Streaming API
// Run this after starting the server: node test-music-api.js

const axios = require('axios');

const BASE_URL = 'http://localhost:8085/api';
let authToken = ''; // Set this after logging in

// Test configurations
const testConfig = {
  // Update these with your test credentials
  email: 'test@example.com',
  password: 'password123',
  spotifyQuery: 'coldplay'
};

// Helper function for API calls
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Update authorization header
const setAuthToken = (token) => {
  authToken = token;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Test functions
async function testLogin() {
  console.log('\n🧪 Testing Login...');
  try {
    const response = await api.post('/auth/login', {
      email: testConfig.email,
      password: testConfig.password
    });
    
    setAuthToken(response.data.token);
    console.log('✅ Login successful!');
    console.log('   User:', response.data.name);
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    console.log('   Please register first or update test credentials');
    return false;
  }
}

async function testGetAllTracks() {
  console.log('\n🧪 Testing Get All Tracks...');
  try {
    const response = await api.get('/music?page=1&limit=10');
    console.log('✅ Get tracks successful!');
    console.log(`   Found ${response.data.tracks.length} tracks`);
    console.log(`   Total: ${response.data.pagination.total}`);
    
    if (response.data.tracks.length > 0) {
      const track = response.data.tracks[0];
      console.log(`   Sample track: "${track.title}" by ${track.artist} (${track.source})`);
      return track._id; // Return track ID for streaming test
    }
    return null;
  } catch (error) {
    console.error('❌ Get tracks failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testSpotifySearch() {
  console.log('\n🧪 Testing Spotify Search...');
  try {
    const response = await api.get(`/music/spotify/search?query=${testConfig.spotifyQuery}&limit=5`);
    console.log('✅ Spotify search successful!');
    console.log(`   Found ${response.data.tracks.length} tracks`);
    
    if (response.data.tracks.length > 0) {
      const track = response.data.tracks[0];
      console.log(`   First result: "${track.title}" by ${track.artist}`);
      console.log(`   Album: ${track.album}`);
      console.log(`   Duration: ${track.duration}s`);
      console.log(`   Popularity: ${track.popularity}/100`);
      return track.externalId; // Return Spotify ID for linking test
    }
    return null;
  } catch (error) {
    console.error('❌ Spotify search failed:', error.response?.data?.message || error.message);
    console.log('   Make sure Spotify credentials are set in .env file');
    return null;
  }
}

async function testLinkSpotifyTrack(spotifyId) {
  if (!spotifyId) {
    console.log('\n⏭️  Skipping Spotify link test (no track ID)');
    return null;
  }
  
  console.log('\n🧪 Testing Link Spotify Track...');
  try {
    const response = await api.post('/music/spotify/link', {
      spotifyId: spotifyId
    });
    console.log('✅ Link Spotify track successful!');
    console.log(`   ${response.data.message}`);
    console.log(`   Track: "${response.data.track.title}" by ${response.data.track.artist}`);
    return response.data.track._id;
  } catch (error) {
    console.error('❌ Link Spotify track failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetTrackById(trackId) {
  if (!trackId) {
    console.log('\n⏭️  Skipping get track by ID test (no track ID)');
    return;
  }
  
  console.log('\n🧪 Testing Get Track by ID...');
  try {
    const response = await api.get(`/music/${trackId}`);
    console.log('✅ Get track by ID successful!');
    console.log(`   Title: ${response.data.title}`);
    console.log(`   Artist: ${response.data.artist}`);
    console.log(`   Genre: ${response.data.genre}`);
    console.log(`   Source: ${response.data.source}`);
    console.log(`   Play count: ${response.data.playCount}`);
    console.log(`   Likes: ${response.data.likes.length}`);
  } catch (error) {
    console.error('❌ Get track by ID failed:', error.response?.data?.message || error.message);
  }
}

async function testToggleLike(trackId) {
  if (!trackId) {
    console.log('\n⏭️  Skipping like test (no track ID)');
    return;
  }
  
  console.log('\n🧪 Testing Toggle Like...');
  try {
    const response = await api.post(`/music/${trackId}/like`);
    console.log('✅ Toggle like successful!');
    console.log(`   ${response.data.message}`);
    console.log(`   Liked: ${response.data.liked}`);
    console.log(`   Total likes: ${response.data.likesCount}`);
  } catch (error) {
    console.error('❌ Toggle like failed:', error.response?.data?.message || error.message);
  }
}

async function testFilterTracks() {
  console.log('\n🧪 Testing Filter Tracks...');
  
  // Test filter by source
  try {
    const response = await api.get('/music?source=spotify&limit=5');
    console.log('✅ Filter by source successful!');
    console.log(`   Found ${response.data.tracks.length} Spotify tracks`);
  } catch (error) {
    console.error('❌ Filter by source failed:', error.response?.data?.message || error.message);
  }
}

async function testStreamTrack(trackId) {
  if (!trackId) {
    console.log('\n⏭️  Skipping stream test (no track ID)');
    return;
  }
  
  console.log('\n🧪 Testing Stream Track...');
  console.log(`   Stream URL: ${BASE_URL}/music/stream/${trackId}`);
  console.log('   ℹ️  You can test streaming by opening this URL in a browser');
  console.log('   ℹ️  Or use: curl "' + BASE_URL + '/music/stream/' + trackId + '" --output test.mp3');
}

// Main test runner
async function runTests() {
  console.log('🎵 MusicJunction API Test Suite');
  console.log('================================\n');
  
  try {
    // Test authentication
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
      console.log('\n⚠️  Cannot continue tests without authentication');
      console.log('   Please register a user first or update test credentials');
      return;
    }
    
    // Test get all tracks
    const trackId = await testGetAllTracks();
    
    // Test Spotify integration
    const spotifyId = await testSpotifySearch();
    const linkedTrackId = await testLinkSpotifyTrack(spotifyId);
    
    // Test get single track
    await testGetTrackById(trackId || linkedTrackId);
    
    // Test like functionality
    await testToggleLike(trackId || linkedTrackId);
    
    // Test filtering
    await testFilterTracks();
    
    // Test streaming (just show URL)
    await testStreamTrack(trackId || linkedTrackId);
    
    console.log('\n✨ Test suite completed!');
    console.log('\n📖 For full API documentation, see: MUSIC_STREAMING_API.md');
    
  } catch (error) {
    console.error('\n💥 Unexpected error:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
