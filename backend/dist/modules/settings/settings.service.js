"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SettingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const company_settings_entity_1 = require("./entities/company-settings.entity");
const company_smtp_transport_1 = require("../../common/mail/company-smtp-transport");
let SettingsService = SettingsService_1 = class SettingsService {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(SettingsService_1.name);
    }
    async onModuleInit() {
        try {
            const count = await this.repo.count();
            if (count === 0) {
                await this.repo.save(this.repo.create({ companyName: 'Eastern Estate', tagline: 'Construction & Development' }));
            }
        }
        catch {
            this.logger.warn('company_settings table not ready yet - will be created by SchemaSyncService');
        }
    }
    async get() {
        const rows = await this.repo
            .createQueryBuilder('s')
            .addSelect('s.smtpPass')
            .getMany();
        if (rows.length === 0) {
            return this.repo.save(this.repo.create({ companyName: 'Eastern Estate' }));
        }
        return rows[0];
    }
    async update(dto) {
        const settings = await this.get();
        const patch = { ...dto };
        if (typeof patch.smtpHost === 'string') {
            patch.smtpHost = patch.smtpHost.trim() || null;
        }
        if (typeof patch.smtpUser === 'string') {
            patch.smtpUser = patch.smtpUser.trim() || null;
        }
        if (typeof patch.smtpFrom === 'string') {
            patch.smtpFrom = patch.smtpFrom.trim() || null;
        }
        if (patch.smtpPass !== undefined && patch.smtpPass !== null) {
            const normalized = (0, company_smtp_transport_1.normalizeSmtpPassword)(patch.smtpPass);
            if (normalized === '') {
                delete patch.smtpPass;
            }
            else {
                patch.smtpPass = normalized;
            }
        }
        else {
            delete patch.smtpPass;
        }
        Object.assign(settings, patch);
        return this.repo.save(settings);
    }
    async testEmail(to, subject, body) {
        const settings = await this.get();
        const smtpPass = (0, company_smtp_transport_1.normalizeSmtpPassword)(settings.smtpPass);
        if (!settings.smtpHost || !settings.smtpUser) {
            throw new common_1.BadRequestException('SMTP is not configured. Fill in SMTP Host and Username first, then Save Settings before testing.');
        }
        if (!smtpPass) {
            throw new common_1.BadRequestException('SMTP password is missing. Enter your Gmail App Password (or SMTP password), click Save Changes, then run the test again. The password field stays empty after you reload the page (security); re-enter it whenever you set or change SMTP.');
        }
        if (!to) {
            throw new common_1.BadRequestException('Recipient email address is required.');
        }
        const transporter = (0, company_smtp_transport_1.createCompanySmtpTransporter)({
            ...settings,
            smtpPass,
        });
        const fromAddress = settings.smtpFrom || settings.smtpUser;
        const fromName = settings.companyName || 'Eastern Estate';
        try {
            const info = await transporter.sendMail({
                from: `"${fromName}" <${fromAddress}>`,
                to,
                subject: subject || `✅ SMTP Test - ${fromName} ERP`,
                html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
            <div style="background:#A8211B;color:white;padding:16px 20px;border-radius:8px 8px 0 0;margin:-24px -24px 24px;">
              <h2 style="margin:0;font-size:18px;">${fromName}</h2>
              <p style="margin:4px 0 0;font-size:13px;opacity:0.85;">Eastern Estate ERP - SMTP Test</p>
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
            this.logger.log(`Test email sent to ${to} - messageId: ${info.messageId}`);
            return {
                success: true,
                message: `Test email delivered to ${to}`,
                messageId: info.messageId,
            };
        }
        catch (err) {
            this.logger.error(`SMTP test failed: ${err?.message}`);
            let detail = err?.message ?? 'Unknown error';
            if (err?.code === 'EAUTH') {
                detail =
                    'Authentication failed. For Gmail: use your full email as Username, a 16-character App Password (not your normal password), Port 587 or 465, and ensure 2-Step Verification is on. Strip spaces from the App Password or paste as-is — both work after save.';
            }
            else if (err?.responseCode === 535 || err?.responseCode === 534) {
                detail =
                    'Server rejected the username/password (SMTP code 535). Regenerate a fresh App Password at myaccount.google.com/apppasswords and save it under Company Settings.';
            }
            else if (err?.code === 'ECONNREFUSED')
                detail = `Connection refused to ${settings.smtpHost}:${settings.smtpPort}. Check the host and port.`;
            else if (err?.code === 'ETIMEDOUT')
                detail = `Connection timed out. The SMTP host may be blocked by your firewall.`;
            else if (err?.code === 'ESOCKET')
                detail = `Socket error - try changing port from ${settings.smtpPort} to 587 (TLS) or 465 (SSL).`;
            return {
                success: false,
                message: 'Test email failed',
                detail,
            };
        }
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = SettingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(company_settings_entity_1.CompanySettings)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SettingsService);
//# sourceMappingURL=settings.service.js.map