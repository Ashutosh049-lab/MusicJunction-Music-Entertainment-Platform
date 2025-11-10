import { create } from 'zustand';
import type { Track } from '../types';

interface PlayerStore {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
  repeat: 'off' | 'one' | 'all';
  shuffle: boolean;
  audioElement: HTMLAudioElement | null;

  setCurrentTrack: (track: Track) => void;
  setQueue: (tracks: Track[]) => void;
  addToQueue: (track: Track) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (position: number) => void;
  setVolume: (volume: number) => void;
  setRepeat: (repeat: 'off' | 'one' | 'all') => void;
  toggleShuffle: () => void;
  next: () => void;
  previous: () => void;
  setDuration: (duration: number) => void;
  setPosition: (position: number) => void;
  initAudioElement: (audio: HTMLAudioElement) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  position: 0,
  duration: 0,
  volume: 0.7,
  repeat: 'off',
  shuffle: false,
  audioElement: null,

  setCurrentTrack: (track: Track) => {
    const audio = get().audioElement;
    console.log('🔍 Audio element:', audio);
    if (audio) {
      let srcPath = track.audioUrl || track.fileUrl || '';
      // Fallback to stream endpoint if no direct URL present
      if (!srcPath && (track as any)) {
        const id = (track as any)._id || (track as any).id;
        if (id) srcPath = `/api/music/stream/${id}`;
      }
      const base = ((import.meta as any).env?.VITE_API_URL?.replace(/\/api$/, '')) || 'http://localhost:8085';
      const fullUrl = srcPath.startsWith('http') ? srcPath : `${base}${srcPath}`;
      console.log('🎵 Setting audio source:', fullUrl);
      console.log('Track data:', track);
      audio.src = fullUrl;
      audio.load();
      audio.onerror = (e) => {
        console.error('❌ Audio failed to load:', e);
        console.error('Failed URL:', fullUrl);
      };
      // Wait for audio to be ready before allowing play
      audio.onloadeddata = () => {
        console.log('✅ Audio loaded and ready to play');
      };
    } else {
      console.error('❌ No audio element initialized!');
    }
    // Ensure artist is present for UI display
    const displayArtist = (track as any).artist 
      || (track as any).uploadedBy?.name 
      || (track as any).user?.name 
      || (track as any).user?.username 
      || 'Unknown Artist';
    set({ currentTrack: { ...(track as any), artist: displayArtist } as any, position: 0 });
  },

  setQueue: (tracks: Track[]) => {
    set({ queue: tracks });
  },

  addToQueue: (track: Track) => {
    set((state) => ({ queue: [...state.queue, track] }));
  },

  play: () => {
    const audio = get().audioElement;
    if (audio) {
      audio.play().catch(err => {
        console.error('Play error:', err);
        set({ isPlaying: false });
      });
      set({ isPlaying: true });
    }
  },

  pause: () => {
    const audio = get().audioElement;
    if (audio) {
      audio.pause();
      set({ isPlaying: false });
    }
  },

  togglePlay: () => {
    const { isPlaying, play, pause } = get();
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  },

  seek: (position: number) => {
    const audio = get().audioElement;
    if (audio) {
      audio.currentTime = position;
      set({ position });
    }
  },

  setVolume: (volume: number) => {
    const audio = get().audioElement;
    if (audio) {
      audio.volume = volume;
    }
    set({ volume });
  },

  setRepeat: (repeat: 'off' | 'one' | 'all') => {
    set({ repeat });
  },

  toggleShuffle: () => {
    set((state) => ({ shuffle: !state.shuffle }));
  },

  next: () => {
    const { currentTrack, queue, shuffle, repeat } = get();
    if (!currentTrack || queue.length === 0) return;

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    
    if (repeat === 'one') {
      get().seek(0);
      get().play();
      return;
    }

    let nextIndex: number;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeat === 'all') {
          nextIndex = 0;
        } else {
          return;
        }
      }
    }

    get().setCurrentTrack(queue[nextIndex]);
    get().play();
  },

  previous: () => {
    const { currentTrack, queue, position } = get();
    if (!currentTrack || queue.length === 0) return;

    // If more than 3 seconds in, restart current track
    if (position > 3) {
      get().seek(0);
      return;
    }

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = currentIndex - 1;

    if (prevIndex >= 0) {
      get().setCurrentTrack(queue[prevIndex]);
      get().play();
    }
  },

  setDuration: (duration: number) => {
    set({ duration });
  },

  setPosition: (position: number) => {
    set({ position });
  },

  initAudioElement: (audio: HTMLAudioElement) => {
    set({ audioElement: audio });
  },
}));
