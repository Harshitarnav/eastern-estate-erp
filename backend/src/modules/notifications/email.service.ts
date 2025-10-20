/**
 * @file email.service.ts
 * @description Email service for sending transactional emails
 * @module NotificationsModule
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

/**
 * EmailService
 * 
 * Handles all email sending operations including:
 * - Booking confirmations to customers
 * - Admin notifications
 * - Template-based email generation
 * 
 * Uses graceful error handling - emails failures are logged but don't throw errors
 * to prevent blocking main business operations.
 */
@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: nodemailer.Transporter;
    private templatesCache: Map<string, HandlebarsTemplateDelegate> = new Map();

    constructor(private configService: ConfigService) {
        this.initializeTransporter();
    }

    /**
     * Initialize email transporter with SMTP configuration
     */
    private initializeTransporter() {
        const emailHost = this.configService.get<string>('email.host');
        const emailPort = this.configService.get<number>('email.port');
        const emailUser = this.configService.get<string>('email.user');
        const emailPassword = this.configService.get<string>('email.password');
        const emailSecure = this.configService.get<boolean>('email.secure');

        // Only initialize if email config is provided
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
        } catch (error) {
            this.logger.error('Failed to initialize email transporter:', error);
        }
    }

    /**
     * Load and compile email template
     * @param templateName - Name of the template file (without extension)
     * @returns Compiled Handlebars template
     */
    private async loadTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
        // Check cache first
        if (this.templatesCache.has(templateName)) {
            return this.templatesCache.get(templateName);
        }

        try {
            const templatePath = path.join(
                __dirname,
                'templates',
                `${templateName}.hbs`
            );

            const templateContent = fs.readFileSync(templatePath, 'utf-8');
            const compiledTemplate = Handlebars.compile(templateContent);

            // Cache the compiled template
            this.templatesCache.set(templateName, compiledTemplate);

            return compiledTemplate;
        } catch (error) {
            this.logger.error(`Failed to load template ${templateName}:`, error);
            throw error;
        }
    }

    /**
     * Send email using transporter
     * @param to - Recipient email address
     * @param subject - Email subject
     * @param html - HTML content
     * @returns Promise<boolean> - True if sent successfully, false otherwise
     */
    private async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
        if (!this.transporter) {
            this.logger.warn('Email transporter not initialized. Skipping email send.');
            return false;
        }

        const from = this.configService.get<string>('email.from');

        try {
            const info = await this.transporter.sendMail({
                from,
                to,
                subject,
                html,
            });

            this.logger.log(`Email sent successfully to ${to}: ${info.messageId}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}:`, error);
            return false;
        }
    }

    /**
     * Send booking confirmation email to customer
     * 
     * @param booking - Booking entity
     * @param customer - Customer entity
     * @param flat - Flat entity
     * @param property - Property entity
     */
    async sendBookingConfirmationToCustomer(
        booking: any,
        customer: any,
        flat: any,
        property: any,
    ): Promise<void> {
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

            await this.sendEmail(
                customer.email,
                `Booking Confirmation - ${property.name}`,
                html,
            );
        } catch (error) {
            this.logger.error('Error sending booking confirmation to customer:', error);
            // Don't throw - graceful degradation
        }
    }

    /**
     * Send booking notification to admin
     * 
     * @param booking - Booking entity
     * @param customer - Customer entity
     * @param flat - Flat entity
     * @param property - Property entity
     */
    async sendBookingNotificationToAdmin(
        booking: any,
        customer: any,
        flat: any,
        property: any,
    ): Promise<void> {
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

            const adminEmail = this.configService.get<string>('email.adminEmail');
            
            await this.sendEmail(
                adminEmail,
                `New Booking Alert - ${booking.bookingNumber}`,
                html,
            );
        } catch (error) {
            this.logger.error('Error sending booking notification to admin:', error);
            // Don't throw - graceful degradation
        }
    }

    /**
     * Format currency to INR format
     */
    private formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    }

    /**
     * Format date to readable format
     */
    private formatDate(date: Date | string): string {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(dateObj);
    }
}



