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
var UsersBootstrapService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersBootstrapService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("./entities/role.entity");
const user_entity_1 = require("./entities/user.entity");
let UsersBootstrapService = UsersBootstrapService_1 = class UsersBootstrapService {
    constructor(roleRepo, userRepo) {
        this.roleRepo = roleRepo;
        this.userRepo = userRepo;
        this.logger = new common_1.Logger(UsersBootstrapService_1.name);
    }
    async onModuleInit() {
        try {
            await this.ensureCoreRoles();
            await this.ensureAdminHasSuperAdmin();
        }
        catch (err) {
            this.logger.warn(`Bootstrap skipped: ${err instanceof Error ? err.message : err}`);
        }
    }
    async ensureCoreRoles() {
        const coreRoles = ['super_admin', 'admin', 'hr'];
        const existing = await this.roleRepo.find({
            where: { name: (0, typeorm_2.In)(coreRoles) },
        });
        const existingNames = new Set(existing.map((r) => r.name));
        const toCreate = coreRoles.filter((name) => !existingNames.has(name));
        if (toCreate.length) {
            const created = this.roleRepo.create(toCreate.map((name) => ({
                name,
                displayName: name.replace('_', ' ').toUpperCase(),
                description: `${name} role`,
                isSystem: true,
                isActive: true,
            })));
            await this.roleRepo.save(created);
            this.logger.log(`Created roles: ${toCreate.join(', ')}`);
        }
    }
    async ensureAdminHasSuperAdmin() {
        const adminEmail = 'admin@eastern-estate.com';
        const user = await this.userRepo.findOne({
            where: { email: adminEmail },
            relations: ['roles'],
        });
        if (!user) {
            this.logger.warn(`Admin user ${adminEmail} not found; skipping role assignment.`);
            return;
        }
        const hasSuper = user.roles?.some((r) => r.name === 'super_admin');
        if (hasSuper)
            return;
        const superRole = await this.roleRepo.findOne({ where: { name: 'super_admin' } });
        if (!superRole) {
            this.logger.warn('super_admin role not found; cannot assign to admin user.');
            return;
        }
        user.roles = [...(user.roles || []), superRole];
        await this.userRepo.save(user);
        this.logger.log(`Assigned super_admin role to ${adminEmail}`);
    }
};
exports.UsersBootstrapService = UsersBootstrapService;
exports.UsersBootstrapService = UsersBootstrapService = UsersBootstrapService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UsersBootstrapService);
//# sourceMappingURL=users.bootstrap.js.map