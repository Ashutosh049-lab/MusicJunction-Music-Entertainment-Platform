
const SpotifyWebApi = require('spotify-web-api-node');

// Initialize Spotify API
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

// Token refresh mechanism
let tokenExpirationTime = 0;

const getAccessToken = async () => {
  try {
    // Check if current token is still valid
    if (Date.now() < tokenExpirationTime) {
      return true;
    }

    // Get new access token using client credentials flow
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    
    // Set expiration time (expires_in is in seconds)
    tokenExpirationTime = Date.now() + (data.body['expires_in'] * 1000);
    
    console.log('✅ Spotify access token obtained');
    return true;
  } catch (error) {
    console.error('❌ Error getting Spotify access token:', error.message);
    throw new Error('Failed to authenticate with Spotify');
  }
};

/**
 * Search for tracks on Spotify
 * @param {string} query - Search query (track name, artist, etc.)
 * @param {number} limit - Number of results to return (default: 20)
 * @returns {Promise<Array>} Array of track objects
 */
const searchTracks = async (query, limit = 20) => {
  try {
    await getAccessToken();
    
    const data = await spotifyApi.searchTracks(query, { limit });
    
    return data.body.tracks.items.map(track => ({
      externalId: track.id,
      title: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      duration: Math.floor(track.duration_ms / 1000), // convert to seconds
      coverImage: track.album.images[0]?.url || null,
      releaseDate: track.album.release_date,
      previewUrl: track.preview_url, // 30-second preview
      externalUrl: track.external_urls.spotify,
      popularity: track.popularity,
      isrc: track.external_ids?.isrc || null,
      source: 'spotify'
    }));
  } catch (error) {
    console.error('Spotify search error:', error.message);
    throw new Error('Failed to search tracks on Spotify');
  }
};

/**
 * Get a single track by Spotify ID
 * @param {string} trackId - Spotify track ID
 * @returns {Promise<Object>} Track object
 */
const getTrackById = async (trackId) => {
  try {
    await getAccessToken();
    
    const data = await spotifyApi.getTrack(trackId);
    const track = data.body;
    
    return {
      externalId: track.id,
      title: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      duration: Math.floor(track.duration_ms / 1000),
      coverImage: track.album.images[0]?.url || null,
      releaseDate: track.album.release_date,
      previewUrl: track.preview_url,
      externalUrl: track.external_urls.spotify,
      popularity: track.popularity,
      isrc: track.external_ids?.isrc || null,
      source: 'spotify'
    };
  } catch (error) {
    console.error('Spotify get track error:', error.message);
    throw new Error('Failed to get track from Spotify');
  }
};

/**
 * Search for tracks by artist
 * @param {string} artistName - Artist name
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} Array of track objects
 */
const searchTracksByArtist = async (artistName, limit = 20) => {
  try {
    await getAccessToken();
    
    const data = await spotifyApi.searchTracks(`artist:${artistName}`, { limit });
    
    return data.body.tracks.items.map(track => ({
      externalId: track.id,
      title: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      duration: Math.floor(track.duration_ms / 1000),
      coverImage: track.album.images[0]?.url || null,
      releaseDate: track.album.release_date,
      previewUrl: track.preview_url,
      externalUrl: track.external_urls.spotify,
      popularity: track.popularity,
      isrc: track.external_ids?.isrc || null,
      source: 'spotify'
    }));
  } catch (error) {
    console.error('Spotify artist search error:', error.message);
    throw new Error('Failed to search tracks by artist on Spotify');
  }
};

/**
 * Get multiple tracks by IDs
 * @param {Array<string>} trackIds - Array of Spotify track IDs
 * @returns {Promise<Array>} Array of track objects
 */
const getMultipleTracks = async (trackIds) => {
  try {
    await getAccessToken();
    
    const data = await spotifyApi.getTracks(trackIds);
    
    return data.body.tracks.map(track => ({
      externalId: track.id,
      title: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      duration: Math.floor(track.duration_ms / 1000),
      coverImage: track.album.images[0]?.url || null,
      releaseDate: track.album.release_date,
      previewUrl: track.preview_url,
      externalUrl: track.external_urls.spotify,
      popularity: track.popularity,
      isrc: track.external_ids?.isrc || null,
      source: 'spotify'
    }));
  } catch (error) {
    console.error('Spotify get multiple tracks error:', error.message);
    throw new Error('Failed to get tracks from Spotify');
  }
};

module.exports = {
  searchTracks,
  getTrackById,
  searchTracksByArtist,
  getMultipleTracks,
  getAccessToken
};
