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
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
const settings_service_1 = require("../../modules/settings/settings.service");
let MailService = MailService_1 = class MailService {
    constructor(settingsService) {
        this.settingsService = settingsService;
        this.logger = new common_1.Logger(MailService_1.name);
    }
    async sendMail(options) {
        const settings = await this.settingsService.get();
        if (!settings.smtpHost || !settings.smtpUser) {
            this.logger.warn(`SMTP not configured - email to ${options.to} was NOT sent. ` +
                `Go to Settings → Company to configure SMTP.`);
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
        const fromName = settings.companyName || 'Eastern Estate';
        try {
            const info = await transporter.sendMail({
                from: `"${fromName}" <${fromAddress}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            });
            this.logger.log(`Email sent to ${options.to} - messageId: ${info.messageId}`);
            return { accepted: info.accepted };
        }
        catch (err) {
            this.logger.error(`Failed to send email to ${options.to}: ${err?.message}`);
            throw new Error(`Email delivery failed: ${err?.message}`);
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], MailService);
//# sourceMappingURL=mail.service.js.map