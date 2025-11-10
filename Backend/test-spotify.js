require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');

console.log('Testing Spotify API Connection...\n');

console.log('Environment Variables:');
console.log('CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? '✓ Set' : '✗ Missing');
console.log('CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET ? '✓ Set' : '✗ Missing');
console.log('REDIRECT_URI:', process.env.SPOTIFY_REDIRECT_URI);
console.log();

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

async function test() {
  try {
    console.log('Attempting to get access token...');
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    console.log('✅ Access token obtained successfully!\n');
    
    console.log('Testing search...');
    const searchData = await spotifyApi.searchTracks('coldplay', { limit: 3 });
    console.log('✅ Search successful!');
    console.log(`Found ${searchData.body.tracks.items.length} tracks:\n`);
    
    searchData.body.tracks.items.forEach((track, i) => {
      console.log(`${i + 1}. "${track.name}" by ${track.artists.map(a => a.name).join(', ')}`);
    });
    
    console.log('\n🎉 Spotify integration is working correctly!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.body) {
      console.error('Response:', JSON.stringify(error.body, null, 2));
    }
  }
}

test();
