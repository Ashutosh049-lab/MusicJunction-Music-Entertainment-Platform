import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music, Users, Heart, TrendingUp, Upload as UploadIcon, Layers, Edit, Trash2, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';
import apiClient from '../lib/axios';
import type { Track, Project } from '../types';
import { formatNumber, formatTimeAgo } from '../lib/utils';

const MusicianDashboard = () => {
  const { user } = useAuthStore();
  const { setCurrentTrack, setQueue, play } = usePlayerStore();
  const navigate = useNavigate();

  const [myTracks, setMyTracks] = useState<Track[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [stats, setStats] = useState({
    totalTracks: 0,
    totalPlays: 0,
    totalLikes: 0,
    totalFollowers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchRecommendations();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user's tracks by uploadedBy
      const userId = (user as any)?._id || user?.id;
      const tracksRes = await apiClient.get(`/music`);
      const allTracks = (tracksRes.data as any)?.tracks || tracksRes.data || [];
      const userTracks = allTracks.filter((t: any) => {
        const trackUploadedBy = t.uploadedBy?._id || t.uploadedBy;
        return trackUploadedBy === userId;
      });
      setMyTracks(userTracks);

      // Fetch projects if available
      try {
        const projectsRes = await apiClient.get('/projects');
        setProjects((projectsRes.data as any)?.projects || projectsRes.data || []);
      } catch {
        setProjects([]);
      }

      // Calculate stats from tracks
      const tracks = (tracksRes.data as any)?.tracks || tracksRes.data || [];
      setStats({
        totalTracks: tracks.length,
        totalPlays: tracks.reduce((sum: number, t: any) => sum + (t.playCount || t.plays || 0), 0),
        totalLikes: tracks.reduce((sum: number, t: any) => sum + (t.likesCount || t.likes?.length || 0), 0),
        totalFollowers: 0,
      });
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const { data } = await apiClient.get('/recommendations');
      setRecommendations(((data as any).recommendations || data || []).slice(0, 4));
    } catch {
      // ignore
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (!confirm('Are you sure you want to delete this track?')) return;

    try {
      await apiClient.delete(`/music/${trackId}`);
      setMyTracks(myTracks.filter((t: any) => (t._id || t.id) !== trackId));
      toast.success('Track deleted successfully');
    } catch {
      toast.error('Failed to delete track');
    }
  };

  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track);
    setQueue(myTracks);
    play();
  };

  if (isLoading) {
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
        <p className="text-muted-foreground">Welcome back, {user?.name || user?.username}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Music className="h-6 w-6" />} label="Tracks" value={stats.totalTracks} color="text-primary" />
        <StatCard icon={<TrendingUp className="h-6 w-6" />} label="Total Plays" value={formatNumber(stats.totalPlays)} color="text-accent" />
        <StatCard icon={<Heart className="h-6 w-6" />} label="Total Likes" value={formatNumber(stats.totalLikes)} color="text-red-500" />
        <StatCard icon={<Users className="h-6 w-6" />} label="Followers" value={formatNumber(stats.totalFollowers)} color="text-green-500" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h2 className="font-display text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => navigate('/upload')} className="p-6 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition flex items-center space-x-3">
            <UploadIcon className="h-6 w-6" />
            <span className="font-semibold">Upload Track</span>
          </button>
          <button onClick={() => navigate('/projects')} className="p-6 border border-input rounded-lg hover:bg-secondary transition flex items-center space-x-3">
            <Layers className="h-6 w-6" />
            <span className="font-semibold">New Project</span>
          </button>
          <button onClick={() => navigate('/mixer')} className="p-6 border border-input rounded-lg hover:bg-secondary transition flex items-center space-x-3">
            <Music className="h-6 w-6" />
            <span className="font-semibold">AI Mixer</span>
          </button>
        </div>
      </motion.div>

      {recommendations.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
          <h2 className="font-display text-2xl font-bold mb-4">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((track: any) => (
              <TrackCard key={(track as any)._id || track.id} track={track as any} />
            ))}
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold">My Tracks</h2>
          <Link to="/upload" className="text-sm text-primary hover:underline">Upload New</Link>
        </div>

        {myTracks.length > 0 ? (
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="divide-y">
              {myTracks.map((track: any, index) => (
                <motion.div key={(track as any)._id || track.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="p-4 hover:bg-secondary/50 transition flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <button onClick={() => handlePlayTrack(track)} className="p-2 hover:bg-primary/10 rounded-full transition flex-shrink-0">
                      <Play className="h-5 w-5 text-primary" />
                    </button>
                    <div className="w-12 h-12 bg-secondary rounded flex-shrink-0">
                      {track.coverUrl ? (
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover rounded" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/track/${(track as any)._id || track.id}`} className="font-medium hover:text-primary transition truncate block">
                        {track.title}
                      </Link>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{track.genre}</span>
                        <span>•</span>
                        <span>{formatNumber((track as any).plays || (track as any).playCount || 0)} plays</span>
                        <span>•</span>
                        <span>{formatTimeAgo(track.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Link to={`/track/${(track as any)._id || track.id}/edit`} className="p-2 hover:bg-secondary rounded-lg transition">
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button onClick={() => handleDeleteTrack((track as any)._id || track.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-card border rounded-lg p-12 text-center">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">You haven't uploaded any tracks yet</p>
            <Link to="/upload" className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition">
              Upload Your First Track
            </Link>
          </div>
        )}
      </motion.div>

      {projects.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-bold">Active Projects</h2>
            <Link to="/projects" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 3).map((project: any) => (
              <Link key={(project as any)._id || project.id} to={`/projects/${(project as any)._id || project.id}`} className="bg-card border rounded-lg p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                    {project.collaborators?.length || 0} members
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.description || 'No description'}</p>
                <p className="text-xs text-muted-foreground">Updated {formatTimeAgo(project.updatedAt)}</p>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
}

const StatCard = ({ icon, label, value, color = 'text-primary' }: StatCardProps) => {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`${color}`}>{icon}</div>
      </div>
    </motion.div>
  );
};

const TrackCard = ({ track }: { track: any }) => {
  return (
    <div className="bg-card border rounded-lg p-4">
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
    </div>
  );
};

export default MusicianDashboard;
