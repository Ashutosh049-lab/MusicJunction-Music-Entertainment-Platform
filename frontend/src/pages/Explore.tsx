import { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Smile, Frown, Zap, Wind, Target } from 'lucide-react';
import apiClient from '../lib/axios';
import TrackCard from '../components/music/TrackCard';
import { EmptyState, LoadingSpinner } from '../components/ui';
import type { Track } from '../types';

const GENRES = [
  'All', 'Rock', 'Pop', 'Hip Hop', 'Electronic', 'Jazz', 'Classical',
  'R&B', 'Country', 'Metal', 'Indie', 'Blues', 'Reggae', 'Other'
];

const MOODS = [
  { id: 'happy', label: 'Happy', icon: Smile, emoji: '😊' },
  { id: 'sad', label: 'Sad', icon: Frown, emoji: '😢' },
  { id: 'energetic', label: 'Energetic', icon: Zap, emoji: '⚡' },
  { id: 'calm', label: 'Calm', icon: Wind, emoji: '😌' },
  { id: 'focus', label: 'Focus', icon: Target, emoji: '🎯' },
];

const Explore = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('recent');
  const [moodRecommendations, setMoodRecommendations] = useState<Track[]>([]);

  useEffect(() => {
    fetchTracks();
  }, [selectedGenre, sortBy]);

  useEffect(() => {
    if (selectedMood) {
      fetchMoodRecommendations(selectedMood);
    }
  }, [selectedMood]);

  const fetchTracks = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (selectedGenre !== 'All') params.genre = selectedGenre;
      if (searchQuery) params.search = searchQuery;
      
      const { data } = await apiClient.get('/music', { params });
      let fetchedTracks = data.tracks || data || [];
      
      // Client-side sorting
      if (sortBy === 'popular') {
        fetchedTracks.sort((a: any, b: any) => (b.playCount || 0) - (a.playCount || 0));
      } else if (sortBy === 'liked') {
        fetchedTracks.sort((a: any, b: any) => (b.likesCount || 0) - (a.likesCount || 0));
      }
      
      setTracks(fetchedTracks);
    } catch (error) {
      console.error('Failed to fetch tracks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracks();
  };

  const fetchMoodRecommendations = async (mood: string) => {
    try {
      const { data } = await apiClient.get(`/recommendations/mood/${mood}`, {
        params: { limit: 12 }
      });
      setMoodRecommendations(data.recommendations || data || []);
    } catch (error) {
      console.error('Failed to fetch mood recommendations:', error);
      setMoodRecommendations([]);
    }
  };

  const handleMoodSelect = (moodId: string) => {
    if (selectedMood === moodId) {
      setSelectedMood(null);
      setMoodRecommendations([]);
    } else {
      setSelectedMood(moodId);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-2">Explore Music</h1>
        <p className="text-muted-foreground">Discover new tracks and artists</p>
      </div>

      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracks, artists, albums..."
              className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          
          <div className="flex gap-2">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  selectedGenre === genre
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="liked">Most Liked</option>
          </select>
        </div>

        {/* Mood Filter */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-medium">Mood:</span>
          </div>
          <div className="flex gap-2">
            {MOODS.map((mood) => {
              return (
                <button
                  key={mood.id}
                  onClick={() => handleMoodSelect(mood.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                    selectedMood === mood.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <span>{mood.emoji}</span>
                  <span>{mood.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mood Recommendations Section */}
      {selectedMood && moodRecommendations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {MOODS.find(m => m.id === selectedMood)?.emoji} {MOODS.find(m => m.id === selectedMood)?.label} Vibes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {moodRecommendations.map((track) => (
              <TrackCard key={track._id || track.id} track={track} />
            ))}
          </div>
          <div className="mt-6 border-t border-gray-700 pt-6" />
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner fullScreen={false} />
      ) : tracks.length > 0 ? (
        <>
          {selectedMood && moodRecommendations.length > 0 && (
            <h2 className="text-2xl font-bold mb-4">All Tracks</h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tracks.map((track) => (
              <TrackCard key={track._id || track.id} track={track} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon="Music"
          title="No tracks found"
          description="Try adjusting your search or filters"
        />
      )}
    </div>
  );
};

export default Explore;
