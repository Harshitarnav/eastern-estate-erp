import { apiService } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profileImage?: string;
  roles: Array<{
    id: string;
    name: string;
    displayName: string;
  }>;
  /** From login /auth/me — when `assigned`, UI limits project list to assignments. */
  propertyAccessMode?: 'wide' | 'assigned';
  assignedPropertyIds?: string[];
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  async register(data: RegisterData): Promise<User> {
    return await apiService.post<User>('/auth/register', data);
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = typeof window !== 'undefined' 
        ? localStorage.getItem('refreshToken') 
        : null;
      
      if (refreshToken) {
        await apiService.post('/auth/logout', { refreshToken });
      }
    } finally {
      this.clearSession();
    }
  }

  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('accessToken');
  }

  clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }
}

export interface ActiveSession {
  sessionId: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  ipAddress: string;
  userAgent: string;
  loginAt: string;
  expiresAt: string;
}

class SessionsService {
  async getActiveSessions(): Promise<ActiveSession[]> {
    return apiService.get<ActiveSession[]>('/auth/sessions');
  }

  async forceLogout(userId: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(`/auth/sessions/${userId}/force-logout`, {});
  }
}

export const authService = new AuthService();
export const sessionsService = new SessionsService();
