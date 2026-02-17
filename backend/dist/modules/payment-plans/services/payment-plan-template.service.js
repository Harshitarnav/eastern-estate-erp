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
exports.PaymentPlanTemplateService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_plan_template_entity_1 = require("../entities/payment-plan-template.entity");
let PaymentPlanTemplateService = class PaymentPlanTemplateService {
    constructor(templateRepository) {
        this.templateRepository = templateRepository;
    }
    async create(createDto, userId) {
        const totalPercentage = createDto.milestones.reduce((sum, m) => sum + m.paymentPercentage, 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
            throw new common_1.BadRequestException(`Total milestone percentages must equal 100. Current total: ${totalPercentage}`);
        }
        if (createDto.isDefault) {
            await this.templateRepository.update({ isDefault: true }, { isDefault: false });
        }
        const template = this.templateRepository.create({
            ...createDto,
            totalPercentage,
            createdBy: userId,
            updatedBy: userId,
        });
        return await this.templateRepository.save(template);
    }
    async findAll(activeOnly = false) {
        const query = this.templateRepository.createQueryBuilder('template')
            .orderBy('template.isDefault', 'DESC')
            .addOrderBy('template.createdAt', 'DESC');
        if (activeOnly) {
            query.where('template.isActive = :isActive', { isActive: true });
        }
        return await query.getMany();
    }
    async findOne(id) {
        const template = await this.templateRepository.findOne({ where: { id } });
        if (!template) {
            throw new common_1.NotFoundException(`Payment plan template with ID ${id} not found`);
        }
        return template;
    }
    async findDefault() {
        return await this.templateRepository.findOne({
            where: { isDefault: true, isActive: true }
        });
    }
    async update(id, updateDto, userId) {
        const template = await this.findOne(id);
        if (updateDto.milestones) {
            const totalPercentage = updateDto.milestones.reduce((sum, m) => sum + m.paymentPercentage, 0);
            if (Math.abs(totalPercentage - 100) > 0.01) {
                throw new common_1.BadRequestException(`Total milestone percentages must equal 100. Current total: ${totalPercentage}`);
            }
        }
        if (updateDto.isDefault && !template.isDefault) {
            await this.templateRepository.update({ isDefault: true }, { isDefault: false });
        }
        Object.assign(template, {
            ...updateDto,
            updatedBy: userId,
        });
        return await this.templateRepository.save(template);
    }
    async remove(id, userId) {
        const template = await this.findOne(id);
        if (template.isDefault) {
            throw new common_1.BadRequestException('Cannot delete the default template');
        }
        template.isActive = false;
        template.updatedBy = userId;
        await this.templateRepository.save(template);
    }
};
exports.PaymentPlanTemplateService = PaymentPlanTemplateService;
exports.PaymentPlanTemplateService = PaymentPlanTemplateService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_plan_template_entity_1.PaymentPlanTemplate)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PaymentPlanTemplateService);
//# sourceMappingURL=payment-plan-template.service.js.map