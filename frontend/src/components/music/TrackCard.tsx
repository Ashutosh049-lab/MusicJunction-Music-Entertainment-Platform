import { Link } from 'react-router-dom';
import { Play, Heart, MoreVertical, User } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Track } from '../../types';
import { formatDuration, formatNumber, formatTimeAgo } from '../../lib/utils';
import { usePlayerStore } from '../../store/playerStore';

interface TrackCardProps {
  track: Track;
  onLike?: (trackId: string) => void;
}

const TrackCard = ({ track, onLike }: TrackCardProps) => {
  const { setCurrentTrack, setQueue, play } = usePlayerStore();

  const handlePlay = () => {
    setCurrentTrack(track);
    setQueue([track]);
    play();
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-card border rounded-lg overflow-hidden group cursor-pointer"
    >
      {/* Cover Image */}
      <div className="relative aspect-square bg-secondary">
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )}
        
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <button
            onClick={handlePlay}
            className="p-4 bg-primary rounded-full hover:scale-110 transition"
          >
            <Play className="h-6 w-6 text-primary-foreground fill-current" />
          </button>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
          {formatDuration(track.duration)}
        </div>
      </div>

      {/* Track Info */}
      <div className="p-4">
        <Link to={`/track/${track.id}`} className="block">
          <h3 className="font-semibold text-lg truncate hover:text-primary transition">
            {track.title}
          </h3>
        </Link>
        
        <Link
          to={`/artist/${track.user?.id || track.userId}`}
          className="text-sm text-muted-foreground hover:text-foreground transition truncate block"
        >
          {track.user?.username || 'Unknown Artist'}
        </Link>

        {/* Stats */}
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <Play className="h-3 w-3" />
              <span>{formatNumber(track.plays)}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Heart className="h-3 w-3" />
              <span>{formatNumber(track.likes)}</span>
            </span>
          </div>
          <span>{formatTimeAgo(track.createdAt)}</span>
        </div>

        {/* Genre tag */}
        {track.genre && (
          <div className="mt-2">
            <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded">
              {track.genre}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <button
            onClick={() => onLike && track.id && onLike(track.id)}
            className={`flex items-center space-x-1 text-sm transition ${
              track.isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
            }`}
          >
            <Heart className={`h-4 w-4 ${track.isLiked ? 'fill-current' : ''}`} />
            <span>Like</span>
          </button>

          <button className="p-1 hover:bg-secondary rounded transition">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TrackCard;
