/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import ExcelJS from 'exceljs';
import { fixArabicForPDF, isArabic } from './arabic-utils';
import type { jsPDF } from 'jspdf';

// ─── Domain types ─────────────────────────────────────────────────────────────

interface Article {
    title: string;
    publishedDate?: string;
    url?: string;
    resolvedUrl?: string;
    sourceType?: string;
    sourceCountry?: string;
    source?: string;
    depth?: string;
    sentiment?: string;
    reach?: number;
    ave?: number;
    content?: string;
    imageUrl?: string;
    keyword?: string;
    hashtags?: string[];
    [key: string]: unknown;
}

/** Typed subset of translation keys used by the export utilities. */
interface ExportTranslations {
    // Excel
    sheet_name?: string;
    date?: string;
    title?: string;
    url?: string;
    type?: string;
    source?: string;
    depth?: string;
    country?: string;
    sentiment?: string;
    reach?: string;
    ave?: string;
    hashtags?: string;
    // PDF — brand
    brand_name?: string;
    brand_tagline?: string;
    footer_url?: string;
    generated_at?: string;
    page_count?: string;
    report_title?: string;
    // PDF — cover
    total_articles?: string;
    keyword_label?: string;
    region_label?: string;
    langs_label?: string;
    // PDF — summary
    summary_title?: string;
    total_reach?: string;
    ad_value?: string;
    sentiment_title?: string;
    sentiment_pos?: string;
    sentiment_neu?: string;
    sentiment_neg?: string;
    ai_recommendation?: string;
    rec_high_neg?: string;
    rec_mod_neg?: string;
    rec_healthy?: string;
    // PDF — table
    coverage_log?: string;
    [key: string]: string | undefined;
}

/** Typed shape of a jspdf-autotable cell data object passed to hooks. */
interface AutoTableCellData {
    section: 'head' | 'body' | 'foot';
    cell: {
        raw: unknown;
        text: string[];
        styles: { halign: string };
    };
}

