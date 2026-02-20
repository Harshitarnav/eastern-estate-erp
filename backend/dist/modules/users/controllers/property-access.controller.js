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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyAccessController = void 0;
const common_1 = require("@nestjs/common");
const property_access_service_1 = require("../services/property-access.service");
const jwt_auth_guard_1 = require("../../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const roles_constant_1 = require("../../../common/constants/roles.constant");
const notifications_service_1 = require("../../notifications/notifications.service");
const notification_entity_1 = require("../../notifications/entities/notification.entity");
let PropertyAccessController = class PropertyAccessController {
    constructor(propertyAccessService, notificationsService) {
        this.propertyAccessService = propertyAccessService;
        this.notificationsService = notificationsService;
    }
    async grantAccess(grantAccessDto, req) {
        const access = await this.propertyAccessService.grantAccess(grantAccessDto.userId, grantAccessDto.propertyId, grantAccessDto.role, req.user.id);
        await this.notificationsService.create({
            userId: grantAccessDto.userId,
            title: 'Property Access Granted',
            message: `You have been granted ${grantAccessDto.role} access to a property.`,
            type: notification_entity_1.NotificationType.SUCCESS,
            category: notification_entity_1.NotificationCategory.SYSTEM,
            actionUrl: '/properties',
            actionLabel: 'View Properties',
        }, req.user.id);
        return access;
    }
    async bulkGrantAccess(bulkGrantDto, req) {
        const accesses = await this.propertyAccessService.bulkGrantAccess(bulkGrantDto.userId, bulkGrantDto.propertyIds, bulkGrantDto.role, req.user.id);
        await this.notificationsService.create({
            userId: bulkGrantDto.userId,
            title: 'Property Access Updated',
            message: `You have been granted access to ${bulkGrantDto.propertyIds.length} properties.`,
            type: notification_entity_1.NotificationType.SUCCESS,
            category: notification_entity_1.NotificationCategory.SYSTEM,
            actionUrl: '/properties',
            actionLabel: 'View Properties',
        }, req.user.id);
        return accesses;
    }
    async revokeAccess(body, req) {
        await this.propertyAccessService.revokeAccess(body.userId, body.propertyId, body.role);
        await this.notificationsService.create({
            userId: body.userId,
            title: 'Property Access Revoked',
            message: 'Your access to a property has been revoked.',
            type: notification_entity_1.NotificationType.INFO,
            category: notification_entity_1.NotificationCategory.SYSTEM,
        }, req.user.id);
        return { message: 'Access revoked successfully' };
    }
    async getAllPropertyAccess() {
        return { message: 'Endpoint for listing all property access' };
    }
    async getUserPropertyAccess(userId) {
        return this.propertyAccessService.getUserProperties(userId);
    }
    async grantAccessToUser(userId, body, req) {
        const access = await this.propertyAccessService.grantAccess(userId, body.propertyId, body.role, req.user.id);
        await this.notificationsService.create({
            userId: userId,
            title: 'Property Access Granted',
            message: `You have been granted ${body.role} access to a property.`,
            type: notification_entity_1.NotificationType.SUCCESS,
            category: notification_entity_1.NotificationCategory.SYSTEM,
            actionUrl: '/properties',
            actionLabel: 'View Properties',
        }, req.user.id);
        return access;
    }
    async revokeAccessFromUser(userId, propertyId, role, req) {
        await this.propertyAccessService.revokeAccess(userId, propertyId, role);
        await this.notificationsService.create({
            userId: userId,
            title: 'Property Access Revoked',
            message: `Your ${role} access to a property has been revoked.`,
            type: notification_entity_1.NotificationType.INFO,
            category: notification_entity_1.NotificationCategory.SYSTEM,
        }, req.user.id);
        return { message: 'Access revoked successfully' };
    }
};
exports.PropertyAccessController = PropertyAccessController;
__decorate([
    (0, common_1.Post)('property-access/grant'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(roles_constant_1.UserRole.ADMIN, roles_constant_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PropertyAccessController.prototype, "grantAccess", null);
__decorate([
    (0, common_1.Post)('property-access/bulk-grant'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(roles_constant_1.UserRole.ADMIN, roles_constant_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PropertyAccessController.prototype, "bulkGrantAccess", null);
__decorate([
    (0, common_1.Post)('property-access/revoke'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(roles_constant_1.UserRole.ADMIN, roles_constant_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PropertyAccessController.prototype, "revokeAccess", null);
__decorate([
    (0, common_1.Get)('property-access/all'),
    (0, roles_decorator_1.Roles)(roles_constant_1.UserRole.ADMIN, roles_constant_1.UserRole.SUPER_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PropertyAccessController.prototype, "getAllPropertyAccess", null);
__decorate([
    (0, common_1.Get)(':userId/property-access'),
    (0, roles_decorator_1.Roles)(roles_constant_1.UserRole.ADMIN, roles_constant_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PropertyAccessController.prototype, "getUserPropertyAccess", null);
__decorate([
    (0, common_1.Post)(':userId/property-access'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(roles_constant_1.UserRole.ADMIN, roles_constant_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PropertyAccessController.prototype, "grantAccessToUser", null);
__decorate([
    (0, common_1.Delete)(':userId/property-access/:propertyId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(roles_constant_1.UserRole.ADMIN, roles_constant_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('propertyId')),
    __param(2, (0, common_1.Query)('role')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], PropertyAccessController.prototype, "revokeAccessFromUser", null);
exports.PropertyAccessController = PropertyAccessController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [property_access_service_1.PropertyAccessService,
        notifications_service_1.NotificationsService])
], PropertyAccessController);
//# sourceMappingURL=property-access.controller.js.map