/**
 * Money Receipt PDF — Professional Design
 * Eastern Estate ERP
 *
 * Design principles:
 *  - Text-only header (no image loading → no squish / CORS failures)
 *  - Every string passes through splitTextToSize (zero overflow)
 *  - A4 portrait, 14 mm side margins, 4 mm vertical rhythm
 *  - All interfaces are 100 % backward-compatible with callers
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { amountInWords } from './generate-demand-invoice-pdf';

// ─── Interfaces (unchanged) ───────────────────────────────────────────────────

export interface ReceiptCompanyInfo {
  name: string;
  tagline?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website?: string;
  gstin?: string;
  pan?: string;
  cin?: string;
  reraNumber?: string;
  logoUrl?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
  upiId?: string;
  authorisedSignatoryName?: string;
  authorisedSignatoryDesignation?: string;
  jurisdictionCity?: string;
}

export interface ReceiptLedgerSummary {
  totalBookingAmount?: number;
  totalReceivedTillDate?: number;
  balanceOutstanding?: number;
  nextDueDate?: string;
  nextMilestoneLabel?: string;
}

export interface ReceiptTaxBreakup {
  grossAmount?: number;
  gstPercentage?: number;
  gstAmount?: number;
  splitCgstSgst?: boolean;
  tdsPercentage?: number;
  tdsAmount?: number;
  netAmount: number;
}

export interface ReceiptData {
  receiptNumber: string;
  receiptDate?: string;
  copyLabel?: 'ORIGINAL' | 'DUPLICATE' | 'CUSTOMER COPY' | 'OFFICE COPY';
  narration?: string;
  paymentDate: string;
  paymentMethod: string;
  bankName?: string;
  bankBranch?: string;
  chequeNumber?: string;
  chequeDate?: string;
  transactionRef?: string;
  clearanceDate?: string;
  paymentNumber: string;
  paymentTypeLabel?: string;
  bookingNumber: string;
  bookingDate?: string;
  bookingValue?: number;
  customerName: string;
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerPincode?: string;
  customerPan?: string;
  customerAadhaar?: string;
  customerPhone?: string;
  customerEmail?: string;
  propertyName: string;
  towerName?: string;
  flatNumber: string;
  flatType?: string;
  flatArea?: string;
  description: string;
  tax: ReceiptTaxBreakup;
  ledger?: ReceiptLedgerSummary;
  company: ReceiptCompanyInfo;
}

// ─── Page geometry ────────────────────────────────────────────────────────────

const PW  = 210;
const PH  = 297;
const ML  = 14;
const MR  = 14;
const CW  = PW - ML - MR;          // 182 mm
const GAP = 5;
const HW  = (CW - GAP) / 2;        // 88.5 mm per column
const C1  = ML;
const C2  = ML + HW + GAP;

// ─── Design tokens ────────────────────────────────────────────────────────────

const BRAND   = '#A8211B';
const DARKRED = '#7B1E12';
const WHITE   = '#FFFFFF';
const BLACK   = '#1A1A1A';
const DARK    = '#333333';
const MID     = '#666666';
const MUTED   = '#999999';
const LINE    = '#DDDDDD';
const CREAM   = '#FEF8EE';
const YELW    = '#FFFCE6';
const YELBRD  = '#EEC900';
const LGRAY   = '#F4F1EB';

// ─── Shared helpers ───────────────────────────────────────────────────────────

const fmt = (n: number | undefined) =>
  '\u20b9' +
  Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (s: string | undefined): string => {
  if (!s) return '\u2014';
  try {
    return new Date(s).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return s; }
};

const PM_LABEL: Record<string, string> = {
  CASH: 'Cash', CHEQUE: 'Cheque', BANK_TRANSFER: 'Bank Transfer',
  NEFT: 'NEFT', RTGS: 'RTGS', IMPS: 'IMPS', UPI: 'UPI',
  CARD: 'Debit / Credit Card', DD: 'Demand Draft',
  ONLINE: 'Online Payment', OTHER: 'Other',
};

/** Single-line label:value. Value is truncated to maxValW if needed. */
function kv(
  doc: jsPDF,
  label: string, value: string,
  x: number, y: number,
  labelW: number, maxValW: number,
) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(MID);
  doc.text(label + ':', x, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(BLACK);
  const safe = doc.splitTextToSize(value || '\u2014', maxValW);
  doc.text(safe[0], x + labelW, y);
}