// ════════════════════════════════════════════════════════════════════════
// EXCEL EXPORT
// ════════════════════════════════════════════════════════════════════════
export async function exportToExcel(
    articles: Article[],
    translations: ExportTranslations,
    reportName: string = 'Media_Monitoring_Report',
) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(translations.sheet_name || 'Coverage Report');

    sheet.columns = [
        { header: translations.date || 'Publication Date', key: 'date', width: 12 },
        { header: translations.title || 'Title', key: 'title', width: 50 },
        { header: translations.url || 'URL', key: 'url', width: 40 },
        { header: translations.type || 'Source Type', key: 'type', width: 15 },
        { header: translations.source || 'Source', key: 'source', width: 18 },
        { header: translations.depth || 'Coverage Depth', key: 'depth', width: 10 },
        { header: translations.country || 'Country', key: 'country', width: 10 },
        { header: translations.sentiment || 'Sentiment Direction', key: 'sentiment', width: 12 },
        { header: translations.reach || 'Reach / Impressions', key: 'reach', width: 15 },
        { header: translations.ave || 'AVE (Advertising Value Equivalent)', key: 'ave', width: 15 },
        { header: translations.hashtags || 'Hashtags', key: 'hashtags', width: 30 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    articles.forEach(article => {
        sheet.addRow({
            date: article.publishedDate,
            title: article.title,
            url: article.resolvedUrl || article.url,
            type: article.sourceType,
            source: article.source || '',
            depth: article.depth || 'standard',
            country: article.sourceCountry,
            sentiment: article.sentiment,
            reach: article.reach,
            ave: article.ave,
            hashtags: Array.isArray(article.hashtags) ? article.hashtags.join(', ') : '',
        });
    });

    sheet.getColumn('reach').numFmt = '#,##0';
    sheet.getColumn('ave').numFmt = '"$"#,##0.00';

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `${reportName.replace(/\s+/g, '_')}_${dateStr}.xlsx`;
    link.click();
}

// ════════════════════════════════════════════════════════════════════════
// PDF EXPORT — Professional branded report
// ════════════════════════════════════════════════════════════════════════

// Brand colors
const BRAND_DARK = [31, 78, 120] as const;     // #1F4E78
const BRAND_AMBER = [218, 165, 32] as const;   // #DAA520 (golden)
const ACCENT_BG = [245, 247, 250] as const;    // #F5F7FA

// Helper: add header with logo
function addPageHeader(
    doc: jsPDF,
    logoBase64: string | null,
    pageWidth: number,
    translations: ExportTranslations,
    fontLoaded: boolean = false,
) {
    // Top bar
    doc.setFillColor(...BRAND_DARK);
    doc.rect(0, 0, pageWidth, 18, 'F');

    // Logo
    if (logoBase64) {
        try {
            doc.addImage(logoBase64, 'PNG', 6, 2, 14, 14);
        } catch { /* ignore */ }
    }

    doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');

    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    const companyName = translations.brand_name || 'ALMSTKSHF';
    doc.text(isArabic(companyName) ? fixArabicForPDF(companyName) : companyName, logoBase64 ? 22 : 8, 11);

    doc.setFontSize(7);
    doc.setTextColor(200, 200, 200);
    const tagline = translations.brand_tagline || 'Media Monitoring & Development';
    doc.text(isArabic(tagline) ? fixArabicForPDF(tagline) : tagline, logoBase64 ? 22 : 8, 15);
}

// Helper: add footer with page number and URL
function addPageFooter(
    doc: jsPDF,
    pageWidth: number,
    pageHeight: number,
    pageNum: number,
    totalPages: number,
    translations: ExportTranslations,
    fontLoaded: boolean,
) {
    const footerY = pageHeight - 10;

    doc.setDrawColor(200, 200, 200);
    doc.line(14, footerY - 3, pageWidth - 14, footerY - 3);

    doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);

    const url = translations.footer_url || 'www.almstkshf.com';
    doc.text(isArabic(url) ? fixArabicForPDF(url) : url, 14, footerY);

    const genDate = new Date().toLocaleDateString('en-GB');
    const genText = (translations.generated_at || 'Generated: {date}').replace('{date}', genDate);
    doc.text(isArabic(genText) ? fixArabicForPDF(genText) : genText, pageWidth / 2, footerY, { align: 'center' });

    const pageText = (translations.page_count || 'Page {current} / {total}')
        .replace('{current}', pageNum.toString())
        .replace('{total}', totalPages.toString());
    doc.text(isArabic(pageText) ? fixArabicForPDF(pageText) : pageText, pageWidth - 14, footerY, { align: 'right' });
}

// Load logo from provided URL or fallback to /logo.png as base64
async function loadLogo(logoUrl?: string): Promise<string | null> {
    try {
        const res = await fetch(logoUrl || '/logo.png');
        if (!res.ok) return null;
        const blob = await res.blob();
        return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(blob);
        });
    } catch {
        console.warn('Could not load logo for PDF');
        return null;
    }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/** Typed wrapper around the dynamically-imported jsPDF constructor. */
type JsPDFConstructor = new (opts: {
    orientation: string;
    unit: string;
    format: string;
    hotfixes: string[];
}) => jsPDF;

/** Typed wrapper around jspdf-autotable's default export. */
type AutoTableFn = (doc: jsPDF, opts: object) => void;

