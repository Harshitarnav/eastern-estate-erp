"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeSmtpPassword = normalizeSmtpPassword;
exports.createCompanySmtpTransporter = createCompanySmtpTransporter;
const net = require("net");
const nodemailer = require("nodemailer");
function normalizeSmtpPassword(pass) {
    return String(pass ?? '').replace(/\s+/g, '');
}
function createCompanySmtpTransporter(settings) {
    const port = Number(settings.smtpPort) || 587;
    const host = (settings.smtpHost || '').trim();
    const user = (settings.smtpUser || '').trim();
    const pass = normalizeSmtpPassword(settings.smtpPass ?? '');
    const hostLower = host.toLowerCase();
    const isGmail = hostLower.endsWith('gmail.com') || hostLower === 'smtp.googlemail.com';
    const tls = {};
    if (port === 465 && host && !net.isIP(host)) {
        tls.servername = host;
    }
    if (isGmail && port === 587) {
        tls.minVersion = 'TLSv1.2';
    }
    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        requireTLS: port === 587,
        ...(Object.keys(tls).length ? { tls } : {}),
        connectionTimeout: 90_000,
        greetingTimeout: 45_000,
        socketTimeout: 90_000,
        dnsTimeout: 45_000,
    });
}
//# sourceMappingURL=company-smtp-transport.js.map