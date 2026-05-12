import { SettingsService } from '../../modules/settings/settings.service';
export interface SendMailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    bcc?: string;
}
export declare class MailService {
    private readonly settingsService;
    private readonly logger;
    constructor(settingsService: SettingsService);
    sendMail(options: SendMailOptions): Promise<{
        accepted: string[];
        skipped?: boolean;
    }>;
}
