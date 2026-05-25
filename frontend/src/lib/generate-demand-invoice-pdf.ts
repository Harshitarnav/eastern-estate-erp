/**
 * Demand Invoice PDF — Professional Design
 * Eastern Estate ERP
 *
 * Design principles:
 *  - Text-only header (no image loading)
 *  - All text through splitTextToSize (zero overflow)
 *  - Interfaces 100 % backward-compatible
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DemandInvoiceData {
  invoiceNumber: string;
  gstin: string;
  gstRate: number;
  bankName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankBranch: string;
  tdNote: string;
  invoiceDate: string;
  dueDate: string;
  bookingNumber: string;
  milestoneName: string;
  customerName: string;
  customerAddress: string;
  customerPan: string;
  customerPhone: string;
  propertyName: string;
  towerName: string;
  flatNumber: string;
  flatArea: string;
  flatType: string;
  baseAmount: number;
  totalPaid: number;
}

// ─── Amount-in-words (exported — used by receipt PDF too) ─────────────────────

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
}

function toWords(n: number): string {
  if (n === 0) return 'Zero';
  if (n < 0)   return 'Minus ' + toWords(-n);
  const crore = Math.floor(n / 10_000_000);
  const lakh  = Math.floor((n % 10_000_000) / 100_000);
  const thou  = Math.floor((n % 100_000)    / 1_000);
  const hund  = Math.floor((n % 1_000)      / 100);
  const rest  = n % 100;
  let r = '';
  if (crore) r += toWords(crore) + ' Crore ';
  if (lakh)  r += twoDigits(lakh)  + ' Lakh ';
  if (thou)  r += twoDigits(thou)  + ' Thousand ';
  if (hund)  r += ONES[hund]       + ' Hundred ';
  if (rest)  r += twoDigits(rest);
  return r.trim();
}

export function amountInWords(amount: number): string {
  const rupees = Math.floor(amount);
  const paise  = Math.round((amount - rupees) * 100);
  let result   = 'Rupees ' + toWords(rupees);
  if (paise)   result += ' and ' + toWords(paise) + ' Paise';
  return result + ' Only';
}

// ─── Page geometry ────────────────────────────────────────────────────────────

const PW  = 210;
const PH  = 297;
const ML  = 14;
const MR  = 14;
const CW  = PW - ML - MR;
const GAP = 5;
const HW  = (CW - GAP) / 2;
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
const SUMMBG  = '#FEF8EE';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  '\u20b9' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (s: string): string => {
  if (!s) return '\u2014';
  try { return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return s; }
};

function kv(
  doc: jsPDF, label: string, value: string,
  x: number, y: number, lw: number, maxValW: number,
) {
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(MID);
  doc.text(label + ':', x, y);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(BLACK);
  const safe = doc.splitTextToSize(value || '\u2014', maxValW);
  doc.text(safe[0], x + lw, y);
}

function divider(doc: jsPDF, y: number) {
  doc.setDrawColor(LINE); doc.setLineWidth(0.22); doc.line(ML, y, PW - MR, y);
}

function sectionHead(doc: jsPDF, text: string, x: number, y: number) {
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(BRAND);
  doc.text(text, x, y);
}

// ─── Main generator ───────────────────────────────────────────────────────────

export function generateDemandInvoicePdf(data: DemandInvoiceData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = 0;

  // GST calculations
  const halfRate   = data.gstRate / 2;
  const cgst       = Math.round(data.baseAmount * halfRate / 100 * 100) / 100;
  const sgst       = Math.round(data.baseAmount * halfRate / 100 * 100) / 100;
  const totalAmt   = data.baseAmount + cgst + sgst;
  const netPayable = Math.max(0, totalAmt - data.totalPaid);

  // ══ 1. Header band ════════════════════════════════════════════════════════
  doc.setFillColor(BRAND);
  doc.rect(0, 0, PW, 22, 'F');

  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(WHITE);
  doc.text('EASTERN ESTATE', ML, 9);

  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor('#EEEEEE');
  doc.text('Construction \u0026 Development Pvt. Ltd.', ML, 14);

  const idBits: string[] = [];
  if (data.gstin) idBits.push(`GSTIN: ${data.gstin}`);
  if (idBits.length) {
    doc.setFontSize(6.5); doc.setTextColor('#DDDDDD');
    doc.text(idBits.join('   \u2502   '), ML, 19);
  }

  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(WHITE);
  doc.text('DEMAND INVOICE', PW - MR, 9, { align: 'right' });

  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor('#EEEEEE');
  doc.text(`No.\u00a0${data.invoiceNumber}`, PW - MR, 14.5, { align: 'right' });
  doc.setFontSize(7); doc.setTextColor('#DDDDDD');
  doc.text('TAX INVOICE', PW - MR, 19.5, { align: 'right' });

  y = 22;

  // ══ 2. Contact / address strip ════════════════════════════════════════════
  // (eastern estate address not in DemandInvoiceData — show a subtle line)
  doc.setFillColor(CREAM);
  doc.rect(0, y, PW, 6, 'F');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(MID);
  doc.text('Subject to realisation of payment instruments  \u2022  All disputes subject to local jurisdiction', PW / 2, y + 4, { align: 'center' });
  y += 6;

  y += 4;

  // ══ 3. Meta grid ══════════════════════════════════════════════════════════
  const LW  = 25;
  const VW  = HW - LW - 2;

  const metaRows: [string, string, string, string][] = [
    ['Invoice No',  data.invoiceNumber,        'Booking No',  data.bookingNumber],
    ['Date',        fmtDate(data.invoiceDate),  'Due Date',    fmtDate(data.dueDate)],
    ['Milestone',   data.milestoneName,         '',            ''],
  ];

  metaRows.forEach(([l1, v1, l2, v2]) => {
    kv(doc, l1, v1, C1, y, LW, VW);
    if (l2) kv(doc, l2, v2, C2, y, LW, VW);
    y += 5;
  });

  y += 2;
  divider(doc, y);
  y += 5;

  // ══ 4. Bill To / Unit Details ═════════════════════════════════════════════
  sectionHead(doc, 'BILL TO', C1, y);
  sectionHead(doc, 'UNIT DETAILS', C2, y);
  y += 5;

  // Customer name
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(BLACK);
  doc.text(doc.splitTextToSize(data.customerName || '\u2014', HW - 2)[0], C1, y);

  // Unit path
  const unitPath = [data.propertyName, data.towerName, data.flatNumber].filter(Boolean).join(' \u203a ');
  doc.text(doc.splitTextToSize(unitPath || '\u2014', HW - 2)[0], C2, y);
  y += 5;

  // Customer address
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(DARK);
  const addrLines = data.customerAddress
    ? doc.splitTextToSize(data.customerAddress, HW - 2)
    : [];
  if (addrLines.length) doc.text(addrLines, C1, y);

  // Unit meta
  const unitMeta = [data.flatType, data.flatArea].filter(Boolean).join('   \u2022   ');
  if (unitMeta) doc.text(doc.splitTextToSize(unitMeta, HW - 2), C2, y);

  let leftY  = y + addrLines.length * 4 + 2;
  const rightY = y + (unitMeta ? 4.5 : 0) + 3;

  if (data.customerPan) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(MUTED);
    doc.text('PAN:', C1, leftY);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(DARK);
    doc.text(data.customerPan, C1 + 10, leftY);
    leftY += 4.5;
  }
  if (data.customerPhone) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(MUTED);
    doc.text('Ph:', C1, leftY);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(DARK);
    doc.text(data.customerPhone, C1 + 10, leftY);
    leftY += 4.5;
  }

  y = Math.max(leftY, rightY) + 3;
  divider(doc, y);
  y += 5;

  // ══ 5. Invoice table ══════════════════════════════════════════════════════
  autoTable(doc, {
    startY: y,
    margin: { left: ML, right: MR },
    head: [['#', 'Description', 'Basic Amount', `CGST @ ${halfRate}%`, `SGST @ ${halfRate}%`, 'Total Amount']],
    body: [[
      '1',
      data.milestoneName || 'Payment Instalment',
      fmt(data.baseAmount),
      fmt(cgst),
      fmt(sgst),
      fmt(totalAmt),
    ]],
    headStyles: {
      fillColor: BRAND, textColor: '#fff', fontStyle: 'bold', fontSize: 8,
      halign: 'center', cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
    },
    bodyStyles: { fontSize: 8.5, textColor: BLACK, cellPadding: { top: 3, bottom: 3, left: 3, right: 3 } },
    columnStyles: {
      0: { cellWidth: 8,  halign: 'center' },
      1: { cellWidth: 64 },
      2: { halign: 'right', cellWidth: 30 },
      3: { halign: 'right', cellWidth: 28 },
      4: { halign: 'right', cellWidth: 28 },
      5: { halign: 'right', cellWidth: 30, fontStyle: 'bold' },
    },
    alternateRowStyles: { fillColor: '#FAFAFA' },
    theme: 'grid',
  });

  y = (doc as any).lastAutoTable.finalY + 4;

  // ══ 6. Summary box (right-aligned) ════════════════════════════════════════
  const SW = 75;
  const SX = PW - MR - SW;

  const summLines: { label: string; value: string; bold?: boolean; color?: string }[] = [
    { label: 'Basic Amount',            value: fmt(data.baseAmount) },
    { label: `CGST @ ${halfRate}%`,     value: fmt(cgst) },
    { label: `SGST @ ${halfRate}%`,     value: fmt(sgst) },
    { label: 'Total Amount',            value: fmt(totalAmt), bold: true },
  ];
  if (data.totalPaid > 0) {
    summLines.push({ label: 'Less: Amount Paid', value: fmt(data.totalPaid), color: MID });
    summLines.push({ label: 'Net Payable',        value: fmt(netPayable), bold: true, color: BRAND });
  }

  const sbH = summLines.length * 5.5 + 6;
  doc.setFillColor(SUMMBG);
  doc.setDrawColor('#E6D5B0');
  doc.setLineWidth(0.3);
  doc.roundedRect(SX, y, SW, sbH, 2, 2, 'FD');

  let sy = y + 5;
  summLines.forEach(({ label, value, bold, color }, i) => {
    const prevIsDivide = i === 3 || (data.totalPaid > 0 && i === summLines.length - 1);
    if (prevIsDivide && i > 0) {
      doc.setDrawColor('#CCCCCC'); doc.setLineWidth(0.2);
      doc.line(SX + 3, sy - 2.5, SX + SW - 3, sy - 2.5);
    }
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 9 : 8);
    doc.setTextColor(color || (bold ? BLACK : DARK));
    doc.text(label, SX + 4, sy);
    doc.setFont('helvetica', 'bold');
    doc.text(value, SX + SW - 4, sy, { align: 'right' });
    sy += 5.5;
  });

  y = Math.max(y + sbH, y) + 4;

  // ══ 7. Amount in words ════════════════════════════════════════════════════
  const words     = amountInWords(Math.round(netPayable));
  const wordsStr  = `Amount in Words: ${words} only.`;
  const wLines    = doc.splitTextToSize(wordsStr, CW - 10);
  const wbH       = wLines.length * 4.2 + 8;

  doc.setFillColor(YELW);
  doc.setDrawColor(YELBRD);
  doc.setLineWidth(0.4);
  doc.roundedRect(ML, y, CW, wbH, 2, 2, 'FD');
  doc.setFont('helvetica', 'bolditalic'); doc.setFontSize(8.5); doc.setTextColor(DARK);
  doc.text(wLines, ML + 5, y + 5.5);
  y += wbH + 5;

  divider(doc, y);
  y += 5;

  // ══ 8. Bank / payment details ═════════════════════════════════════════════
  if (data.bankName || data.bankAccountNumber) {
    sectionHead(doc, 'PAYMENT INSTRUCTIONS', ML, y);
    y += 5;

    const bFields: [string, string][] = [
      ['Bank Name',   data.bankName],
      ['Account No',  data.bankAccountNumber],
      ['IFSC Code',   data.bankIfsc],
      ['Branch',      data.bankBranch],
    ].filter(([, v]) => !!v) as [string, string][];

    const BLW = 24;
    for (let i = 0; i < bFields.length; i += 2) {
      const pair = bFields.slice(i, i + 2);
      pair.forEach(([lbl, val], idx) => {
        kv(doc, lbl, val, idx === 0 ? C1 : C2, y, BLW, HW - BLW - 3);
      });
      y += 5.5;
    }

    divider(doc, y);
    y += 5;
  }

  // ══ 9. TDS note ═══════════════════════════════════════════════════════════
  if (data.tdNote) {
    doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5); doc.setTextColor(MID);
    const tdLines = doc.splitTextToSize(`Note: ${data.tdNote}`, CW);
    doc.text(tdLines, ML, y);
    y += tdLines.length * 4 + 3;
  }

  // ══ 10. Footer + signatory ════════════════════════════════════════════════
  const footerTop = Math.max(y + 6, PH - 32);
  divider(doc, footerTop);

  doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(MUTED);
  doc.text('\u2022  This is a computer-generated document.', ML, footerTop + 5);
  doc.text('\u2022  GST is charged as applicable under the provisions of the GST Act.', ML, footerTop + 8.8);
  doc.text('\u2022  Kindly settle the amount on or before the due date to avoid penalties.', ML, footerTop + 12.6);

  // Signatory
  const sigX = PW - MR - 58;
  doc.setDrawColor('#AAAAAA'); doc.setLineWidth(0.5);
  doc.line(sigX, footerTop + 22, PW - MR, footerTop + 22);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(BLACK);
  doc.text('Authorised Signatory', PW - MR, footerTop + 27, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(MID);
  doc.text('For Eastern Estate', PW - MR, footerTop + 31, { align: 'right' });

  // Footer band
  doc.setFillColor(BRAND);
  doc.rect(0, PH - 8, PW, 8, 'F');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(WHITE);
  doc.text(
    `Demand Invoice  \u2022  Eastern Estate  \u2022  Generated: ${new Date().toLocaleDateString('en-IN')}`,
    PW / 2, PH - 3.5, { align: 'center' },
  );

  // ══ Save ══════════════════════════════════════════════════════════════════
  const tag = (data.invoiceNumber || 'demand-invoice').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`${tag}.pdf`);
}
