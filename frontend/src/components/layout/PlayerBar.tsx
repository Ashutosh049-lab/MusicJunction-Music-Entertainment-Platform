import { useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { useAuthStore } from '../../store/authStore';
import { formatDuration } from '../../lib/utils';
import { interactionTracker } from '../../services/interactionTracker';
import apiClient from '../../lib/axios';

const PlayerBar = () => {
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    volume,
    repeat,
    shuffle,
    togglePlay,
    seek,
    setVolume,
    setRepeat,
    toggleShuffle,
    next,
    previous,
    setDuration,
    setPosition,
    initAudioElement,
  } = usePlayerStore();

  const audioRef = useRef<HTMLAudioElement>(null);
  const enrichedIdRef = useRef<string | null>(null);
  const authUser = useAuthStore((s) => s.user);

  useEffect(() => {
    if (audioRef.current) {
      initAudioElement(audioRef.current);
    }
  }, [initAudioElement]);

  // Enrich currentTrack artist if missing by fetching from API
  useEffect(() => {
    const enrich = async () => {
      if (!currentTrack) return;
      const id = (currentTrack as any)._id || (currentTrack as any).id;
      const hasArtist = !!((currentTrack as any).artist);
      if (!id || hasArtist || enrichedIdRef.current === id) return;
      try {
        const { data } = await apiClient.get(`/music/${id}`);
        const t = (data.track || data || {}) as any;
        const artist = t.artist || t.uploadedBy?.name || t.user?.name || t.user?.username;
        if (artist) {
          // merge and update without disrupting playback position
          const merged = { ...(currentTrack as any), artist, uploadedBy: (currentTrack as any).uploadedBy || t.uploadedBy || t.user };
          usePlayerStore.getState().setCurrentTrack(merged);
          enrichedIdRef.current = id;
        }
      } catch {
        // ignore
      }
    };
    enrich();
  }, [currentTrack]);

  // Track play interactions
  useEffect(() => {
    if (currentTrack && isPlaying && duration > 0) {
      const trackId = currentTrack._id || currentTrack.id;
      if (trackId) {
        interactionTracker.trackPlay(trackId, duration);
      }
    }
  }, [currentTrack, isPlaying, duration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setPosition(audio.currentTime);
      
      // Track completion at 90%
      const trackId = currentTrack?._id || currentTrack?.id;
      if (trackId && duration > 0) {
        const completionRate = (audio.currentTime / duration) * 100;
        if (completionRate >= 90) {
          interactionTracker.trackComplete(trackId, audio.currentTime);
        }
      }
    };
    
    const handleDurationChange = () => setDuration(audio.duration);
    
    const handleEnded = () => {
      // Track completion on end
      const trackId = currentTrack?._id || currentTrack?.id;
      if (trackId) {
        interactionTracker.trackComplete(trackId, audio.currentTime);
      }
      next();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [setPosition, setDuration, next, currentTrack, duration]);

  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <>
      {/* Audio element always mounted */}
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      {/* UI only shows when there's a track */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t z-50">
      
      <div className="container mx-auto px-4 py-3">
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{formatDuration(position)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
          <div
            className="w-full h-1 bg-secondary rounded-full cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = x / rect.width;
              seek(percentage * duration);
            }}
          >
            <div
              className="h-full bg-primary rounded-full relative group-hover:bg-primary/80 transition"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-foreground rounded-full opacity-0 group-hover:opacity-100 transition" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-secondary rounded flex-shrink-0">
              {currentTrack.coverUrl && (
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover rounded"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{currentTrack.title}</p>
              <p className="text-sm text-muted-foreground truncate">
                {(currentTrack.artist)
                  || (currentTrack as any).uploadedBy?.name
                  || (currentTrack as any).uploadedBy?.username
                  || ((currentTrack as any).uploadedBy?.email ? (currentTrack as any).uploadedBy.email.split('@')[0] : '')
                  || (currentTrack as any).user?.name
                  || (currentTrack as any).user?.username
                  || authUser?.name
                  || authUser?.username
                  || 'Unknown Artist'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-full transition ${
                shuffle ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Shuffle"
            >
              <Shuffle className="h-4 w-4" />
            </button>
            
            <button
              onClick={previous}
              className="p-2 rounded-full hover:bg-secondary transition"
              aria-label="Previous"
            >
              <SkipBack className="h-5 w-5" />
            </button>
            
            <button
              onClick={togglePlay}
              className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </button>
            
            <button
              onClick={() => {
                // Track skip if playing less than 30%
                const trackId = currentTrack?._id || currentTrack?.id;
                if (trackId && duration > 0) {
                  const completionRate = (position / duration) * 100;
                  if (completionRate < 30) {
                    interactionTracker.trackSkip(trackId, position);
                  }
                }
                next();
              }}
              className="p-2 rounded-full hover:bg-secondary transition"
              aria-label="Next"
            >
              <SkipForward className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => {
                const modes: Array<'off' | 'one' | 'all'> = ['off', 'one', 'all'];
                const currentIndex = modes.indexOf(repeat);
                const nextMode = modes[(currentIndex + 1) % modes.length];
                setRepeat(nextMode);
              }}
              className={`p-2 rounded-full transition ${
                repeat !== 'off' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Repeat"
            >
              <Repeat className="h-4 w-4" />
              {repeat === 'one' && (
                <span className="absolute text-xs font-bold">1</span>
              )}
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center space-x-2 flex-1 justify-end">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${volume * 100}%, hsl(var(--secondary)) ${volume * 100}%, hsl(var(--secondary)) 100%)`,
              }}
            />
          </div>
        </div>
      </div>
        </div>
      )}
    </>
  );
};

export default PlayerBar;
