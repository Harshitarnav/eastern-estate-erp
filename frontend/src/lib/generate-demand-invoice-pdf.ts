/**
 * Demand Invoice PDF Generator
 * Uses jsPDF + jspdf-autotable (both already in package.json).
 *
 * All fields marked (manual) are filled via the UI dialog before generation.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DemandInvoiceData {
  // Manual fields (entered in dialog)
  invoiceNumber: string;       // e.g. "EE/25-26/0001"
  gstin: string;               // company GSTIN
  gstRate: number;             // total GST % e.g. 18  → split as CGST 9% + SGST 9%
  bankName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankBranch: string;
  tdNote: string;              // e.g. "TDS @ 1% u/s 194-IA (if applicable)"

  // Auto-filled from draft + fetched data
  invoiceDate: string;         // ISO date string
  dueDate: string;             // ISO date string or ''
  bookingNumber: string;
  milestoneName: string;

  // Customer
  customerName: string;
  customerAddress: string;
  customerPan: string;
  customerPhone: string;

  // Unit
  propertyName: string;
  towerName: string;
  flatNumber: string;
  flatArea: string;
  flatType: string;

  // Financials
  baseAmount: number;          // amount before GST
  totalPaid: number;           // already paid against this plan
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigits(n: number): string {
  if (n < 20) return ones[n];
  return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
}

function toWords(n: number): string {
  if (n === 0) return 'Zero';
  if (n < 0) return 'Minus ' + toWords(-n);

  const crore = Math.floor(n / 10_000_000);
  const lakh  = Math.floor((n % 10_000_000) / 100_000);
  const thou  = Math.floor((n % 100_000) / 1_000);
  const hund  = Math.floor((n % 1_000) / 100);
  const rest  = n % 100;

  let result = '';
  if (crore) result += toWords(crore) + ' Crore ';
  if (lakh)  result += twoDigits(lakh)  + ' Lakh ';
  if (thou)  result += twoDigits(thou)  + ' Thousand ';
  if (hund)  result += ones[hund]       + ' Hundred ';
  if (rest)  result += twoDigits(rest);
  return result.trim();
}

export function amountInWords(amount: number): string {
  const rupees = Math.floor(amount);
  const paise  = Math.round((amount - rupees) * 100);
  let result   = 'Rupees ' + toWords(rupees);
  if (paise)   result += ' and ' + toWords(paise) + ' Paise';
  return result + ' Only';
}

const fmt = (n: number) =>
  '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (s: string) => {
  if (!s) return '-';
  try {
    return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return s; }
};

// ── Main generator ────────────────────────────────────────────────────────────

export function generateDemandInvoicePdf(data: DemandInvoiceData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const PW  = 210;   // page width mm
  const PH  = 297;   // page height mm
  const ML  = 14;    // margin left
  const MR  = 14;    // margin right
  const CW  = PW - ML - MR;  // content width
  const brandRed = '#A8211B';

  // ── GST calculations ───────────────────────────────────────────────────────
  const halfRate    = data.gstRate / 2;
  const cgstAmount  = Math.round((data.baseAmount * halfRate) / 100 * 100) / 100;
  const sgstAmount  = Math.round((data.baseAmount * halfRate) / 100 * 100) / 100;
  const totalAmount = data.baseAmount + cgstAmount + sgstAmount;
  const netPayable  = Math.max(0, totalAmount - data.totalPaid);

  let y = 12;

  // ── HEADER BAND ────────────────────────────────────────────────────────────
  doc.setFillColor(brandRed);
  doc.rect(0, 0, PW, 28, 'F');

  // Try to load logo from /logo.png (if available in public folder)
  // Logo is placed top-left; company name top-right
  try {
    const img = new Image();
    img.src = '/logo-white.png';
    doc.addImage(img, 'PNG', ML, 4, 30, 20, '', 'FAST');
  } catch {
    // Logo unavailable - just show company name
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor('#ffffff');
  doc.text('EASTERN ESTATE', PW - MR, 12, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Construction & Development Pvt. Ltd.', PW - MR, 17, { align: 'right' });
  if (data.gstin) {
    doc.text(`GSTIN: ${data.gstin}`, PW - MR, 22, { align: 'right' });
  }

  y = 34;

  // ── TITLE ──────────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(brandRed);
  doc.text('DEMAND INVOICE', PW / 2, y, { align: 'center' });
  y += 2;
  doc.setDrawColor(brandRed);
  doc.setLineWidth(0.4);
  doc.line(ML, y, PW - MR, y);
  y += 5;

  // ── META GRID (invoice no / date on left, booking / due date on right) ─────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor('#333333');

  const col1 = ML;
  const col2 = PW / 2 + 4;

  const metaRow = (label: string, value: string, xBase: number, yPos: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#555555');
    doc.text(label + ':', xBase, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#111111');
    doc.text(value || '-', xBase + 26, yPos);
  };

  metaRow('Invoice No',   data.invoiceNumber,            col1, y);
  metaRow('Booking No',   data.bookingNumber,             col2, y);
  y += 5;
  metaRow('Date',         fmtDate(data.invoiceDate),      col1, y);
  metaRow('Due Date',     fmtDate(data.dueDate),          col2, y);
  y += 5;
  metaRow('Milestone',    data.milestoneName,             col1, y);
  y += 5;

  doc.setDrawColor('#dddddd');
  doc.setLineWidth(0.3);
  doc.line(ML, y, PW - MR, y);
  y += 5;

  // ── TO / UNIT GRID ─────────────────────────────────────────────────────────
  const halfW = (CW / 2) - 2;

  // Customer block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(brandRed);
  doc.text('BILL TO', col1, y);

  // Unit block
  doc.text('UNIT DETAILS', col2, y);
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor('#111111');
  doc.text(data.customerName || '-', col1, y);
  const unitLabel = [data.propertyName, data.towerName, data.flatNumber].filter(Boolean).join(' › ');
  doc.text(unitLabel || '-', col2, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor('#333333');

  // Wrap customer address
  const addrLines = doc.splitTextToSize(data.customerAddress || '', halfW);
  doc.text(addrLines, col1, y);

  // Unit extras
  if (data.flatType || data.flatArea) {
    doc.text([data.flatType, data.flatArea].filter(Boolean).join(' | '), col2, y);
    y += 4;
  }

  const addrBlockHeight = addrLines.length * 4;
  y = Math.max(y, y + addrBlockHeight - 4);

  if (data.customerPan) {
    doc.setFont('helvetica', 'normal');
    doc.text(`PAN: ${data.customerPan}`, col1, y);
    y += 4;
  }
  if (data.customerPhone) {
    doc.text(`Ph: ${data.customerPhone}`, col1, y);
    y += 4;
  }

  y += 2;
  doc.setDrawColor('#dddddd');
  doc.line(ML, y, PW - MR, y);
  y += 5;

  // ── INVOICE TABLE ──────────────────────────────────────────────────────────
  const tableBody: (string | number)[][] = [
    [
      '1',
      data.milestoneName || 'Payment Instalment',
      fmt(data.baseAmount),
      `${halfRate}%\n${fmt(cgstAmount)}`,
      `${halfRate}%\n${fmt(sgstAmount)}`,
      fmt(totalAmount),
    ],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: ML, right: MR },
    head: [['#', 'Description', 'Basic Amount', `CGST\n${halfRate}%`, `SGST\n${halfRate}%`, 'Total']],
    body: tableBody,
    headStyles: {
      fillColor: brandRed,
      textColor: '#ffffff',
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: '#111111',
      cellPadding: 3,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { cellWidth: 60 },
      2: { halign: 'right' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: { fillColor: '#fafafa' },
    theme: 'grid',
  });

  y = (doc as any).lastAutoTable.finalY + 4;

  // ── SUMMARY BOX ────────────────────────────────────────────────────────────
  const summaryX = PW - MR - 70;
  const summaryW = 70;

  const summaryRow = (label: string, value: string, bold = false, color = '#111111') => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(color);
    doc.text(label, summaryX + 2, y);
    doc.text(value, summaryX + summaryW - 2, y, { align: 'right' });
    y += 5;
  };

  doc.setDrawColor('#cccccc');
  doc.setLineWidth(0.3);

  summaryRow('Base Amount',             fmt(data.baseAmount));
  summaryRow(`CGST @ ${halfRate}%`,     fmt(cgstAmount));
  summaryRow(`SGST @ ${halfRate}%`,     fmt(sgstAmount));
  doc.line(summaryX, y - 1, summaryX + summaryW, y - 1);
  summaryRow('Total Amount',            fmt(totalAmount), true);
  if (data.totalPaid > 0) {
    summaryRow('Less: Amount Paid',     fmt(data.totalPaid), false, '#555555');
    doc.line(summaryX, y - 1, summaryX + summaryW, y - 1);
    summaryRow('Net Payable',           fmt(netPayable), true, brandRed);
  }

  y += 3;

  // ── AMOUNT IN WORDS ────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor('#333333');
  const words = amountInWords(Math.round(netPayable));
  const wordsLines = doc.splitTextToSize(`Amount in Words: ${words}`, CW);
  doc.text(wordsLines, ML, y);
  y += wordsLines.length * 4 + 4;

  doc.setDrawColor('#dddddd');
  doc.line(ML, y, PW - MR, y);
  y += 5;

  // ── BANK DETAILS ───────────────────────────────────────────────────────────
  if (data.bankName || data.bankAccountNumber) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(brandRed);
    doc.text('PAYMENT DETAILS', ML, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#333333');

    const bankFields: [string, string][] = [
      ['Bank Name', data.bankName],
      ['Account No', data.bankAccountNumber],
      ['IFSC Code', data.bankIfsc],
      ['Branch', data.bankBranch],
    ].filter(([, v]) => !!v) as [string, string][];

    const colsPerRow = 2;
    for (let i = 0; i < bankFields.length; i += colsPerRow) {
      const slice = bankFields.slice(i, i + colsPerRow);
      slice.forEach(([label, value], idx) => {
        const xb = ML + idx * (CW / colsPerRow);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor('#555555');
        doc.text(`${label}:`, xb, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor('#111111');
        doc.text(value, xb + 22, y);
      });
      y += 5;
    }

    doc.setDrawColor('#dddddd');
    doc.line(ML, y, PW - MR, y);
    y += 5;
  }

  // ── TDS NOTE ──────────────────────────────────────────────────────────────
  if (data.tdNote) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor('#666666');
    doc.text(`Note: ${data.tdNote}`, ML, y);
    y += 6;
  }

  // ── FOOTER / SIGNATORY ────────────────────────────────────────────────────
  // Place at bottom of page
  const footerY = PH - 30;
  doc.setDrawColor('#dddddd');
  doc.line(ML, footerY, PW - MR, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor('#888888');
  doc.text('This is a computer-generated document.', ML, footerY + 5);

  // Signatory block on right
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor('#333333');
  doc.text('Prepared By: _________________', PW - MR - 75, footerY + 8);
  doc.text('Authorised Signatory', PW - MR - 55, footerY + 18);
  doc.setDrawColor('#555555');
  doc.setLineWidth(0.3);
  doc.line(PW - MR - 75, footerY + 16, PW - MR, footerY + 16);

  // ── SAVE ──────────────────────────────────────────────────────────────────
  const safeName = (data.invoiceNumber || 'demand-invoice').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`${safeName}.pdf`);
}
