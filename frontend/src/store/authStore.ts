import { create } from 'zustand';
import { authService, User } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (email, password) => {
    try {
      console.log('Login attempt:', email);
      const response = await authService.login({ email, password });
      console.log('Login response received:', response);
      set({ user: response.user, isAuthenticated: true });
      console.log('Auth state updated successfully');
    } catch (error) {
      console.error('Login failed in authStore:', error);
      throw error;
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getStoredUser();
    set({ isAuthenticated, user, isLoading: false });
  },
}));
