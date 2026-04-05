/**
 * Canonical Demand Draft HTML Builder
 *
 * Single source of truth for the visual format of all demand drafts
 * generated in the Eastern Estate ERP — regardless of where they originate
 * (payment plan page, construction milestone trigger, auto-generation).
 */

export interface DemandDraftHtmlData {
  /** Unique reference, e.g. "DD-BK2501-03" */
  refNumber: string;
  /** Issue date formatted for en-IN */
  dateIssued: string;

  /* Customer */
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;

  /* Property */
  propertyName: string;
  towerName?: string;
  flatNumber: string;
  bookingNumber?: string;

  /* Milestone */
  milestoneSeq: number | string;
  milestoneName: string;
  milestoneDescription?: string;
  constructionPhase?: string;
  phasePercentage?: number;

  /* Amounts — all pre-formatted strings, e.g. "12,50,000" (no ₹ prefix) */
  amount: string;
  dueDate: string;
  totalAmount?: string;
  paidAmount?: string;
  balanceAfterPayment?: string;

  /* Bank details — use placeholder if not yet filled */
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
}

const CSS = `
* { box-sizing: border-box; }
body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #1a1a1a; margin: 0; padding: 0; background: #fff; }
.page { max-width: 820px; margin: 0 auto; padding: 40px; }

/* ── Header ─────────────────────────────────────────────────── */
.header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 14px; margin-bottom: 0; border-bottom: 3px solid #A8211B; }
.brand-name { font-size: 26px; font-weight: 700; color: #7B1E12; letter-spacing: 0.5px; }
.brand-sub  { font-size: 12px; color: #555; margin-top: 3px; }
.brand-tag  { font-size: 11px; color: #999; margin-top: 2px; font-style: italic; }
.header-right { text-align: right; font-size: 11px; color: #555; line-height: 1.9; }
.header-right .ref-no { font-weight: 700; font-size: 13px; color: #1a1a1a; }

/* ── Doc title ──────────────────────────────────────────────── */
.doc-title { text-align: center; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #A8211B; margin: 22px 0 26px; }

/* ── To block ───────────────────────────────────────────────── */
.to-block { padding: 14px 18px; background: #fafafa; border-left: 3px solid #A8211B; border-radius: 0 4px 4px 0; margin-bottom: 22px; }
.to-label   { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #aaa; margin-bottom: 5px; }
.to-name    { font-size: 16px; font-weight: 700; color: #1a1a1a; }
.to-unit    { font-size: 12px; color: #555; margin-top: 3px; }
.to-contact { font-size: 11px; color: #888; margin-top: 5px; }

/* ── Subject ────────────────────────────────────────────────── */
.subject-line { font-size: 13px; font-weight: 600; color: #333; padding-bottom: 12px; margin-bottom: 20px; border-bottom: 1px dashed #ddd; }
.subject-line span { color: #A8211B; }

/* ── Body text ──────────────────────────────────────────────── */
.body-text p { margin: 0 0 10px; line-height: 1.8; color: #333; }

/* ── Demand table ───────────────────────────────────────────── */
table.dt { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12.5px; }
table.dt th { background: #A8211B; color: #fff; padding: 9px 14px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; }
table.dt td { padding: 10px 14px; border-bottom: 1px solid #eee; vertical-align: top; }
table.dt tr.tr-total td { background: #fef9f0; font-weight: 700; border-top: 2px solid #A8211B; }
table.dt .r { text-align: right; font-weight: 600; }
table.dt tr.tr-total .r { color: #A8211B; font-size: 14px; }

/* ── Summary grid ───────────────────────────────────────────── */
.sg { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #e5e7eb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; margin-bottom: 24px; }
.sg-cell { background: #fff; padding: 12px 16px; }
.sg-cell label { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; margin-bottom: 4px; }
.sg-val { font-size: 14px; font-weight: 700; color: #1a1a1a; }
.sg-val.red   { color: #A8211B; }
.sg-val.green { color: #16a34a; }

/* ── Bank box ───────────────────────────────────────────────── */
.bank-box { background: #f5f5f5; border-left: 4px solid #A8211B; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 4px 4px 0; }
.bank-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #A8211B; margin-bottom: 12px; }
.bank-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 10px; }
.bank-grid label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; color: #9ca3af; }
.bank-grid .bv { font-size: 13px; font-weight: 600; color: #333; margin-top: 1px; }
.bank-note { font-size: 11px; color: #666; margin-top: 10px; padding-top: 8px; border-top: 1px solid #ddd; }

/* ── Note box ───────────────────────────────────────────────── */
.note-box { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 4px; padding: 12px 16px; margin-bottom: 28px; font-size: 12px; color: #78350f; line-height: 1.6; }

/* ── Signature ──────────────────────────────────────────────── */
.sig-section { display: flex; justify-content: flex-end; margin-bottom: 32px; }
.sig-block { text-align: center; min-width: 200px; }
.sig-line { border-top: 1px solid #aaa; margin-top: 52px; margin-bottom: 6px; }
.sig-label { font-size: 12px; font-weight: 700; color: #333; }
.sig-sub   { font-size: 11px; color: #666; margin-top: 2px; }

/* ── Footer ─────────────────────────────────────────────────── */
.page-footer { border-top: 1px solid #eee; padding-top: 12px; font-size: 10.5px; color: #999; display: flex; justify-content: space-between; line-height: 1.8; }

@media print { .page { padding: 24px; } }
`.trim();

