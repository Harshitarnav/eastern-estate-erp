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
exports.DailyProgressReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const daily_progress_report_entity_1 = require("./entities/daily-progress-report.entity");
let DailyProgressReportsService = class DailyProgressReportsService {
    constructor(reportsRepository) {
        this.reportsRepository = reportsRepository;
    }
    async create(createDto) {
        const report = this.reportsRepository.create(createDto);
        return await this.reportsRepository.save(report);
    }
    async findAll(filters) {
        const query = this.reportsRepository.createQueryBuilder('report');
        if (filters?.projectId) {
            query.andWhere('report.constructionProjectId = :projectId', { projectId: filters.projectId });
        }
        if (filters?.fromDate) {
            query.andWhere('report.reportDate >= :fromDate', { fromDate: filters.fromDate });
        }
        if (filters?.toDate) {
            query.andWhere('report.reportDate <= :toDate', { toDate: filters.toDate });
        }
        return await query.orderBy('report.reportDate', 'DESC').getMany();
    }
    async findOne(id) {
        const report = await this.reportsRepository.findOne({ where: { id } });
        if (!report) {
            throw new common_1.NotFoundException(`Report with ID ${id} not found`);
        }
        return report;
    }
    async update(id, updateDto) {
        const report = await this.findOne(id);
        Object.assign(report, updateDto);
        return await this.reportsRepository.save(report);
    }
    async remove(id) {
        await this.reportsRepository.delete(id);
    }
    async getAttendanceSummary(projectId, month, year) {
        const reports = await this.reportsRepository
            .createQueryBuilder('report')
            .where('report.constructionProjectId = :projectId', { projectId })
            .andWhere('EXTRACT(MONTH FROM report.reportDate) = :month', { month })
            .andWhere('EXTRACT(YEAR FROM report.reportDate) = :year', { year })
            .getMany();
        const totalPresent = reports.reduce((sum, r) => sum + (r.workersPresent || 0), 0);
        const totalAbsent = reports.reduce((sum, r) => sum + (r.workersAbsent || 0), 0);
        const avgAttendance = reports.length > 0 ? totalPresent / reports.length : 0;
        return {
            totalPresent,
            totalAbsent,
            avgAttendance: Math.round(avgAttendance * 100) / 100,
            totalDays: reports.length
        };
    }
};
exports.DailyProgressReportsService = DailyProgressReportsService;
exports.DailyProgressReportsService = DailyProgressReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(daily_progress_report_entity_1.DailyProgressReport)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DailyProgressReportsService);
//# sourceMappingURL=daily-progress-reports.service.js.map