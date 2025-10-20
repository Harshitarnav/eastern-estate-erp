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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
const Handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
let EmailService = EmailService_1 = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.templatesCache = new Map();
        this.initializeTransporter();
    }
    initializeTransporter() {
        const emailHost = this.configService.get('email.host');
        const emailPort = this.configService.get('email.port');
        const emailUser = this.configService.get('email.user');
        const emailPassword = this.configService.get('email.password');
        const emailSecure = this.configService.get('email.secure');
        if (!emailUser || !emailPassword) {
            this.logger.warn('Email configuration not found. Email service will not be functional.');
            return;
        }
        try {
            this.transporter = nodemailer.createTransport({
                host: emailHost,
                port: emailPort,
                secure: emailSecure,
                auth: {
                    user: emailUser,
                    pass: emailPassword,
                },
            });
            this.logger.log('Email transporter initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize email transporter:', error);
        }
    }
    async loadTemplate(templateName) {
        if (this.templatesCache.has(templateName)) {
            return this.templatesCache.get(templateName);
        }
        try {
            const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
            const templateContent = fs.readFileSync(templatePath, 'utf-8');
            const compiledTemplate = Handlebars.compile(templateContent);
            this.templatesCache.set(templateName, compiledTemplate);
            return compiledTemplate;
        }
        catch (error) {
            this.logger.error(`Failed to load template ${templateName}:`, error);
            throw error;
        }
    }
    async sendEmail(to, subject, html) {
        if (!this.transporter) {
            this.logger.warn('Email transporter not initialized. Skipping email send.');
            return false;
        }
        const from = this.configService.get('email.from');
        try {
            const info = await this.transporter.sendMail({
                from,
                to,
                subject,
                html,
            });
            this.logger.log(`Email sent successfully to ${to}: ${info.messageId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${to}:`, error);
            return false;
        }
    }
    async sendBookingConfirmationToCustomer(booking, customer, flat, property) {
        try {
            const template = await this.loadTemplate('booking-confirmation');
            const html = template({
                customerName: `${customer.firstName} ${customer.lastName}`,
                bookingNumber: booking.bookingNumber,
                propertyName: property.name,
                propertyAddress: property.address,
                flatNumber: flat.flatNumber,
                flatType: flat.type,
                carpetArea: flat.carpetArea,
                totalAmount: this.formatCurrency(booking.totalAmount),
                tokenAmount: this.formatCurrency(booking.tokenAmount),
                balanceAmount: this.formatCurrency(booking.balanceAmount),
                bookingDate: this.formatDate(booking.bookingDate),
                expectedPossessionDate: booking.expectedPossessionDate
                    ? this.formatDate(booking.expectedPossessionDate)
                    : 'To be announced',
                paymentPlan: booking.paymentPlan || 'Standard',
                currentYear: new Date().getFullYear(),
            });
            await this.sendEmail(customer.email, `Booking Confirmation - ${property.name}`, html);
        }
        catch (error) {
            this.logger.error('Error sending booking confirmation to customer:', error);
        }
    }
    async sendBookingNotificationToAdmin(booking, customer, flat, property) {
        try {
            const template = await this.loadTemplate('booking-admin-notification');
            const html = template({
                bookingNumber: booking.bookingNumber,
                customerName: `${customer.firstName} ${customer.lastName}`,
                customerEmail: customer.email,
                customerPhone: customer.phoneNumber,
                propertyName: property.name,
                flatNumber: flat.flatNumber,
                flatType: flat.type,
                totalAmount: this.formatCurrency(booking.totalAmount),
                tokenAmount: this.formatCurrency(booking.tokenAmount),
                balanceAmount: this.formatCurrency(booking.balanceAmount),
                bookingDate: this.formatDate(booking.bookingDate),
                status: booking.status,
                paymentStatus: booking.paymentStatus,
                currentYear: new Date().getFullYear(),
            });
            const adminEmail = this.configService.get('email.adminEmail');
            await this.sendEmail(adminEmail, `New Booking Alert - ${booking.bookingNumber}`, html);
        }
        catch (error) {
            this.logger.error('Error sending booking notification to admin:', error);
        }
    }
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    }
    formatDate(date) {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(dateObj);
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map