/** Format a raw number string for display (adds commas using en-IN locale) */
function fmtRaw(val: string | undefined): string {
  if (!val) return '—';
  const n = parseFloat(val.replace(/[^0-9.]/g, ''));
  if (isNaN(n)) return val;
  return n.toLocaleString('en-IN');
}

/**
 * Build the canonical Eastern Estate Demand Draft HTML.
 * All fields are optional except the core identifiers.
 */
export function buildDemandDraftHtml(d: DemandDraftHtmlData): string {
  const unitParts = [d.propertyName, d.towerName, d.flatNumber ? `Flat ${d.flatNumber}` : ''].filter(Boolean);
  const unitStr   = unitParts.join(' \u203a ');   // ›

  const contactParts = [d.customerEmail, d.customerPhone].filter(Boolean);
  const contactLine  = contactParts.length
    ? `<div class="to-contact">${contactParts.join(' &nbsp;|&nbsp; ')}</div>`
    : '';

  const bookingLine = d.bookingNumber
    ? `<div>Booking No: <strong>${d.bookingNumber}</strong></div>`
    : '';

  const constructionLine = d.constructionPhase
    ? ` (${d.constructionPhase}${d.phasePercentage != null ? ` — ${d.phasePercentage}%` : ''})`
    : '';

  const descLine = d.milestoneDescription
    ? `<br/><span style="font-size:11.5px;color:#666;">${d.milestoneDescription}</span>`
    : '';

  /* Summary grid — only if we have financial totals */
  const summaryHtml = (d.totalAmount || d.paidAmount || d.balanceAfterPayment)
    ? `<div class="sg">
        <div class="sg-cell"><label>Total Property Value</label><div class="sg-val">₹ ${fmtRaw(d.totalAmount)}</div></div>
        <div class="sg-cell"><label>Amount Paid to Date</label><div class="sg-val green">₹ ${fmtRaw(d.paidAmount)}</div></div>
        <div class="sg-cell"><label>Current Installment Due</label><div class="sg-val red">₹ ${d.amount}</div></div>
        <div class="sg-cell"><label>Balance After This Payment</label><div class="sg-val">₹ ${fmtRaw(d.balanceAfterPayment)}</div></div>
      </div>`
    : '';

  /* Bank details */
  const bankName     = d.bankName     || '[Bank Name — to be filled]';
  const accountName  = d.accountName  || 'Eastern Estate';
  const accountNumber = d.accountNumber || '[Account Number — to be filled]';
  const ifscCode     = d.ifscCode     || '[IFSC Code — to be filled]';
  const branchHtml   = d.branch
    ? `<div><label>Branch</label><div class="bv">${d.branch}</div></div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>${CSS}</style>
</head>
<body>
<div class="page">

  <!-- ── HEADER ─────────────────────────────────────────── -->
  <div class="header">
    <div>
      <div class="brand-name">Eastern Estate</div>
      <div class="brand-sub">Construction &amp; Development</div>
      <div class="brand-tag">Life Long Bonding...</div>
    </div>
    <div class="header-right">
      <div class="ref-no">Ref: ${d.refNumber}</div>
      <div>Date: ${d.dateIssued}</div>
      ${bookingLine}
    </div>
  </div>

  <!-- ── TITLE ──────────────────────────────────────────── -->
  <div class="doc-title">Payment Demand Notice</div>

  <!-- ── TO ────────────────────────────────────────────── -->
  <div class="to-block">
    <div class="to-label">To</div>
    <div class="to-name">${d.customerName}</div>
    <div class="to-unit">${unitStr}</div>
    ${contactLine}
  </div>

  <!-- ── SUBJECT ────────────────────────────────────────── -->
  <div class="subject-line">
    Subject: <span>Demand for Payment – ${d.milestoneName}</span>
    &nbsp;&nbsp;|&nbsp;&nbsp; Unit: <span>${d.flatNumber}</span>
  </div>

  <!-- ── BODY ───────────────────────────────────────────── -->
  <div class="body-text">
    <p>Dear <strong>${d.customerName}</strong>,</p>
    <p>Greetings from <strong>Eastern Estate</strong>! We hope you are doing well.</p>
    <p>
      We are pleased to inform you that the construction of your registered unit has reached the
      <strong>${d.milestoneName}</strong> stage${constructionLine}. As per the terms of your
      registered Payment Plan, the following installment is now due for payment:
    </p>
  </div>

  <!-- ── DEMAND TABLE ───────────────────────────────────── -->
  <table class="dt">
    <thead>
      <tr>
        <th width="5%">#</th>
        <th>Milestone / Description</th>
        <th width="18%">Due Date</th>
        <th width="18%" style="text-align:right">Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${d.milestoneSeq}</td>
        <td><strong>${d.milestoneName}</strong>${descLine}</td>
        <td>${d.dueDate}</td>
        <td class="r">₹ ${d.amount}</td>
      </tr>
      <tr class="tr-total">
        <td colspan="3" style="text-align:right">Total Amount Payable</td>
        <td class="r">₹ ${d.amount}</td>
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
      For NEFT / RTGS / UPI transfers, please use the Booking Number as the reference.
      Share the transaction receipt with our Accounts team after payment.
    </div>
  </div>

  <!-- ── NOTE ───────────────────────────────────────────── -->
  <div class="note-box">
    &#9888;&#65039; <strong>Important:</strong> Kindly ensure payment reaches us on or before
    <strong>${d.dueDate}</strong>. Delayed payments may attract penalties as per your Booking
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
    <div>Eastern Estate Construction &amp; Development</div>
    <div>System-generated document. Please retain for your records.</div>
  </div>

</div>
</body>
</html>`;
}
