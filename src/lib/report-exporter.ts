import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ArticleData {
  title: string;
  publishedDate: string;
  source: string;
  sourceType: string;
  sentiment: string;
  reach: number;
  url: string;
  description?: string;
}

export const exportToPdf = (articles: ArticleData[], namespace: string = 'Press') => {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Add Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text(`ALMSTKSHF - ${namespace} Monitoring Report`, 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${timestamp}`, 14, 30);
  doc.text(`Total Articles: ${articles.length}`, 14, 35);

  // Define Table Columns
  const tableColumn = [
    'Date',
    'Source',
    'Type',
    'Sentiment',
    'Reach',
    'Title'
  ];

  const tableRows: any[] = [];

  articles.forEach(article => {
    const rowData = [
      article.publishedDate,
      article.source,
      article.sourceType,
      article.sentiment,
      article.reach?.toLocaleString() || '0',
      article.title
    ];
    tableRows.push(rowData);
  });

  // Generate Table
  autoTable(doc, {
    startY: 45,
    head: [tableColumn],
    body: tableRows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 20 }, // Date
      1: { cellWidth: 25 }, // Source
      2: { cellWidth: 20 }, // Type
      3: { cellWidth: 20 }, // Sentiment
      4: { cellWidth: 20 }, // Reach
      5: { cellWidth: 'auto' } // Title
    },
    didDrawPage: (data) => {
      // Footer
      const str = 'Page ' + doc.getNumberOfPages();
      doc.setFontSize(10);
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      doc.text(str, data.settings.margin.left, pageHeight - 10);
    }
  });

  // Save the PDF
  const filename = `ALMSTKSHF_${namespace}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
