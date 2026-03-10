import { SettingsService } from './settings.service';
import { CompanySettings } from './entities/company-settings.entity';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getCompanySettings(): Promise<Omit<CompanySettings, 'smtpPass'>>;
    updateCompanySettings(dto: Partial<CompanySettings>): Promise<Omit<CompanySettings, 'smtpPass'>>;
    testEmail(body: {
        to: string;
        subject?: string;
        message?: string;
    }): Promise<{
        success: boolean;
        message: string;
        detail?: string;
        messageId?: string;
    }>;
}
