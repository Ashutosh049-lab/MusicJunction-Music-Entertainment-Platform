import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Music, ListMusic, Activity, BarChart3, 
  Calendar, MapPin, Link as LinkIcon 
} from 'lucide-react';
import axios from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import TrackCard from '../components/music/TrackCard';

interface Track {
  _id: string;
  title: string;
  artist: string;
  genre?: string;
  duration: number;
  playCount?: number;
  likesCount?: number;
  fileUrl?: string;
  coverUrl?: string;
  uploadedBy?: string;
}

interface Playlist {
  _id: string;
  name: string;
  description?: string;
  tracks: any[];
  isPublic: boolean;
  createdAt: string;
}

interface ActivityStats {
  totalActivities: number;
  breakdown: Array<{
    _id: string;
    count: number;
  }>;
}

interface UserProfile {
  _id: string;
  name: string;
  email?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  createdAt: string;
}

type TabType = 'tracks' | 'playlists' | 'activity';

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('tracks');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  useEffect(() => {
    if (userId && activeTab === 'tracks') {
      fetchTracks();
    } else if (userId && activeTab === 'playlists') {
      fetchPlaylists();
    } else if (userId && activeTab === 'activity') {
      fetchActivityStats();
    }
  }, [activeTab, userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Try public user endpoint first
      try {
        const res = await axios.get(`/users/${userId}`);
        const u = res.data.user || res.data;
        setProfile({
          _id: String(u.id || u._id || userId),
          name: u.name || u.username || 'User',
          email: u.email,
          username: u.username,
          bio: u.bio,
          location: u.location,
          website: u.website,
          avatarUrl: u.avatarUrl,
          isVerified: u.isVerified,
          createdAt: u.createdAt || new Date().toISOString(),
        });
      } catch {
        // Fallback for own profile
        const me = await axios.get('/auth/me');
        const u = me.data;
        setProfile({
          _id: String(u.id || u._id || userId),
          name: u.name || u.username || 'User',
          email: u.email,
          username: u.username,
          bio: u.bio,
          location: u.location,
          website: u.website,
          avatarUrl: u.avatarUrl,
          isVerified: u.isVerified,
          createdAt: u.createdAt || new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTracks = async () => {
    try {
      const response = await axios.get('/music', { params: { uploadedBy: userId } });
      const list = response.data.tracks || response.data.data || response.data || [];
      const userTracks = list.filter((t: any) => {
        const uid = t.uploadedBy?._id || t.uploadedBy;
        return uid === userId;
      });
      setTracks(userTracks);

      if (userTracks.length > 0 && userTracks[0].artist) {
        setProfile(prev => prev ? { ...prev, name: userTracks[0].artist } : null);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await axios.get(`/playlists/user/${userId}`);
      const list = response.data.playlists || response.data.data || [];
      setPlaylists(list);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const fetchActivityStats = async () => {
    try {
      const response = await axios.get(`/notifications/activity/user/${userId}/stats`);
      if (response.data.success) {
        setActivityStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching activity stats:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getActivityTypeName = (type: string) => {
    const types: Record<string, string> = {
      upload: 'Uploads',
      like: 'Likes',
      comment: 'Comments',
      follow: 'Follows',
      playlist_create: 'Playlists Created',
      project_create: 'Projects Created',
      share: 'Shares'
    };
    return types[type] || type;
  };

  const isOwnProfile = (currentUser?.id || (currentUser as any)?._id) === userId;

  const tabs = [
    { id: 'tracks' as TabType, label: 'Tracks', icon: Music },
    { id: 'playlists' as TabType, label: 'Playlists', icon: ListMusic },
    { id: 'activity' as TabType, label: 'Activity', icon: Activity },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <EmptyState
          icon="User"
          title="User not found"
          description="This user doesn't exist"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-lg p-8 mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              profile.name.charAt(0).toUpperCase()
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{profile.name}</h1>
              {profile.isVerified && (
                <span className="text-primary-500 text-2xl">✓</span>
              )}
            </div>

            {profile.username && (
              <p className="text-gray-400 mb-3">@{profile.username}</p>
            )}

            {profile.bio && (
              <p className="text-gray-300 mb-4">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDate(profile.createdAt)}</span>
              </div>
              
              {profile.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}

              {profile.website && (
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  <a 
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-500 transition-colors"
                  >
                    {profile.website}
                  </a>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-4">
              <div>
                <div className="text-2xl font-bold">{tracks.length}</div>
                <div className="text-sm text-gray-400">Tracks</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{playlists.length}</div>
                <div className="text-sm text-gray-400">Playlists</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{activityStats?.totalActivities || 0}</div>
                <div className="text-sm text-gray-400">Activities</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-dark-200 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'tracks' && (
          <>
            {tracks.length === 0 ? (
              <EmptyState
                icon="Music"
                title="No tracks yet"
                description={isOwnProfile ? "Upload your first track to get started" : "This user hasn't uploaded any tracks yet"}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tracks.map((track, index) => (
                  <motion.div
                    key={track._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TrackCard track={track} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'playlists' && (
          <>
            {playlists.length === 0 ? (
              <EmptyState
                icon="ListMusic"
                title="No playlists yet"
                description={isOwnProfile ? "Create your first playlist" : "This user hasn't created any public playlists yet"}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlists.map((playlist, index) => (
                  <motion.div
                    key={playlist._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-dark-200 rounded-lg p-6 hover:bg-dark-300 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/playlists/${playlist._id}`}
                  >
                    <div className="w-full aspect-square bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-lg mb-4 flex items-center justify-center">
                      <ListMusic className="w-12 h-12 text-primary-500" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 truncate">{playlist.name}</h3>
                    {playlist.description && (
                      <p className="text-sm text-gray-400 mb-2 line-clamp-2">{playlist.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>{playlist.tracks.length} tracks</span>
                      <span>{playlist.isPublic ? 'Public' : 'Private'}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'activity' && (
          <>
            {!activityStats || activityStats.totalActivities === 0 ? (
              <EmptyState
                icon="Activity"
                title="No activity yet"
                description={isOwnProfile ? "Start engaging to see your activity here" : "This user hasn't been active yet"}
              />
            ) : (
              <div className="space-y-6">
                {/* Total Activities */}
                <div className="bg-dark-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-6 h-6 text-primary-500" />
                    <h3 className="text-xl font-bold">Activity Overview</h3>
                  </div>
                  <div className="text-3xl font-bold text-primary-500">
                    {activityStats.totalActivities}
                  </div>
                  <p className="text-gray-400">Total Activities</p>
                </div>

                {/* Activity Breakdown */}
                <div className="bg-dark-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Activity Breakdown</h3>
                  <div className="space-y-3">
                    {activityStats.breakdown.map((item) => {
                      const percentage = (item.count / activityStats.totalActivities) * 100;
                      return (
                        <div key={item._id}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300">{getActivityTypeName(item._id)}</span>
                            <span className="text-gray-400">{item.count}</span>
                          </div>
                          <div className="w-full bg-dark-300 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
