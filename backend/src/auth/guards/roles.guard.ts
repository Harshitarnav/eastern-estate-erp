import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';

/**
 * RolesGuard - Enhanced Role-Based Access Control
 * 
 * Features:
 * - Supports multiple roles per user
 * - User needs at least ONE of the required roles to access
 * - Super Admin bypasses all role checks
 * - Works with simplified 8-role system
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.roles) {
      return false;
    }

    // Get user's role names
    const userRoles = user.roles.map((r: any) => 
      typeof r === 'string' ? r : r.name
    );

    // Super Admin always has access
    if (userRoles.includes('super_admin')) {
      return true;
    }

    // Check if user has at least one of the required roles
    return requiredRoles.some((requiredRole) => 
      userRoles.includes(requiredRole)
    );
  }
}