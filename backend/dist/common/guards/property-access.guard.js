"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PropertyAccessGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyAccessGuard = exports.RequirePropertyAccess = exports.REQUIRE_PROPERTY_ACCESS = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const property_access_service_1 = require("../../modules/users/services/property-access.service");
const public_decorator_1 = require("../../auth/decorators/public.decorator");
exports.REQUIRE_PROPERTY_ACCESS = 'requirePropertyAccess';
const RequirePropertyAccess = (roles) => (0, common_1.SetMetadata)(exports.REQUIRE_PROPERTY_ACCESS, roles);
exports.RequirePropertyAccess = RequirePropertyAccess;
let PropertyAccessGuard = PropertyAccessGuard_1 = class PropertyAccessGuard {
    constructor(reflector, propertyAccessService) {
        this.reflector = reflector;
        this.propertyAccessService = propertyAccessService;
        this.logger = new common_1.Logger(PropertyAccessGuard_1.name);
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            this.logger.debug('Public route - skipping property access check');
            return true;
        }
        const requiredRoles = this.reflector.get(exports.REQUIRE_PROPERTY_ACCESS, context.getHandler());
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            this.logger.warn('User not authenticated');
            throw new common_1.ForbiddenException('User not authenticated');
        }
        const isAdmin = await this.propertyAccessService.isGlobalAdmin(user.id);
        if (isAdmin) {
            this.logger.debug(`User ${user.email} is global admin - bypassing property access check`);
            request.isGlobalAdmin = true;
            return true;
        }
        const userPropertyIds = await this.propertyAccessService.getUserPropertyIds(user.id);
        if (!userPropertyIds || userPropertyIds.length === 0) {
            this.logger.warn(`User ${user.email} has no property access - denying request`);
            throw new common_1.ForbiddenException('You do not have access to any properties. Please contact your administrator.');
        }
        request.accessiblePropertyIds = userPropertyIds;
        const propertyId = request.params?.propertyId ||
            request.query?.propertyId ||
            request.body?.propertyId;
        if (!propertyId) {
            this.logger.debug(`No propertyId in request - user has access to ${userPropertyIds.length} properties`);
            request.isGlobalAdmin = false;
            return true;
        }
        const hasAccess = await this.propertyAccessService.hasAccess(user.id, propertyId, requiredRoles);
        if (!hasAccess) {
            this.logger.warn(`User ${user.email} does not have access to property ${propertyId}`);
            throw new common_1.ForbiddenException('You do not have access to this property');
        }
        const accesses = await this.propertyAccessService.getUserProperties(user.id);
        const propertyAccess = accesses.find((a) => a.propertyId === propertyId);
        request.propertyAccess = propertyAccess;
        request.isGlobalAdmin = false;
        this.logger.debug(`User ${user.email} has ${propertyAccess?.role} access to property ${propertyId}`);
        return true;
    }
};
exports.PropertyAccessGuard = PropertyAccessGuard;
exports.PropertyAccessGuard = PropertyAccessGuard = PropertyAccessGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        property_access_service_1.PropertyAccessService])
], PropertyAccessGuard);
//# sourceMappingURL=property-access.guard.js.map