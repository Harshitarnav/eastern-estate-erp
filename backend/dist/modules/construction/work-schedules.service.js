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
exports.WorkSchedulesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const work_schedule_entity_1 = require("./entities/work-schedule.entity");
let WorkSchedulesService = class WorkSchedulesService {
    constructor(schedulesRepository) {
        this.schedulesRepository = schedulesRepository;
    }
    async create(createDto) {
        const schedule = this.schedulesRepository.create(createDto);
        return await this.schedulesRepository.save(schedule);
    }
    async findAll(filters) {
        const query = this.schedulesRepository.createQueryBuilder('schedule');
        if (filters?.projectId) {
            query.andWhere('schedule.constructionProjectId = :projectId', { projectId: filters.projectId });
        }
        if (filters?.assignedTo) {
            query.andWhere('schedule.assignedTo = :assignedTo', { assignedTo: filters.assignedTo });
        }
        if (filters?.status) {
            query.andWhere('schedule.status = :status', { status: filters.status });
        }
        return await query.orderBy('schedule.startDate', 'ASC').getMany();
    }
    async findOne(id) {
        const schedule = await this.schedulesRepository.findOne({ where: { id } });
        if (!schedule) {
            throw new common_1.NotFoundException(`Work schedule with ID ${id} not found`);
        }
        return schedule;
    }
    async update(id, updateDto) {
        const schedule = await this.findOne(id);
        Object.assign(schedule, updateDto);
        return await this.schedulesRepository.save(schedule);
    }
    async remove(id) {
        await this.schedulesRepository.delete(id);
    }
    async updateProgress(id, progress) {
        const schedule = await this.findOne(id);
        schedule.progressPercentage = progress;
        if (progress === 100) {
            schedule.status = 'COMPLETED';
        }
        else if (progress > 0) {
            schedule.status = 'IN_PROGRESS';
        }
        return await this.schedulesRepository.save(schedule);
    }
    async getUpcomingTasks(projectId, days = 7) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        return await this.schedulesRepository
            .createQueryBuilder('schedule')
            .where('schedule.constructionProjectId = :projectId', { projectId })
            .andWhere('schedule.startDate <= :futureDate', { futureDate })
            .andWhere('schedule.status != :status', { status: 'COMPLETED' })
            .orderBy('schedule.startDate', 'ASC')
            .getMany();
    }
    async getOverdueTasks(projectId) {
        const today = new Date();
        return await this.schedulesRepository
            .createQueryBuilder('schedule')
            .where('schedule.constructionProjectId = :projectId', { projectId })
            .andWhere('schedule.endDate < :today', { today })
            .andWhere('schedule.status != :status', { status: 'COMPLETED' })
            .orderBy('schedule.endDate', 'ASC')
            .getMany();
    }
    async getTasksByEngineer(engineerId) {
        return await this.schedulesRepository
            .createQueryBuilder('schedule')
            .where('schedule.assignedTo = :engineerId', { engineerId })
            .andWhere('schedule.status != :status', { status: 'COMPLETED' })
            .orderBy('schedule.startDate', 'ASC')
            .getMany();
    }
};
exports.WorkSchedulesService = WorkSchedulesService;
exports.WorkSchedulesService = WorkSchedulesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(work_schedule_entity_1.WorkSchedule)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], WorkSchedulesService);
//# sourceMappingURL=work-schedules.service.js.map