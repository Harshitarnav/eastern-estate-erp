import { Injectable, OnModuleInit, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { CompanySettings } from './entities/company-settings.entity';

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectRepository(CompanySettings)
    private readonly repo: Repository<CompanySettings>,
  ) {}

  async onModuleInit() {
    // Ensure singleton row exists (schema sync already does this, but double-guard)
    try {
      const count = await this.repo.count();
      if (count === 0) {
        await this.repo.save(this.repo.create({ companyName: 'Eastern Estate', tagline: 'Construction & Development' }));
      }
    } catch {
      this.logger.warn('company_settings table not ready yet — will be created by SchemaSyncService');
    }
  }

  /** Always returns the single settings row */
  async get(): Promise<CompanySettings> {
    const rows = await this.repo
      .createQueryBuilder('s')
      .addSelect('s.smtpPass')  // select: false override
      .getMany();
    if (rows.length === 0) {
      return this.repo.save(this.repo.create({ companyName: 'Eastern Estate' }));
    }
    return rows[0];
  }

  /** Partial update of the single settings row */
  async update(dto: Partial<CompanySettings>): Promise<CompanySettings> {
    const settings = await this.get();
    Object.assign(settings, dto);
    return this.repo.save(settings);
  }

  /**
   * Send a test email using the currently saved SMTP credentials.
   * Returns { success, message, detail }.
   */
  async testEmail(to: string, subject?: string, body?: string): Promise<{
    success: boolean;
    message: string;
    detail?: string;
    messageId?: string;
  }> {
    const settings = await this.get();

    if (!settings.smtpHost || !settings.smtpUser) {
      throw new BadRequestException(
        'SMTP is not configured. Fill in SMTP Host and Username first, then Save Settings before testing.',
      );
    }
    if (!to) {
      throw new BadRequestException('Recipient email address is required.');
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
      // Verify connection first — gives a clear error before sending
      await transporter.verify();

      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to,
        subject: subject || `✅ SMTP Test — ${fromName} ERP`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
            <div style="background:#A8211B;color:white;padding:16px 20px;border-radius:8px 8px 0 0;margin:-24px -24px 24px;">
              <h2 style="margin:0;font-size:18px;">${fromName}</h2>
              <p style="margin:4px 0 0;font-size:13px;opacity:0.85;">Eastern Estate ERP — SMTP Test</p>
            </div>
            <p style="font-size:15px;color:#111;">✅ <strong>SMTP is working correctly!</strong></p>
            <p style="color:#555;font-size:14px;">
              This test email was sent from the Eastern Estate ERP to confirm your email settings are configured properly.
            </p>
            ${body ? `<blockquote style="border-left:3px solid #A8211B;margin:16px 0;padding:8px 16px;color:#333;font-size:14px;">${body}</blockquote>` : ''}
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
            <p style="font-size:12px;color:#999;">
              Sent from: <strong>${fromAddress}</strong><br/>
              SMTP Server: ${settings.smtpHost}:${settings.smtpPort ?? 587}
            </p>
          </div>
        `,
        text: `SMTP Test from Eastern Estate ERP\n\n✅ Your email settings are working correctly!\n\nFrom: ${fromAddress}\nSMTP: ${settings.smtpHost}:${settings.smtpPort ?? 587}`,
      });

      this.logger.log(`Test email sent to ${to} — messageId: ${info.messageId}`);
      return {
        success: true,
        message: `Test email delivered to ${to}`,
        messageId: info.messageId,
      };
    } catch (err: any) {
      this.logger.error(`SMTP test failed: ${err?.message}`);

      // Give a human-friendly error based on the error code
      let detail = err?.message ?? 'Unknown error';
      if (err?.code === 'EAUTH')        detail = 'Authentication failed — wrong username or password / App Password. Make sure 2-Step Verification is enabled on Gmail.';
      else if (err?.code === 'ECONNREFUSED') detail = `Connection refused to ${settings.smtpHost}:${settings.smtpPort}. Check the host and port.`;
      else if (err?.code === 'ETIMEDOUT')    detail = `Connection timed out. The SMTP host may be blocked by your firewall.`;
      else if (err?.code === 'ESOCKET')      detail = `Socket error — try changing port from ${settings.smtpPort} to 587 (TLS) or 465 (SSL).`;

      return {
        success: false,
        message: 'Test email failed',
        detail,
      };
    }
  }
}
