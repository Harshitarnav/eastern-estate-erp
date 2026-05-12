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

    // Super Admin - always sees everything, no filtering ever
    if (userRoles.includes('super_admin')) {
      this.logger.debug(`User ${user.email} is super_admin - full bypass`);
      request.isGlobalAdmin = true;
      request.accessiblePropertyIds = null;
      return true;
    }

    // Explicit rows in user_property_access win over everything else (including `customer` role).
    // Otherwise ERP assignments are ignored for anyone tagged as customer, and GET /properties returns [].
    const userPropertyIds = await this.propertyAccessService.getUserPropertyIds(user.id);

    if (userPropertyIds && userPropertyIds.length > 0) {
      request.isGlobalAdmin = false;
      request.accessiblePropertyIds = userPropertyIds;

      const propertyId =
        request.params?.propertyId ||
        request.query?.propertyId ||
        request.body?.propertyId;

      if (!propertyId) {
        this.logger.debug(
          `No propertyId in request — user scoped to ${userPropertyIds.length} assigned project(s)`,
        );
        return true;
      }

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

      const accesses = await this.propertyAccessService.getUserProperties(user.id);
      request.propertyAccess = accesses.find((a) => a.propertyId === propertyId);

      this.logger.debug(
        `User ${user.email} has ${request.propertyAccess?.role} access to property ${propertyId}`,
      );
      return true;
    }

    // Customer portal users — scope by bookings (no user_property_access rows)
    if (userRoles.includes('customer')) {
      const customerId = await this.propertyAccessService.getUserCustomerId(user.id);
      if (!customerId) {
        this.logger.debug(`User ${user.email} is customer with no linked profile — empty property scope`);
        request.isGlobalAdmin = false;
        request.accessiblePropertyIds = [];
        return true;
      }
      const customerPropertyIds =
        await this.propertyAccessService.getPropertyIdsForCustomerBookings(customerId);
      this.logger.debug(
        `User ${user.email} is customer — scoped to ${customerPropertyIds.length} booking project(s)`,
      );
      request.isGlobalAdmin = false;
      request.accessiblePropertyIds = customerPropertyIds;
      return true;
    }

    // Privileged roles with NO explicit assignments → full access (opt-in restriction via assignments)
    const isPrivilegedWideRole =
      userRoles.includes('head_accountant') ||
      userRoles.includes('admin') ||
      userRoles.includes('hr');
    if (isPrivilegedWideRole) {
      this.logger.debug(
        `User ${user.email} has wide role (${userRoles.join(',')}) with no assignments — full bypass`,
      );
      request.isGlobalAdmin = true;
      request.accessiblePropertyIds = null;
      return true;
    }
    
    this.logger.warn(`User ${user.email} has no property access - denying request`);
    throw new ForbiddenException(
      'You have not been assigned to any projects yet. Please contact your administrator.',
    );
  }
}
