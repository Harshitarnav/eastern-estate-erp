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
var ConstructionProgressLogsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstructionProgressLogsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const construction_progress_log_entity_1 = require("./entities/construction-progress-log.entity");
const construction_project_entity_1 = require("./entities/construction-project.entity");
const booking_entity_1 = require("../bookings/entities/booking.entity");
const user_entity_1 = require("../users/entities/user.entity");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_entity_1 = require("../notifications/entities/notification.entity");
const flat_payment_plan_entity_1 = require("../payment-plans/entities/flat-payment-plan.entity");
const construction_workflow_service_1 = require("./services/construction-workflow.service");
let ConstructionProgressLogsService = ConstructionProgressLogsService_1 = class ConstructionProgressLogsService {
    constructor(constructionProgressLogRepository, constructionProjectRepository, bookingRepository, userRepository, flatPaymentPlanRepository, notificationsService, workflowService) {
        this.constructionProgressLogRepository = constructionProgressLogRepository;
        this.constructionProjectRepository = constructionProjectRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.flatPaymentPlanRepository = flatPaymentPlanRepository;
        this.notificationsService = notificationsService;
        this.workflowService = workflowService;
        this.logger = new common_1.Logger(ConstructionProgressLogsService_1.name);
    }
    async create(createDto) {
        let propertyId = createDto.propertyId || null;
        if (!propertyId && createDto.constructionProjectId) {
            const project = await this.constructionProjectRepository.findOne({
                where: { id: createDto.constructionProjectId },
                select: ['id', 'propertyId'],
            });
            if (project?.propertyId) {
                propertyId = project.propertyId;
            }
        }
        const log = this.constructionProgressLogRepository.create({
            constructionProjectId: createDto.constructionProjectId || null,
            propertyId,
            towerId: createDto.towerId || null,
            logDate: createDto.logDate ? new Date(createDto.logDate) : new Date(),
            progressType: createDto.progressType || null,
            description: createDto.description || createDto.workCompleted || null,
            progressPercentage: createDto.progressPercentage ?? null,
            weatherCondition: createDto.weatherCondition || null,
            temperature: createDto.temperature ?? null,
            loggedBy: createDto.loggedBy || null,
            photos: createDto.photos || [],
            shift: createDto.shift || null,
            workersPresent: createDto.workersPresent != null ? Number(createDto.workersPresent) : null,
            workersAbsent: createDto.workersAbsent != null ? Number(createDto.workersAbsent) : null,
            materialsUsed: createDto.materialsUsed || null,
            issuesDelays: createDto.issuesDelays || null,
            supervisorName: createDto.supervisorName || null,
            nextDayPlan: createDto.nextDayPlan || null,
            remarks: createDto.remarks || null,
        });
        const saved = await this.constructionProgressLogRepository.save(log);
        if (propertyId) {
            this.notifyCustomersOnProgressLog(saved, propertyId).catch(e => this.logger.warn(`Failed to send construction notification: ${e.message}`));
        }
        const workflow = await this.maybeRunWorkflow(createDto, propertyId);
        const result = Object.assign({}, saved);
        if (workflow) {
            result.workflow = workflow;
        }
        return result;
    }
    async maybeRunWorkflow(createDto, propertyId) {
        const phase = createDto.phase;
        const phaseProgress = createDto.phaseProgress != null ? Number(createDto.phaseProgress) : undefined;
        const overallProgress = Number(createDto.overallProgress ?? createDto.progressPercentage ?? 0) || 0;
        if (!phase || !Number.isFinite(phaseProgress)) {
            return undefined;
        }
        const flatId = createDto.flatId || undefined;
        const applyToAllSoldFlats = Boolean(createDto.applyToAllSoldFlats);
        let flatIds = [];
        if (flatId) {
            flatIds = [flatId];
        }
        else if (applyToAllSoldFlats && propertyId) {
            const plans = await this.flatPaymentPlanRepository
                .createQueryBuilder('plan')
                .innerJoin('plan.flat', 'flat')
                .where('plan.status = :status', { status: flat_payment_plan_entity_1.FlatPaymentPlanStatus.ACTIVE })
                .andWhere('flat.propertyId = :propertyId', { propertyId })
                .select(['plan.id', 'plan.flatId'])
                .getMany();
            flatIds = plans.map(p => p.flatId).filter(Boolean);
        }
        if (flatIds.length === 0) {
            return undefined;
        }
        const result = {
            flatsProcessed: 0,
            milestonesTriggered: 0,
            generatedDemandDrafts: [],
            errors: [],
        };
        for (const id of flatIds) {
            try {
                const r = await this.workflowService.processConstructionUpdate(id, phase, phaseProgress, overallProgress);
                result.flatsProcessed += 1;
                result.milestonesTriggered += r.milestonesTriggered;
                result.generatedDemandDrafts.push(...r.generatedDemandDrafts);
            }
            catch (err) {
                this.logger.error(`Workflow failed for flat ${id} during daily log save: ${err?.message}`);
                result.errors.push({ flatId: id, message: err?.message ?? 'Unknown error' });
            }
        }
        return result;
    }
    async notifyCustomersOnProgressLog(log, propertyId) {
        const bookings = await this.bookingRepository
            .createQueryBuilder('b')
            .select('DISTINCT b.customerId', 'customerId')
            .where('b.propertyId = :propertyId', { propertyId })
            .andWhere('b.customerId IS NOT NULL')
            .getRawMany();
        if (!bookings.length)
            return;
        const customerIds = bookings.map((b) => b.customerId).filter(Boolean);
        if (!customerIds.length)
            return;
        const users = await this.userRepository
            .createQueryBuilder('u')
            .where('u.customerId IN (:...customerIds)', { customerIds })
            .select(['u.id', 'u.customerId'])
            .getMany();
        if (!users.length)
            return;
        const logDate = log.logDate
            ? new Date(log.logDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
            : 'today';
        const workType = log.progressType || log.workType || 'Construction';
        const pct = log.progressPercentage;
        for (const user of users) {
            await this.notificationsService.create({
                userId: user.id,
                title: 'Construction Update',
                message: `New site update logged on ${logDate}${workType ? ` for ${workType.replace(/_/g, ' ')}` : ''}${pct != null ? ` - ${Math.round(Number(pct))}% progress` : ''}.`,
                type: notification_entity_1.NotificationType.INFO,
                category: notification_entity_1.NotificationCategory.CONSTRUCTION,
                actionUrl: '/portal/construction',
                actionLabel: 'View Updates',
                relatedEntityId: log.id,
                relatedEntityType: 'construction_log',
            });
        }
    }
    async findAll(filters) {
        const where = {};
        if (filters?.constructionProjectId)
            where.constructionProjectId = filters.constructionProjectId;
        if (filters?.propertyId)
            where.propertyId = filters.propertyId;
        return await this.constructionProgressLogRepository.find({
            where: Object.keys(where).length ? where : undefined,
            order: { logDate: 'DESC', createdAt: 'DESC' },
            take: 200,
        });
    }
    async findByProject(constructionProjectId) {
        return await this.constructionProgressLogRepository.find({
            where: { constructionProjectId },
            order: { logDate: 'DESC' },
        });
    }
    async findOne(id) {
        const log = await this.constructionProgressLogRepository.findOne({
            where: { id },
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
        return { success: true };
    }
    async getLatestByProject(constructionProjectId) {
        return await this.constructionProgressLogRepository.findOne({
            where: { constructionProjectId },
            order: { logDate: 'DESC' },
        });
    }
    async addPhotos(id, urls) {
        const log = await this.findOne(id);
        const existing = Array.isArray(log.photos) ? log.photos : [];
        log.photos = [...existing, ...urls];
        return await this.constructionProgressLogRepository.save(log);
    }
    async removePhoto(id, photoUrl) {
        const log = await this.findOne(id);
        const existing = Array.isArray(log.photos) ? log.photos : [];
        log.photos = existing.filter(u => u !== photoUrl);
        return await this.constructionProgressLogRepository.save(log);
    }
};
exports.ConstructionProgressLogsService = ConstructionProgressLogsService;
exports.ConstructionProgressLogsService = ConstructionProgressLogsService = ConstructionProgressLogsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(construction_progress_log_entity_1.ConstructionProgressLog)),
    __param(1, (0, typeorm_1.InjectRepository)(construction_project_entity_1.ConstructionProject)),
    __param(2, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(4, (0, typeorm_1.InjectRepository)(flat_payment_plan_entity_1.FlatPaymentPlan)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService,
        construction_workflow_service_1.ConstructionWorkflowService])
], ConstructionProgressLogsService);
//# sourceMappingURL=construction-progress-logs.service.js.map