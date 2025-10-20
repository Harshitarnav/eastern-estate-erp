import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private readonly logger;
    private transporter;
    private templatesCache;
    constructor(configService: ConfigService);
    private initializeTransporter;
    private loadTemplate;
    private sendEmail;
    sendBookingConfirmationToCustomer(booking: any, customer: any, flat: any, property: any): Promise<void>;
    sendBookingNotificationToAdmin(booking: any, customer: any, flat: any, property: any): Promise<void>;
    private formatCurrency;
    private formatDate;
}
