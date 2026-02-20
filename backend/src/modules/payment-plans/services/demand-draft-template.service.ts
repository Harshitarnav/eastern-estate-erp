import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DemandDraftTemplate } from '../entities/demand-draft-template.entity';
import { CreateDemandDraftTemplateDto } from '../dto/create-demand-draft-template.dto';
import { UpdateDemandDraftTemplateDto } from '../dto/update-demand-draft-template.dto';

@Injectable()
export class DemandDraftTemplateService {
  constructor(
    @InjectRepository(DemandDraftTemplate)
    private readonly templateRepository: Repository<DemandDraftTemplate>,
  ) {}

  /**
   * Create a new demand draft template
   */
  async create(createDto: CreateDemandDraftTemplateDto, userId: string): Promise<DemandDraftTemplate> {
    const template = this.templateRepository.create({
      ...createDto,
      createdBy: userId,
      updatedBy: userId,
    });
    return await this.templateRepository.save(template);
  }

  /**
   * Get all templates
   */
  async findAll(activeOnly: boolean = false): Promise<DemandDraftTemplate[]> {
    const query = this.templateRepository.createQueryBuilder('template')
      .orderBy('template.createdAt', 'DESC');

    if (activeOnly) {
      query.where('template.isActive = :isActive', { isActive: true });
    }

    return await query.getMany();
  }

  /**
   * Get template by ID
   */
  async findOne(id: string): Promise<DemandDraftTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Demand draft template with ID ${id} not found`);
    }
    return template;
  }

  /**
   * Get first active template (for auto-generation)
   */
  async findFirstActive(): Promise<DemandDraftTemplate | null> {
    return await this.templateRepository.findOne({
      where: { isActive: true },
      order: { createdAt: 'ASC' }
    });
  }

  /**
   * Update template
   */
  async update(id: string, updateDto: UpdateDemandDraftTemplateDto, userId: string): Promise<DemandDraftTemplate> {
    const template = await this.findOne(id);
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
    template.isActive = false;
    template.updatedBy = userId;
    await this.templateRepository.save(template);
  }

  /**
   * Render template with data
   */
  renderTemplate(template: DemandDraftTemplate, data: Record<string, any>): { subject: string; htmlContent: string } {
    let subject = template.subject;
    let htmlContent = template.htmlContent;

    // Replace placeholders like {{variable}}
    Object.keys(data).forEach(key => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      const value = data[key] !== null && data[key] !== undefined ? String(data[key]) : '';
      subject = subject.replace(placeholder, value);
      htmlContent = htmlContent.replace(placeholder, value);
    });

    return { subject, htmlContent };
  }
}
