import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Requires specific permissions to access the route
 * @param permissions - Array of permission strings in format "module:action"
 * Example: @RequirePermissions('leads:create', 'leads:update')
 */
export const RequirePermissions = (...permissions: string[]) => 
  SetMetadata(PERMISSIONS_KEY, permissions);
