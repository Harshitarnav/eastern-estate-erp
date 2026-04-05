import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PropertyAccessService } from '../../modules/users/services/property-access.service';
import { PropertyRole } from '../../modules/users/entities/user-property-access.entity';
import { IS_PUBLIC_KEY } from '../../auth/decorators/public.decorator';

export const REQUIRE_PROPERTY_ACCESS = 'requirePropertyAccess';
export const RequirePropertyAccess = (roles?: PropertyRole[]) =>
  SetMetadata(REQUIRE_PROPERTY_ACCESS, roles);

@Injectable()
export class PropertyAccessGuard implements CanActivate {
  private readonly logger = new Logger(PropertyAccessGuard.name);

  constructor(
    private reflector: Reflector,
    private propertyAccessService: PropertyAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public (has @Public() decorator)
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      this.logger.debug('Public route - skipping property access check');
      return true;
    }

    const requiredRoles = this.reflector.get<PropertyRole[]>(
      REQUIRE_PROPERTY_ACCESS,
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn('User not authenticated');
      throw new ForbiddenException('User not authenticated');
    }

    const userRoles: string[] = (user.roles || []).map((r: any) =>
      typeof r === 'string' ? r : r.name,
    );

    // Super Admin — always sees everything, no filtering ever
    if (userRoles.includes('super_admin')) {
      this.logger.debug(`User ${user.email} is super_admin - full bypass`);
      request.isGlobalAdmin = true;
      request.accessiblePropertyIds = null;
      return true;
    }

    // Head Accountant — company-wide accounting (same property visibility as admin for API filtering)
    if (userRoles.includes('head_accountant')) {
      this.logger.debug(`User ${user.email} is head_accountant - full property bypass`);
      request.isGlobalAdmin = true;
      request.accessiblePropertyIds = null;
      return true;
    }

    // Customer portal users — scoped by customerId, not property assignments
    if (userRoles.includes('customer')) {
      this.logger.debug(`User ${user.email} is a customer - bypassing property access check`);
      return true;
    }

    // For all other users (admin, hr, staff, etc.) check assigned properties first
    const userPropertyIds = await this.propertyAccessService.getUserPropertyIds(user.id);

    // Admin / HR with NO explicit assignments → full access (opt-in restriction)
    const isPrivilegedRole = userRoles.includes('admin') || userRoles.includes('hr');
    if (isPrivilegedRole && (!userPropertyIds || userPropertyIds.length === 0)) {
      this.logger.debug(`User ${user.email} has ${userRoles.join(',')} role with no assignments - full bypass`);
      request.isGlobalAdmin = true;
      request.accessiblePropertyIds = null;
      return true;
    }
    
    if (!userPropertyIds || userPropertyIds.length === 0) {
      this.logger.warn(`User ${user.email} has no property access - denying request`);
      throw new ForbiddenException(
        'You have not been assigned to any projects yet. Please contact your administrator.',
      );
    }

    // Attach accessible property IDs — services will filter by these
    request.isGlobalAdmin = false;
    request.accessiblePropertyIds = userPropertyIds;

    // Extract propertyId from request (params, query, or body)
    const propertyId =
      request.params?.propertyId ||
      request.query?.propertyId ||
      request.body?.propertyId;

    if (!propertyId) {
      // If no propertyId in request, allow (service will filter using accessiblePropertyIds)
      this.logger.debug(`No propertyId in request - user has access to ${userPropertyIds.length} properties`);
      request.isGlobalAdmin = false;
      return true;
    }

    // Check if user has access to this specific property
    const hasAccess = await this.propertyAccessService.hasAccess(
      user.id,
      propertyId,
      requiredRoles,
    );

    if (!hasAccess) {
      this.logger.warn(
        `User ${user.email} does not have access to property ${propertyId}`,
      );
      throw new ForbiddenException(
        'You do not have access to this property',
      );
    }

    // Get the specific access for this property
    const accesses = await this.propertyAccessService.getUserProperties(user.id);
    const propertyAccess = accesses.find((a) => a.propertyId === propertyId);

    // Attach property access info to request for later use
    request.propertyAccess = propertyAccess;
    request.isGlobalAdmin = false;

    this.logger.debug(
      `User ${user.email} has ${propertyAccess?.role} access to property ${propertyId}`,
    );

    return true;
  }
}
