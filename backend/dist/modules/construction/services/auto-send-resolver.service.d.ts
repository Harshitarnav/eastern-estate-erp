import { Repository } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { Property } from '../../properties/entities/property.entity';
import { SettingsService } from '../../settings/settings.service';
export type AutoSendSource = 'customer' | 'property' | 'company';
export interface AutoSendResolution {
    shouldAutoSend: boolean;
    source: AutoSendSource;
    customer: boolean | null;
    property: boolean | null;
    company: boolean;
}
export declare class AutoSendResolverService {
    private readonly customerRepo;
    private readonly propertyRepo;
    private readonly settingsService;
    private readonly logger;
    constructor(customerRepo: Repository<Customer>, propertyRepo: Repository<Property>, settingsService: SettingsService);
    resolve(customerId: string | null | undefined, propertyId: string | null | undefined): Promise<AutoSendResolution>;
}
