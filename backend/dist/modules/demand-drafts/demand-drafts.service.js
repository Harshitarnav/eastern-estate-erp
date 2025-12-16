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
exports.DemandDraftsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const demand_draft_entity_1 = require("./entities/demand-draft.entity");
const demand_draft_response_dto_1 = require("./dto/demand-draft-response.dto");
let DemandDraftsService = class DemandDraftsService {
    constructor(draftsRepo) {
        this.draftsRepo = draftsRepo;
    }
    async create(dto) {
        const draft = this.draftsRepo.create({
            ...dto,
            status: dto.status || demand_draft_entity_1.DemandDraftStatus.DRAFT,
            generatedAt: new Date(),
            content: dto.content || this.buildDefaultContent(dto),
        });
        const saved = await this.draftsRepo.save(draft);
        return demand_draft_response_dto_1.DemandDraftResponseDto.fromEntity(saved);
    }
    async findAll(filters) {
        const qb = this.draftsRepo.createQueryBuilder('draft').orderBy('draft.createdAt', 'DESC');
        if (filters.flatId)
            qb.andWhere('draft.flatId = :flatId', { flatId: filters.flatId });
        if (filters.customerId)
            qb.andWhere('draft.customerId = :customerId', { customerId: filters.customerId });
        if (filters.bookingId)
            qb.andWhere('draft.bookingId = :bookingId', { bookingId: filters.bookingId });
        if (filters.milestoneId)
            qb.andWhere('draft.milestoneId = :milestoneId', { milestoneId: filters.milestoneId });
        const drafts = await qb.getMany();
        return demand_draft_response_dto_1.DemandDraftResponseDto.fromEntities(drafts);
    }
    async findOne(id) {
        const draft = await this.draftsRepo.findOne({ where: { id } });
        if (!draft) {
            throw new common_1.NotFoundException(`Demand draft ${id} not found`);
        }
        return demand_draft_response_dto_1.DemandDraftResponseDto.fromEntity(draft);
    }
    async update(id, dto) {
        const draft = await this.draftsRepo.findOne({ where: { id } });
        if (!draft) {
            throw new common_1.NotFoundException(`Demand draft ${id} not found`);
        }
        if (dto.status === demand_draft_entity_1.DemandDraftStatus.SENT) {
            draft.sentAt = draft.sentAt || new Date();
        }
        Object.assign(draft, dto);
        const saved = await this.draftsRepo.save(draft);
        return demand_draft_response_dto_1.DemandDraftResponseDto.fromEntity(saved);
    }
    async markSent(id, fileUrl) {
        const draft = await this.draftsRepo.findOne({ where: { id } });
        if (!draft) {
            throw new common_1.NotFoundException(`Demand draft ${id} not found`);
        }
        draft.status = demand_draft_entity_1.DemandDraftStatus.SENT;
        draft.sentAt = new Date();
        if (fileUrl) {
            draft.fileUrl = fileUrl;
        }
        const saved = await this.draftsRepo.save(draft);
        return demand_draft_response_dto_1.DemandDraftResponseDto.fromEntity(saved);
    }
    buildDefaultContent(dto) {
        const name = dto?.customerName || 'Customer';
        const address = dto?.customerAddress || '—';
        const subjectMilestone = dto.milestoneId || 'construction milestone';
        const amount = dto.amount ? Number(dto.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) : '₹0';
        const flatInfo = dto?.flatInfo || 'Flat';
        const bankDetails = dto?.bankDetails || {
            accountHolder: 'Eastern Estate Construction & Developer’s Pvt. Ltd.',
            accountNumber: 'XXXXXXXXXXXX',
            ifsc: 'SBINXXXXXXX',
        };
        return `To,
${name}
${address}

Subject: Release of payment for ${subjectMilestone}.

Dear Sir/Madam,

In respect of the above we would like to mention that construction work for ${flatInfo} is under construction and has reached ${subjectMilestone}. As per the agreement, payment up to this stage has fallen due as detailed below:

Amount Due: ${amount}

You are requested to release the above amount via DD/NEFT/RTGS as per our bank details given below.
Account Holder : ${bankDetails.accountHolder}
Account Number : ${bankDetails.accountNumber}
IFSC : ${bankDetails.ifsc}

Thanking You

Yours Faithfully
Eastern Estate Construction & Developer’s Pvt. Ltd.
www.eecd.in
`;
    }
};
exports.DemandDraftsService = DemandDraftsService;
exports.DemandDraftsService = DemandDraftsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(demand_draft_entity_1.DemandDraft)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DemandDraftsService);
//# sourceMappingURL=demand-drafts.service.js.map