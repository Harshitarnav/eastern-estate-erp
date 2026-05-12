import * as net from 'net';
import * as nodemailer from 'nodemailer';

export type CompanySmtpSettings = {
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpUser?: string | null;
  smtpPass?: string | null;
};

/**
 * Normalizes Gmail app passwords (often pasted as "xxxx xxxx xxxx xxxx").
 */
export function normalizeSmtpPassword(pass: string | null | undefined): string {
  return String(pass ?? '').replace(/\s+/g, '');
}

/**
 * Shared SMTP transport for company_settings — keeps Mail + Settings test in sync.
 */
export function createCompanySmtpTransporter(settings: CompanySmtpSettings): nodemailer.Transporter {
  const port = Number(settings.smtpPort) || 587;
  const host = (settings.smtpHost || '').trim();
  const user = (settings.smtpUser || '').trim();
  const pass = normalizeSmtpPassword(settings.smtpPass ?? '');

  const hostLower = host.toLowerCase();
  const isGmail =
    hostLower.endsWith('gmail.com') || hostLower === 'smtp.googlemail.com';

  const tls: { servername?: string; minVersion?: 'TLSv1.2' } = {};
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
    // Looser than previous 30s caps — a single send can include TLS + EHLO + AUTH + DATA.
    connectionTimeout: 90_000,
    greetingTimeout: 45_000,
    socketTimeout: 90_000,
    dnsTimeout: 45_000,
  });
}
