import { create } from 'zustand';
import { authService, User } from '@/services/auth.service';
import { usePropertyStore } from '@/store/propertyStore';

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
      const response = await authService.login({ email, password });
      usePropertyStore.getState().setProperties([]);
      usePropertyStore.getState().setSelectedProperties([]);
      set({ user: response.user, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    await authService.logout();
    usePropertyStore.getState().setProperties([]);
    usePropertyStore.getState().setSelectedProperties([]);
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getStoredUser();
    set({ isAuthenticated, user, isLoading: false });
  },
}));
