export interface User {
  id: string;
  _id?: string; // MongoDB ID
  email: string;
  username: string;
  name?: string; // Display name
  role: 'musician' | 'listener';
  avatar?: string;
  avatarUrl?: string; // Alias for avatar
  bio?: string;
  followers?: number;
  following?: number;
  createdAt: string;
}

export interface Track {
  id?: string;
  _id?: string; // MongoDB ID
  title: string;
  artist?: string;
  genre: string;
  description?: string;
  audioUrl?: string;
  fileUrl?: string; // Backend uses fileUrl
  coverUrl?: string;
  coverImage?: string; // Backend uses coverImage
  duration: number;
  userId?: string;
  uploadedBy?: any; // Can be ID or populated user object
  user?: User;
  plays?: number;
  playCount?: number; // Backend uses playCount
  likes?: number;
  likesCount?: number; // Backend uses likesCount
  isLiked?: boolean;
  rating?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  trackId: string;
  userId: string;
  user?: User;
  content: string;
  timestamp?: number; // in seconds for audio position
  likes: number;
  replies?: Comment[];
  createdAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  userId: string;
  user?: User;
  tracks: Track[];
  isCollaborative: boolean;
  coverUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  owner?: User;
  collaborators: User[];
  files: ProjectFile[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  url: string;
  type: 'audio' | 'note' | 'other';
  uploadedBy: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'comment' | 'like' | 'follow' | 'collaboration' | 'release';
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
  repeat: 'off' | 'one' | 'all';
  shuffle: boolean;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  userId: string;
  user?: User;
  message: string;
  createdAt: string;
}

export interface MixerJob {
  id: string;
  trackId: string;
  type: 'auto-mix' | 'loudness-boost' | 'vocal-enhance';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  resultUrl?: string;
  createdAt: string;
  completedAt?: string;
}
