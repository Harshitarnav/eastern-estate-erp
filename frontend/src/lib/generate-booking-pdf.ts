/**
 * Booking Summary PDF — Professional Design
 * Eastern Estate ERP
 *
 * Design principles:
 *  - Text-only header (no image loading)
 *  - All text through splitTextToSize (zero overflow)
 *  - Interface 100 % backward-compatible
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Booking } from '@/services/bookings.service';

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

const BRAND    = '#A8211B';
const DARKRED  = '#7B1E12';
const WHITE    = '#FFFFFF';
const BLACK    = '#1A1A1A';
const DARK     = '#333333';
const MID      = '#666666';
const MUTED    = '#999999';
const LINE     = '#DDDDDD';
const CREAM    = '#FEF8EE';
const LGRAY    = '#F4F1EB';
const BANDTOP  = '#FFF3F2';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number | undefined | null): string => {
  if (n == null || isNaN(Number(n))) return '\u2014';
  return '\u20b9' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

const fmtDate = (s: string | null | undefined): string => {
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

function sectionHead(doc: jsPDF, text: string, y: number): number {
  doc.setFillColor('#F0EEEA');
  doc.rect(ML, y, CW, 7, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(BRAND);
  doc.text(text, ML + 4, y + 4.8);
  return y + 10;
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface BookingSummaryData {
  booking: Booking;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  milestones?: Array<{
    name: string;
    amount: number;
    dueDate?: string;
    status?: string;
  }>;
}

// ─── Main generator ───────────────────────────────────────────────────────────

export function generateBookingSummaryPdf(data: BookingSummaryData): void {
  const { booking, customerName, customerPhone, customerEmail, milestones } = data;
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
  doc.text('BOOKING SUMMARY', PW - MR, 9, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor('#EEEEEE');
  doc.text(`No.\u00a0${booking.bookingNumber ?? '\u2014'}`, PW - MR, 14.5, { align: 'right' });

  // Status badge in header
  const status = (booking.status ?? '').toUpperCase();
  const statusColors: Record<string, string> = {
    CONFIRMED: '#15803D', CANCELLED: '#B91C1C', COMPLETED: '#1D4ED8',
    TOKEN_PAID: '#B45309', AGREEMENT_SIGNED: '#065F46',
  };
  const sBg = statusColors[status] || '#555555';
  doc.setFillColor(sBg);
  doc.roundedRect(PW - MR - 32, 16.5, 32, 7, 2, 2, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(WHITE);
  doc.text(status || 'PENDING', PW - MR - 16, 21.5, { align: 'center' });

  y = 22;

  // ══ 2. Contact strip (6 mm) ═══════════════════════════════════════════════
  doc.setFillColor(CREAM);
  doc.rect(0, y, PW, 6, 'F');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(MID);
  doc.text(`Booking Date: ${fmtDate(booking.bookingDate)}  \u2022  Generated: ${new Date().toLocaleDateString('en-IN')}  \u2022  Computer-generated document`, PW / 2, y + 4, { align: 'center' });
  y += 6;

  y += 4;

  // ══ 3. Customer Details ═══════════════════════════════════════════════════
  y = sectionHead(doc, 'CUSTOMER DETAILS', y);

  const LW = 28;
  const VW = HW - LW - 2;

  kv(doc, 'Customer Name', customerName,  C1, y, LW, VW);
  kv(doc, 'Phone',         customerPhone, C2, y, LW, VW);
  y += 5;
  kv(doc, 'Email', customerEmail, C1, y, LW, VW);
  const custAddr = (booking as any).customer?.address || (booking as any).customerAddress;
  if (custAddr) kv(doc, 'Address', custAddr, C2, y, LW, VW);
  y += 7;

  // ══ 4. Property & Unit ════════════════════════════════════════════════════
  y = sectionHead(doc, 'PROPERTY \u0026 UNIT DETAILS', y);

  const property  = booking.property?.name ?? (booking as any).propertyName ?? '\u2014';
  const tower     = (booking.flat as any)?.tower?.name ?? (booking as any).towerName ?? '\u2014';
  const flatNo    = booking.flat?.flatNumber ?? booking.flat?.name ?? '\u2014';
  const flatType  = (booking.flat as any)?.flatType ?? (booking.flat as any)?.bhkType ?? '\u2014';
  const area      = (booking.flat as any)?.superBuiltUpArea ?? (booking.flat as any)?.carpetArea ?? (booking.flat as any)?.builtUpArea;
  const facing    = (booking.flat as any)?.facing;
  const possession = (booking as any).possessionDate;

  kv(doc, 'Project',  property, C1, y, LW, VW);
  kv(doc, 'Tower',    tower,    C2, y, LW, VW);
  y += 5;
  kv(doc, 'Unit / Flat No.', flatNo,   C1, y, LW, VW);
  kv(doc, 'Configuration',   flatType, C2, y, LW, VW);
  y += 5;
  if (area) kv(doc, 'Area (Sq.Ft.)',  String(area), C1, y, LW, VW);
  if (facing) kv(doc, 'Facing', facing, C2, y, LW, VW);
  if (area || facing) y += 5;
  if (possession) {
    kv(doc, 'Expected Possession', fmtDate(possession), C1, y, LW, VW);
    y += 5;
  }
  y += 2;

  // ══ 5. Financial Summary ══════════════════════════════════════════════════
  y = sectionHead(doc, 'FINANCIAL SUMMARY', y);

  // Three-box summary band
  const bandH = 16;
  doc.setFillColor(BANDTOP);
  doc.setDrawColor(BRAND);
  doc.setLineWidth(0.3);
  doc.rect(ML, y, CW, bandH, 'FD');

  const cells = [
    { label: 'Agreement Value', value: fmt(booking.totalAmount) },
    { label: 'Amount Paid',     value: fmt(booking.paidAmount) },
    { label: 'Balance Due',     value: fmt(booking.balanceAmount) },
  ];
  const cellW = CW / cells.length;
  cells.forEach((c, i) => {
    const cx = ML + i * cellW + 4;
    // Divider between cells
    if (i > 0) {
      doc.setDrawColor('#F0C0C0'); doc.setLineWidth(0.2);
      doc.line(ML + i * cellW, y + 2, ML + i * cellW, y + bandH - 2);
    }
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(MID);
    doc.text(c.label, cx, y + 5.5);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(DARKRED);
    doc.text(c.value, cx, y + 13);
  });
  y += bandH + 6;

  // Detail rows
  const finRows: [string, string][] = [
    ['Token Amount',           fmt(booking.tokenAmount)],
    ['Discount',               fmt(booking.discountAmount)],
    ['GST',                    fmt(booking.gstAmount)],
    ['Stamp Duty',             fmt(booking.stampDuty)],
    ['Registration Charges',   fmt(booking.registrationCharges)],
    ['Parking Charges',        fmt(booking.parkingCharges)],
    ['Maintenance Deposit',    fmt(booking.maintenanceDeposit)],
    ['Other Charges',          fmt(booking.otherCharges)],
  ].filter(([, v]) => v !== '\u2014' && v !== '\u20b90') as [string, string][];

  if (finRows.length) {
    const colW = (CW - 4) / 2;
    finRows.forEach(([label, val], i) => {
      const cx = ML + 2 + (i % 2) * (colW + 2);
      const ry = y + Math.floor(i / 2) * 8;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(MUTED);
      doc.text(label, cx, ry);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(DARK);
      doc.text(val, cx, ry + 4);
    });
    y += Math.ceil(finRows.length / 2) * 8 + 4;
  }

  // ══ 6. Payment plan / Milestones ══════════════════════════════════════════
  if (milestones && milestones.length > 0) {
    y = sectionHead(doc, 'PAYMENT PLAN MILESTONES', y);

    autoTable(doc, {
      startY: y,
      margin: { left: ML, right: MR },
      head: [['#', 'Milestone', 'Amount (\u20b9)', 'Due Date', 'Status']],
      body: milestones.map((m, i) => [
        String(i + 1),
        m.name,
        fmt(m.amount),
        fmtDate(m.dueDate),
        m.status ?? 'PENDING',
      ]),
      headStyles: {
        fillColor: BRAND, textColor: '#fff', fontStyle: 'bold', fontSize: 8,
        cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
      },
      bodyStyles: { fontSize: 8, cellPadding: { top: 2.5, bottom: 2.5, left: 4, right: 4 }, textColor: DARK },
      columnStyles: {
        0: { cellWidth: 8,  halign: 'center' },
        1: { cellWidth: 72 },
        2: { cellWidth: 34, halign: 'right' },
        3: { cellWidth: 30 },
        4: { cellWidth: 24, halign: 'center' },
      },
      alternateRowStyles: { fillColor: '#FAFAFA' },
      didParseCell: (hookData: any) => {
        if (hookData.section === 'body' && hookData.column.index === 4) {
          const s = String(hookData.cell.raw ?? '');
          hookData.cell.styles.textColor =
            s === 'PAID' || s === 'COMPLETED' ? '#15803D' :
            s === 'OVERDUE'                   ? '#B91C1C' :
            s === 'TRIGGERED'                 ? '#B45309' : '#6B7280';
          hookData.cell.styles.fontStyle = 'bold';
        }
      },
      theme: 'grid',
    });

    y = (doc as any).lastAutoTable.finalY + 6;
  } else if (booking.paymentPlan) {
    y = sectionHead(doc, 'PAYMENT PLAN', y);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(DARK);
    doc.text(doc.splitTextToSize(booking.paymentPlan, CW - 8), ML + 4, y);
    y += 14;
  }

  // ══ 7. Notes ══════════════════════════════════════════════════════════════
  const noteText = booking.discountReason ?? (booking as any).notes ?? (booking as any).remarks;
  if (noteText) {
    y = sectionHead(doc, 'NOTES', y);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(DARK);
    const nLines = doc.splitTextToSize(noteText, CW - 8);
    doc.text(nLines, ML + 4, y);
    y += nLines.length * 4.5 + 6;
  }

  // ══ 8. Signature area ═════════════════════════════════════════════════════
  const sigY = Math.max(y + 8, PH - 40);
  divider(doc, sigY);

  // Customer sig (left)
  doc.setDrawColor('#AAAAAA'); doc.setLineWidth(0.5);
  doc.line(ML, sigY + 18, ML + 62, sigY + 18);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(MUTED);
  doc.text('Customer Signature', ML, sigY + 22);

  // Company sig (right)
  const coSigX = PW - MR - 65;
  doc.line(coSigX, sigY + 18, PW - MR, sigY + 18);
  doc.text('Authorised Signatory', coSigX, sigY + 22);
  doc.text('Eastern Estate', coSigX, sigY + 26);

  // ══ 9. Footer band ════════════════════════════════════════════════════════
  doc.setFillColor(BRAND);
  doc.rect(0, PH - 8, PW, 8, 'F');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(WHITE);
  doc.text(
    `Booking Summary  \u2022  Eastern Estate  \u2022  ${booking.bookingNumber ?? ''}  \u2022  Generated: ${new Date().toLocaleDateString('en-IN')}`,
    PW / 2, PH - 3.5, { align: 'center' },
  );

  // ══ Save ══════════════════════════════════════════════════════════════════
  const tag = (booking.bookingNumber ?? 'booking').replace(/[^a-z0-9]/gi, '_');
  doc.save(`booking_summary_${tag}.pdf`);
}
