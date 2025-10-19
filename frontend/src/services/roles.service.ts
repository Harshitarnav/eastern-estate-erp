import { BaseCachedService } from './base-cached.service';
import { Role, Permission } from './users.service';

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

class RolesService extends BaseCachedService {
  private readonly baseUrl = '/roles';
  private readonly cachePrefix = 'roles';

  /**
   * Get all roles
   */
  async getRoles(options?: { forceRefresh?: boolean }): Promise<Role[]> {
    const cacheKey = this.createKey(this.cachePrefix, 'list');

    return this.fetchWithCache(
      cacheKey,
      () => this.get<Role[]>(this.baseUrl),
      options
    );
  }

  /**
   * Get role by ID
   */
  async getRole(id: string, options?: { forceRefresh?: boolean }): Promise<Role> {
    const cacheKey = this.createKey(this.cachePrefix, 'detail', id);

    return this.fetchWithCache(
      cacheKey,
      () => this.get<Role>(`${this.baseUrl}/${id}`),
      options
    );
  }

  /**
   * Get all permissions
   */
  async getPermissions(options?: { forceRefresh?: boolean }): Promise<Permission[]> {
    const cacheKey = this.createKey('permissions', 'list');

    return this.fetchWithCache(
      cacheKey,
      () => this.get<Permission[]>('/permissions'),
      options
    );
  }

  /**
   * Create a new role
   */
  async createRole(data: CreateRoleDto): Promise<Role> {
    return this.post<Role>(
      this.baseUrl,
      data,
      `cache_${this.cachePrefix}_.*`
    );
  }

  /**
   * Update role
   */
  async updateRole(id: string, data: UpdateRoleDto): Promise<Role> {
    return this.put<Role>(
      `${this.baseUrl}/${id}`,
      data,
      `cache_${this.cachePrefix}_.*`
    );
  }

  /**
   * Delete role
   */
  async deleteRole(id: string): Promise<void> {
    await this.delete<void>(
      `${this.baseUrl}/${id}`,
      `cache_${this.cachePrefix}_.*`
    );
  }
}

export const rolesService = new RolesService();
export type { Role, Permission };
