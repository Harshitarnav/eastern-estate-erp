import * as nodemailer from 'nodemailer';
export type CompanySmtpSettings = {
    smtpHost?: string | null;
    smtpPort?: number | null;
    smtpUser?: string | null;
    smtpPass?: string | null;
};
export declare function normalizeSmtpPassword(pass: string | null | undefined): string;
export declare function createCompanySmtpTransporter(settings: CompanySmtpSettings): nodemailer.Transporter;
