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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const role_entity_1 = require("./entities/role.entity");
const permission_entity_1 = require("./entities/permission.entity");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(usersRepository, rolesRepository, permissionsRepository) {
        this.usersRepository = usersRepository;
        this.rolesRepository = rolesRepository;
        this.permissionsRepository = permissionsRepository;
    }
    async create(createUserDto, createdById) {
        const existingUser = await this.usersRepository.findOne({
            where: [
                { email: createUserDto.email },
                { username: createUserDto.username },
            ],
        });
        if (existingUser) {
            throw new common_1.BadRequestException('User already exists with this email or username');
        }
        const password = await bcrypt.hash(createUserDto.password, 12);
        const roles = await this.rolesRepository.find({
            where: {
                id: (0, typeorm_2.In)(createUserDto.roleIds || []),
                isActive: true
            }
        });
        const user = this.usersRepository.create({
            ...createUserDto,
            password,
            roles,
            createdBy: createdById,
        });
        return await this.usersRepository.save(user);
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, role, isActive } = query;
        const queryBuilder = this.usersRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'roles')
            .select([
            'user.id',
            'user.email',
            'user.username',
            'user.firstName',
            'user.lastName',
            'user.phone',
            'user.profileImage',
            'user.isActive',
            'user.isVerified',
            'user.lastLoginAt',
            'user.createdAt',
            'roles',
        ]);
        if (search) {
            queryBuilder.where('user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR user.username ILIKE :search', { search: `%${search}%` });
        }
        if (role) {
            queryBuilder.andWhere('roles.name = :role', { role });
        }
        if (isActive !== undefined) {
            queryBuilder.andWhere('user.isActive = :isActive', { isActive });
        }
        const [data, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('user.createdAt', 'DESC')
            .getManyAndCount();
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: ['roles', 'roles.permissions'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email) {
        return await this.usersRepository.findOne({
            where: { email },
            relations: ['roles', 'roles.permissions'],
        });
    }
    async getRoleByName(roleName) {
        return await this.rolesRepository.findOne({
            where: { name: roleName, isActive: true },
        });
    }
    async update(id, updateUserDto, updatedById) {
        const user = await this.findOne(id);
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.usersRepository.findOne({
                where: { email: updateUserDto.email },
            });
            if (existingUser) {
                throw new common_1.BadRequestException('Email already in use');
            }
        }
        if (updateUserDto.password) {
            updateUserDto['password'] = await bcrypt.hash(updateUserDto.password, 12);
            delete updateUserDto.password;
        }
        if (updateUserDto.roleIds) {
            const roles = await this.rolesRepository.find({
                where: {
                    id: (0, typeorm_2.In)(updateUserDto.roleIds),
                    isActive: true
                }
            });
            user.roles = roles;
            delete updateUserDto.roleIds;
        }
        Object.assign(user, updateUserDto);
        user.updatedBy = updatedById;
        return await this.usersRepository.save(user);
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.usersRepository.remove(user);
        return { message: 'User deleted successfully' };
    }
    async toggleActive(id) {
        const user = await this.findOne(id);
        user.isActive = !user.isActive;
        return await this.usersRepository.save(user);
    }
    async findAllRoles() {
        return await this.rolesRepository.find({
            where: { isActive: true },
            relations: ['permissions'],
            order: { name: 'ASC' },
        });
    }
    async findOneRole(id) {
        const role = await this.rolesRepository.findOne({
            where: { id, isActive: true },
            relations: ['permissions'],
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }
    async findAllPermissions() {
        return await this.permissionsRepository.find({
            order: { name: 'ASC' },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(2, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map