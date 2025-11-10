import { create } from 'zustand';
import type { User } from '../types';
import apiClient from '../lib/axios';
import { initSocket, disconnectSocket } from '../lib/socket';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: 'musician' | 'listener', musicianKey?: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      
      localStorage.setItem('token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      set({ 
        user: data.user, 
        token: data.token, 
        isAuthenticated: true,
        isLoading: false 
      });

      // Initialize socket connection
      initSocket(data.token);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email: string, password: string, name: string, role: 'musician' | 'listener', musicianKey?: string) => {
    try {
      const headers: Record<string, string> = {};
      if (role === 'musician' && musicianKey) headers['x-musician-key'] = musicianKey;
      const { data } = await apiClient.post('/auth/register', { 
        email, 
        password, 
        name, 
        role,
        musicianKey
      }, { headers });
      
      localStorage.setItem('token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      set({ 
        user: data.user, 
        token: data.token, 
        isAuthenticated: true,
        isLoading: false 
      });

      // Initialize socket connection
      initSocket(data.token);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    disconnectSocket();
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false,
      isLoading: false 
    });
  },

  setUser: (user: User) => {
    set({ user });
  },

  hydrate: async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const { data } = await apiClient.get('/auth/me');
      set({ 
        user: data, 
        token, 
        isAuthenticated: true,
        isLoading: false 
      });

      // Initialize socket connection
      initSocket(token);
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        isLoading: false 
      });
    }
  },
}));
