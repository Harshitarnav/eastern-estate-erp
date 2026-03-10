import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanySettings } from './entities/company-settings.entity';

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectRepository(CompanySettings)
    private readonly repo: Repository<CompanySettings>,
  ) {}

  async onModuleInit() {
    // Ensure singleton row exists (schema sync already does this, but double-guard)
    try {
      const count = await this.repo.count();
      if (count === 0) {
        await this.repo.save(this.repo.create({ companyName: 'Eastern Estate', tagline: 'Construction & Development' }));
      }
    } catch {
      this.logger.warn('company_settings table not ready yet — will be created by SchemaSyncService');
    }
  }

  /** Always returns the single settings row */
  async get(): Promise<CompanySettings> {
    const rows = await this.repo
      .createQueryBuilder('s')
      .addSelect('s.smtpPass')  // select: false override
      .getMany();
    if (rows.length === 0) {
      return this.repo.save(this.repo.create({ companyName: 'Eastern Estate' }));
    }
    return rows[0];
  }

  /** Partial update of the single settings row */
  async update(dto: Partial<CompanySettings>): Promise<CompanySettings> {
    const settings = await this.get();
    Object.assign(settings, dto);
    return this.repo.save(settings);
  }
}
