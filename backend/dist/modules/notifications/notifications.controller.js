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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("./notifications.service");
const push_service_1 = require("./push.service");
const create_notification_dto_1 = require("./dto/create-notification.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const BROADCAST_ROLES = new Set([
    'admin',
    'super_admin',
    'hr',
    'head_accountant',
]);
let NotificationsController = class NotificationsController {
    constructor(notificationsService, pushService) {
        this.notificationsService = notificationsService;
        this.pushService = pushService;
    }
    async create(createNotificationDto, req) {
        const userId = req.user?.userId || req.user?.id;
        const userRoles = (req.user?.roles || []).map((r) => typeof r === 'string' ? r : r.name);
        const isBroadcaster = userRoles.some((r) => BROADCAST_ROLES.has(r));
        const targetsOther = createNotificationDto.userId &&
            createNotificationDto.userId !== userId;
        const targetsMany = createNotificationDto.targetRoles ||
            createNotificationDto.userIds;
        if (!isBroadcaster && (targetsOther || targetsMany)) {
            throw new common_1.ForbiddenException('You are not allowed to send notifications to other users.');
        }
        return this.notificationsService.create(createNotificationDto, userId);
    }
    async findAll(req, includeRead) {
        const userId = req.user?.userId || req.user?.id;
        if (!userId) {
            return [];
        }
        try {
            const include = includeRead === 'true';
            return await this.notificationsService.findAllForUser(userId, include);
        }
        catch (error) {
            return [];
        }
    }
    async getUnreadCount(req) {
        const userId = req.user?.userId || req.user?.id;
        if (!userId) {
            return { count: 0 };
        }
        try {
            const count = await this.notificationsService.getUnreadCount(userId);
            return { count };
        }
        catch (error) {
            return { count: 0 };
        }
    }
    async markAsRead(id, req) {
        const userId = req.user?.userId || req.user?.id;
        return this.notificationsService.markAsRead(id, userId);
    }
    async markAllAsRead(req) {
        const userId = req.user?.userId || req.user?.id;
        await this.notificationsService.markAllAsRead(userId);
        return { message: 'All notifications marked as read' };
    }
    async remove(id, req) {
        const userId = req.user?.userId || req.user?.id;
        await this.notificationsService.remove(id, userId);
        return { message: 'Notification deleted successfully' };
    }
    async clearRead(req) {
        const userId = req.user?.userId || req.user?.id;
        await this.notificationsService.clearRead(userId);
        return { message: 'Read notifications cleared successfully' };
    }
    getVapidPublicKey() {
        return { publicKey: this.pushService.getPublicKey() };
    }
    async pushSubscribe(body, req) {
        const userId = req.user?.userId || req.user?.id;
        await this.pushService.subscribe(userId, body.endpoint, body.p256dh, body.auth);
        return { message: 'Subscribed' };
    }
    async pushUnsubscribe(body, req) {
        const userId = req.user?.userId || req.user?.id;
        await this.pushService.unsubscribe(userId, body.endpoint);
        return { message: 'Unsubscribed' };
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_notification_dto_1.CreateNotificationDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('includeRead')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)('mark-all-read'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('clear/read'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "clearRead", null);
__decorate([
    (0, common_1.Get)('push/vapid-public-key'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "getVapidPublicKey", null);
__decorate([
    (0, common_1.Post)('push/subscribe'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "pushSubscribe", null);
__decorate([
    (0, common_1.Post)('push/unsubscribe'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "pushUnsubscribe", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        push_service_1.PushService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map