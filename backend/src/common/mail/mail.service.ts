import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SettingsService } from '../../modules/settings/settings.service';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  /** Optional plain-text fallback */
  text?: string;
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
        `SMTP not configured — email to ${options.to} was NOT sent. ` +
        `Go to Settings → Company to configure SMTP.`,
      );
      return { accepted: [], skipped: true };
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort ?? 587,
      secure: (settings.smtpPort ?? 587) === 465,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass ?? '',
      },
    });

    const fromAddress = settings.smtpFrom || settings.smtpUser;
    const fromName    = settings.companyName || 'Eastern Estate';

    try {
      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      this.logger.log(`Email sent to ${options.to} — messageId: ${info.messageId}`);
      return { accepted: info.accepted as string[] };
    } catch (err: any) {
      this.logger.error(`Failed to send email to ${options.to}: ${err?.message}`);
      throw new Error(`Email delivery failed: ${err?.message}`);
    }
  }
}
