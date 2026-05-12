/**
 * Renders demand-draft HTML to a printable PDF (letter / notice body).
 * Uses html2canvas + jsPDF (multi-page when content is taller than one A4).
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function downloadDemandDraftLetterPdf(options: {
  title: string;
  html: string;
}): Promise<void> {
  const { title, html } = options;

  const wrap = document.createElement('div');
  wrap.style.position = 'fixed';
  wrap.style.left = '-12000px';
  wrap.style.top = '0';
  wrap.style.width = '720px';
  wrap.style.padding = '32px';
  wrap.style.backgroundColor = '#ffffff';
  wrap.style.fontFamily = 'Arial, Helvetica, sans-serif';
  wrap.style.fontSize = '13px';
  wrap.style.color = '#1a1a1a';
  wrap.style.lineHeight = '1.55';
  wrap.innerHTML = html?.trim() ? html : '<p>(No content)</p>';
  document.body.appendChild(wrap);

  try {
    const canvas = await html2canvas(wrap, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/jpeg', 0.92);

    const contentPageHeight = pageHeight - margin * 2;
    let heightLeft = imgHeight;
    let y = margin;

    pdf.addImage(imgData, 'JPEG', margin, y, imgWidth, imgHeight);
    heightLeft -= contentPageHeight;

    while (heightLeft > 0) {
      y = margin - (imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, y, imgWidth, imgHeight);
      heightLeft -= contentPageHeight;
    }

    const safeName = (title || 'demand-draft')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    pdf.save(`${safeName}.pdf`);
  } finally {
    document.body.removeChild(wrap);
  }
}
