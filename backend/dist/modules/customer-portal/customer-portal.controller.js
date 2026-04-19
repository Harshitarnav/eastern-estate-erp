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
exports.CustomerPortalController = void 0;
const common_1 = require("@nestjs/common");
const customer_portal_service_1 = require("./customer-portal.service");
const customer_portal_guard_1 = require("./customer-portal.guard");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const role_entity_1 = require("../users/entities/role.entity");
const customer_entity_1 = require("../customers/entities/customer.entity");
const bcrypt = require("bcrypt");
let CustomerPortalController = class CustomerPortalController {
    constructor(portalService, usersRepo, rolesRepo, customersRepo) {
        this.portalService = portalService;
        this.usersRepo = usersRepo;
        this.rolesRepo = rolesRepo;
        this.customersRepo = customersRepo;
    }
    getProfile(req) {
        return this.portalService.getProfile(req.customerId);
    }
    getBookings(req) {
        return this.portalService.getBookings(req.customerId);
    }
    getBookingDetail(req, id) {
        return this.portalService.getBookingDetail(req.customerId, id);
    }
    getPayments(req) {
        return this.portalService.getPayments(req.customerId);
    }
    getConstructionUpdates(req) {
        return this.portalService.getConstructionUpdates(req.customerId);
    }
    getDemandDrafts(req) {
        return this.portalService.getDemandDrafts(req.customerId);
    }
    async inviteCustomer(customerId, body, req) {
        const adminRoles = (req.user?.roles || []).map((r) => typeof r === 'string' ? r : r.name);
        const isAdmin = adminRoles.some((r) => ['admin', 'super_admin', 'hr'].includes(r));
        if (!isAdmin)
            throw new common_1.BadRequestException('Insufficient permissions');
        const customer = await this.customersRepo.findOne({
            where: { id: customerId },
        });
        if (!customer)
            throw new common_1.BadRequestException('Customer not found');
        if (!customer.email)
            throw new common_1.BadRequestException('Customer must have an email address to create a portal account');
        const existing = await this.usersRepo
            .createQueryBuilder('u')
            .where('u.email = :email OR u.customerId = :cid', {
            email: customer.email,
            cid: customerId,
        })
            .getOne();
        if (existing) {
            throw new common_1.BadRequestException('A portal account already exists for this customer');
        }
        const customerRole = await this.rolesRepo.findOne({
            where: { name: 'customer' },
        });
        if (!customerRole)
            throw new common_1.BadRequestException('Customer role not found - run the v009 migration first');
        const password = await bcrypt.hash(body.password || Math.random().toString(36).slice(-10), 12);
        const nameParts = (customer.fullName || '').trim().split(' ');
        const firstName = nameParts[0] || 'Customer';
        const lastName = nameParts.slice(1).join(' ') || '';
        const user = this.usersRepo.create({
            email: customer.email,
            username: customer.email.split('@')[0] + '_' + customer.customerCode,
            password,
            firstName,
            lastName,
            phone: customer.phoneNumber,
            customerId: customer.id,
            roles: [customerRole],
            createdBy: req.user?.id,
        });
        const saved = await this.usersRepo.save(user);
        return {
            message: 'Portal account created successfully',
            userId: saved.id,
            email: saved.email,
        };
    }
    async checkPortalAccount(customerId, req) {
        this.assertAdmin(req);
        const user = await this.usersRepo.findOne({
            where: { customerId },
            select: ['id', 'email', 'isActive', 'lastLoginAt'],
        });
        return { hasAccount: !!user, user: user || null };
    }
    async listPortalAccounts(req) {
        this.assertAdmin(req);
        const accounts = await this.usersRepo
            .createQueryBuilder('u')
            .innerJoin('u.roles', 'r', "r.name = 'customer'")
            .leftJoinAndMapOne('u.customer', customer_entity_1.Customer, 'c', 'c.id = u.customer_id')
            .select([
            'u.id',
            'u.email',
            'u.firstName',
            'u.lastName',
            'u.phone',
            'u.isActive',
            'u.lastLoginAt',
            'u.createdAt',
            'u.customerId',
            'c.id',
            'c.fullName',
            'c.customerCode',
            'c.email',
            'c.phoneNumber',
        ])
            .orderBy('u.createdAt', 'DESC')
            .getMany();
        return accounts;
    }
    async toggleAccountStatus(userId, body, req) {
        this.assertAdmin(req);
        const user = await this.usersRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const roles = (user.roles || []).map((r) => typeof r === 'string' ? r : r.name);
        if (!roles.includes('customer'))
            throw new common_1.ForbiddenException('This endpoint only manages customer accounts');
        user.isActive = body.isActive;
        await this.usersRepo.save(user);
        return { message: `Account ${body.isActive ? 'activated' : 'deactivated'}`, userId };
    }
    async resetPassword(userId, body, req) {
        this.assertAdmin(req);
        if (!body.newPassword || body.newPassword.length < 6)
            throw new common_1.BadRequestException('Password must be at least 6 characters');
        const user = await this.usersRepo.findOne({
            where: { id: userId },
            select: ['id', 'roles'],
        });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        await this.usersRepo.update(userId, {
            password: await bcrypt.hash(body.newPassword, 12),
        });
        return { message: 'Password reset successfully', userId };
    }
    async revokePortalAccess(userId, req) {
        this.assertAdmin(req);
        const user = await this.usersRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const roles = (user.roles || []).map((r) => typeof r === 'string' ? r : r.name);
        if (!roles.includes('customer'))
            throw new common_1.ForbiddenException('This endpoint only manages customer accounts');
        await this.usersRepo.remove(user);
        return { message: 'Portal access revoked', userId };
    }
    assertAdmin(req) {
        const roles = (req.user?.roles || []).map((r) => typeof r === 'string' ? r : r.name);
        const ok = roles.some((r) => ['admin', 'super_admin', 'hr'].includes(r));
        if (!ok)
            throw new common_1.ForbiddenException('Insufficient permissions');
    }
};
exports.CustomerPortalController = CustomerPortalController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, customer_portal_guard_1.CustomerPortalGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CustomerPortalController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, customer_portal_guard_1.CustomerPortalGuard),
    (0, common_1.Get)('bookings'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CustomerPortalController.prototype, "getBookings", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, customer_portal_guard_1.CustomerPortalGuard),
    (0, common_1.Get)('bookings/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CustomerPortalController.prototype, "getBookingDetail", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, customer_portal_guard_1.CustomerPortalGuard),
    (0, common_1.Get)('payments'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CustomerPortalController.prototype, "getPayments", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, customer_portal_guard_1.CustomerPortalGuard),
    (0, common_1.Get)('construction'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CustomerPortalController.prototype, "getConstructionUpdates", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, customer_portal_guard_1.CustomerPortalGuard),
    (0, common_1.Get)('demand-drafts'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CustomerPortalController.prototype, "getDemandDrafts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('invite/:customerId'),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerPortalController.prototype, "inviteCustomer", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('check/:customerId'),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomerPortalController.prototype, "checkPortalAccount", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('accounts'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerPortalController.prototype, "listPortalAccounts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('accounts/:userId/status'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerPortalController.prototype, "toggleAccountStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('accounts/:userId/reset-password'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerPortalController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('accounts/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomerPortalController.prototype, "revokePortalAccess", null);
exports.CustomerPortalController = CustomerPortalController = __decorate([
    (0, common_1.Controller)('customer-portal'),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(3, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [customer_portal_service_1.CustomerPortalService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CustomerPortalController);
//# sourceMappingURL=customer-portal.controller.js.map