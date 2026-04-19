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
exports.DemandDraftTemplateService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const demand_draft_template_entity_1 = require("../entities/demand-draft-template.entity");
const demand_draft_template_defaults_1 = require("./demand-draft-template.defaults");
let DemandDraftTemplateService = class DemandDraftTemplateService {
    constructor(templateRepository) {
        this.templateRepository = templateRepository;
    }
    async create(createDto, userId) {
        const template = this.templateRepository.create({
            ...createDto,
            createdBy: userId,
            updatedBy: userId,
        });
        return await this.templateRepository.save(template);
    }
    async findAll(activeOnly = false) {
        const query = this.templateRepository.createQueryBuilder('template')
            .orderBy('template.createdAt', 'DESC');
        if (activeOnly) {
            query.where('template.isActive = :isActive', { isActive: true });
        }
        return await query.getMany();
    }
    async findOne(id) {
        const template = await this.templateRepository.findOne({ where: { id } });
        if (!template) {
            throw new common_1.NotFoundException(`Demand draft template with ID ${id} not found`);
        }
        return template;
    }
    async findFirstActive() {
        return await this.templateRepository.findOne({
            where: { isActive: true },
            order: { createdAt: 'ASC' }
        });
    }
    async findByTone(tone) {
        const exact = await this.templateRepository.findOne({
            where: { isActive: true, tone },
            order: { createdAt: 'ASC' },
        });
        if (exact)
            return exact;
        return this.findFirstActive();
    }
    async seedDefaultTones() {
        const defaults = [
            {
                tone: 'ON_TIME',
                name: 'Default Demand Letter',
                subject: 'Payment Demand - {{milestoneName}} - {{flatNumber}}',
                html: demand_draft_template_defaults_1.DEFAULT_TONE_HTML.ON_TIME,
            },
            {
                tone: 'REMINDER_1',
                name: 'Gentle Reminder (7 days overdue)',
                subject: 'Friendly Reminder: Payment Due for {{flatNumber}}',
                html: demand_draft_template_defaults_1.DEFAULT_TONE_HTML.REMINDER_1,
            },
            {
                tone: 'REMINDER_2',
                name: 'Firm Reminder (14 days overdue)',
                subject: 'Important: Payment Overdue for {{flatNumber}} ({{daysOverdue}} days)',
                html: demand_draft_template_defaults_1.DEFAULT_TONE_HTML.REMINDER_2,
            },
            {
                tone: 'REMINDER_3',
                name: 'Final Notice (21 days overdue)',
                subject: 'FINAL NOTICE: Payment Overdue - {{flatNumber}}',
                html: demand_draft_template_defaults_1.DEFAULT_TONE_HTML.REMINDER_3,
            },
            {
                tone: 'REMINDER_4',
                name: 'Last Chance Notice (28 days overdue)',
                subject: 'LAST CHANCE: Clear Your Payment - {{flatNumber}}',
                html: demand_draft_template_defaults_1.DEFAULT_TONE_HTML.REMINDER_4,
            },
            {
                tone: 'CANCELLATION_WARNING',
                name: 'Cancellation Warning (30+ days overdue)',
                subject: 'NOTICE OF CANCELLATION WARNING - Booking {{bookingNumber}}',
                html: demand_draft_template_defaults_1.DEFAULT_TONE_HTML.CANCELLATION_WARNING,
            },
            {
                tone: 'POST_WARNING',
                name: 'Post-Warning Weekly Reminder',
                subject: 'Continued Payment Default - Booking {{bookingNumber}} ({{daysOverdue}} days overdue)',
                html: demand_draft_template_defaults_1.DEFAULT_TONE_HTML.POST_WARNING,
            },
        ];
        for (const d of defaults) {
            const existing = await this.templateRepository.findOne({
                where: { tone: d.tone },
            });
            if (existing)
                continue;
            await this.templateRepository.save(this.templateRepository.create({
                tone: d.tone,
                name: d.name,
                subject: d.subject,
                htmlContent: d.html,
                isActive: true,
                description: `Auto-seeded default template for tone ${d.tone}`,
            }));
        }
    }
    async update(id, updateDto, userId) {
        const template = await this.findOne(id);
        Object.assign(template, {
            ...updateDto,
            updatedBy: userId,
        });
        return await this.templateRepository.save(template);
    }
    async remove(id, userId) {
        const template = await this.findOne(id);
        template.isActive = false;
        template.updatedBy = userId;
        await this.templateRepository.save(template);
    }
    renderTemplate(template, data) {
        let subject = template.subject;
        let htmlContent = template.htmlContent;
        Object.keys(data).forEach(key => {
            const placeholder = new RegExp(`{{${key}}}`, 'g');
            const value = data[key] !== null && data[key] !== undefined ? String(data[key]) : '';
            subject = subject.replace(placeholder, value);
            htmlContent = htmlContent.replace(placeholder, value);
        });
        return { subject, htmlContent };
    }
};
exports.DemandDraftTemplateService = DemandDraftTemplateService;
exports.DemandDraftTemplateService = DemandDraftTemplateService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(demand_draft_template_entity_1.DemandDraftTemplate)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DemandDraftTemplateService);
//# sourceMappingURL=demand-draft-template.service.js.map