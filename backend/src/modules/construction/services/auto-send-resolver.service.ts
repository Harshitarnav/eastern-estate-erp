import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { Property } from '../../properties/entities/property.entity';
import { SettingsService } from '../../settings/settings.service';

/**
 * Source layer that "won" the precedence contest when resolving the
 * effective auto-send flag for a newly-generated milestone DD.
 *
 *   customer  → explicit per-customer override (highest priority)
 *   property  → explicit per-project override
 *   company   → org-wide default from company_settings
 */
export type AutoSendSource = 'customer' | 'property' | 'company';

export interface AutoSendResolution {
  shouldAutoSend: boolean;
  source: AutoSendSource;
  // Raw layer values kept around so callers can stamp a clear audit
  // trail onto the DD metadata (useful when a support ticket asks "why
  // did this one go out automatically and not that one").
  customer: boolean | null;
  property: boolean | null;
  company: boolean;
}

/**
 * Resolves whether a milestone-generated demand draft should be sent
 * automatically or land in the Collections Workstation as DRAFT
 * awaiting human review.
 *
 * Precedence (first non-null wins):
 *   customer.auto_send_milestone_demand_drafts
 *   > property.auto_send_milestone_demand_drafts
 *   > company_settings.auto_send_milestone_demand_drafts (non-null, default false)
 *
 * The three-layer design means a company can ship a safe default
 * ("review everything"), flip one project to auto-send for trusted
 * corporate buyers, and still carve out an individual VIP who wants
 * personal contact before every reminder.
 */
@Injectable()
export class AutoSendResolverService {
  private readonly logger = new Logger(AutoSendResolverService.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
    private readonly settingsService: SettingsService,
  ) {}

  async resolve(
    customerId: string | null | undefined,
    propertyId: string | null | undefined,
  ): Promise<AutoSendResolution> {
    // Load all three layers in parallel so even a hot creation path pays
    // at most one DB round-trip latency (three concurrent lookups).
    const [customer, property, settings] = await Promise.all([
      customerId
        ? this.customerRepo.findOne({
            where: { id: customerId },
            select: ['id', 'autoSendMilestoneDemandDrafts'] as any,
          })
        : Promise.resolve(null),
      propertyId
        ? this.propertyRepo.findOne({
            where: { id: propertyId },
            select: ['id', 'autoSendMilestoneDemandDrafts'] as any,
          })
        : Promise.resolve(null),
      this.settingsService.get().catch(() => null),
    ]);

    const customerVal = customer?.autoSendMilestoneDemandDrafts ?? null;
    const propertyVal = property?.autoSendMilestoneDemandDrafts ?? null;
    const companyVal = settings?.autoSendMilestoneDemandDrafts ?? false;

    let shouldAutoSend: boolean;
    let source: AutoSendSource;
    if (customerVal !== null && customerVal !== undefined) {
      shouldAutoSend = !!customerVal;
      source = 'customer';
    } else if (propertyVal !== null && propertyVal !== undefined) {
      shouldAutoSend = !!propertyVal;
      source = 'property';
    } else {
      shouldAutoSend = !!companyVal;
      source = 'company';
    }

    return {
      shouldAutoSend,
      source,
      customer: customerVal,
      property: propertyVal,
      company: companyVal,
    };
  }
}
