import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentPlanTemplate } from '../entities/payment-plan-template.entity';
import { CreatePaymentPlanTemplateDto } from '../dto/create-payment-plan-template.dto';
import { UpdatePaymentPlanTemplateDto } from '../dto/update-payment-plan-template.dto';

@Injectable()
export class PaymentPlanTemplateService {
  constructor(
    @InjectRepository(PaymentPlanTemplate)
    private readonly templateRepository: Repository<PaymentPlanTemplate>,
  ) {}

  /**
   * Create a new payment plan template
   */
  async create(createDto: CreatePaymentPlanTemplateDto, userId: string): Promise<PaymentPlanTemplate> {
    // Validate that total percentage is 100
    const totalPercentage = createDto.milestones.reduce((sum, m) => sum + m.paymentPercentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new BadRequestException(`Total milestone percentages must equal 100. Current total: ${totalPercentage}`);
    }

    // If setting as default, unset other defaults
    if (createDto.isDefault) {
      await this.templateRepository.update(
        { isDefault: true },
        { isDefault: false }
      );
    }

    const template = this.templateRepository.create({
      ...createDto,
      totalPercentage,
      createdBy: userId,
      updatedBy: userId,
    });

    return await this.templateRepository.save(template);
  }

  /**
   * Get all templates
   */
  async findAll(activeOnly: boolean = false): Promise<PaymentPlanTemplate[]> {
    const query = this.templateRepository.createQueryBuilder('template')
      .orderBy('template.isDefault', 'DESC')
      .addOrderBy('template.createdAt', 'DESC');

    if (activeOnly) {
      query.where('template.isActive = :isActive', { isActive: true });
    }

    return await query.getMany();
  }

  /**
   * Get template by ID
   */
  async findOne(id: string): Promise<PaymentPlanTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Payment plan template with ID ${id} not found`);
    }
    return template;
  }

  /**
   * Get default template
   */
  async findDefault(): Promise<PaymentPlanTemplate | null> {
    return await this.templateRepository.findOne({
      where: { isDefault: true, isActive: true }
    });
  }

  /**
   * Update template
   */
  async update(id: string, updateDto: UpdatePaymentPlanTemplateDto, userId: string): Promise<PaymentPlanTemplate> {
    const template = await this.findOne(id);

    // Validate total percentage if milestones are being updated
    if (updateDto.milestones) {
      const totalPercentage = updateDto.milestones.reduce((sum, m) => sum + m.paymentPercentage, 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new BadRequestException(`Total milestone percentages must equal 100. Current total: ${totalPercentage}`);
      }
    }

    // If setting as default, unset other defaults
    if (updateDto.isDefault && !template.isDefault) {
      await this.templateRepository.update(
        { isDefault: true },
        { isDefault: false }
      );
    }

    Object.assign(template, {
      ...updateDto,
      updatedBy: userId,
    });

    return await this.templateRepository.save(template);
  }

  /**
   * Delete template (soft delete by setting inactive)
   */
  async remove(id: string, userId: string): Promise<void> {
    const template = await this.findOne(id);
    
    if (template.isDefault) {
      throw new BadRequestException('Cannot delete the default template');
    }

    template.isActive = false;
    template.updatedBy = userId;
    await this.templateRepository.save(template);
  }
}
