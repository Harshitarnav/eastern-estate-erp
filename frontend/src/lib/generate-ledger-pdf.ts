/**
 * Unit-wise Ledger Statement PDF — Professional Design
 * Eastern Estate ERP
 *
 * Design principles:
 *  - Text-only header (no image loading)
 *  - All text through splitTextToSize (zero overflow)
 *  - Same design system as receipt / invoice / booking PDFs
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LedgerResponse } from '@/services/payment-plans.service';

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
const BANDTOP = '#FFF3F2';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number | undefined | null): string => {
  if (n == null || isNaN(Number(n))) return '\u2014';
  return '\u20b9' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

const fmtDate = (s: string | null | undefined): string => {
  if (!s) return '\u2014';
  try {
    return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return s; }
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

function sectionHead(doc: jsPDF, text: string, y: number): number {
  doc.setFillColor('#F0EEEA');
  doc.rect(ML, y, CW, 7, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(BRAND);
  doc.text(text, ML + 4, y + 4.8);
  return y + 10;
}

// ─── Main generator ───────────────────────────────────────────────────────────

export function generateLedgerPdf(ledger: LedgerResponse): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = 0;

  // ══ 1. Header band (22 mm) ════════════════════════════════════════════════
  doc.setFillColor(BRAND);
  doc.rect(0, 0, PW, 22, 'F');

  // Left — company
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(WHITE);
  doc.text('EASTERN ESTATE', ML, 9);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor('#EEEEEE');
  doc.text('Construction \u0026 Development Pvt. Ltd.', ML, 14);
  doc.setFontSize(6.5); doc.setTextColor('#DDDDDD');
  doc.text('Life Long Bonding\u2026', ML, 19);

  // Right — document type
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(WHITE);
  doc.text('LEDGER STATEMENT', PW - MR, 9, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor('#EEEEEE');
  doc.text('Unit-wise Account Summary', PW - MR, 14, { align: 'right' });

  y = 22;

  // ══ 2. Contact strip (6 mm) ═══════════════════════════════════════════════
  doc.setFillColor(CREAM);
  doc.rect(0, y, PW, 6, 'F');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(MID);
  const bkNo = ledger.booking?.bookingNumber ?? '';
  doc.text(
    `Booking: ${bkNo || '\u2014'}  \u2022  Statement Date: ${new Date().toLocaleDateString('en-IN')}  \u2022  Computer-generated document`,
    PW / 2, y + 4, { align: 'center' },
  );
  y += 6;

  y += 4;

  // ══ 3. Customer & Unit Info ════════════════════════════════════════════════
  y = sectionHead(doc, 'CUSTOMER \u0026 UNIT DETAILS', y);

  const LW = 28;
  const VW = HW - LW - 2;

  const customerName  = ledger.customer?.fullName ?? '\u2014';
  const customerPhone = ledger.customer?.phone ?? '\u2014';
  const customerEmail = ledger.customer?.email ?? '\u2014';

  const unitLabel = [
    ledger.flat?.property,
    ledger.flat?.tower,
    ledger.flat?.flatNumber ? `Flat ${ledger.flat.flatNumber}` : '',
  ].filter(Boolean).join(' \u203a ') || '\u2014';

  kv(doc, 'Customer', customerName,  C1, y, LW, VW);
  kv(doc, 'Phone',    customerPhone, C2, y, LW, VW);
  y += 5;
  kv(doc, 'Email', customerEmail, C1, y, LW, VW);
  if (ledger.booking?.bookingDate) {
    kv(doc, 'Booking Date', fmtDate(ledger.booking.bookingDate as unknown as string), C2, y, LW, VW);
  }
  y += 5;
  kv(doc, 'Unit', doc.splitTextToSize(unitLabel, VW + LW)[0], C1, y, LW, VW + LW);
  y += 7;

  // ══ 4. Summary Band (4 boxes) ════════════════════════════════════════════
  y = sectionHead(doc, 'FINANCIAL SUMMARY', y);

  const bandH = 16;
  doc.setFillColor(BANDTOP);
  doc.setDrawColor(BRAND);
  doc.setLineWidth(0.3);
  doc.rect(ML, y, CW, bandH, 'FD');

  const summaryBoxes = [
    { label: 'Agreement Value', value: fmt(ledger.plan.totalAmount) },
    { label: 'Total Demanded',  value: fmt(ledger.summary.totalDemanded) },
    { label: 'Total Paid',      value: fmt(ledger.summary.totalPaid) },
    { label: 'Outstanding',     value: fmt(ledger.summary.balance) },
  ];

  const cellW = CW / summaryBoxes.length;
  summaryBoxes.forEach((b, i) => {
    const cx = ML + i * cellW + 4;
    if (i > 0) {
      doc.setDrawColor('#F0C0C0'); doc.setLineWidth(0.2);
      doc.line(ML + i * cellW, y + 2, ML + i * cellW, y + bandH - 2);
    }
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(MID);
    doc.text(b.label, cx, y + 5.5);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(DARKRED);
    doc.text(b.value, cx, y + 13);
  });
  y += bandH + 6;

  // Plan status row
  const overdueCount   = ledger.summary.overdueCount ?? 0;
  const pendingCount   = ledger.summary.pendingMilestones ?? 0;
  const planStatus     = ledger.plan.status ?? '\u2014';

  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(MUTED);
  doc.text(
    `Plan Status: ${planStatus}  \u2022  Overdue Milestones: ${overdueCount}  \u2022  Pending Milestones: ${pendingCount}`,
    ML, y,
  );
  y += 7;

  // ══ 5. Ledger Table ═══════════════════════════════════════════════════════
  y = sectionHead(doc, 'TRANSACTION LEDGER', y);

  const tableBody: any[] = ledger.rows.map((row) => {
    const isDemand = row.type === 'DEMAND';
    const desc = doc.splitTextToSize(
      row.description + (row.reference ? ` (${row.reference})` : ''),
      58,
    )[0];
    return [
      fmtDate(row.date),
      desc,
      isDemand ? fmt(row.debit)  : '',
      !isDemand ? fmt(row.credit) : '',
      fmt(row.balance),
      row.status ?? 'PENDING',
    ];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: ML, right: MR },
    head: [['Date', 'Description', 'Demanded (\u20b9)', 'Paid (\u20b9)', 'Balance (\u20b9)', 'Status']],
    body: tableBody,
    headStyles: {
      fillColor: BRAND,
      textColor: '#fff',
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: { top: 2.5, bottom: 2.5, left: 4, right: 4 },
      textColor: DARK,
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 64 },
      2: { cellWidth: 26, halign: 'right' },
      3: { cellWidth: 24, halign: 'right' },
      4: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 18, halign: 'center', fontSize: 7 },
    },
    alternateRowStyles: { fillColor: '#FAFAFA' },
    didParseCell: (hookData: any) => {
      if (hookData.section === 'body') {
        const row = ledger.rows[hookData.row.index];
        if (hookData.column.index === 5) {
          const s = String(hookData.cell.raw ?? '');
          hookData.cell.styles.textColor =
            s === 'PAID' || s === 'COMPLETED' ? '#15803D' :
            s === 'OVERDUE'                   ? '#B91C1C' :
            s === 'TRIGGERED'                 ? '#B45309' : MID;
          hookData.cell.styles.fontStyle = 'bold';
        } else if (row?.type === 'DEMAND') {
          hookData.cell.styles.textColor = '#92400E';
        } else if (row?.type === 'PAYMENT') {
          hookData.cell.styles.textColor = '#14532D';
        }
      }
    },
    theme: 'grid',
  });

  const afterTable = (doc as any).lastAutoTable.finalY + 6;

  // ══ 6. Signature area ════════════════════════════════════════════════════
  const sigY = Math.max(afterTable + 8, PH - 38);
  divider(doc, sigY);

  doc.setDrawColor('#AAAAAA'); doc.setLineWidth(0.5);
  doc.line(ML, sigY + 18, ML + 62, sigY + 18);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(MUTED);
  doc.text('Customer Signature', ML, sigY + 22);

  const coSigX = PW - MR - 65;
  doc.line(coSigX, sigY + 18, PW - MR, sigY + 18);
  doc.text('Accounts Team Signature', coSigX, sigY + 22);
  doc.text('Eastern Estate', coSigX, sigY + 26);

  // Disclaimer line
  doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(MUTED);
  doc.text(
    'This is a computer-generated statement. For queries contact the Accounts Department.',
    PW / 2, sigY + 30, { align: 'center' },
  );

  // ══ 7. Footer band ════════════════════════════════════════════════════════
  doc.setFillColor(BRAND);
  doc.rect(0, PH - 8, PW, 8, 'F');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(WHITE);
  const flatTag2 = ledger.flat?.flatNumber ?? 'unit';
  doc.text(
    `Ledger Statement  \u2022  Eastern Estate  \u2022  ${bkNo || flatTag2}  \u2022  Generated: ${new Date().toLocaleDateString('en-IN')}`,
    PW / 2, PH - 3.5, { align: 'center' },
  );

  // ══ Save ══════════════════════════════════════════════════════════════════
  const flatTag = (ledger.flat?.flatNumber ?? 'unit').replace(/[^a-z0-9]/gi, '_');
  doc.save(`ledger_${flatTag}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