function divider(doc: jsPDF, y: number) {
  doc.setDrawColor(LINE);
  doc.setLineWidth(0.22);
  doc.line(ML, y, PW - MR, y);
}

function sectionHead(doc: jsPDF, text: string, x: number, y: number) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(BRAND);
  doc.text(text, x, y);
}

// ─── Main generator ───────────────────────────────────────────────────────────

export function generateReceiptPdf(data: ReceiptData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = 0;

  const coName = (data.company.name || 'EASTERN ESTATE').toUpperCase();

  // ══ 1. Header band (22 mm) ════════════════════════════════════════════════
  doc.setFillColor(BRAND);
  doc.rect(0, 0, PW, 22, 'F');

  // Left — company identity
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(WHITE);
  doc.text(coName, ML, 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor('#EEEEEE');
  doc.text('Construction \u0026 Development Pvt. Ltd.', ML, 14);

  const idBits: string[] = [];
  if (data.company.gstin)      idBits.push(`GSTIN: ${data.company.gstin}`);
  if (data.company.reraNumber) idBits.push(`RERA: ${data.company.reraNumber}`);
  if (data.company.pan)        idBits.push(`PAN: ${data.company.pan}`);
  if (idBits.length) {
    doc.setFontSize(6.5);
    doc.setTextColor('#DDDDDD');
    doc.text(idBits.join('   \u2502   '), ML, 19);
  }

  // Right — document type
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(WHITE);
  doc.text('MONEY RECEIPT', PW - MR, 9, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor('#EEEEEE');
  doc.text(`No.\u00a0${data.receiptNumber}`, PW - MR, 14.5, { align: 'right' });

  if (data.copyLabel) {
    doc.setFontSize(7);
    doc.setTextColor('#FFDDAA');
    doc.text(`[ ${data.copyLabel} ]`, PW - MR, 19.5, { align: 'right' });
  }

  y = 22;

  // ══ 2. Contact strip (6 mm) ═══════════════════════════════════════════════
  const contactParts: string[] = [];
  const fullAddr = [
    data.company.address, data.company.city,
    data.company.state,   data.company.pincode,
  ].filter(Boolean).join(', ');
  if (fullAddr)            contactParts.push(fullAddr);
  if (data.company.phone)  contactParts.push(`Ph: ${data.company.phone}`);
  if (data.company.email)  contactParts.push(data.company.email);
  if (data.company.website) contactParts.push(data.company.website);

  if (contactParts.length) {
    doc.setFillColor(CREAM);
    doc.rect(0, y, PW, 7, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(MID);
    const joined = contactParts.join('  \u2022  ');
    const cLines = doc.splitTextToSize(joined, CW - 6);
    // Show max 1 line to keep strip height fixed
    doc.text(cLines[0], PW / 2, y + 4.5, { align: 'center' });
    y += 7;
  }

  y += 4; // breathing room

  // ══ 3. Meta grid (receipt #, dates, booking #) ════════════════════════════
  const LBL_W = 27;   // label column
  const VAL_W = HW - LBL_W - 2;  // value max width

  const metaRows: [string, string, string, string][] = [
    ['Receipt No',  data.receiptNumber,                    'Receipt Date', fmtDate(data.receiptDate || new Date().toISOString())],
    ['Booking No',  data.bookingNumber,                    'Payment Date', fmtDate(data.paymentDate)],
    ['Payment Ref', data.paymentNumber || '\u2014',        'Booking Date', fmtDate(data.bookingDate)],
  ];

  metaRows.forEach(([l1, v1, l2, v2]) => {
    kv(doc, l1, v1, C1, y, LBL_W, VAL_W);
    kv(doc, l2, v2, C2, y, LBL_W, VAL_W);
    y += 5;
  });

  y += 2;
  divider(doc, y);
  y += 5;

  // ══ 4. Received From / Unit Details (two columns) ═════════════════════════
  sectionHead(doc, 'RECEIVED WITH THANKS FROM', C1, y);
  sectionHead(doc, 'UNIT DETAILS', C2, y);
  y += 5;

  // Customer name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(BLACK);
  const custLines = doc.splitTextToSize(data.customerName || '\u2014', HW - 2);
  doc.text(custLines[0], C1, y);

  // Unit path
  const unitPath = [data.propertyName, data.towerName, data.flatNumber].filter(Boolean).join(' \u203a ');
  const unitLines = doc.splitTextToSize(unitPath || '\u2014', HW - 2);
  doc.text(unitLines[0], C2, y);
  y += 5;

  // Customer address (wrapped)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(DARK);

  const addrStr = [
    data.customerAddress,
    [data.customerCity, data.customerState, data.customerPincode].filter(Boolean).join(', '),
  ].filter(Boolean).join('\n');

  const addrLines = addrStr ? doc.splitTextToSize(addrStr, HW - 2) : [];
  if (addrLines.length) doc.text(addrLines, C1, y);

  // Unit meta (type + area)
  const unitMeta = [data.flatType, data.flatArea].filter(Boolean).join('   \u2022   ');
  const unitMetaLines = unitMeta ? doc.splitTextToSize(unitMeta, HW - 2) : [];
  if (unitMetaLines.length) doc.text(unitMetaLines, C2, y);

  let leftY  = y + addrLines.length  * 4 + 2;
  let rightY = y + unitMetaLines.length * 4 + 2;

  // IDs (PAN, Aadhaar, Phone, Email)
  const custIDs: [string, string, number][] = [];
  if (data.customerPan)     custIDs.push(['PAN', data.customerPan, 12]);
  if (data.customerAadhaar) custIDs.push(['Aadhaar', data.customerAadhaar, 16]);
  if (data.customerPhone)   custIDs.push(['Phone', data.customerPhone, 14]);
  if (data.customerEmail)   custIDs.push(['Email', data.customerEmail, 14]);

  custIDs.forEach(([lbl, val, lw]) => {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(MUTED);
    doc.text(lbl + ':', C1, leftY);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(DARK);
    const vLines = doc.splitTextToSize(val, HW - lw - 4);
    doc.text(vLines[0], C1 + lw, leftY);
    leftY += 4.5;
  });

  // Booking value on right
  if (data.bookingValue) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(MUTED);
    doc.text('Booking Value:', C2, rightY);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(BLACK);
    doc.text(fmt(data.bookingValue), C2 + 30, rightY);
    rightY += 5;
  }

  y = Math.max(leftY, rightY) + 3;
  divider(doc, y);
  y += 5;

  // ══ 5. Payment details ════════════════════════════════════════════════════
  sectionHead(doc, 'PAYMENT DETAILS', C1, y);
  y += 5;

  const pmFields: [string, string][] = [
    ['Mode', PM_LABEL[data.paymentMethod] || data.paymentMethod || '\u2014'],
  ];
  if (data.paymentTypeLabel) pmFields.push(['Towards',       data.paymentTypeLabel]);
  if (data.bankName)         pmFields.push(['Bank',          data.bankName]);
  if (data.bankBranch)       pmFields.push(['Branch',        data.bankBranch]);
  if (data.chequeNumber)     pmFields.push(['Cheque / DD No', data.chequeNumber]);
  if (data.chequeDate)       pmFields.push(['Cheque Date',   fmtDate(data.chequeDate)]);
  if (data.transactionRef)   pmFields.push(['UTR / Txn Ref', data.transactionRef]);
  if (data.clearanceDate)    pmFields.push(['Cleared On',    fmtDate(data.clearanceDate)]);

  const PLW = 32;
  for (let i = 0; i < pmFields.length; i += 2) {
    const pair = pmFields.slice(i, i + 2);
    pair.forEach(([lbl, val], idx) => {
      kv(doc, lbl, val, idx === 0 ? C1 : C2, y, PLW, HW - PLW - 2);
    });
    y += 5;
  }

  y += 2;
  divider(doc, y);
  y += 5;

  // ══ 6. Tax / Amount table ═════════════════════════════════════════════════
  const tax = data.tax;
  const tableRows: [string, string][] = [
    [data.description || 'Payment received against booking', fmt(tax.grossAmount ?? tax.netAmount)],
  ];

  if (tax.gstAmount && tax.gstAmount > 0) {
    if (tax.splitCgstSgst) {
      const half = tax.gstAmount / 2;
      const pct  = (tax.gstPercentage ?? 0) / 2;
      tableRows.push([`Add: CGST @ ${pct.toFixed(2)}%`, fmt(half)]);
      tableRows.push([`Add: SGST @ ${pct.toFixed(2)}%`, fmt(half)]);
    } else {
      tableRows.push([
        `Add: GST${tax.gstPercentage ? ` @ ${tax.gstPercentage}%` : ''}`,
        fmt(tax.gstAmount),
      ]);
    }
  }

  if (tax.tdsAmount && tax.tdsAmount > 0) {
    tableRows.push([
      `Less: TDS${tax.tdsPercentage ? ` @ ${tax.tdsPercentage}%` : ''}`,
      `(\u2212${fmt(tax.tdsAmount)})`,
    ]);
  }

  autoTable(doc, {
    startY: y,
    margin: { left: ML, right: MR },
    head: [['Description', 'Amount (\u20b9)']],
    body: tableRows,
    foot: [['NET AMOUNT RECEIVED', fmt(tax.netAmount)]],
    headStyles: {
      fillColor: BRAND,
      textColor: '#ffffff',
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
    },
    bodyStyles: { fontSize: 8.5, textColor: BLACK, cellPadding: { top: 2.5, bottom: 2.5, left: 4, right: 4 } },
    footStyles: {
      fillColor: '#FDECEA',
      textColor: DARKRED,
      fontStyle: 'bold',
      fontSize: 10,
      cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
    },
    columnStyles: {
      0: { cellWidth: CW - 48 },
      1: { cellWidth: 48, halign: 'right', fontStyle: 'bold' },
    },
    theme: 'grid',
  });

  y = (doc as any).lastAutoTable.finalY + 4;

  // ══ 7. Amount in words ════════════════════════════════════════════════════
  const wordsText = amountInWords(Math.round(tax.netAmount));
  const wordsStr  = `Amount in Words: ${wordsText} only.`;
  const wLines    = doc.splitTextToSize(wordsStr, CW - 10);
  const wbH       = wLines.length * 4.2 + 8;

  doc.setFillColor(YELW);
  doc.setDrawColor(YELBRD);
  doc.setLineWidth(0.4);
  doc.roundedRect(ML, y, CW, wbH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(8.5);
  doc.setTextColor(DARK);
  doc.text(wLines, ML + 5, y + 5.5);
  y += wbH + 4;

  // ══ 8. Ledger summary ════════════════════════════════════════════════════
  const ledger = data.ledger;
  if (ledger && (ledger.totalBookingAmount != null || ledger.totalReceivedTillDate != null || ledger.balanceOutstanding != null)) {
    const lRows: { label: string; value: string; bold: boolean }[] = [];
    if (ledger.totalBookingAmount    != null) lRows.push({ label: 'Total Booking Value',                             value: fmt(ledger.totalBookingAmount),    bold: false });
    if (ledger.totalReceivedTillDate != null) lRows.push({ label: 'Total Received Till Date (incl. this receipt)',  value: fmt(ledger.totalReceivedTillDate), bold: false });
    if (ledger.balanceOutstanding    != null) lRows.push({ label: 'Balance Outstanding',                            value: fmt(ledger.balanceOutstanding),    bold: true  });
    if (ledger.nextMilestoneLabel)            lRows.push({ label: `Next Instalment: ${ledger.nextMilestoneLabel}`,  value: ledger.nextDueDate ? fmtDate(ledger.nextDueDate) : '\u2014', bold: false });

    const lbH = lRows.length * 6 + 11;
    doc.setFillColor(LGRAY);
    doc.roundedRect(ML, y, CW, lbH, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(DARKRED);
    doc.text('BOOKING LEDGER SUMMARY', ML + 5, y + 6);

    let ry = y + 12;
    lRows.forEach(({ label, value, bold }, i) => {
      const lStr = doc.splitTextToSize(label, CW - 55);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(bold ? BRAND : BLACK);
      doc.text(lStr[0], ML + 5, ry);
      doc.setFont('helvetica', 'bold');
      doc.text(value, PW - MR - 4, ry, { align: 'right' });
      if (i < lRows.length - 1) {
        doc.setDrawColor('#DEDAD2');
        doc.setLineWidth(0.2);
        doc.line(ML + 5, ry + 2.5, PW - MR - 5, ry + 2.5);
      }
      ry += 6;
    });

    y += lbH + 4;
  }

  // ══ 9. Narration ═════════════════════════════════════════════════════════
  if (data.narration) {
    sectionHead(doc, 'NARRATION / NOTES', ML, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(DARK);
    const nLines = doc.splitTextToSize(data.narration, CW);
    doc.text(nLines, ML, y);
    y += nLines.length * 4 + 3;
  }

  // ══ 10. Bank details (remit next instalment to) ═══════════════════════════
  if (data.company.accountNumber || data.company.ifscCode || data.company.upiId) {
    const bPairs: [string, string][] = [];
    if (data.company.accountName)  bPairs.push(['Beneficiary',  data.company.accountName]);
    if (data.company.bankName)     bPairs.push(['Bank',         data.company.bankName]);
    if (data.company.branch)       bPairs.push(['Branch',       data.company.branch]);
    if (data.company.accountNumber) bPairs.push(['A/c No',      data.company.accountNumber]);
    if (data.company.ifscCode)     bPairs.push(['IFSC',         data.company.ifscCode]);
    if (data.company.upiId)        bPairs.push(['UPI ID',       data.company.upiId]);

    const bbH = Math.ceil(bPairs.length / 2) * 5.5 + 11;
    doc.setDrawColor(BRAND);
    doc.setLineWidth(0.4);
    doc.roundedRect(ML, y, CW, bbH, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(DARKRED);
    doc.text('REMIT NEXT INSTALMENT TO', ML + 5, y + 6);

    let by = y + 12;
    const BLW = 22;
    for (let i = 0; i < bPairs.length; i += 2) {
      const pair = bPairs.slice(i, i + 2);
      pair.forEach(([k, v], idx) => {
        kv(doc, k, v, idx === 0 ? C1 + 3 : C2, by, BLW, HW - BLW - 4);
      });
      by += 5.5;
    }
    y += bbH + 5;
  }

  // ══ 11. Terms + signatory ═════════════════════════════════════════════════
  const footerTop = Math.max(y + 4, PH - 34);
  divider(doc, footerTop);

  const terms = [
    'Cheques / Demand Drafts are accepted subject to realisation.',
    'This receipt is valid subject to clearance of payment instruments and bank credit.',
    data.company.jurisdictionCity
      ? `Subject to ${data.company.jurisdictionCity} jurisdiction only.`
      : "Subject to jurisdiction of the company\u2019s registered office.",
    'Computer-generated document \u2014 valid without manual signature unless stated otherwise.',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(MUTED);
  terms.forEach((t, i) => doc.text(`\u2022  ${t}`, ML, footerTop + 5 + i * 3.8));

  // Signatory block
  const sigX  = PW - MR - 58;
  const sigY1 = footerTop + 22;
  doc.setDrawColor('#AAAAAA');
  doc.setLineWidth(0.5);
  doc.line(sigX, sigY1, PW - MR, sigY1);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(BLACK);
  doc.text(
    data.company.authorisedSignatoryName || 'Authorised Signatory',
    PW - MR, sigY1 + 5, { align: 'right' },
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(MID);
  doc.text(
    data.company.authorisedSignatoryDesignation
      ? `${data.company.authorisedSignatoryDesignation}, ${coName}`
      : `For ${coName}`,
    PW - MR, sigY1 + 9.5, { align: 'right' },
  );

  // ══ 12. Footer band ═══════════════════════════════════════════════════════
  doc.setFillColor(BRAND);
  doc.rect(0, PH - 8, PW, 8, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(WHITE);
  doc.text(
    `Money Receipt  \u2022  ${coName}  \u2022  Generated: ${new Date().toLocaleDateString('en-IN')}  \u2022  Computer-generated document`,
    PW / 2, PH - 3.5, { align: 'center' },
  );

  // ══ Save ══════════════════════════════════════════════════════════════════
  const tag = (data.receiptNumber || 'receipt').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`receipt_${tag}.pdf`);
}
