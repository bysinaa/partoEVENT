// ============================================
// Auth Store — Zustand state management
// Handles authentication state & persistence
// ============================================

import { create } from 'zustand';
import { authApi } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);

    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));

    set({
      user: data.user,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },

  loadUser: async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        set({ isLoading: false });
        return;
      }

      // First, restore user from localStorage for immediate UI
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        const user = JSON.parse(cachedUser);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }

      // Fallback: fetch from API
      const { data } = await authApi.me();
      localStorage.setItem('user', JSON.stringify(data));
      set({
        user: data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setUser: (user: User) => set({ user }),
}));