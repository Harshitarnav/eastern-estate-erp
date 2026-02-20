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
var PropertyAccessService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyAccessService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_property_access_entity_1 = require("../entities/user-property-access.entity");
const user_entity_1 = require("../entities/user.entity");
const property_entity_1 = require("../../properties/entities/property.entity");
let PropertyAccessService = PropertyAccessService_1 = class PropertyAccessService {
    constructor(propertyAccessRepo, userRepo, propertyRepo) {
        this.propertyAccessRepo = propertyAccessRepo;
        this.userRepo = userRepo;
        this.propertyRepo = propertyRepo;
        this.logger = new common_1.Logger(PropertyAccessService_1.name);
    }
    async getUserProperties(userId) {
        return await this.propertyAccessRepo.find({
            where: { userId, isActive: true },
            relations: ['property'],
            order: { assignedAt: 'DESC' },
        });
    }
    async getPropertyUsers(propertyId) {
        return await this.propertyAccessRepo.find({
            where: { propertyId, isActive: true },
            relations: ['user'],
            order: { assignedAt: 'DESC' },
        });
    }
    async grantAccess(userId, propertyId, role, assignedBy) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        const property = await this.propertyRepo.findOne({ where: { id: propertyId } });
        if (!property) {
            throw new common_1.NotFoundException(`Property with ID ${propertyId} not found`);
        }
        let access = await this.propertyAccessRepo.findOne({
            where: { userId, propertyId, role },
        });
        if (access) {
            if (!access.isActive) {
                access.isActive = true;
                access.assignedBy = assignedBy;
                access.assignedAt = new Date();
                const updated = await this.propertyAccessRepo.save(access);
                this.logger.log(`Reactivated access for user ${userId} to property ${propertyId} with role ${role}`);
                return updated;
            }
            this.logger.warn(`Access already exists for user ${userId} to property ${propertyId} with role ${role}`);
            return access;
        }
        access = this.propertyAccessRepo.create({
            userId,
            propertyId,
            role,
            assignedBy,
            assignedAt: new Date(),
            isActive: true,
        });
        const saved = await this.propertyAccessRepo.save(access);
        this.logger.log(`Granted access for user ${userId} to property ${propertyId} with role ${role}`);
        return saved;
    }
    async revokeAccess(userId, propertyId, role) {
        const where = { userId, propertyId };
        if (role) {
            where.role = role;
        }
        const result = await this.propertyAccessRepo.update(where, { isActive: false });
        if (result.affected > 0) {
            this.logger.log(`Revoked access for user ${userId} from property ${propertyId}${role ? ` with role ${role}` : ''}`);
        }
        else {
            this.logger.warn(`No access found to revoke for user ${userId} and property ${propertyId}`);
        }
    }
    async hasAccess(userId, propertyId, requiredRoles) {
        const where = { userId, propertyId, isActive: true };
        const access = await this.propertyAccessRepo.findOne({ where });
        if (!access) {
            return false;
        }
        if (requiredRoles && requiredRoles.length > 0) {
            return requiredRoles.includes(access.role);
        }
        return true;
    }
    async getUserPropertyIds(userId) {
        const accesses = await this.propertyAccessRepo.find({
            where: { userId, isActive: true },
            select: ['propertyId'],
        });
        return accesses.map((a) => a.propertyId);
    }
    async isGlobalAdmin(userId) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['roles'],
        });
        if (!user) {
            return false;
        }
        const roleNames = user.roles.map(r => r.name);
        return roleNames.includes('super_admin') || roleNames.includes('admin');
    }
    async applyPropertyFilter(userId, queryBuilder, propertyColumn = 'propertyId') {
        const isAdmin = await this.isGlobalAdmin(userId);
        if (isAdmin) {
            return;
        }
        const propertyIds = await this.getUserPropertyIds(userId);
        if (propertyIds.length === 0) {
            queryBuilder.andWhere('1 = 0');
            return;
        }
        queryBuilder.andWhere(`${propertyColumn} IN (:...propertyIds)`, { propertyIds });
    }
    async bulkGrantAccess(userId, propertyIds, role, assignedBy) {
        const accesses = [];
        for (const propertyId of propertyIds) {
            try {
                const access = await this.grantAccess(userId, propertyId, role, assignedBy);
                accesses.push(access);
            }
            catch (error) {
                this.logger.error(`Failed to grant access to property ${propertyId}: ${error.message}`);
            }
        }
        return accesses;
    }
    async bulkRevokeAccess(userId, propertyIds, role) {
        for (const propertyId of propertyIds) {
            await this.revokeAccess(userId, propertyId, role);
        }
    }
    async getUserPropertiesByRole(userId, role) {
        return await this.propertyAccessRepo.find({
            where: { userId, role, isActive: true },
            relations: ['property'],
        });
    }
    async getAccessiblePropertyIds(userId) {
        const isAdmin = await this.isGlobalAdmin(userId);
        if (isAdmin) {
            return null;
        }
        return await this.getUserPropertyIds(userId);
    }
    async updateRole(userId, propertyId, oldRole, newRole, updatedBy) {
        const access = await this.propertyAccessRepo.findOne({
            where: { userId, propertyId, role: oldRole },
        });
        if (!access) {
            throw new common_1.NotFoundException(`Access not found for user ${userId} to property ${propertyId} with role ${oldRole}`);
        }
        const existingNewRole = await this.propertyAccessRepo.findOne({
            where: { userId, propertyId, role: newRole },
        });
        if (existingNewRole && existingNewRole.isActive) {
            throw new common_1.BadRequestException(`User already has ${newRole} access to this property`);
        }
        access.role = newRole;
        access.assignedBy = updatedBy;
        access.assignedAt = new Date();
        const updated = await this.propertyAccessRepo.save(access);
        this.logger.log(`Updated role for user ${userId} on property ${propertyId} from ${oldRole} to ${newRole}`);
        return updated;
    }
    async getUserAccessSummary(userId) {
        const accesses = await this.getUserProperties(userId);
        const accessByRole = {};
        accesses.forEach((access) => {
            accessByRole[access.role] = (accessByRole[access.role] || 0) + 1;
        });
        return {
            totalProperties: accesses.length,
            accessByRole,
            properties: accesses,
        };
    }
};
exports.PropertyAccessService = PropertyAccessService;
exports.PropertyAccessService = PropertyAccessService = PropertyAccessService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_property_access_entity_1.UserPropertyAccess)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(property_entity_1.Property)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PropertyAccessService);
//# sourceMappingURL=property-access.service.js.map