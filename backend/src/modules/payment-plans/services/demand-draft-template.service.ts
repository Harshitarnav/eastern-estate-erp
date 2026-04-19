import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DemandDraftTemplate } from '../entities/demand-draft-template.entity';
import { CreateDemandDraftTemplateDto } from '../dto/create-demand-draft-template.dto';
import { UpdateDemandDraftTemplateDto } from '../dto/update-demand-draft-template.dto';
import { DEFAULT_TONE_HTML } from './demand-draft-template.defaults';

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
   * Find an active template for a given tone. Falls back to the first active
   * template of any tone so the caller always gets something renderable.
   */
  async findByTone(tone: string): Promise<DemandDraftTemplate | null> {
    const exact = await this.templateRepository.findOne({
      where: { isActive: true, tone },
      order: { createdAt: 'ASC' },
    });
    if (exact) return exact;
    return this.findFirstActive();
  }

  /**
   * Seed the 7 default templates (one per tone) if they do not already
   * exist. Safe to call on every boot.
   */
  async seedDefaultTones(): Promise<void> {
    const defaults: Array<{
      tone: string;
      name: string;
      subject: string;
      html: string;
    }> = [
      {
        tone: 'ON_TIME',
        name: 'Default Demand Letter',
        subject: 'Payment Demand - {{milestoneName}} - {{flatNumber}}',
        html: DEFAULT_TONE_HTML.ON_TIME,
      },
      {
        tone: 'REMINDER_1',
        name: 'Gentle Reminder (7 days overdue)',
        subject: 'Friendly Reminder: Payment Due for {{flatNumber}}',
        html: DEFAULT_TONE_HTML.REMINDER_1,
      },
      {
        tone: 'REMINDER_2',
        name: 'Firm Reminder (14 days overdue)',
        subject: 'Important: Payment Overdue for {{flatNumber}} ({{daysOverdue}} days)',
        html: DEFAULT_TONE_HTML.REMINDER_2,
      },
      {
        tone: 'REMINDER_3',
        name: 'Final Notice (21 days overdue)',
        subject: 'FINAL NOTICE: Payment Overdue - {{flatNumber}}',
        html: DEFAULT_TONE_HTML.REMINDER_3,
      },
      {
        tone: 'REMINDER_4',
        name: 'Last Chance Notice (28 days overdue)',
        subject: 'LAST CHANCE: Clear Your Payment - {{flatNumber}}',
        html: DEFAULT_TONE_HTML.REMINDER_4,
      },
      {
        tone: 'CANCELLATION_WARNING',
        name: 'Cancellation Warning (30+ days overdue)',
        subject: 'NOTICE OF CANCELLATION WARNING - Booking {{bookingNumber}}',
        html: DEFAULT_TONE_HTML.CANCELLATION_WARNING,
      },
      {
        tone: 'POST_WARNING',
        name: 'Post-Warning Weekly Reminder',
        subject: 'Continued Payment Default - Booking {{bookingNumber}} ({{daysOverdue}} days overdue)',
        html: DEFAULT_TONE_HTML.POST_WARNING,
      },
    ];

    for (const d of defaults) {
      const existing = await this.templateRepository.findOne({
        where: { tone: d.tone },
      });
      if (existing) continue;
      await this.templateRepository.save(
        this.templateRepository.create({
          tone: d.tone,
          name: d.name,
          subject: d.subject,
          htmlContent: d.html,
          isActive: true,
          description: `Auto-seeded default template for tone ${d.tone}`,
        }),
      );
    }
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
