import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LedgerResponse } from '@/services/payment-plans.service';

const brandRed = '#A8211B';
const PW = 210;
const ML = 12;
const MR = 12;

const fmt = (n: number) =>
  '₹' + Number(n).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtDate = (s: string | null | undefined): string => {
  if (!s) return '-';
  try {
    return new Date(s).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return s;
  }
};

export function generateLedgerPdf(ledger: LedgerResponse): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // ── HEADER BAND ──────────────────────────────────────────────────────────────
  doc.setFillColor(brandRed);
  doc.rect(0, 0, PW, 26, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor('#ffffff');
  doc.text('EASTERN ESTATE', PW - MR, 10, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Construction & Development Pvt. Ltd.', PW - MR, 15, { align: 'right' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('UNIT-WISE LEDGER STATEMENT', ML, 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, ML, 16);

  let y = 32;

  // ── UNIT & CUSTOMER INFO ─────────────────────────────────────────────────────
  const col1 = ML;
  const col2 = PW / 2 + 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(brandRed);
  doc.text('CUSTOMER', col1, y);
  doc.text('UNIT DETAILS', col2, y);
  y += 4;

  doc.setTextColor('#111111');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(ledger.customer?.fullName ?? '-', col1, y);
  const unitLabel = [ledger.flat?.property, ledger.flat?.tower, ledger.flat?.flatNumber]
    .filter(Boolean)
    .join(' › ');
  doc.text(unitLabel || '-', col2, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor('#444444');
  if (ledger.customer?.phone) { doc.text(`Ph: ${ledger.customer.phone}`, col1, y); }
  if (ledger.booking?.bookingNumber) {
    doc.text(`Booking: ${ledger.booking.bookingNumber}`, col2, y);
  }
  y += 4;
  if (ledger.customer?.email) { doc.text(`Email: ${ledger.customer.email}`, col1, y); }
  if (ledger.booking?.bookingDate) {
    doc.text(`Booking Date: ${fmtDate(ledger.booking.bookingDate as unknown as string)}`, col2, y);
  }
  y += 5;

  // ── SUMMARY BAND ─────────────────────────────────────────────────────────────
  doc.setFillColor('#fdf3f3');
  doc.setDrawColor(brandRed);
  doc.setLineWidth(0.3);
  doc.rect(ML, y, PW - ML - MR, 16, 'FD');

  const summaryBoxW = (PW - ML - MR - 6) / 4;
  const boxes = [
    { label: 'Total Agreement', value: fmt(ledger.plan.totalAmount) },
    { label: 'Total Demanded', value: fmt(ledger.summary.totalDemanded) },
    { label: 'Total Paid', value: fmt(ledger.summary.totalPaid) },
    { label: 'Outstanding', value: fmt(ledger.summary.balance) },
  ];
  boxes.forEach((b, i) => {
    const bx = ML + 3 + i * (summaryBoxW + 2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor('#666666');
    doc.text(b.label, bx, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(brandRed);
    doc.text(b.value, bx, y + 12);
  });

  y += 22;

  // ── LEDGER TABLE ─────────────────────────────────────────────────────────────
  const tableBody: any[] = ledger.rows.map((row) => {
    const isDemand = row.type === 'DEMAND';
    return [
      fmtDate(row.date),
      row.description + (row.reference ? `\n(Ref: ${row.reference})` : ''),
      isDemand ? fmt(row.debit) : '',
      !isDemand ? fmt(row.credit) : '',
      fmt(row.balance),
      row.status ?? '',
    ];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: ML, right: MR },
    head: [['Date', 'Description', 'Demanded (₹)', 'Paid (₹)', 'Balance (₹)', 'Status']],
    body: tableBody,
    headStyles: {
      fillColor: brandRed,
      textColor: '#ffffff',
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.5,
    },
    bodyStyles: { fontSize: 8, cellPadding: 2, textColor: '#222222' },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 62 },
      2: { halign: 'right', cellWidth: 28 },
      3: { halign: 'right', cellWidth: 24 },
      4: { halign: 'right', cellWidth: 28, fontStyle: 'bold' },
      5: { cellWidth: 20, fontSize: 7 },
    },
    alternateRowStyles: { fillColor: '#fafafa' },
    // Colour demand rows vs payment rows
    didParseCell: (data: any) => {
      if (data.section === 'body') {
        const row = ledger.rows[data.row.index];
        if (row?.type === 'DEMAND') {
          data.cell.styles.textColor = '#B45309'; // amber for demands
        } else if (row?.type === 'PAYMENT') {
          data.cell.styles.textColor = '#15803D'; // green for payments
        }
      }
    },
    theme: 'grid',
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;

  // ── FOOTER ───────────────────────────────────────────────────────────────────
  doc.setDrawColor('#dddddd');
  doc.setLineWidth(0.3);
  doc.line(ML, finalY, PW - MR, finalY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor('#888888');
  doc.text('This is a computer-generated statement. For queries contact the accounts team.', ML, finalY + 4);
  doc.text(`Status: ${ledger.plan.status}  •  Overdue milestones: ${ledger.summary.overdueCount}  •  Pending milestones: ${ledger.summary.pendingMilestones}`, ML, finalY + 8);

  // ── SAVE ─────────────────────────────────────────────────────────────────────
  const flatTag = ledger.flat?.flatNumber?.replace(/[^a-z0-9]/gi, '_') ?? 'unit';
  doc.save(`ledger_${flatTag}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
