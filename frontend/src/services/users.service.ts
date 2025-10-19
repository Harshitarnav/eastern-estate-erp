import { BaseCachedService } from './base-cached.service';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  profileImage?: string;
  isActive: boolean;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  profileImage?: string;
  roleIds?: string[];
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  profileImage?: string;
  roleIds?: string[];
}

export interface UserFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedUsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class UsersService extends BaseCachedService {
  private readonly baseUrl = '/users';
  private readonly cachePrefix = 'users';

  /**
   * Get all users with filtering and pagination
   */
  async getUsers(filters?: UserFilters, options?: { forceRefresh?: boolean }): Promise<PaginatedUsersResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const cacheKey = this.createKey(this.cachePrefix, 'list', queryString || 'default');

    return this.fetchWithCache(
      cacheKey,
      () => this.get<PaginatedUsersResponse>(`${this.baseUrl}?${queryString}`),
      options
    );
  }

  /**
   * Get user by ID
   */
  async getUser(id: string, options?: { forceRefresh?: boolean }): Promise<User> {
    const cacheKey = this.createKey(this.cachePrefix, 'detail', id);

    return this.fetchWithCache(
      cacheKey,
      () => this.get<User>(`${this.baseUrl}/${id}`),
      options
    );
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserDto): Promise<User> {
    return this.post<User>(
      this.baseUrl,
      data,
      `cache_${this.cachePrefix}_.*`
    );
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    return this.put<User>(
      `${this.baseUrl}/${id}`,
      data,
      `cache_${this.cachePrefix}_.*`
    );
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    await this.delete<void>(
      `${this.baseUrl}/${id}`,
      `cache_${this.cachePrefix}_.*`
    );
  }

  /**
   * Toggle user active status
   */
  async toggleUserActive(id: string): Promise<User> {
    return this.patch<User>(
      `${this.baseUrl}/${id}/toggle-active`,
      {},
      `cache_${this.cachePrefix}_.*`
    );
  }
}

export const usersService = new UsersService();
