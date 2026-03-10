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
var SettingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const company_settings_entity_1 = require("./entities/company-settings.entity");
let SettingsService = SettingsService_1 = class SettingsService {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(SettingsService_1.name);
    }
    async onModuleInit() {
        try {
            const count = await this.repo.count();
            if (count === 0) {
                await this.repo.save(this.repo.create({ companyName: 'Eastern Estate', tagline: 'Construction & Development' }));
            }
        }
        catch {
            this.logger.warn('company_settings table not ready yet — will be created by SchemaSyncService');
        }
    }
    async get() {
        const rows = await this.repo
            .createQueryBuilder('s')
            .addSelect('s.smtpPass')
            .getMany();
        if (rows.length === 0) {
            return this.repo.save(this.repo.create({ companyName: 'Eastern Estate' }));
        }
        return rows[0];
    }
    async update(dto) {
        const settings = await this.get();
        Object.assign(settings, dto);
        return this.repo.save(settings);
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = SettingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(company_settings_entity_1.CompanySettings)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SettingsService);
//# sourceMappingURL=settings.service.js.map