import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../constants/roles.constant';

export const ROLES_KEY = 'roles';

/**
 * Roles Decorator
 * 
 * Use this decorator to specify which roles can access a route
 * Supports multiple roles - user needs to have at least one of the specified roles
 * 
 * @example
 * @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
 * @Get()
 * findAll() { ... }
 */
export const Roles = (...roles: (UserRole | string)[]) => SetMetadata(ROLES_KEY, roles);
