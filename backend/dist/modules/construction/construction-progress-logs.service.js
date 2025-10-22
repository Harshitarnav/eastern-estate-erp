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
exports.ConstructionProgressLogsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const construction_progress_log_entity_1 = require("./entities/construction-progress-log.entity");
let ConstructionProgressLogsService = class ConstructionProgressLogsService {
    constructor(constructionProgressLogRepository) {
        this.constructionProgressLogRepository = constructionProgressLogRepository;
    }
    async create(createDto) {
        const log = this.constructionProgressLogRepository.create({
            ...createDto,
            logDate: createDto.logDate ? new Date(createDto.logDate) : new Date(),
        });
        return await this.constructionProgressLogRepository.save(log);
    }
    async findByProject(constructionProjectId) {
        return await this.constructionProgressLogRepository.find({
            where: { constructionProjectId },
            relations: ['constructionProject', 'loggedBy'],
            order: { logDate: 'DESC' },
        });
    }
    async findOne(id) {
        const log = await this.constructionProgressLogRepository.findOne({
            where: { id },
            relations: ['constructionProject', 'loggedBy'],
        });
        if (!log) {
            throw new common_1.NotFoundException(`Progress log with ID ${id} not found`);
        }
        return log;
    }
    async update(id, updateDto) {
        const log = await this.findOne(id);
        Object.assign(log, updateDto);
        if (updateDto.logDate) {
            log.logDate = new Date(updateDto.logDate);
        }
        return await this.constructionProgressLogRepository.save(log);
    }
    async remove(id) {
        const log = await this.findOne(id);
        await this.constructionProgressLogRepository.remove(log);
    }
    async getLatestByProject(constructionProjectId) {
        return await this.constructionProgressLogRepository.findOne({
            where: { constructionProjectId },
            relations: ['loggedBy'],
            order: { logDate: 'DESC' },
        });
    }
};
exports.ConstructionProgressLogsService = ConstructionProgressLogsService;
exports.ConstructionProgressLogsService = ConstructionProgressLogsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(construction_progress_log_entity_1.ConstructionProgressLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ConstructionProgressLogsService);
//# sourceMappingURL=construction-progress-logs.service.js.map