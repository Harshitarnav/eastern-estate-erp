import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../../modules/settings/settings.service';
import {
  createCompanySmtpTransporter,
  normalizeSmtpPassword,
} from './company-smtp-transport';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  /** Optional plain-text fallback */
  text?: string;
  /** BCC archive copy (e.g. sender mailbox). SMTP submit does not sync to “Sent”. */
  bcc?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Send an email using SMTP credentials stored in company_settings.
   * Gracefully skips (logs a warning) if SMTP is not configured.
   */
  async sendMail(options: SendMailOptions): Promise<{ accepted: string[]; skipped?: boolean }> {
    const settings = await this.settingsService.get();

    if (!settings.smtpHost || !settings.smtpUser) {
      this.logger.warn(
        `SMTP not configured - email to ${options.to} was NOT sent. ` +
        `Go to Settings → Company to configure SMTP.`,
      );
      return { accepted: [], skipped: true };
    }

    const smtpPass = normalizeSmtpPassword(settings.smtpPass);
    if (!smtpPass) {
      this.logger.warn(
        `SMTP password missing - email to ${options.to} was NOT sent. Save an App Password under Company Settings.`,
      );
      return { accepted: [], skipped: true };
    }

    const transporter = createCompanySmtpTransporter({
      ...settings,
      smtpPass,
    });

    const fromAddress = settings.smtpFrom || settings.smtpUser;
    const fromName    = settings.companyName || 'Eastern Estate';

    try {
      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: options.to,
        bcc: options.bcc || undefined,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      this.logger.log(`Email sent to ${options.to} - messageId: ${info.messageId}`);
      return { accepted: info.accepted as string[] };
    } catch (err: any) {
      this.logger.error(`Failed to send email to ${options.to}: ${err?.message}`);
      throw new Error(`Email delivery failed: ${err?.message}`);
    }
  }
}
