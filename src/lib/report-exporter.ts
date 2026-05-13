/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

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

interface PressReleaseOnlineNewsReport {
  No: number;
  URL: string;
  "Published Date": string;
  Title: string;
  Content: string;
  Language: string;
  Sentiment: string;
  "Source Type": string;
  "Source Country": string;
  Reach: number;
  AVE: number;
}

interface PressReleaseSocialMediaReport {
  No: number;
  URL: string;
  "Published Date": string;
  Title: string;
  Content: string;
  Language: string;
  Sentiment: string;
  source_type: string;
  "Source.country": string;
  Reach: number;
  AVE: number;
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
    'Publication Date',
    'Source',
    'Source Type',
    'Sentiment Direction',
    'Reach / Impressions',
    'Title'
  ];

  const tableRows: unknown[] = [];

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

export const exportPressReleaseOnlineNewsReportToPdf = (reports: PressReleaseOnlineNewsReport[]) => {
  const doc = new jsPDF({ orientation: reports.length > 10 ? 'landscape' : 'portrait' });
  const timestamp = new Date().toLocaleString();

  // Cover Page
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, doc.internal.pageSize.width, 70, 'F');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('Press Release Online News Report', doc.internal.pageSize.width / 2, 30, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Generated on: ${timestamp}`, doc.internal.pageSize.width / 2, 45, { align: 'center' });
  doc.text(`Total Reports: ${reports.length}`, doc.internal.pageSize.width / 2, 55, { align: 'center' });

  doc.addPage();

  // Table
  const tableColumn = ['No', 'URL', 'Published Date', 'Title', 'Content', 'Language', 'Sentiment', 'Source Type', 'Source Country', 'Reach', 'AVE'];
  const tableRows = reports.map(r => [r.No, r.URL, r['Published Date'], r.Title, r.Content, r.Language, r.Sentiment, r['Source Type'], r['Source Country'], r.Reach, r.AVE]);

  autoTable(doc, {
    startY: 20,
    head: [tableColumn],
    body: tableRows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    didDrawPage: (data) => {
      const str = 'Page ' + doc.getNumberOfPages();
      doc.setFontSize(10);
      const pageHeight = doc.internal.pageSize.height;
      doc.text(str, data.settings.margin.left, pageHeight - 10);
    }
  });

  const filename = `Press_Release_Online_News_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

export const exportPressReleaseSocialMediaReportToPdf = (reports: PressReleaseSocialMediaReport[]) => {
  const doc = new jsPDF({ orientation: reports.length > 10 ? 'landscape' : 'portrait' });
  const timestamp = new Date().toLocaleString();

  // Cover Page
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, doc.internal.pageSize.width, 70, 'F');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('Press Release Social Media Report', doc.internal.pageSize.width / 2, 30, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Generated on: ${timestamp}`, doc.internal.pageSize.width / 2, 45, { align: 'center' });
  doc.text(`Total Reports: ${reports.length}`, doc.internal.pageSize.width / 2, 55, { align: 'center' });

  doc.addPage();

  // Table
  const tableColumn = ['No', 'URL', 'Published Date', 'Title', 'Content', 'Language', 'Sentiment', 'source_type', 'Source.country', 'Reach', 'AVE'];
  const tableRows = reports.map(r => [r.No, r.URL, r['Published Date'], r.Title, r.Content, r.Language, r.Sentiment, r.source_type, r['Source.country'], r.Reach, r.AVE]);

  autoTable(doc, {
    startY: 20,
    head: [tableColumn],
    body: tableRows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    didDrawPage: (data) => {
      const str = 'Page ' + doc.getNumberOfPages();
      doc.setFontSize(10);
      const pageHeight = doc.internal.pageSize.height;
      doc.text(str, data.settings.margin.left, pageHeight - 10);
    }
  });

  const filename = `Press_Release_Social_Media_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
