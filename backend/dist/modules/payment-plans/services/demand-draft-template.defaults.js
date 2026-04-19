"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TONE_HTML = void 0;
const LETTERHEAD = `
  <div style="font-family: Arial, sans-serif; max-width: 780px; margin: 0 auto; padding: 32px; color: #1f2937;">
    <div style="text-align: right; font-size: 12px; color: #6b7280;">Ref: {{refNumber}}<br/>Date: {{dateIssued}}</div>
    <h2 style="color: #A8211B; margin-top: 24px;">{{documentTitle}}</h2>
    <p>Dear <strong>{{customerName}}</strong>,</p>
`;
const PAYMENT_BLOCK = `
    <h3 style="color: #111827; margin-top: 24px; border-bottom: 2px solid #A8211B; padding-bottom: 6px;">Payment Details</h3>
    <table style="width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 14px;">
      <tr><td style="padding: 6px 0;">Property</td><td style="padding: 6px 0; text-align: right;"><strong>{{propertyName}}</strong></td></tr>
      <tr><td style="padding: 6px 0;">Tower / Flat</td><td style="padding: 6px 0; text-align: right;"><strong>{{towerName}} / {{flatNumber}}</strong></td></tr>
      <tr><td style="padding: 6px 0;">Milestone</td><td style="padding: 6px 0; text-align: right;">{{milestoneName}}</td></tr>
      <tr><td style="padding: 6px 0;">Booking Ref</td><td style="padding: 6px 0; text-align: right;">{{bookingNumber}}</td></tr>
      <tr style="background: #fef2f2;"><td style="padding: 10px 0; font-weight: bold;">Amount Due</td><td style="padding: 10px 0; text-align: right; font-size: 18px; color: #A8211B;"><strong>INR {{amount}}</strong></td></tr>
      <tr><td style="padding: 6px 0;">Due By</td><td style="padding: 6px 0; text-align: right;">{{dueDate}}</td></tr>
    </table>
    <h3 style="color: #111827; margin-top: 24px; border-bottom: 2px solid #A8211B; padding-bottom: 6px;">Bank Details</h3>
    <p style="font-size: 13px; line-height: 1.8;">
      Account Name: <strong>{{accountName}}</strong><br/>
      Bank: <strong>{{bankName}}</strong> ({{branch}})<br/>
      A/c No: <strong>{{accountNumber}}</strong><br/>
      IFSC: <strong>{{ifscCode}}</strong>
    </p>
`;
const FOOTER = `
    <p style="margin-top: 32px; font-size: 12px; color: #6b7280;">
      For any queries regarding this notice, please contact our accounts team.<br/>
      This is a system-generated letter; no signature is required.
    </p>
  </div>
`;
exports.DEFAULT_TONE_HTML = {
    ON_TIME: LETTERHEAD.replace('{{documentTitle}}', 'Payment Demand Notice') +
        `<p>We hope this note finds you well. As per your payment plan, the next milestone <strong>{{milestoneName}}</strong> is now due. Kindly arrange the payment of <strong>INR {{amount}}</strong> by <strong>{{dueDate}}</strong> to stay on schedule.</p>` +
        PAYMENT_BLOCK +
        `<p>Thank you for your continued trust in us.</p>` +
        FOOTER,
    REMINDER_1: LETTERHEAD.replace('{{documentTitle}}', 'Gentle Reminder - Payment Pending') +
        `<p>We wanted to send you a friendly reminder that your payment of <strong>INR {{amount}}</strong> for <strong>{{milestoneName}}</strong> is now <strong>{{daysOverdue}} day(s) overdue</strong>. We understand unexpected delays happen. If you have already initiated the transfer, please ignore this note and share the payment reference with us.</p>` +
        PAYMENT_BLOCK +
        `<p>If you are facing any difficulty, please reach out. We are happy to help.</p>` +
        FOOTER,
    REMINDER_2: LETTERHEAD.replace('{{documentTitle}}', 'Important: Payment Overdue') +
        `<p>Our records show that the payment of <strong>INR {{amount}}</strong> for <strong>{{milestoneName}}</strong> is now <strong>{{daysOverdue}} days overdue</strong>. We kindly request immediate settlement to avoid further escalation and keep your construction schedule on track.</p>` +
        PAYMENT_BLOCK +
        `<p>Please clear this dues within the next 7 days. If payment has already been made, do share the reference at your earliest convenience.</p>` +
        FOOTER,
    REMINDER_3: LETTERHEAD.replace('{{documentTitle}}', 'FINAL NOTICE - Payment Overdue') +
        `<p style="color: #A8211B;"><strong>This is a final notice.</strong> The payment of <strong>INR {{amount}}</strong> for <strong>{{milestoneName}}</strong> is now <strong>{{daysOverdue}} days overdue</strong>. Failure to settle this amount promptly will lead to formal escalation, including potential penalties as per the agreement.</p>` +
        PAYMENT_BLOCK +
        `<p>We urge you to clear the dues within 7 days of receipt of this notice.</p>` +
        FOOTER,
    REMINDER_4: LETTERHEAD.replace('{{documentTitle}}', 'LAST CHANCE - Clear Your Payment') +
        `<p style="color: #A8211B;"><strong>This is your last opportunity to clear the payment before a formal cancellation-warning letter is prepared.</strong> The amount of <strong>INR {{amount}}</strong> for <strong>{{milestoneName}}</strong> is now <strong>{{daysOverdue}} days overdue</strong>.</p>` +
        PAYMENT_BLOCK +
        `<p>Please settle immediately, or contact our accounts team to discuss a resolution. Non-payment after this notice may result in proceedings to cancel your booking as per the terms of the agreement.</p>` +
        FOOTER,
    CANCELLATION_WARNING: LETTERHEAD.replace('{{documentTitle}}', 'NOTICE OF CANCELLATION WARNING') +
        `<p style="color: #991b1b;"><strong>Your booking for <span style="text-decoration: underline;">{{propertyName}} - {{towerName}} - {{flatNumber}}</span> (Booking Ref: {{bookingNumber}}) is now at risk of cancellation.</strong></p>` +
        `<p>Despite multiple prior reminders, the outstanding payment of <strong>INR {{amount}}</strong> for <strong>{{milestoneName}}</strong> remains unpaid and is now <strong>{{daysOverdue}} days overdue</strong>. As per Clause [X] of your booking agreement, we reserve the right to cancel the booking and forfeit all deposits already paid.</p>` +
        PAYMENT_BLOCK +
        `<p><strong>To prevent cancellation, please clear the overdue amount within 14 days of this letter.</strong> If you wish to discuss a resolution or payment plan, contact our accounts team immediately.</p>` +
        `<p>This is a formal notice issued under the terms of your booking agreement.</p>` +
        FOOTER,
    POST_WARNING: LETTERHEAD.replace('{{documentTitle}}', 'Continued Payment Default') +
        `<p>This is a reminder that your booking remains flagged as <strong>AT RISK</strong> and the cancellation warning issued earlier is still in effect. The payment of <strong>INR {{amount}}</strong> for <strong>{{milestoneName}}</strong> is now <strong>{{daysOverdue}} days overdue</strong>.</p>` +
        PAYMENT_BLOCK +
        `<p>Please act immediately to avoid initiation of cancellation proceedings.</p>` +
        FOOTER,
};
//# sourceMappingURL=demand-draft-template.defaults.js.map