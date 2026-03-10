import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Booking } from '@/services/bookings.service';

const brandRed  = '#A8211B';
const brandDark = '#7B1E12';
const PW = 210;
const PH = 297;
const ML = 14;
const MR = 14;

const fmt = (n: number | undefined | null) => {
  if (n == null || isNaN(Number(n))) return '—';
  return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

const fmtDate = (s: string | null | undefined): string => {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return s; }
};

const labelValue = (
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  maxW = 82,
) => {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor('#888888');
  doc.text(label.toUpperCase(), x, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor('#1a1a1a');
  const lines = doc.splitTextToSize(value || '—', maxW);
  doc.text(lines, x, y + 4);
  return y + 4 + lines.length * 4.5;
};

const section = (doc: jsPDF, title: string, y: number) => {
  doc.setFillColor('#f5f5f5');
  doc.rect(ML, y, PW - ML - MR, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(brandRed);
  doc.text(title, ML + 3, y + 4.8);
  return y + 10;
};

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

export function generateBookingSummaryPdf(data: BookingSummaryData): void {
  const { booking, customerName, customerPhone, customerEmail, milestones } = data;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // ── TOP BRAND BAND ────────────────────────────────────────────────────────
  doc.setFillColor(brandRed);
  doc.rect(0, 0, PW, 28, 'F');

  // Company name (right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor('#ffffff');
  doc.text('EASTERN ESTATE', PW - MR, 11, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Construction & Development Pvt. Ltd.', PW - MR, 17, { align: 'right' });

  // Doc title (left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('BOOKING SUMMARY', ML, 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Booking No: ${booking.bookingNumber ?? '—'}`, ML, 17);
  doc.text(`Date: ${fmtDate(booking.bookingDate)}`, ML, 22);

  // Status badge
  const status = booking.status ?? '';
  const statusColor = status === 'CONFIRMED' ? '#16a34a' : status === 'CANCELLED' ? '#dc2626' : '#d97706';
  doc.setFillColor(statusColor);
  doc.roundedRect(PW - MR - 30, 19, 30, 7, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor('#ffffff');
  doc.text(status, PW - MR - 15, 24, { align: 'center' });

  let y = 35;

  // ── CUSTOMER DETAILS ──────────────────────────────────────────────────────
  y = section(doc, 'CUSTOMER DETAILS', y);

  const col1 = ML + 2;
  const col2 = ML + 2 + (PW - ML - MR) / 2;

  labelValue(doc, 'Customer Name', customerName, col1, y);
  labelValue(doc, 'Phone', customerPhone, col2, y);
  y += 10;
  labelValue(doc, 'Email', customerEmail, col1, y);
  if ((booking as any).customer?.address) {
    labelValue(doc, 'Address', (booking as any).customer.address, col2, y);
  }
  y += 12;

  // ── PROPERTY & UNIT ───────────────────────────────────────────────────────
  y = section(doc, 'PROPERTY & UNIT DETAILS', y);

  const property = booking.property?.name ?? (booking as any).propertyName ?? '—';
  const tower    = (booking.flat as any)?.tower?.name ?? (booking as any).towerName ?? '—';
  const flatNo   = booking.flat?.flatNumber ?? booking.flat?.name ?? '—';
  const flatType = (booking.flat as any)?.flatType ?? (booking.flat as any)?.bhkType ?? '—';
  const area     = (booking.flat as any)?.carpetArea ?? (booking.flat as any)?.builtUpArea;

  labelValue(doc, 'Project / Property', property, col1, y);
  labelValue(doc, 'Tower', tower, col2, y);
  y += 10;
  labelValue(doc, 'Unit / Flat No.', flatNo, col1, y);
  labelValue(doc, 'Type / Configuration', flatType, col2, y);
  y += 10;
  if (area) {
    labelValue(doc, 'Area', `${area} sq. ft.`, col1, y);
  }
  if ((booking as any).possessionDate) {
    labelValue(doc, 'Expected Possession', fmtDate((booking as any).possessionDate), col2, y);
  }
  y += 12;

  // ── FINANCIAL SUMMARY ─────────────────────────────────────────────────────
  y = section(doc, 'FINANCIAL SUMMARY', y);

  const finRows: [string, string][] = [
    ['Agreement / Sale Value',       fmt(booking.totalAmount)],
    ['Token Amount',                 fmt(booking.tokenAmount)],
    ['Discount',                     fmt(booking.discountAmount)],
    ['GST',                          fmt(booking.gstAmount)],
    ['Stamp Duty',                   fmt(booking.stampDuty)],
    ['Registration Charges',         fmt(booking.registrationCharges)],
    ['Parking Charges',              fmt(booking.parkingCharges)],
    ['Maintenance Deposit',          fmt(booking.maintenanceDeposit)],
    ['Other Charges',                fmt(booking.otherCharges)],
  ].filter(([, v]) => v !== '—' && v !== '₹0');

  // Summary band
  const bandW = PW - ML - MR;
  const bandH = 14;
  doc.setFillColor('#fff7f7');
  doc.setDrawColor(brandRed);
  doc.setLineWidth(0.3);
  doc.rect(ML, y, bandW, bandH, 'FD');

  const cells = [
    { label: 'Total Value', value: fmt(booking.totalAmount) },
    { label: 'Amount Paid', value: fmt(booking.paidAmount) },
    { label: 'Balance Due', value: fmt(booking.balanceAmount) },
  ];
  const cw = bandW / cells.length;
  cells.forEach((c, i) => {
    const cx = ML + i * cw + 3;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor('#888888');
    doc.text(c.label, cx, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(brandDark);
    doc.text(c.value, cx, y + 12);
  });
  y += bandH + 4;

  // Detail rows in two columns
  const colW = (PW - ML - MR - 4) / 2;
  finRows.forEach(([label, val], i) => {
    const cx = ML + 2 + (i % 2) * (colW + 2);
    const ry = y + Math.floor(i / 2) * 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor('#999999');
    doc.text(label, cx, ry);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor('#222222');
    doc.text(val, cx, ry + 4);
  });
  y += Math.ceil(finRows.length / 2) * 8 + 4;

  // ── PAYMENT PLAN / MILESTONES ─────────────────────────────────────────────
  if (milestones && milestones.length > 0) {
    y = section(doc, 'PAYMENT PLAN MILESTONES', y);

    const milestoneRows = milestones.map((m, idx) => [
      String(idx + 1),
      m.name,
      fmt(m.amount),
      fmtDate(m.dueDate),
      m.status ?? 'PENDING',
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: ML, right: MR },
      head: [['#', 'Milestone', 'Amount (₹)', 'Due Date', 'Status']],
      body: milestoneRows,
      headStyles: {
        fillColor: brandRed,
        textColor: '#ffffff',
        fontStyle: 'bold',
        fontSize: 7.5,
        cellPadding: 2.5,
      },
      bodyStyles: { fontSize: 8, cellPadding: 2.2, textColor: '#222222' },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 68 },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 28 },
        4: { cellWidth: 24 },
      },
      alternateRowStyles: { fillColor: '#fafafa' },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 4) {
          const s = String(data.cell.raw ?? '');
          data.cell.styles.textColor =
            s === 'PAID' || s === 'COMPLETED' ? '#16a34a' :
            s === 'OVERDUE'                   ? '#dc2626' :
            s === 'TRIGGERED'                 ? '#d97706' : '#6b7280';
          data.cell.styles.fontStyle = 'bold';
        }
      },
      theme: 'grid',
    });

    y = (doc as any).lastAutoTable.finalY + 6;
  } else if (booking.paymentPlan) {
    y = section(doc, 'PAYMENT PLAN', y);
    labelValue(doc, 'Plan', booking.paymentPlan, ML + 2, y);
    y += 14;
  }

  // ── NOTES & PAYMENT TERMS ─────────────────────────────────────────────────
  if (booking.discountReason || (booking as any).notes || (booking as any).remarks) {
    y = section(doc, 'NOTES', y);
    const note = booking.discountReason ?? (booking as any).notes ?? (booking as any).remarks ?? '';
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor('#444444');
    const lines = doc.splitTextToSize(note, PW - ML - MR - 6);
    doc.text(lines, ML + 3, y);
    y += lines.length * 4.5 + 6;
  }

  // ── SIGNATURE AREA ────────────────────────────────────────────────────────
  const sigY = Math.max(y + 4, PH - 40);

  doc.setDrawColor('#dddddd');
  doc.setLineWidth(0.3);
  doc.line(ML, sigY, ML + 60, sigY);
  doc.line(PW - MR - 60, sigY, PW - MR, sigY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor('#888888');
  doc.text('Customer Signature', ML, sigY + 4);
  doc.text('Authorised Signatory', PW - MR - 60, sigY + 4);
  doc.text('Eastern Estate', PW - MR - 60, sigY + 8);

  // ── FOOTER LINE ───────────────────────────────────────────────────────────
  doc.setFillColor(brandRed);
  doc.rect(0, PH - 8, PW, 8, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor('#ffffff');
  doc.text(
    `Booking Summary  •  Generated: ${new Date().toLocaleDateString('en-IN')}  •  This is a computer-generated document.`,
    PW / 2,
    PH - 3.5,
    { align: 'center' },
  );

  // ── SAVE ──────────────────────────────────────────────────────────────────
  const tag = (booking.bookingNumber ?? 'booking').replace(/[^a-z0-9]/gi, '_');
  doc.save(`booking_summary_${tag}.pdf`);
}
