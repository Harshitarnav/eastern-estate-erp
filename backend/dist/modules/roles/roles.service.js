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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("./entities/role.entity");
const permission_entity_1 = require("./entities/permission.entity");
const role_permission_entity_1 = require("./entities/role-permission.entity");
let RolesService = class RolesService {
    constructor(roleRepository, permissionRepository, rolePermissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.rolePermissionRepository = rolePermissionRepository;
    }
    async create(createRoleDto, userId) {
        const { permissionIds, ...roleData } = createRoleDto;
        const existing = await this.roleRepository.findOne({
            where: { name: roleData.name },
        });
        if (existing) {
            throw new common_1.BadRequestException('Role with this name already exists');
        }
        const role = this.roleRepository.create({
            ...roleData,
            createdBy: userId,
        });
        await this.roleRepository.save(role);
        if (permissionIds && permissionIds.length > 0) {
            await this.assignPermissions(role.id, permissionIds);
        }
        return this.findOne(role.id);
    }
    async findAll() {
        return this.roleRepository.find({
            where: { isActive: true },
            relations: ['rolePermissions', 'rolePermissions.permission'],
            order: { displayName: 'ASC' },
        });
    }
    async findOne(id) {
        const role = await this.roleRepository.findOne({
            where: { id },
            relations: ['rolePermissions', 'rolePermissions.permission'],
        });
        if (!role) {
            throw new common_1.NotFoundException('Role not found');
        }
        return role;
    }
    async update(id, updateRoleDto, userId) {
        const role = await this.findOne(id);
        if (role.isSystemRole) {
            throw new common_1.BadRequestException('Cannot modify system roles');
        }
        const { permissionIds, ...roleData } = updateRoleDto;
        Object.assign(role, roleData);
        role.updatedBy = userId;
        await this.roleRepository.save(role);
        if (permissionIds !== undefined) {
            await this.rolePermissionRepository.delete({ roleId: id });
            if (permissionIds.length > 0) {
                await this.assignPermissions(id, permissionIds);
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        const role = await this.findOne(id);
        if (role.isSystemRole) {
            throw new common_1.BadRequestException('Cannot delete system roles');
        }
        await this.roleRepository.update(id, { isActive: false });
    }
    async getAllPermissions() {
        return this.permissionRepository.find({
            order: {
                module: 'ASC',
                action: 'ASC',
            },
        });
    }
    async checkPermission(roleId, module, action) {
        const count = await this.rolePermissionRepository
            .createQueryBuilder('rp')
            .innerJoin('rp.permission', 'p')
            .where('rp.role_id = :roleId', { roleId })
            .andWhere('p.module = :module', { module })
            .andWhere('p.action = :action', { action })
            .getCount();
        return count > 0;
    }
    async getUserPermissions(roleId) {
        const rolePermissions = await this.rolePermissionRepository.find({
            where: { roleId },
            relations: ['permission'],
        });
        return rolePermissions.map(rp => rp.permission);
    }
    async assignPermissions(roleId, permissionIds) {
        const permissions = await this.permissionRepository.find({
            where: { id: (0, typeorm_2.In)(permissionIds) },
        });
        if (permissions.length !== permissionIds.length) {
            throw new common_1.BadRequestException('Some permissions not found');
        }
        const rolePermissions = permissionIds.map(permissionId => this.rolePermissionRepository.create({
            roleId,
            permissionId,
        }));
        await this.rolePermissionRepository.save(rolePermissions);
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(1, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __param(2, (0, typeorm_1.InjectRepository)(role_permission_entity_1.RolePermission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RolesService);
//# sourceMappingURL=roles.service.js.map