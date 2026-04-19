import { Logger } from '@nestjs/common';
import { SettingsService } from '../../modules/settings/settings.service';
export interface SendSmsOptions {
    to: string;
    body: string;
    templateId?: string;
    sender?: string;
}
export interface SendSmsResult {
    accepted: boolean;
    skipped?: boolean;
    providerMessageId?: string;
    error?: string;
}
export declare class SmsService {
    protected readonly settingsService: SettingsService;
    protected readonly logger: Logger;
    constructor(settingsService: SettingsService);
    sendSms(options: SendSmsOptions): Promise<SendSmsResult>;
}
