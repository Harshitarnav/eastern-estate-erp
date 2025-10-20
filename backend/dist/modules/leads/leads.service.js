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
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lead_entity_1 = require("./entities/lead.entity");
const user_entity_1 = require("../users/entities/user.entity");
const dto_1 = require("./dto");
let LeadsService = class LeadsService {
    constructor(leadsRepository) {
        this.leadsRepository = leadsRepository;
    }
    async generateLeadCode() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const count = await this.leadsRepository.count({
            where: {
                createdAt: startOfMonth,
            },
        });
        const sequence = (count + 1).toString().padStart(4, '0');
        return `LD${year}${month}${sequence}`;
    }
    async create(createLeadDto) {
        const existing = await this.leadsRepository.findOne({
            where: [
                { email: createLeadDto.email },
                { phoneNumber: createLeadDto.phone },
            ],
        });
        if (existing) {
            throw new common_1.ConflictException('Lead with this email or phone already exists');
        }
        const leadCode = await this.generateLeadCode();
        const { firstName, lastName, phone, ...rest } = createLeadDto;
        const fullName = `${firstName} ${lastName}`.trim();
        const lead = this.leadsRepository.create({
            ...rest,
            leadCode,
            fullName,
            phoneNumber: phone,
        });
        const savedLead = await this.leadsRepository.save(lead);
        return dto_1.LeadResponseDto.fromEntity(savedLead);
    }
    async findAll(query) {
        const { search, status, source, priority, assignedTo, isQualified, needsHomeLoan, hasSiteVisit, minBudget, maxBudget, createdFrom, createdTo, followUpDue, isActive, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', } = query;
        const queryBuilder = this.leadsRepository
            .createQueryBuilder('lead')
            .leftJoinAndMapOne('lead.assignedUser', user_entity_1.User, 'assignedUser', '"assignedUser"."id"::text = "lead"."assigned_to"');
        if (search) {
            queryBuilder.andWhere('(lead.fullName ILIKE :search OR lead.email ILIKE :search OR lead.phoneNumber ILIKE :search)', { search: `%${search}%` });
        }
        if (status) {
            queryBuilder.andWhere('lead.status = :status', { status });
        }
        if (source) {
            queryBuilder.andWhere('lead.source = :source', { source });
        }
        if (priority) {
            queryBuilder.andWhere('lead.priority = :priority', { priority });
        }
        if (assignedTo) {
            queryBuilder.andWhere('lead.assignedTo = :assignedTo', {
                assignedTo,
            });
        }
        if (isQualified !== undefined) {
            queryBuilder.andWhere('lead.isQualified = :isQualified', {
                isQualified,
            });
        }
        if (needsHomeLoan !== undefined) {
            queryBuilder.andWhere('lead.needsHomeLoan = :needsHomeLoan', {
                needsHomeLoan,
            });
        }
        if (hasSiteVisit !== undefined) {
            queryBuilder.andWhere('lead.hasSiteVisit = :hasSiteVisit', {
                hasSiteVisit,
            });
        }
        if (minBudget !== undefined) {
            queryBuilder.andWhere('lead.budgetMin >= :minBudget', { minBudget });
        }
        if (maxBudget !== undefined) {
            queryBuilder.andWhere('lead.budgetMax <= :maxBudget', { maxBudget });
        }
        if (createdFrom) {
            queryBuilder.andWhere('lead.createdAt >= :createdFrom', { createdFrom });
        }
        if (createdTo) {
            queryBuilder.andWhere('lead.createdAt <= :createdTo', { createdTo });
        }
        if (followUpDue) {
            queryBuilder.andWhere('lead.nextFollowUpDate <= :followUpDue', {
                followUpDue,
            });
        }
        if (isActive !== undefined) {
            queryBuilder.andWhere('lead.isActive = :isActive', { isActive });
        }
        queryBuilder.orderBy(`lead.${sortBy}`, sortOrder);
        const total = await queryBuilder.getCount();
        const leads = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return {
            data: dto_1.LeadResponseDto.fromEntities(leads),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const lead = await this.leadsRepository
            .createQueryBuilder('lead')
            .leftJoinAndMapOne('lead.assignedUser', user_entity_1.User, 'assignedUser', '"assignedUser"."id"::text = "lead"."assigned_to"')
            .where('lead.id = :id', { id })
            .getOne();
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${id} not found`);
        }
        return dto_1.LeadResponseDto.fromEntity(lead);
    }
    async update(id, updateLeadDto) {
        const lead = await this.leadsRepository.findOne({ where: { id } });
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${id} not found`);
        }
        if (updateLeadDto.email || updateLeadDto.phone) {
            const existing = await this.leadsRepository.findOne({
                where: [
                    { email: updateLeadDto.email || lead.email },
                    { phoneNumber: updateLeadDto.phone || lead.phoneNumber },
                ],
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException('Lead with this email or phone already exists');
            }
        }
        const { firstName, lastName, phone, ...rest } = updateLeadDto;
        if (firstName || lastName) {
            const newFirstName = firstName || lead.firstName;
            const newLastName = lastName || lead.lastName;
            lead.fullName = `${newFirstName} ${newLastName}`.trim();
        }
        if (phone) {
            lead.phoneNumber = phone;
        }
        Object.assign(lead, rest);
        const updatedLead = await this.leadsRepository.save(lead);
        return dto_1.LeadResponseDto.fromEntity(updatedLead);
    }
    async remove(id) {
        const lead = await this.leadsRepository.findOne({ where: { id } });
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${id} not found`);
        }
        lead.isActive = false;
        await this.leadsRepository.save(lead);
    }
    async assignLead(id, userId) {
        const lead = await this.leadsRepository.findOne({ where: { id } });
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${id} not found`);
        }
        lead.assignedTo = userId;
        lead.assignedAt = new Date();
        const updatedLead = await this.leadsRepository.save(lead);
        return dto_1.LeadResponseDto.fromEntity(updatedLead);
    }
    async updateStatus(id, status, notes) {
        const lead = await this.leadsRepository.findOne({ where: { id } });
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${id} not found`);
        }
        lead.status = status;
        if (notes) {
            lead.followUpNotes = lead.followUpNotes ? `${lead.followUpNotes}\n${notes}` : notes;
        }
        const updatedLead = await this.leadsRepository.save(lead);
        return dto_1.LeadResponseDto.fromEntity(updatedLead);
    }
    async getStatistics() {
        const leads = await this.leadsRepository.find({
            where: { isActive: true },
        });
        const total = leads.length;
        const newLeads = leads.filter((l) => l.status === 'NEW').length;
        const contacted = leads.filter((l) => l.status === 'CONTACTED').length;
        const qualified = leads.filter((l) => l.status === 'QUALIFIED').length;
        const won = leads.filter((l) => l.status === 'WON').length;
        const lost = leads.filter((l) => l.status === 'LOST').length;
        const conversionRate = total > 0 ? (won / total) * 100 : 0;
        return {
            total,
            newLeads,
            contacted,
            qualified,
            won,
            lost,
            conversionRate: Math.round(conversionRate * 100) / 100,
        };
    }
    async getMyLeads(userId) {
        const leads = await this.leadsRepository
            .createQueryBuilder('lead')
            .leftJoinAndMapOne('lead.assignedUser', user_entity_1.User, 'assignedUser', '\"assignedUser\".\"id\"::text = \"lead\".\"assigned_to\"')
            .where('lead.assignedTo = :userId', { userId })
            .andWhere('lead.isActive = true')
            .orderBy('lead.createdAt', 'DESC')
            .getMany();
        return dto_1.LeadResponseDto.fromEntities(leads);
    }
    async getDueFollowUps(userId) {
        const queryBuilder = this.leadsRepository
            .createQueryBuilder('lead')
            .leftJoinAndMapOne('lead.assignedUser', user_entity_1.User, 'assignedUser', '\"assignedUser\".\"id\"::text = \"lead\".\"assigned_to\"')
            .where('lead.nextFollowUpDate <= :today', { today: new Date() })
            .andWhere('lead.isActive = true');
        if (userId) {
            queryBuilder.andWhere('lead.assignedTo = :userId', { userId });
        }
        const leads = await queryBuilder.getMany();
        return dto_1.LeadResponseDto.fromEntities(leads);
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lead_entity_1.Lead)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LeadsService);
//# sourceMappingURL=leads.service.js.map