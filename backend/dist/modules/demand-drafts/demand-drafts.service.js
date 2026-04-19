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
var DemandDraftsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemandDraftsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const demand_draft_entity_1 = require("./entities/demand-draft.entity");
const user_entity_1 = require("../users/entities/user.entity");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_entity_1 = require("../notifications/entities/notification.entity");
let DemandDraftsService = DemandDraftsService_1 = class DemandDraftsService {
    constructor(demandDraftRepository, userRepository, notificationsService) {
        this.demandDraftRepository = demandDraftRepository;
        this.userRepository = userRepository;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(DemandDraftsService_1.name);
    }
    async findAll(query, accessiblePropertyIds) {
        const queryBuilder = this.demandDraftRepository.createQueryBuilder('draft');
        if (query.flatId) {
            queryBuilder.andWhere('draft.flatId = :flatId', { flatId: query.flatId });
        }
        if (query.customerId) {
            queryBuilder.andWhere('draft.customerId = :customerId', { customerId: query.customerId });
        }
        if (query.bookingId) {
            queryBuilder.andWhere('draft.bookingId = :bookingId', { bookingId: query.bookingId });
        }
        if (query.status) {
            queryBuilder.andWhere('draft.status = :status', { status: query.status });
        }
        if (query.requiresReview !== undefined) {
            queryBuilder.andWhere('draft.requiresReview = :requiresReview', {
                requiresReview: query.requiresReview === 'true',
            });
        }
        const wantsPropertyScope = !!query.propertyId ||
            (accessiblePropertyIds && accessiblePropertyIds.length > 0);
        if (wantsPropertyScope) {
            queryBuilder.leftJoin('flats', 'flat', 'flat.id = draft.flatId');
            if (query.propertyId) {
                if (accessiblePropertyIds &&
                    accessiblePropertyIds.length > 0 &&
                    !accessiblePropertyIds.includes(query.propertyId)) {
                    queryBuilder.andWhere('1 = 0');
                }
                else {
                    queryBuilder.andWhere('flat.property_id = :propertyId', {
                        propertyId: query.propertyId,
                    });
                }
            }
            else if (accessiblePropertyIds && accessiblePropertyIds.length > 0) {
                queryBuilder.andWhere('flat.property_id IN (:...accessiblePropertyIds)', { accessiblePropertyIds });
            }
        }
        queryBuilder.orderBy('draft.createdAt', 'DESC');
        return await queryBuilder.getMany();
    }
    async findOne(id) {
        const draft = await this.demandDraftRepository.findOne({ where: { id } });
        if (!draft) {
            throw new common_1.NotFoundException(`Demand draft with ID ${id} not found`);
        }
        return draft;
    }
    async create(createDto, userId) {
        const draft = this.demandDraftRepository.create({
            ...createDto,
            createdBy: userId,
            updatedBy: userId,
        });
        const saved = (await this.demandDraftRepository.save(draft));
        if (saved.customerId) {
            this.notifyCustomerOnDraftCreated(saved).catch(e => this.logger.warn(`Failed to send demand draft notification: ${e.message}`));
        }
        return saved;
    }
    async notifyCustomerOnDraftCreated(draft) {
        const customerUser = await this.userRepository.findOne({
            where: { customerId: draft.customerId },
            select: ['id'],
        });
        if (!customerUser)
            return;
        const amt = draft.amount
            ? new Intl.NumberFormat('en-IN', {
                style: 'currency', currency: 'INR', maximumFractionDigits: 0,
            }).format(Number(draft.amount))
            : '';
        await this.notificationsService.create({
            userId: customerUser.id,
            title: 'Demand Draft Issued',
            message: `A demand draft${amt ? ` of ${amt}` : ''} has been generated${draft.title ? ` for "${draft.title}"` : ''}.`,
            type: notification_entity_1.NotificationType.INFO,
            category: notification_entity_1.NotificationCategory.PAYMENT,
            actionUrl: draft.bookingId ? `/portal/bookings/${draft.bookingId}` : '/portal/payments',
            actionLabel: 'View Details',
            relatedEntityId: draft.id,
            relatedEntityType: 'demand_draft',
        });
    }
    async update(id, updateDto, userId) {
        const draft = await this.findOne(id);
        for (const key in updateDto) {
            if (updateDto.hasOwnProperty(key)) {
                draft[key] = updateDto[key];
            }
        }
        draft.updatedBy = userId;
        return this.demandDraftRepository.save(draft);
    }
    async remove(id) {
        await this.findOne(id);
        await this.demandDraftRepository.delete(id);
    }
};
exports.DemandDraftsService = DemandDraftsService;
exports.DemandDraftsService = DemandDraftsService = DemandDraftsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(demand_draft_entity_1.DemandDraft)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], DemandDraftsService);
//# sourceMappingURL=demand-drafts.service.js.map