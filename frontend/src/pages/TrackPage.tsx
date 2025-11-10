import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, Heart, Share2, Download, Star, User } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Waveform from '../components/music/Waveform';
import CommentSection from '../components/music/CommentSection';
import apiClient from '../lib/axios';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import type { Track, Comment } from '../types';
import { formatDuration, formatNumber, formatTimeAgo } from '../lib/utils';
import { interactionTracker } from '../services/interactionTracker';

const TrackPage = () => {
  const { id } = useParams<{ id: string }>();
  const [track, setTrack] = useState<Track | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedTracks, setRelatedTracks] = useState<Track[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const { currentTrack, isPlaying, setCurrentTrack, setQueue, play, pause } = usePlayerStore();
  const { user } = useAuthStore();

  const isCurrentTrack = (currentTrack?._id || currentTrack?.id) === id;

  useEffect(() => {
    if (id) {
      fetchTrack();
      fetchComments();
      fetchRelatedTracks();
    }
  }, [id]);

  const fetchTrack = async () => {
    try {
      const { data } = await apiClient.get(`/music/${id}`);
      setTrack(data.track || data);
      setUserRating(data.userRating || 0);
    } catch (error: any) {
      toast.error('Failed to load track');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await apiClient.get(`/comments/Music/${id}`);
      setComments(data.comments || data || []);
    } catch (error) {
      console.error('Failed to load comments');
    }
  };

  const fetchRelatedTracks = async () => {
    try {
      const { data } = await apiClient.get(`/music?genre=${track?.genre}&limit=5`);
      const filtered = (data.tracks || data || []).filter((t: any) => (t._id || t.id) !== id).slice(0, 4);
      setRelatedTracks(filtered);
    } catch (error) {
      console.error('Failed to load related tracks');
    }
  };

  const handlePlayPause = () => {
    if (!track) return;
    
    console.log('🎵 Play button clicked', { track, isCurrentTrack, isPlaying });
    
    if (isCurrentTrack) {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    } else {
      console.log('🔥 Setting new track');
      setCurrentTrack(track);
      setQueue([track, ...relatedTracks]);
      play();
    }
  };

  const handleLike = async () => {
    if (!track) return;
    try {
      await apiClient.post(`/music/${id}/like`);
      const currentLikes = track.likesCount || track.likes || 0;
      setTrack({ 
        ...track, 
        isLiked: !track.isLiked, 
        likes: track.isLiked ? currentLikes - 1 : currentLikes + 1,
        likesCount: track.isLiked ? currentLikes - 1 : currentLikes + 1,
      });
      
      // Track like interaction
      if (id) {
        interactionTracker.trackLike(id);
      }
    } catch (error: any) {
      toast.error('Failed to like track');
    }
  };

  const handleRate = async (rating: number) => {
    try {
      await apiClient.post(`/ratings/Music/${id}`, { rating });
      setUserRating(rating);
      toast.success('Rating submitted');
    } catch (error: any) {
      toast.error('Failed to rate track');
    }
  };

  const handleShare = async (platform?: string) => {
    const url = window.location.href;
    
    // Track share in backend
    try {
      await apiClient.post('/social/share', {
        trackId: id,
        platform: platform || 'link',
        url
      });
      
      // Track share interaction for recommendations
      if (id) {
        interactionTracker.trackShare(id);
      }
    } catch (err) {
      console.error('Share tracking failed:', err);
    }
    
    if (navigator.share) {
      await navigator.share({
        title: track?.title,
        text: `Check out ${track?.title} on MusicJunction`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  const handleComment = async (content: string, parentId?: string) => {
    try {
      await apiClient.post(`/comments/Music/${id}`, {
        content: content,
        parentComment: parentId,
      });
      await fetchComments();
      toast.success('Comment posted');
    } catch (error: any) {
      toast.error('Failed to post comment');
    }
  };

  const handleCommentLike = async (commentId: string) => {
    try {
      await apiClient.post(`/comments/${commentId}/like`);
      await fetchComments();
    } catch (error: any) {
      toast.error('Failed to like comment');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Track not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Track Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border rounded-lg p-6"
          >
            <div className="flex items-start space-x-6">
              {/* Cover Art */}
              <div className="w-48 h-48 bg-secondary rounded-lg flex-shrink-0">
                {track.coverUrl ? (
                  <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-24 w-24 text-muted-foreground/50" />
                  </div>
                )}
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-4xl font-bold mb-2 break-words">{track.title}</h1>
                <Link
                  to={`/artist/${track.uploadedBy?._id || track.uploadedBy}`}
                  className="text-xl text-muted-foreground hover:text-foreground transition"
                >
                  {track.artist || track.uploadedBy?.name || 'Unknown Artist'}
                </Link>

                <div className="flex items-center space-x-4 mt-4 text-sm text-muted-foreground">
                  <span>{formatTimeAgo(track.createdAt)}</span>
                  <span>•</span>
                  <span>{track.genre}</span>
                  <span>•</span>
                  <span>{formatDuration(track.duration)}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-6 mt-4">
                  <span className="flex items-center space-x-1">
                    <Play className="h-4 w-4" />
                    <span>{formatNumber(track.playCount || track.plays || 0)} plays</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>{formatNumber(track.likesCount || track.likes?.length || 0)} likes</span>
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 mt-6">
                  <button
                    onClick={handlePlayPause}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition flex items-center space-x-2"
                  >
                    {isCurrentTrack && isPlaying ? (
                      <>
                        <Pause className="h-5 w-5" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5" />
                        <span>Play</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleLike}
                    className={`p-3 border rounded-lg transition ${
                      track.isLiked ? 'bg-red-500 text-white border-red-500' : 'border-input hover:bg-secondary'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${track.isLiked ? 'fill-current' : ''}`} />
                  </button>

                  <button onClick={handleShare} className="p-3 border border-input rounded-lg hover:bg-secondary transition">
                    <Share2 className="h-5 w-5" />
                  </button>

                  <button className="p-3 border border-input rounded-lg hover:bg-secondary transition">
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            {track.description && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-muted-foreground whitespace-pre-wrap">{track.description}</p>
              </div>
            )}
          </motion.div>

          {/* Waveform */}
          {/* Waveform - only show if we have an audio URL */}
          {track.fileUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border rounded-lg p-6"
            >
              <h2 className="font-semibold mb-4">Waveform</h2>
              <Waveform audioUrl={`http://localhost:8085${track.fileUrl}`} height={150} />
            </motion.div>
          )}
          {/* Rating */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border rounded-lg p-6"
          >
            <h2 className="font-semibold mb-4">Rate this track</h2>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  className="transition hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= userRating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
              {userRating > 0 && (
                <span className="text-sm text-muted-foreground ml-2">Your rating: {userRating}/5</span>
              )}
            </div>
          </motion.div>

          {/* Comments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border rounded-lg p-6"
          >
            <h2 className="font-semibold mb-6">Comments ({comments.length})</h2>
            <CommentSection
              comments={comments}
              onComment={handleComment}
              onLike={handleCommentLike}
              currentUserId={user?.id}
            />
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Related Tracks */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border rounded-lg p-6"
          >
            <h2 className="font-semibold mb-4">Related Tracks</h2>
            <div className="space-y-4">
              {relatedTracks.slice(0, 5).map((relatedTrack) => (
                <Link key={relatedTrack.id} to={`/track/${relatedTrack.id}`} className="block">
                  <div className="flex items-center space-x-3 hover:bg-secondary p-2 rounded-lg transition">
                    <div className="w-12 h-12 bg-secondary rounded flex-shrink-0">
                      {relatedTrack.coverUrl ? (
                        <img src={relatedTrack.coverUrl} alt={relatedTrack.title} className="w-full h-full object-cover rounded" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{relatedTrack.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{relatedTrack.user?.username}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TrackPage;
