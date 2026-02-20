import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PropertyAccessService } from '../../modules/users/services/property-access.service';
import { PropertyRole } from '../../modules/users/entities/user-property-access.entity';
export declare const REQUIRE_PROPERTY_ACCESS = "requirePropertyAccess";
export declare const RequirePropertyAccess: (roles?: PropertyRole[]) => import("@nestjs/common").CustomDecorator<string>;
export declare class PropertyAccessGuard implements CanActivate {
    private reflector;
    private propertyAccessService;
    private readonly logger;
    constructor(reflector: Reflector, propertyAccessService: PropertyAccessService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
