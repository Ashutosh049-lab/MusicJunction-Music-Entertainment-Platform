import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, Compass, Layers, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '../lib/axios';
import type { Track } from '../types';

const ListenerDashboard = () => {
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [recentPlays, setRecentPlays] = useState<Track[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        // Recommendations
        const rec = await apiClient.get('/recommendations');
        setRecommendations(((rec.data as any).recommendations || rec.data || []).slice(0, 8));

        // Profile with liked + recently played ids
        const me = await apiClient.get('/auth/me');
        const recentIds = ((me.data?.recentlyPlayed || []) as any[])
          .map((r) => r.music)
          .filter(Boolean)
          .slice(-8) // last 8
          .reverse();
        const likedIds = ((me.data?.likedMusic || []) as string[]).slice(-8).reverse();

        // Fetch tracks by id (limit to avoid burst)
        const fetchByIds = async (ids: string[]) => {
          const results: Track[] = [];
          for (const id of ids) {
            try {
              const { data } = await apiClient.get(`/music/${id}`);
              results.push((data.track || data) as Track);
            } catch {
              // ignore missing
            }
          }
          return results;
        };

        setRecentPlays(await fetchByIds(recentIds));
        setLikedTracks(await fetchByIds(likedIds));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Discover new music and manage your playlists.</p>
      </div>

      {/* Quick Links (no upload) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <Link to="/explore" className="p-6 border rounded-lg hover:bg-secondary transition flex items-center gap-3">
          <Compass className="h-6 w-6" />
          <span className="font-semibold">Explore</span>
        </Link>
        <Link to="/playlists" className="p-6 border rounded-lg hover:bg-secondary transition flex items-center gap-3">
          <Layers className="h-6 w-6" />
          <span className="font-semibold">Your Playlists</span>
        </Link>
        <Link to="/mixer" className="p-6 border rounded-lg hover:bg-secondary transition flex items-center gap-3">
          <Headphones className="h-6 w-6" />
          <span className="font-semibold">Player / Mixer</span>
        </Link>
      </div>

      {/* Recently Played */}
      {recentPlays.length > 0 && (
        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-4">Recently Played</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recentPlays.map((track: any) => (
              <Card key={(track as any)._id || track.id} track={track} />
            ))}
          </div>
        </div>
      )}

      {/* Liked Tracks */}
      {likedTracks.length > 0 && (
        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-4">Liked Tracks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {likedTracks.map((track: any) => (
              <Card key={(track as any)._id || track.id} track={track} />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 ? (
        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-4">Recommended for You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendations.map((track: any) => (
              <Card key={(track as any)._id || track.id} track={track} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card border rounded-lg p-12 text-center">
          <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No recommendations yet. Try exploring trending tracks.</p>
          <Link to="/explore" className="mt-4 inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition">Explore</Link>
        </div>
      )}
    </div>
  );
};

const Card = ({ track }: { track: any }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border rounded-lg p-4">
    <div className="w-full h-40 bg-secondary rounded mb-3 overflow-hidden">
      {track.coverUrl ? (
        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Music className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
    </div>
    <div className="truncate font-medium">{track.title}</div>
    <div className="text-sm text-muted-foreground truncate">
      {track.artist 
        || (track as any).uploadedBy?.name 
        || (track as any).uploadedBy?.username 
        || ((track as any).uploadedBy?.email ? (track as any).uploadedBy.email.split('@')[0] : '') 
        || 'Unknown'}
    </div>
  </motion.div>
); 

export default ListenerDashboard;
