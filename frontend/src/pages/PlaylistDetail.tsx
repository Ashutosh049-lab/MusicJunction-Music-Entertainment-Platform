import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Music, Heart, UserPlus, 
  Play, Trash2, Clock, User, X 
} from 'lucide-react';
import axios from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { formatDuration } from '../lib/utils';
import { toast } from 'sonner';

interface Track {
  _id: string;
  id?: string;
  title: string;
  artist: string;
  duration: number;
  fileUrl?: string;
  audioUrl?: string;
  coverUrl?: string;
  genre: string;
  createdAt: string;
}

interface Playlist {
  _id: string;
  name: string;
  description?: string;
  tracks: Track[];
  owner: {
    _id: string;
    name: string;
  };
  collaborators?: Array<{ _id: string; name: string }>;
  isPublic: boolean;
  isFollowing?: boolean;
  isLiked?: boolean;
  followersCount?: number;
  likesCount?: number;
  createdAt: string;
  updatedAt: string;
}

const PlaylistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setCurrentTrack } = usePlayerStore();
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [collaboratorEmail, setCollaboratorEmail] = useState('');

  // Edit/Delete state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPlaylist();
    }
  }, [id]);

  const fetchPlaylist = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/playlists/${id}`);
      if (response.data?.playlist) {
        const p = response.data.playlist;
        const normalized = {
          ...p,
          tracks: Array.isArray(p.tracks)
            ? p.tracks.map((t: any) => {
                const m = (t as any).music || t;
                return {
                  _id: m._id || t._id,
                  id: m._id || t._id,
                  title: m.title,
                  // Prefer explicit artist field, fallback to uploader name or username
                  artist: m.artist || m.uploadedBy?.name || m.user?.name || m.user?.username || 'Unknown Artist',
                  duration: m.duration || 0,
                  fileUrl: m.fileUrl || m.audioUrl,
                  audioUrl: m.audioUrl || m.fileUrl || (m._id ? `/api/music/stream/${m._id}` : undefined),
                  coverUrl: m.coverImage || m.coverUrl,
                  uploadedBy: m.uploadedBy || m.user,
                  genre: m.genre || 'Unknown',
                  createdAt: m.createdAt || new Date().toISOString(),
                } as any;
              })
            : [],
        } as any;
        setPlaylist(normalized);
      } else if (response.data?.data) {
        setPlaylist(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching playlist:', error);
      toast.error('Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTracks = async () => {
    try {
      const response = await axios.get('/music');
      const tracks = response.data?.tracks || response.data?.data || [];
      const list = Array.isArray(tracks) ? tracks : [];
      // Exclude tracks already in the playlist
      const existingIds = new Set((playlist?.tracks || []).map((t) => (t._id || t.id)));
      const filtered = list.filter((t: any) => !existingIds.has(t._id));
      setAvailableTracks(filtered);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track);
  };

  const handlePlayAll = () => {
    if (playlist && playlist.tracks.length > 0) {
      setCurrentTrack(playlist.tracks[0]);
    }
  };

  const handleAddTrack = async () => {
    if (!selectedTrackId) {
      toast.error('Please select a track');
      return;
    }

    try {
      const response = await axios.post(`/playlists/${id}/tracks`, {
        musicId: selectedTrackId
      });
      
      if (response.status === 200 || response.status === 201) {
        toast.success('Track added to playlist');
        setShowAddTrackModal(false);
        setSelectedTrackId('');
        fetchPlaylist();
      } else {
        toast.error(response.data?.message || 'Failed to add track');
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('Track already exists in playlist');
      } else {
        toast.error(error.response?.data?.message || 'Failed to add track');
      }
    }
  };

  const handleRemoveTrack = async (trackId: string) => {
    try {
      const response = await axios.delete(`/playlists/${id}/tracks/${trackId}`);
      
      if (response.data.success) {
        toast.success('Track removed from playlist');
        fetchPlaylist();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove track');
    }
  };

  const handleToggleFollow = async () => {
    try {
      const response = await axios.post(`/playlists/${id}/follow`);
      
      if (response.data.success) {
        setPlaylist(prev => prev ? {
          ...prev,
          isFollowing: !prev.isFollowing,
          followersCount: (prev.followersCount || 0) + (prev.isFollowing ? -1 : 1)
        } : null);
        toast.success(playlist?.isFollowing ? 'Unfollowed playlist' : 'Following playlist');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to follow playlist');
    }
  };

  const handleDeletePlaylist = async () => {
    if (!id) return;
    if (!confirm('Delete this playlist? This cannot be undone.')) return;
    try {
      const response = await axios.delete(`/playlists/${id}`);
      if (response.status === 200) {
        toast.success('Playlist deleted');
        navigate('/playlists');
      } else {
        toast.error(response.data?.message || 'Failed to delete');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const openEditModal = () => {
    if (!playlist) return;
    setEditName(playlist.name || '');
    setEditDescription(playlist.description || '');
    setEditIsPublic((playlist as any).visibility ? (playlist as any).visibility === 'public' : !!playlist.isPublic);
    setShowEditModal(true);
  };

  const handleUpdatePlaylist = async () => {
    if (!id) return;
    if (!editName.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      const payload: any = {
        name: editName.trim(),
        description: editDescription,
        visibility: editIsPublic ? 'public' : 'private',
      };
      const response = await axios.put(`/playlists/${id}`, payload);
      const updated = response.data?.playlist || response.data?.data;
      if (response.status === 200) {
        toast.success('Playlist updated');
        setShowEditModal(false);
        if (updated) {
          // Refresh locally or refetch
          setPlaylist((prev) => prev ? { ...prev, ...updated } : updated);
        } else {
          fetchPlaylist();
        }
      } else {
        toast.error(response.data?.message || 'Failed to update');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update');
    }
  };

  const handleToggleLike = async () => {
    try {
      const response = await axios.post(`/playlists/${id}/like`);
      
      if (response.data.success) {
        setPlaylist(prev => prev ? {
          ...prev,
          isLiked: !prev.isLiked,
          likesCount: (prev.likesCount || 0) + (prev.isLiked ? -1 : 1)
        } : null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to like playlist');
    }
  };

  const handleAddCollaborator = async () => {
    if (!collaboratorEmail) {
      toast.error('Please enter an email');
      return;
    }

    try {
      const response = await axios.post(`/playlists/${id}/collaborators`, {
        email: collaboratorEmail
      });
      
      if (response.data.success) {
        toast.success('Collaborator added');
        setShowCollaboratorModal(false);
        setCollaboratorEmail('');
        fetchPlaylist();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add collaborator');
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    try {
      const response = await axios.delete(`/playlists/${id}/collaborators/${collaboratorId}`);
      
      if (response.data.success) {
        toast.success('Collaborator removed');
        fetchPlaylist();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove collaborator');
    }
  };

  const isOwner = user?._id === playlist?.owner._id;
  const canEdit = isOwner || playlist?.collaborators?.some(c => c._id === user?._id);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <EmptyState
          icon="Music"
          title="Playlist not found"
          description="This playlist doesn't exist or you don't have access to it"
          action={{ label: 'Go to Playlists', onClick: () => navigate('/playlists') }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Playlist Header */}
      <div className="bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-lg p-8 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-gray-400 mb-4">{playlist.description}</p>
            )}
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{playlist.owner.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                <span>{playlist.tracks.length} tracks</span>
              </div>
              {playlist.followersCount ? (
                <span>{playlist.followersCount} followers</span>
              ) : null}
            </div>
          </div>

          <div className="flex gap-2">
            {isOwner && (
              <>
                <button
                  onClick={openEditModal}
                  className="px-4 py-2 rounded-full bg-dark-200 hover:bg-dark-300 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDeletePlaylist}
                  className="px-4 py-2 rounded-full bg-red-600/80 hover:bg-red-600 text-white transition-colors"
                >
                  Delete
                </button>
              </>
            )}
            <button
              onClick={handleToggleLike}
              className={`p-3 rounded-full transition-colors ${
                playlist.isLiked
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-200 hover:bg-dark-300'
              }`}
            >
              <Heart className="w-5 h-5" />
            </button>
            
            {!isOwner && (
              <button
                onClick={handleToggleFollow}
                className={`px-4 py-2 rounded-full transition-colors ${
                  playlist.isFollowing
                    ? 'bg-dark-200 hover:bg-dark-300'
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
              >
                {playlist.isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handlePlayAll}
            disabled={playlist.tracks.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5" />
            Play All
          </button>

          {canEdit && (
            <>
              <button
                onClick={() => {
                  fetchAvailableTracks();
                  setShowAddTrackModal(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-dark-200 hover:bg-dark-300 rounded-full font-semibold transition-colors"
              >
                <Music className="w-5 h-5" />
                Add Track
              </button>

              {isOwner && (
                <button
                  onClick={() => setShowCollaboratorModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-dark-200 hover:bg-dark-300 rounded-full font-semibold transition-colors"
                >
                  <UserPlus className="w-5 h-5" />
                  Add Collaborator
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Collaborators */}
      {playlist.collaborators && playlist.collaborators.length > 0 && (
        <div className="bg-dark-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3">Collaborators</h3>
          <div className="flex flex-wrap gap-2">
            {playlist.collaborators.map((collab) => (
              <div
                key={collab._id}
                className="flex items-center gap-2 px-3 py-1.5 bg-dark-300 rounded-full"
              >
                <span className="text-sm">{collab.name}</span>
                {isOwner && (
                  <button
                    onClick={() => handleRemoveCollaborator(collab._id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tracks List */}
      {playlist.tracks.length === 0 ? (
        <EmptyState
          icon="Music"
          title="No tracks yet"
          description="Add some tracks to get started"
          action={
            canEdit
              ? {
                  label: 'Add Track',
                  onClick: () => {
                    fetchAvailableTracks();
                    setShowAddTrackModal(true);
                  }
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {playlist.tracks.map((track, index) => (
            <motion.div
              key={track._id || track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-dark-200 rounded-lg p-4 hover:bg-dark-300 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <span className="text-gray-500 w-6 text-center">{index + 1}</span>
                
                <button
                  onClick={() => handlePlayTrack(track)}
                  className="w-12 h-12 rounded-lg bg-dark-300 flex items-center justify-center group-hover:bg-primary-500 transition-colors"
                >
                  <Play className="w-5 h-5" />
                </button>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{track.title}</h4>
                  <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(track.duration)}</span>
                  </div>

                  {canEdit && (
                    <button
                      onClick={() => handleRemoveTrack(track._id || track.id!)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Track Modal */}
      {showAddTrackModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-100 rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">Add Track to Playlist</h3>
            
            <select
              value={selectedTrackId}
              onChange={(e) => setSelectedTrackId(e.target.value)}
              className="w-full bg-dark-200 rounded-lg px-4 py-3 mb-4"
            >
              <option value="">Select a track</option>
              {availableTracks.map((track) => (
                <option key={track._id} value={track._id}>
                  {track.title} - {track.artist}
                </option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddTrackModal(false);
                  setSelectedTrackId('');
                }}
                className="flex-1 px-4 py-2 bg-dark-200 hover:bg-dark-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTrack}
                className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
              >
                Add Track
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Playlist Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-100 rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">Edit Playlist</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-dark-200 rounded-lg px-4 py-3"
                  placeholder="Playlist name"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-dark-200 rounded-lg px-4 py-3"
                  rows={3}
                  placeholder="Describe your playlist"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editIsPublic} onChange={(e) => setEditIsPublic(e.target.checked)} />
                Public playlist
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-dark-200 hover:bg-dark-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePlaylist}
                className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Collaborator Modal */}
      {showCollaboratorModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-100 rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">Add Collaborator</h3>
            
            <input
              type="email"
              value={collaboratorEmail}
              onChange={(e) => setCollaboratorEmail(e.target.value)}
              placeholder="Enter user email"
              className="w-full bg-dark-200 rounded-lg px-4 py-3 mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCollaboratorModal(false);
                  setCollaboratorEmail('');
                }}
                className="flex-1 px-4 py-2 bg-dark-200 hover:bg-dark-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCollaborator}
                className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PlaylistDetail;
