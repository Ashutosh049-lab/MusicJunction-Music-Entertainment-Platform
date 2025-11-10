import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Users, Globe } from 'lucide-react';
import axios from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

interface ActivityItem {
  _id: string;
  type: string;
  user: {
    _id: string;
    name: string;
    username?: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
  targetUser?: {
    name: string;
    username?: string;
  };
  entity?: any;
  entityType?: string;
  entityId?: string;
  description: string;
  metadata?: any;
  visibility: 'public' | 'followers' | 'private';
  likesCount?: number;
  commentsCount?: number;
  createdAt: string;
}

type FeedType = 'public' | 'following' | 'trending';

const ActivityFeed = () => {
  const { user } = useAuthStore();
  const [feedType, setFeedType] = useState<FeedType>('public');
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchActivities();
  }, [feedType, page]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      
      switch (feedType) {
        case 'public':
          endpoint = '/notifications/activity/public';
          break;
        case 'following':
          endpoint = '/notifications/activity/following';
          break;
        case 'trending':
          endpoint = '/notifications/activity/trending';
          break;
      }

      const response = await axios.get(endpoint, {
        params: { page, limit: 20 }
      });

      if (response.data.success) {
        const data = response.data.data;
        setActivities(data.activities || []);
        if (data.pagination) {
          setTotalPages(data.pagination.pages);
        }
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatActivityText = (activity: ActivityItem) => {
    const userName = activity.user.name || activity.user.username || 'User';
    
    switch (activity.type) {
      case 'upload':
        return `${userName} uploaded a new track`;
      case 'like':
        return `${userName} liked ${activity.entityType === 'Music' ? 'a track' : 'content'}`;
      case 'comment':
        return `${userName} commented on ${activity.entityType === 'Music' ? 'a track' : 'content'}`;
      case 'follow':
        return `${userName} followed ${activity.targetUser?.name || 'a user'}`;
      case 'playlist_create':
        return `${userName} created a new playlist`;
      case 'project_create':
        return `${userName} created a new project`;
      default:
        return activity.description || `${userName} performed an action`;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const tabs = [
    { id: 'public' as FeedType, label: 'Public', icon: Globe },
    { id: 'following' as FeedType, label: 'Following', icon: Users },
    { id: 'trending' as FeedType, label: 'Trending', icon: TrendingUp },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-8 h-8 text-primary-500" />
          <h1 className="text-3xl font-bold">Activity Feed</h1>
        </div>
        <p className="text-gray-400">Stay updated with the latest activities</p>
      </div>

      {/* Feed Type Tabs */}
      <div className="flex gap-2 mb-6 bg-dark-200 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setFeedType(tab.id);
                setPage(1);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md transition-all ${
                feedType === tab.id
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

      {/* Activities List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : activities.length === 0 ? (
        <EmptyState
          icon="Activity"
          title="No activities yet"
          description={
            feedType === 'following'
              ? "Follow users to see their activities here"
              : "Be the first to create some activity!"
          }
        />
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <motion.div
              key={activity._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-dark-200 rounded-lg p-4 hover:bg-dark-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* User Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {activity.user.avatarUrl ? (
                    <img
                      src={activity.user.avatarUrl}
                      alt={activity.user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    activity.user.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-gray-300">
                      {formatActivityText(activity)}
                      {activity.user.isVerified && (
                        <span className="inline-block ml-1 text-primary-500">✓</span>
                      )}
                    </p>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatTimeAgo(activity.createdAt)}
                    </span>
                  </div>

                  {/* Metadata */}
                  {activity.metadata?.title && (
                    <p className="text-sm text-gray-400 mt-1 truncate">
                      {activity.metadata.title}
                    </p>
                  )}

                  {/* Engagement Stats */}
                  {feedType === 'trending' && (activity.likesCount || activity.commentsCount) ? (
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      {activity.likesCount ? (
                        <span>❤️ {activity.likesCount}</span>
                      ) : null}
                      {activity.commentsCount ? (
                        <span>💬 {activity.commentsCount}</span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-dark-200 rounded-lg hover:bg-dark-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 bg-dark-200 rounded-lg">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-dark-200 rounded-lg hover:bg-dark-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
