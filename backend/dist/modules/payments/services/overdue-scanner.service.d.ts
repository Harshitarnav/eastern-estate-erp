import { Repository } from 'typeorm';
import { DemandDraft } from '../../demand-drafts/entities/demand-draft.entity';
import { FlatPaymentPlan } from '../../payment-plans/entities/flat-payment-plan.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { SettingsService } from '../../settings/settings.service';
import { DemandDraftTemplateService } from '../../payment-plans/services/demand-draft-template.service';
import { MailService } from '../../../common/mail/mail.service';
import { SmsService } from '../../../common/sms/sms.service';
import { NotificationsService } from '../../notifications/notifications.service';
export interface ScanStats {
    examined: number;
    remindersSent: number;
    warningsPrepared: number;
    postWarningsSent: number;
    bookingsFlaggedAtRisk: number;
    skippedPaused: number;
    skippedLegacyDisabled: number;
    skippedCapped: number;
    errors: number;
}
export declare class OverdueScannerService {
    private readonly ddRepo;
    private readonly planRepo;
    private readonly bookingRepo;
    private readonly customerRepo;
    private readonly settingsService;
    private readonly templateService;
    private readonly mailService;
    private readonly smsService;
    private readonly notificationsService;
    private readonly logger;
    constructor(ddRepo: Repository<DemandDraft>, planRepo: Repository<FlatPaymentPlan>, bookingRepo: Repository<Booking>, customerRepo: Repository<Customer>, settingsService: SettingsService, templateService: DemandDraftTemplateService, mailService: MailService, smsService: SmsService, notificationsService: NotificationsService);
    dailyScan(): Promise<void>;
    runScan(now?: Date): Promise<ScanStats>;
    private decide;
    private sendReminder;
    private prepareCancellationWarning;
    private sendPostWarning;
    private createChildReminderDD;
    private notifyAll;
    private notifyCustomerInApp;
    private notifyCustomerEmail;
    private notifyCustomerSms;
    private notifyInternalTeams;
    private computeNextReminder;
    private tonePriority;
    private smsBodyForTone;
}
