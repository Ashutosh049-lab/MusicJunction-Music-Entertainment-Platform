import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Music, ExternalLink, Plus, Loader } from 'lucide-react';
import axios from '../lib/axios';
import { toast } from 'sonner';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { SearchBar } from '../components/ui';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  duration_ms: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

const SpotifyIntegration = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [linkingTrack, setLinkingTrack] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      const response = await axios.get('/music/spotify/search', {
        params: { query: searchQuery, limit: 20 }
      });

      if (response.data.tracks) {
        setTracks(response.data.tracks);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to search Spotify');
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkTrack = async (spotifyId: string) => {
    try {
      setLinkingTrack(spotifyId);
      const response = await axios.post('/music/spotify/link', { spotifyId });

      if (response.data.message) {
        toast.success(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to link track');
    } finally {
      setLinkingTrack(null);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Music className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Spotify Integration</h1>
        </div>
        <p className="text-muted-foreground">
          Search Spotify's catalog and add tracks to your library
        </p>
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-lg p-6 mb-6 shadow-sm"
      >
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1">
            <SearchBar
              placeholder="Search for tracks, artists, or albums..."
              onSearch={setSearchQuery}
              delay={0}
              size="md"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : !hasSearched ? (
        <EmptyState
          icon="Music"
          title="Search Spotify"
          description="Enter a track name, artist, or album to search Spotify's catalog"
        />
      ) : tracks.length === 0 ? (
        <EmptyState
          icon="Music"
          title="No results found"
          description="Try a different search query"
        />
      ) : (
        <div className="space-y-3">
          {tracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card border border-border rounded-lg p-4 hover:border-foreground/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Album Art */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  {track.album.images[0] ? (
                    <img
                      src={track.album.images[0].url}
                      alt={track.album.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{track.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {track.artists.map(a => a.name).join(', ')}
                  </p>
                  <p className="text-xs text-muted-foreground/80 truncate">
                    {track.album.name} • {formatDuration(track.duration_ms)}
                  </p>
                </div>

                {/* Preview Player */}
                {track.preview_url && (
                  <audio
                    controls
                    className="h-10"
                    preload="none"
                  >
                    <source src={track.preview_url} type="audio/mpeg" />
                  </audio>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-secondary hover:bg-secondary/80 border border-border rounded-lg transition-colors"
                    title="Open in Spotify"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => handleLinkTrack(track.id)}
                    disabled={linkingTrack === track.id}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Add to your library"
                  >
                    {linkingTrack === track.id ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 bg-card border border-border rounded-lg p-6 shadow-sm"
      >
        <h3 className="font-bold mb-3">About Spotify Integration</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Search millions of tracks from Spotify's catalog</li>
          <li>• Preview tracks before adding them</li>
          <li>• Added tracks will appear in your library</li>
          <li>• Spotify tracks include metadata and album art</li>
          <li>• Full playback requires Spotify Premium (preview available for free)</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default SpotifyIntegration;
