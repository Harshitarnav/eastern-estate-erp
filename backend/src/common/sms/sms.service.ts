import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../../modules/settings/settings.service';

/**
 * Options for sending a single SMS.
 */
export interface SendSmsOptions {
  /** Destination phone number in E.164 or local 10-digit Indian format */
  to: string;
  /** Message body (keep under 160 chars for single segment, Unicode segments = 70) */
  body: string;
  /** DLT template id (MSG91/Airtel/etc.) - optional for providers that require it */
  templateId?: string;
  /** Free-form sender metadata for the provider log */
  sender?: string;
}

/**
 * Result returned from every sendSms call. `skipped=true` means the provider
 * was not configured or the SMS feature flag is off - the caller can treat
 * this as a non-fatal outcome and continue with in-app + email notifications.
 */
export interface SendSmsResult {
  accepted: boolean;
  skipped?: boolean;
  providerMessageId?: string;
  error?: string;
}

/**
 * Base SMS service contract. The default implementation (NoopSmsService)
 * logs-and-skips so the rest of the system can call sendSms uniformly
 * without checking whether a real provider is wired up.
 *
 * PR4 will add a MSG91Provider that extends this - the business logic
 * in OverdueScannerService and NotificationHelperService never needs to
 * change when that happens.
 */
@Injectable()
export class SmsService {
  protected readonly logger = new Logger(SmsService.name);

  constructor(protected readonly settingsService: SettingsService) {}

  async sendSms(options: SendSmsOptions): Promise<SendSmsResult> {
    const settings = await this.settingsService.get();

    if (!settings.enableSmsReminders) {
      this.logger.debug(
        `SMS feature flag is OFF - message to ${options.to} was NOT sent. ` +
          `Toggle company_settings.enable_sms_reminders to enable.`,
      );
      return { accepted: false, skipped: true };
    }

    // When a real provider is plugged in (MSG91 etc.), it will override
    // this method. Until then we log-and-skip so automated reminder code
    // paths exercise cleanly in dev without requiring a provider account.
    this.logger.warn(
      `SMS provider NOT configured - message to ${options.to} was NOT sent.`,
    );
    return { accepted: false, skipped: true };
  }
}
