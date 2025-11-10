import { useState, useEffect } from 'react';
import { Plus, Music, Lock, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../lib/axios';
import { EmptyState, LoadingSpinner } from '../components/ui';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';

interface Playlist {
  _id: string;
  name: string;
  description?: string;
  owner: any;
  tracks: any[];
  isPublic: boolean;
  coverUrl?: string;
}

const Playlists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '', isPublic: true });
  const { user } = useAuthStore();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const userId = (user as any)?._id || (user as any)?.id;
      const url = userId ? `/playlists/user/${userId}` : '/playlists';
      const { data } = await apiClient.get(url);
      const raw = (data.playlists || data || []) as any[];
      const normalized = raw.map((p: any) => ({
        ...p,
        isPublic: p.visibility ? p.visibility === 'public' : !!p.isPublic,
        coverUrl: p.coverUrl || p.coverImage,
      }));
      setPlaylists(normalized);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylist.name) {
      toast.error('Please enter a playlist name');
      return;
    }

    try {
      const payload: any = {
        name: newPlaylist.name,
        description: newPlaylist.description,
        visibility: newPlaylist.isPublic ? 'public' : 'private',
      };
      const { data } = await apiClient.post('/playlists', payload);
      const created = (data.playlist || data) as any;
      const normalized = {
        ...created,
        isPublic: created.visibility ? created.visibility === 'public' : newPlaylist.isPublic,
        coverUrl: created.coverUrl || created.coverImage,
      } as any;
      setPlaylists([normalized, ...playlists]);
      setShowCreateModal(false);
      setNewPlaylist({ name: '', description: '', isPublic: true });
      toast.success('Playlist created!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create playlist');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold mb-2">Playlists</h1>
          <p className="text-muted-foreground">Create and manage your playlists</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 active:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition"
        >
          <Plus className="h-5 w-5" />
          New Playlist
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner fullScreen={false} />
      ) : playlists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <Link key={playlist._id} to={`/playlists/${playlist._id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-card border rounded-lg p-4 hover:shadow-lg active:bg-secondary/40 transition cursor-pointer"
              >
                <div className="aspect-square bg-secondary rounded-lg mb-4 flex items-center justify-center">
                  {playlist.coverUrl ? (
                    <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Music className="h-16 w-16 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{playlist.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {(playlist as any).tracksCount || playlist.tracks?.length || 0} tracks
                    </p>
                  </div>
                  {playlist.isPublic ? (
                    <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
                {playlist.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{playlist.description}</p>
                )}
              </motion.div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="ListMusic"
          title="No playlists yet"
          description="Create your first playlist to organize your favorite tracks"
        />
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl p-6 max-w-md w-full border border-white/10 shadow-2xl"
            style={{ backgroundColor: 'hsl(var(--card))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Create New Playlist</h2>
            <form onSubmit={createPlaylist} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">Name *</label>
                <input
                  id="name"
                  type="text"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="My Awesome Playlist"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  id="description"
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                  placeholder="Describe your playlist..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newPlaylist.isPublic}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, isPublic: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isPublic" className="text-sm">Make this playlist public</label>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-input rounded-lg hover:bg-secondary active:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Playlists;
