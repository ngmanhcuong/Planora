import { create } from 'zustand';
import type { User } from '@/types';
import { apiClient } from '@/lib/axios';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLogoutModalOpen: boolean;
  setAuth: (token: string, user: User & { profile?: { avatarUrl?: string | null } }) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  initializeAuth: () => Promise<void>;
  openLogoutModal: () => void;
  closeLogoutModal: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Global event listener for 401 unauthorized
  if (typeof window !== 'undefined') {
    window.addEventListener('planora_unauthorized', () => {
      get().clearAuth();
    });
  }

  const initialToken = typeof window !== 'undefined' ? localStorage.getItem('planora_token') : null;

  return {
    user: null,
    token: initialToken,
    isAuthenticated: !!initialToken,
    isInitializing: !!initialToken,
    isLogoutModalOpen: false,

    setAuth: (token, user) => {
      localStorage.setItem('planora_token', token);
      set({ token, user: { ...user, avatarUrl: user.profile?.avatarUrl ?? user.avatarUrl }, isAuthenticated: true, isInitializing: false });
      void get().initializeAuth();
    },

    setUser: (user: User) => {
      set({ user });
    },

    clearAuth: () => {
      localStorage.removeItem('planora_token');
      set({ token: null, user: null, isAuthenticated: false, isInitializing: false, isLogoutModalOpen: false });
    },

    initializeAuth: async () => {
      const token = localStorage.getItem('planora_token');
      if (!token) {
        set({ isAuthenticated: false, isInitializing: false, user: null });
        return;
      }

      try {
        const response = await apiClient.get('/auth/me');
        if (response.data && response.data.success) {
          const userData = response.data.data.user;
          const user: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            isVerified: userData.isVerified,
            studentId: userData.profile?.studentId || undefined,
            major: userData.profile?.major || undefined,
            university: userData.profile?.university || undefined,
            avatarUrl: userData.profile?.avatarUrl || undefined,
          };
          set({ user, isAuthenticated: true, isInitializing: false });
        } else {
          get().clearAuth();
        }
      } catch (error) {
        get().clearAuth();
      }
    },

    openLogoutModal: () => set({ isLogoutModalOpen: true }),
    closeLogoutModal: () => set({ isLogoutModalOpen: false }),
  };
});