export async function exportToPDF(
    articles: Article[],
    translations: ExportTranslations,
    logoUrl?: string,
    reportTitle?: string,
) {
    if (typeof window === 'undefined') throw new Error('PDF export is client-only');

    const finalReportTitle = reportTitle || translations.report_title || 'Media Coverage Report';

    // Dynamically load jspdf to avoid SSR bundling issues
    let JsPDF: JsPDFConstructor;
    try {
        const mod = await import('jspdf');
        JsPDF = (mod.jsPDF ?? (mod as unknown as { default?: JsPDFConstructor }).default) as JsPDFConstructor;
        if (!JsPDF) throw new Error('jsPDF not found in primary bundle');
    } catch {
        const mod = await import('jspdf/dist/jspdf.umd.min.js');
        JsPDF = (mod.jsPDF ?? (mod as unknown as { default?: JsPDFConstructor }).default) as JsPDFConstructor;
    }

    const autoTableMod = await import('jspdf-autotable');
    const autoTable: AutoTableFn =
        (autoTableMod as { default?: AutoTableFn }).default ??
        (autoTableMod as unknown as AutoTableFn);

    const totalContentLength = articles.reduce((sum, a) => sum + (a.content?.length || 0) + (a.title?.length || 0), 0);
    const useLandscape = articles.length > 20 || totalContentLength > 10000; // Adjust thresholds as needed

    const doc = new JsPDF({ orientation: useLandscape ? 'l' : 'p', unit: 'mm', format: 'a4', hotfixes: ['px_line_height'] });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Load Arabic font
    let fontLoaded = false;
    try {
        const fontUrl = 'https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHqUpvrIw74NL.ttf';
        const res = await fetch(fontUrl);
        if (res.ok) {
            const arrayBuffer = await res.arrayBuffer();
            const base64 = arrayBufferToBase64(arrayBuffer);
            doc.addFileToVFS('Amiri-Regular.ttf', base64);
            doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
            fontLoaded = true;
        }
    } catch (e) {
        console.warn('Amiri font load failed', e);
    }

    if (!fontLoaded) {
        console.warn('All Arabic font sources failed. Arabic text may not render correctly.');
    }

    const logoBase64 = await loadLogo(logoUrl);

    // Helper to set font and handle Arabic text
    const addText = (text: string, x: number, y: number, options: { align?: 'center' | 'right' | 'left' } = {}) => {
        doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
        const processedText = isArabic(text) ? fixArabicForPDF(text) : text;
        doc.text(processedText, x, y, options);
    };

    // ═══════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE
    // ═══════════════════════════════════════════════════════
    doc.setFillColor(...BRAND_DARK);
    doc.rect(0, 0, pageWidth, 70, 'F');

    if (logoBase64) {
        try { doc.addImage(logoBase64, 'PNG', pageWidth / 2 - 15, 15, 30, 30); } catch { /* */ }
    }

    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    addText(translations.brand_name || 'ALMSTKSHF', pageWidth / 2, 55, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(200, 220, 255);
    addText((translations.brand_tagline || 'MEDIA MONITORING & DEVELOPMENT').toUpperCase(), pageWidth / 2, 62, { align: 'center' });

    doc.setFontSize(28);
    doc.setTextColor(...BRAND_DARK);
    addText(finalReportTitle.toUpperCase(), pageWidth / 2, pageHeight / 2 - 10, { align: 'center' });

    doc.setDrawColor(...BRAND_AMBER);
    doc.setLineWidth(1.5);
    doc.line(pageWidth / 4, pageHeight / 2, (pageWidth * 3) / 4, pageHeight / 2);

    doc.setFontSize(11);
    doc.setTextColor(100);
    const genDate = new Date().toLocaleDateString('en-GB');
    const genText = (translations.generated_at || 'Generated: {date}').replace('{date}', genDate);
    doc.text(genText, pageWidth / 2, pageHeight / 2 + 15, { align: 'center' });
    doc.text(`${translations.total_articles || 'Total Articles'}: ${articles.length}`, pageWidth / 2, pageHeight / 2 + 24, { align: 'center' });

    const keyword = articles[0]?.keyword || 'N/A';
    const countriesList = [...new Set(articles.map(a => a.sourceCountry))].join(', ');
    const isActuallyArabic = articles.some(a => isArabic(a.title));
    const langs = isActuallyArabic ? 'EN / AR' : 'EN';

    doc.setFontSize(9);
    addText(
        `${translations.keyword_label || 'Keyword'}: "${keyword}"  |  ${translations.region_label || 'Region'}: ${countriesList}  |  ${translations.langs_label || 'Languages'}: ${langs}`,
        pageWidth / 2,
        pageHeight / 2 + 36,
        { align: 'center' },
    );

    doc.setFillColor(...BRAND_DARK);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    addText(`${translations.footer_url || 'www.almstkshf.com'}  |  ${translations.brand_name || 'المستكشف'}`, pageWidth / 2, pageHeight - 5, { align: 'center' });

    // ═══════════════════════════════════════════════════════
    // PAGE 2 — EXECUTIVE SUMMARY
    // ═══════════════════════════════════════════════════════
    doc.addPage();
    addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

    let y = 28;
    doc.setFontSize(18);
    doc.setTextColor(...BRAND_DARK);
    addText(translations.summary_title || 'Executive Summary', 14, y);
    y += 12;

    const totalReach = articles.reduce((sum, a) => sum + (a.reach || 0), 0);
    const totalAVE = articles.reduce((sum, a) => sum + (a.ave || 0), 0);
    const pos = articles.filter(a => a.sentiment === 'Positive').length;
    const neu = articles.filter(a => a.sentiment === 'Neutral').length;
    const neg = articles.filter(a => a.sentiment === 'Negative').length;

    const boxW = (pageWidth - 42) / 3;
    const boxes: { label: string; value: string; color: [number, number, number] }[] = [
        { label: translations.total_reach || 'TOTAL REACH / IMPRESSIONS', value: totalReach.toLocaleString(), color: [31, 78, 120] },
        { label: translations.ad_value || 'ADVERTISING VALUE EQUIVALENT (AVE)', value: `$${totalAVE.toLocaleString()}`, color: [218, 165, 32] },
        { label: translations.total_articles || 'TOTAL ARTICLES', value: articles.length.toString(), color: [16, 185, 129] },
    ];

    boxes.forEach((box, i) => {
        const x = 14 + i * (boxW + 7);
        doc.setFillColor(...ACCENT_BG);
        doc.roundedRect(x, y, boxW, 28, 3, 3, 'F');
        doc.setFontSize(8);
        doc.setTextColor(120);
        addText(box.label, x + boxW / 2, y + 10, { align: 'center' });
        doc.setFontSize(16);
        doc.setTextColor(...box.color);
        addText(box.value, x + boxW / 2, y + 22, { align: 'center' });
    });

    y += 38;

    doc.setFontSize(12);
    doc.setTextColor(...BRAND_DARK);
    addText(translations.sentiment_title || 'Sentiment Direction Distribution', 14, y);
    y += 8;

    const sentimentData = [
        { label: translations.sentiment_pos || 'Positive Direction', count: pos, pct: articles.length ? Math.round(pos / articles.length * 100) : 0, color: [16, 185, 129] as [number, number, number] },
        { label: translations.sentiment_neu || 'Neutral Direction', count: neu, pct: articles.length ? Math.round(neu / articles.length * 100) : 0, color: [59, 130, 246] as [number, number, number] },
        { label: translations.sentiment_neg || 'Negative Direction', count: neg, pct: articles.length ? Math.round(neg / articles.length * 100) : 0, color: [244, 63, 94] as [number, number, number] },
    ];

    sentimentData.forEach((s) => {
        doc.setFontSize(9);
        doc.setTextColor(80);
        addText(`${s.label}: ${s.count} (${s.pct}%)`, 20, y + 5);
        doc.setFillColor(230, 230, 230);
        doc.roundedRect(70, y + 1, 100, 5, 2, 2, 'F');
        if (s.pct > 0) {
            doc.setFillColor(...s.color);
            doc.roundedRect(70, y + 1, Math.max(s.pct, 2), 5, 2, 2, 'F');
        }
        y += 10;
    });

    y += 10;
    doc.setFontSize(12);
    doc.setTextColor(...BRAND_DARK);
    addText(translations.ai_recommendation || 'AI Strategic Recommendation', 14, y);
    y += 8;

    doc.setFillColor(255, 250, 235);
    doc.roundedRect(14, y, pageWidth - 28, 20, 3, 3, 'F');
    doc.setDrawColor(...BRAND_AMBER);
    doc.roundedRect(14, y, pageWidth - 28, 20, 3, 3, 'S');

    doc.setFontSize(8);
    const negRatio = articles.length ? neg / articles.length : 0;
    const recommendation = negRatio > 0.5
        ? (translations.rec_high_neg || 'High negative sentiment detected. Recommend activating crisis management protocols immediately.')
        : negRatio > 0.3
            ? (translations.rec_mod_neg || 'Moderate negative coverage. Monitor closely and prepare proactive messaging.')
            : (translations.rec_healthy || 'Coverage sentiment is healthy. Continue current media strategy.');

    const splitRec = doc.splitTextToSize(recommendation, pageWidth - 40);
    doc.setTextColor(80);
    const recAlign = isArabic(recommendation) ? 'right' : 'left';
    const recX = recAlign === 'right' ? pageWidth - 20 : 20;
    doc.text(splitRec, recX, y + 10, { align: recAlign });

    // ═══════════════════════════════════════════════════════
    // PAGE 3+ — ARTICLES TABLE
    // ═══════════════════════════════════════════════════════
    doc.addPage();
    addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

    doc.setFontSize(14);
    doc.setTextColor(...BRAND_DARK);
    addText(translations.coverage_log || 'Media Coverage Log', pageWidth - 14, 28, { align: 'right' });

    const tableData = articles.map(a => {
        const parsedTitle = fixArabicForPDF(a.title);
        const hashStr = Array.isArray(a.hashtags) && a.hashtags.length > 0 ? `\n#${a.hashtags.join(' #')}` : '';
        return [
            a.publishedDate ?? '',
            parsedTitle + hashStr,
            a.sourceType ?? '',
            a.sourceCountry ?? '',
            a.sentiment ?? '',
            (a.reach ?? 0).toLocaleString(),
            `$${(a.ave ?? 0).toLocaleString()}`
        ];
    });

    autoTable(doc, {
        head: [[
            translations.date || 'Publication Date',
            translations.title || 'Title',
            translations.type || 'Source Type',
            translations.country || 'Country',
            translations.sentiment || 'Sentiment Direction',
            translations.reach || 'Reach / Impressions',
            translations.ave || 'AVE (Advertising Value Equivalent)'
        ]],
        body: tableData,
        startY: 33,
        margin: { top: 22, bottom: 18 },
        styles: {
            fontSize: 7,
            font: fontLoaded ? 'Amiri' : 'helvetica',
            cellPadding: 3,
            halign: 'left',
        },
        headStyles: {
            fillColor: [31, 78, 120],
            halign: 'center',
            fontSize: 7,
            fontStyle: 'bold',
            font: fontLoaded ? 'Amiri' : 'helvetica',
        },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 65, halign: 'left' },
            2: { cellWidth: 22 },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 18, halign: 'center' },
            5: { cellWidth: 20, halign: 'right' },
            6: { cellWidth: 20, halign: 'right' },
        },
        didParseCell: (data: AutoTableCellData) => {
            if (data.section === 'body' && typeof data.cell.raw === 'string') {
                const raw = data.cell.raw;
                if (/[\u0600-\u06FF]/.test(raw)) {
                    data.cell.text = [fixArabicForPDF(raw)];
                    data.cell.styles.halign = 'right';
                }
            }
        },
        didDrawPage: () => {
            addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);
        },
    });

    // ═══════════════════════════════════════════════════════
    // ADD PAGE NUMBERS
    // ═══════════════════════════════════════════════════════
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addPageFooter(doc, pageWidth, pageHeight, i, totalPages, translations, fontLoaded);
    }

    doc.save(`${finalReportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}
