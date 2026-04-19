/**
 * Money Receipt PDF Generator
 * Uses jsPDF + jspdf-autotable (both already in package.json).
 *
 * All fields marked (manual) are filled via the UI dialog before generation.
 * All other fields are auto-filled from the payment record + fetched relations.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { amountInWords } from './generate-demand-invoice-pdf';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ReceiptData {
  // Manual fields (entered in dialog)
  receiptNumber: string;      // pre-filled from payment.receiptNumber or typed
  narration: string;          // free-text notes, optional

  // Auto-filled from payment record
  paymentDate: string;        // ISO date string
  amount: number;             // payment amount (full received amount)
  paymentMethod: string;      // CASH | CHEQUE | BANK_TRANSFER | UPI | CARD | OTHER
  bankName?: string;
  chequeNumber?: string;
  chequeDate?: string;        // ISO date string
  transactionRef?: string;    // UTR / transaction ID / UPI ref
  bookingNumber: string;
  paymentNumber: string;      // internal payment code

  // Customer
  customerName: string;
  customerAddress: string;
  customerPan: string;
  customerPhone: string;

  // Unit (flat → tower → property)
  propertyName: string;
  towerName: string;
  flatNumber: string;
  flatType: string;
  flatArea: string;

  // Description of what this payment is against
  description: string;       // e.g. "On Account of Booking / Instalment 3 / On Possession"
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (s: string | undefined) => {
  if (!s) return '-';
  try {
    return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return s; }
};

const paymentMethodLabel: Record<string, string> = {
  CASH: 'Cash',
  CHEQUE: 'Cheque',
  BANK_TRANSFER: 'Bank Transfer / NEFT / RTGS',
  UPI: 'UPI',
  CARD: 'Card',
  OTHER: 'Other',
};

// ── Main generator ────────────────────────────────────────────────────────────

export function generateReceiptPdf(data: ReceiptData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const PW  = 210;
  const PH  = 297;
  const ML  = 14;
  const MR  = 14;
  const CW  = PW - ML - MR;
  const brandRed = '#A8211B';

  let y = 12;

  // ── HEADER BAND ────────────────────────────────────────────────────────────
  doc.setFillColor(brandRed);
  doc.rect(0, 0, PW, 28, 'F');

  try {
    const img = new Image();
    img.src = '/logo-white.png';
    doc.addImage(img, 'PNG', ML, 4, 30, 20, '', 'FAST');
  } catch {
    // Logo unavailable - skip silently
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor('#ffffff');
  doc.text('EASTERN ESTATE', PW - MR, 12, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Construction & Development Pvt. Ltd.', PW - MR, 17, { align: 'right' });

  y = 34;

  // ── TITLE ──────────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(brandRed);
  doc.text('MONEY RECEIPT', PW / 2, y, { align: 'center' });
  y += 2;
  doc.setDrawColor(brandRed);
  doc.setLineWidth(0.4);
  doc.line(ML, y, PW - MR, y);
  y += 5;

  // ── META GRID ──────────────────────────────────────────────────────────────
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
    doc.text(value || '-', xBase + 28, yPos);
  };

  metaRow('Receipt No',   data.receiptNumber,           col1, y);
  metaRow('Booking No',   data.bookingNumber,            col2, y);
  y += 5;
  metaRow('Date',         fmtDate(new Date().toISOString()), col1, y);
  metaRow('Payment Date', fmtDate(data.paymentDate),    col2, y);
  y += 5;
  metaRow('Payment Ref',  data.paymentNumber,            col1, y);
  y += 5;

  doc.setDrawColor('#dddddd');
  doc.setLineWidth(0.3);
  doc.line(ML, y, PW - MR, y);
  y += 5;

  // ── CUSTOMER / UNIT GRID ───────────────────────────────────────────────────
  const halfW = (CW / 2) - 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(brandRed);
  doc.text('RECEIVED FROM', col1, y);
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

  const addrLines = doc.splitTextToSize(data.customerAddress || '', halfW);
  doc.text(addrLines, col1, y);

  if (data.flatType || data.flatArea) {
    doc.text([data.flatType, data.flatArea].filter(Boolean).join(' | '), col2, y);
  }

  const addrBlockHeight = addrLines.length * 4;
  y = Math.max(y + 4, y + addrBlockHeight - 4 + 4);

  if (data.customerPan) {
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

  // ── PAYMENT MODE BLOCK ─────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(brandRed);
  doc.text('PAYMENT DETAILS', ML, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor('#333333');

  const method = paymentMethodLabel[data.paymentMethod] || data.paymentMethod || 'N/A';

  // Lay out payment mode fields in a 2-column grid
  const modeFields: [string, string][] = [
    ['Mode', method],
  ];

  if (data.bankName)      modeFields.push(['Bank', data.bankName]);
  if (data.chequeNumber)  modeFields.push(['Cheque No', data.chequeNumber]);
  if (data.chequeDate)    modeFields.push(['Cheque Date', fmtDate(data.chequeDate)]);
  if (data.transactionRef) modeFields.push(['UTR / Ref No', data.transactionRef]);

  for (let i = 0; i < modeFields.length; i += 2) {
    const pair = modeFields.slice(i, i + 2);
    pair.forEach(([label, value], idx) => {
      const xb = ML + idx * (CW / 2);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#555555');
      doc.text(`${label}:`, xb, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#111111');
      doc.text(value, xb + 26, y);
    });
    y += 5;
  }

  y += 2;
  doc.setDrawColor('#dddddd');
  doc.line(ML, y, PW - MR, y);
  y += 5;

  // ── RECEIPT TABLE ─────────────────────────────────────────────────────────
  const tableBody: (string | number)[][] = [
    [
      '1',
      data.description || 'Payment Received',
      fmt(data.amount),
    ],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: ML, right: MR },
    head: [['#', 'Description / Against', 'Amount Received']],
    body: tableBody,
    foot: [['', 'Total Amount Received', fmt(data.amount)]],
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
    footStyles: {
      fillColor: '#f5f5f5',
      textColor: '#111111',
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'right' as const,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 130 },
      2: { halign: 'right', fontStyle: 'bold' },
    },
    theme: 'grid',
  });

  y = (doc as any).lastAutoTable.finalY + 4;

  // ── AMOUNT IN WORDS ────────────────────────────────────────────────────────
  doc.setFillColor('#fef9e7');
  const wordsText = amountInWords(Math.round(data.amount));
  const wordsLines = doc.splitTextToSize(`Amount in Words: ${wordsText}`, CW - 6);
  const wordsBlockH = wordsLines.length * 4.5 + 6;
  doc.roundedRect(ML, y, CW, wordsBlockH, 2, 2, 'F');
  doc.setDrawColor('#f0c040');
  doc.setLineWidth(0.3);
  doc.roundedRect(ML, y, CW, wordsBlockH, 2, 2, 'S');

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor('#333333');
  doc.text(wordsLines, ML + 3, y + 5);
  y += wordsBlockH + 5;

  // ── NARRATION ─────────────────────────────────────────────────────────────
  if (data.narration) {
    doc.setDrawColor('#dddddd');
    doc.line(ML, y, PW - MR, y);
    y += 4;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(brandRed);
    doc.text('NARRATION / NOTES', ML, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor('#333333');
    const narrationLines = doc.splitTextToSize(data.narration, CW);
    doc.text(narrationLines, ML, y);
    y += narrationLines.length * 4 + 4;
  }

  // ── FOOTER / SIGNATORY ────────────────────────────────────────────────────
  const footerY = PH - 32;
  doc.setDrawColor('#dddddd');
  doc.setLineWidth(0.3);
  doc.line(ML, footerY, PW - MR, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor('#888888');
  doc.text('This is a computer-generated receipt and does not require a physical signature.', ML, footerY + 5);
  doc.text('Please retain this receipt for your records.', ML, footerY + 10);

  // Signatory block - right side
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor('#333333');
  doc.text('Received By: _________________', PW - MR - 75, footerY + 8);
  doc.setDrawColor('#555555');
  doc.setLineWidth(0.3);
  doc.line(PW - MR - 75, footerY + 20, PW - MR, footerY + 20);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorised Signatory', PW - MR - 55, footerY + 24);

  // ── SAVE ──────────────────────────────────────────────────────────────────
  const safeName = (data.receiptNumber || 'receipt').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`receipt_${safeName}.pdf`);
}
