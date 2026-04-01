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
exports.CustomerPortalGuard = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
let CustomerPortalGuard = class CustomerPortalGuard {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user)
            throw new common_1.UnauthorizedException();
        const roles = (user.roles || []).map((r) => typeof r === 'string' ? r : r.name);
        if (!roles.includes('customer') && !roles.includes('super_admin') && !roles.includes('admin')) {
            throw new common_1.ForbiddenException('Customer portal access only');
        }
        const fullUser = await this.usersRepository.findOne({
            where: { id: user.id },
            select: ['id', 'customerId'],
        });
        if (!fullUser?.customerId) {
            throw new common_1.ForbiddenException('Your account is not linked to a customer profile. Please contact support.');
        }
        request.customerId = fullUser.customerId;
        return true;
    }
};
exports.CustomerPortalGuard = CustomerPortalGuard;
exports.CustomerPortalGuard = CustomerPortalGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CustomerPortalGuard);
//# sourceMappingURL=customer-portal.guard.js.map