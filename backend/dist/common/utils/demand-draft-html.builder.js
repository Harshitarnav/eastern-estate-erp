"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDemandDraftHtml = buildDemandDraftHtml;
const CSS = `
*, *::before, *::after { box-sizing: border-box; }

body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  color: #1a1a1a;
  margin: 0;
  padding: 0;
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.page {
  max-width: 800px;
  margin: 0 auto;
  padding: 36px 40px;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* ── Header ─────────────────────────────────────────────── */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 14px;
  margin-bottom: 0;
  border-bottom: 3px solid #A8211B;
  gap: 16px;
}

.brand-name {
  font-size: 24px;
  font-weight: 700;
  color: #7B1E12;
  letter-spacing: 0.5px;
  word-break: keep-all;
}

.brand-sub {
  font-size: 12px;
  color: #555;
  margin-top: 3px;
}

.brand-tag {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
  font-style: italic;
}

.brand-contact {
  font-size: 10.5px;
  color: #777;
  margin-top: 6px;
  line-height: 1.7;
}

.header-right {
  text-align: right;
  font-size: 11px;
  color: #555;
  line-height: 1.9;
  flex-shrink: 0;
  min-width: 160px;
}

.header-right .ref-no {
  font-weight: 700;
  font-size: 13px;
  color: #1a1a1a;
}

/* ── Doc title ──────────────────────────────────────────── */
.doc-title {
  text-align: center;
  font-size: 15px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #A8211B;
  margin: 22px 0 24px;
}

/* ── To block ───────────────────────────────────────────── */
.to-block {
  padding: 14px 18px;
  background: #fafafa;
  border-left: 3px solid #A8211B;
  border-radius: 0 4px 4px 0;
  margin-bottom: 20px;
  word-break: break-word;
}

.to-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #aaa;
  margin-bottom: 5px;
}

.to-name {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  word-break: break-word;
}

.to-unit {
  font-size: 12px;
  color: #555;
  margin-top: 3px;
  word-break: break-word;
}

.to-contact {
  font-size: 11px;
  color: #888;
  margin-top: 5px;
  word-break: break-word;
}

/* ── Subject ────────────────────────────────────────────── */
.subject-line {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  padding-bottom: 12px;
  margin-bottom: 18px;
  border-bottom: 1px dashed #ddd;
  word-break: break-word;
}

.subject-line span { color: #A8211B; }

/* ── Body text ──────────────────────────────────────────── */
.body-text p {
  margin: 0 0 10px;
  line-height: 1.8;
  color: #333;
  word-break: break-word;
}

/* ── Demand table ───────────────────────────────────────── */
table.dt {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 22px;
  font-size: 12.5px;
  table-layout: fixed;
  word-break: break-word;
}

table.dt th {
  background: #A8211B;
  color: #fff;
  padding: 9px 14px;
  text-align: left;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

table.dt td {
  padding: 10px 14px;
  border-bottom: 1px solid #eee;
  vertical-align: top;
  word-break: break-word;
  overflow-wrap: break-word;
}

table.dt tr.tr-total td {
  background: #fef9f0;
  font-weight: 700;
  border-top: 2px solid #A8211B;
}

table.dt .r { text-align: right; font-weight: 600; }
table.dt tr.tr-total .r { color: #A8211B; font-size: 14px; }

/* ── Summary grid ───────────────────────────────────────── */
.sg {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: #e5e7eb;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 22px;
}

.sg-cell {
  background: #fff;
  padding: 12px 16px;
  word-break: break-word;
}

.sg-cell label {
  display: block;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.sg-val { font-size: 14px; font-weight: 700; color: #1a1a1a; }
.sg-val.red   { color: #A8211B; }
.sg-val.green { color: #16a34a; }

/* ── Bank box ───────────────────────────────────────────── */
.bank-box {
  background: #f5f5f5;
  border-left: 4px solid #A8211B;
  padding: 16px 20px;
  margin-bottom: 22px;
  border-radius: 0 4px 4px 0;
  word-break: break-word;
}

.bank-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #A8211B;
  margin-bottom: 12px;
}

.bank-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 24px;
  margin-bottom: 10px;
}

.bank-grid label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #9ca3af;
}

.bank-grid .bv {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-top: 1px;
  word-break: break-all;
}

.bank-note {
  font-size: 11px;
  color: #666;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid #ddd;
  line-height: 1.6;
}

/* ── Note box ───────────────────────────────────────────── */
.note-box {
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 4px;
  padding: 12px 16px;
  margin-bottom: 28px;
  font-size: 12px;
  color: #78350f;
  line-height: 1.6;
  word-break: break-word;
}

/* ── Signature ──────────────────────────────────────────── */
.sig-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 28px;
}

.sig-block {
  text-align: center;
  min-width: 200px;
}

.sig-line {
  border-top: 1px solid #aaa;
  margin-top: 52px;
  margin-bottom: 6px;
}

.sig-label { font-size: 12px; font-weight: 700; color: #333; }
.sig-sub   { font-size: 11px; color: #666; margin-top: 2px; }

/* ── Footer ─────────────────────────────────────────────── */
.page-footer {
  border-top: 1px solid #eee;
  padding-top: 12px;
  font-size: 10.5px;
  color: #999;
  display: flex;
  justify-content: space-between;
  line-height: 1.8;
  gap: 12px;
  word-break: break-word;
}

/* ── Print styles ───────────────────────────────────────── */
@media print {
  body { margin: 0; }
  .page { padding: 20px 24px; max-width: 100%; }
  .note-box, .bank-box, .sg { break-inside: avoid; }
  table.dt { break-inside: auto; }
  table.dt tr { break-inside: avoid; }
  @page { margin: 10mm; size: A4; }
}
`.trim();
function fmtRaw(val) {
    if (!val)
        return '-';
    const n = parseFloat(val.replace(/[^0-9.]/g, ''));
    if (isNaN(n))
        return val;
    return n.toLocaleString('en-IN');
}
function esc(s) {
    if (!s)
        return '';
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
function buildDemandDraftHtml(d) {
    const unitParts = [
        d.propertyName,
        d.towerName,
        d.flatNumber ? `Flat ${d.flatNumber}` : '',
    ].filter(Boolean);
    const unitStr = unitParts.map(esc).join(' \u203a ');
    const contactParts = [d.customerEmail, d.customerPhone].filter(Boolean);
    const contactLine = contactParts.length
        ? `<div class="to-contact">${contactParts.map(esc).join(' &nbsp;|&nbsp; ')}</div>`
        : '';
    const bookingLine = d.bookingNumber
        ? `<div>Booking No: <strong>${esc(d.bookingNumber)}</strong></div>`
        : '';
    const constructionLine = d.constructionPhase
        ? ` (${esc(d.constructionPhase)}${d.phasePercentage != null ? ` - ${d.phasePercentage}%` : ''})`
        : '';
    const descLine = d.milestoneDescription
        ? `<br/><span style="font-size:11.5px;color:#666;">${esc(d.milestoneDescription)}</span>`
        : '';
    const summaryHtml = (d.totalAmount || d.paidAmount || d.balanceAfterPayment)
        ? `<div class="sg">
        <div class="sg-cell"><label>Total Property Value</label><div class="sg-val">\u20b9 ${fmtRaw(d.totalAmount)}</div></div>
        <div class="sg-cell"><label>Amount Paid to Date</label><div class="sg-val green">\u20b9 ${fmtRaw(d.paidAmount)}</div></div>
        <div class="sg-cell"><label>Current Installment Due</label><div class="sg-val red">\u20b9 ${esc(d.amount)}</div></div>
        <div class="sg-cell"><label>Balance After This Payment</label><div class="sg-val">\u20b9 ${fmtRaw(d.balanceAfterPayment)}</div></div>
      </div>`
        : '';
    const bankName = esc(d.bankName) || '[Bank Name \u2014 to be filled]';
    const accountName = esc(d.accountName) || 'Eastern Estate';
    const accountNumber = esc(d.accountNumber) || '[Account Number \u2014 to be filled]';
    const ifscCode = esc(d.ifscCode) || '[IFSC Code \u2014 to be filled]';
    const branchHtml = d.branch
        ? `<div><label>Branch</label><div class="bv">${esc(d.branch)}</div></div>`
        : '';
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>${CSS}</style>
</head>
<body>
<div class="page">

  <!-- ── HEADER ─────────────────────────────────────────── -->
  <div class="header">
    <div>
      <div class="brand-name">Eastern Estate</div>
      <div class="brand-sub">Construction &amp; Development Pvt. Ltd.</div>
      <div class="brand-tag">Life Long Bonding&hellip;</div>
      <div class="brand-contact">
        Naya Raipur, Chhattisgarh<br/>
        accounts@easternestatedvlp.com
      </div>
    </div>
    <div class="header-right">
      <div class="ref-no">Ref: ${esc(d.refNumber)}</div>
      <div>Date: ${esc(d.dateIssued)}</div>
      ${bookingLine}
    </div>
  </div>

  <!-- ── TITLE ──────────────────────────────────────────── -->
  <div class="doc-title">Payment Demand Notice</div>

  <!-- ── TO ────────────────────────────────────────────── -->
  <div class="to-block">
    <div class="to-label">To</div>
    <div class="to-name">${esc(d.customerName)}</div>
    <div class="to-unit">${unitStr}</div>
    ${contactLine}
  </div>

  <!-- ── SUBJECT ────────────────────────────────────────── -->
  <div class="subject-line">
    Subject: <span>Demand for Payment &ndash; ${esc(d.milestoneName)}</span>
    &nbsp;&nbsp;|&nbsp;&nbsp;
    Unit: <span>${esc(d.flatNumber)}</span>
  </div>

  <!-- ── BODY ───────────────────────────────────────────── -->
  <div class="body-text">
    <p>Dear <strong>${esc(d.customerName)}</strong>,</p>
    <p>Greetings from <strong>Eastern Estate</strong>! We hope you are doing well.</p>
    <p>
      We are pleased to inform you that the construction of your registered unit has reached the
      <strong>${esc(d.milestoneName)}</strong> stage${constructionLine}. As per the terms of your
      registered Payment Plan, the following installment is now due for payment:
    </p>
  </div>

  <!-- ── DEMAND TABLE ───────────────────────────────────── -->
  <table class="dt">
    <colgroup>
      <col style="width:5%"/>
      <col/>
      <col style="width:18%"/>
      <col style="width:20%"/>
    </colgroup>
    <thead>
      <tr>
        <th>#</th>
        <th>Milestone / Description</th>
        <th>Due Date</th>
        <th style="text-align:right">Amount (\u20b9)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${esc(String(d.milestoneSeq))}</td>
        <td><strong>${esc(d.milestoneName)}</strong>${descLine}</td>
        <td>${esc(d.dueDate)}</td>
        <td class="r">\u20b9 ${esc(d.amount)}</td>
      </tr>
      <tr class="tr-total">
        <td colspan="3" style="text-align:right">Total Amount Payable</td>
        <td class="r">\u20b9 ${esc(d.amount)}</td>
      </tr>
    </tbody>
  </table>

  <!-- ── PAYMENT SUMMARY ────────────────────────────────── -->
  ${summaryHtml}

  <!-- ── BANK DETAILS ───────────────────────────────────── -->
  <div class="bank-box">
    <div class="bank-title">Payment Instructions</div>
    <div class="bank-grid">
      <div><label>Bank Name</label><div class="bv">${bankName}</div></div>
      <div><label>Account Name</label><div class="bv">${accountName}</div></div>
      <div><label>Account Number</label><div class="bv">${accountNumber}</div></div>
      <div><label>IFSC Code</label><div class="bv">${ifscCode}</div></div>
      ${branchHtml}
    </div>
    <div class="bank-note">
      Cheques / Demand Drafts should be drawn in favour of <strong>Eastern Estate</strong>.
      For NEFT / RTGS / UPI transfers, please use the Booking Number as the payment reference.
      Kindly share the transaction receipt with our Accounts team after making the payment.
    </div>
  </div>

  <!-- ── NOTE ───────────────────────────────────────────── -->
  <div class="note-box">
    <strong>Important:</strong> Kindly ensure payment reaches us on or before
    <strong>${esc(d.dueDate)}</strong>. Delayed payments may attract penalties as per your Booking
    Agreement. For queries or assistance, please contact our Accounts Department.
  </div>

  <!-- ── SIGNATURE ──────────────────────────────────────── -->
  <div class="sig-section">
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-label">Authorised Signatory</div>
      <div class="sig-sub">For Eastern Estate</div>
      <div class="sig-sub">Accounts Department</div>
    </div>
  </div>

  <!-- ── FOOTER ─────────────────────────────────────────── -->
  <div class="page-footer">
    <div>Eastern Estate Construction &amp; Development Pvt. Ltd.</div>
    <div>System-generated document &mdash; please retain for your records.</div>
  </div>

</div>
</body>
</html>`;
}
//# sourceMappingURL=demand-draft-html.builder.js.map