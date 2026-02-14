import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Article {
    title: string;
    publishedDate: string;
    url: string;
    resolvedUrl?: string;
    sourceType: string;
    sourceCountry: string;
    sentiment: string;
    reach: number;
    ave: number;
    content: string;
    imageUrl?: string;
    keyword?: string;
}

// ════════════════════════════════════════════════════════════════════════
// EXCEL EXPORT
// ════════════════════════════════════════════════════════════════════════
export async function exportToExcel(articles: Article[], reportName: string = 'Media_Monitoring_Report') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Coverage Report');

    sheet.columns = [
        { header: 'Date', key: 'date', width: 12 },
        { header: 'Title', key: 'title', width: 50 },
        { header: 'URL', key: 'url', width: 40 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Country', key: 'country', width: 10 },
        { header: 'Sentiment', key: 'sentiment', width: 12 },
        { header: 'Reach', key: 'reach', width: 15 },
        { header: 'AVE ($)', key: 'ave', width: 15 },
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
            country: article.sourceCountry,
            sentiment: article.sentiment,
            reach: article.reach,
            ave: article.ave,
        });
    });

    sheet.getColumn('reach').numFmt = '#,##0';
    sheet.getColumn('ave').numFmt = '"$"#,##0.00';

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${reportName}.xlsx`;
    link.click();
}

// ════════════════════════════════════════════════════════════════════════
// PDF EXPORT — Professional branded report
// ════════════════════════════════════════════════════════════════════════

// Brand colors
const BRAND_DARK = [31, 78, 120] as const;     // #1F4E78
const BRAND_AMBER = [218, 165, 32] as const;   // #DAA520 (golden)
const ACCENT_BG = [245, 247, 250] as const;    // #F5F7FA

// Helper: add header with logo
function addPageHeader(doc: jsPDF, logoBase64: string | null, pageWidth: number) {
    // Top bar
    doc.setFillColor(...BRAND_DARK);
    doc.rect(0, 0, pageWidth, 18, 'F');

    // Logo
    if (logoBase64) {
        try {
            doc.addImage(logoBase64, 'PNG', 6, 2, 14, 14);
        } catch { /* ignore */ }
    }

    // Company name
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('ALMSTKSHF', logoBase64 ? 22 : 8, 11);

    // Tagline
    doc.setFontSize(7);
    doc.setTextColor(200, 200, 200);
    doc.text('Media Monitoring & Development', logoBase64 ? 22 : 8, 15);
}

// Helper: add footer with page number and URL
function addPageFooter(doc: jsPDF, pageWidth: number, pageHeight: number, pageNum: number, totalPages: number) {
    const footerY = pageHeight - 10;

    doc.setDrawColor(200, 200, 200);
    doc.line(14, footerY - 3, pageWidth - 14, footerY - 3);

    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('www.almstkshf.com', 14, footerY);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth / 2, footerY, { align: 'center' });
    doc.text(`Page ${pageNum} / ${totalPages}`, pageWidth - 14, footerY, { align: 'right' });
}

// Load logo from /logo.png as base64
async function loadLogo(): Promise<string | null> {
    try {
        const res = await fetch('/logo.png');
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

export async function exportToPDF(articles: Article[], _logoUrl?: string, reportTitle: string = 'Media Coverage Report') {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Load Arabic font
    try {
        const fontUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Regular.ttf';
        const res = await fetch(fontUrl);
        if (res.ok) {
            const blob = await res.blob();
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(blob);
            });
            doc.addFileToVFS('Amiri-Regular.ttf', base64);
            doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
        }
    } catch (e) {
        console.warn("Could not load Arabic font.", e);
    }

    // Load logo
    const logoBase64 = await loadLogo();

    // We build all pages first, then go back and add page numbers
    const pages: (() => void)[] = [];

    // ═══════════════════════════════════════════════════════
    // PAGE 1 — COVER PAGE
    // ═══════════════════════════════════════════════════════
    // Header bar
    doc.setFillColor(...BRAND_DARK);
    doc.rect(0, 0, pageWidth, 70, 'F');

    // Logo centered
    if (logoBase64) {
        try { doc.addImage(logoBase64, 'PNG', pageWidth / 2 - 15, 15, 30, 30); } catch { /* */ }
    }

    // Brand name in header
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('ALMSTKSHF', pageWidth / 2, 55, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(200, 220, 255);
    doc.text('MEDIA MONITORING & DEVELOPMENT', pageWidth / 2, 62, { align: 'center' });

    // Title
    doc.setFontSize(28);
    doc.setTextColor(...BRAND_DARK);
    doc.text(reportTitle.toUpperCase(), pageWidth / 2, pageHeight / 2 - 10, { align: 'center' });

    // Decorative line
    doc.setDrawColor(...BRAND_AMBER);
    doc.setLineWidth(1.5);
    doc.line(pageWidth / 4, pageHeight / 2, (pageWidth * 3) / 4, pageHeight / 2);

    // Metadata
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth / 2, pageHeight / 2 + 15, { align: 'center' });
    doc.text(`Total Articles: ${articles.length}`, pageWidth / 2, pageHeight / 2 + 24, { align: 'center' });

    // Keyword info
    const keyword = articles[0]?.keyword || 'N/A';
    const countries = [...new Set(articles.map(a => a.sourceCountry))].join(', ');
    const langs = [...new Set(articles.map(a => a.content))].length > 0 ? 'EN / AR' : 'EN';
    doc.setFontSize(9);
    doc.text(`Keyword: "${keyword}"  |  Region: ${countries}  |  Languages: ${langs}`, pageWidth / 2, pageHeight / 2 + 36, { align: 'center' });

    // Footer branding
    doc.setFillColor(...BRAND_DARK);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text('www.almstkshf.com  |  المستكشف', pageWidth / 2, pageHeight - 5, { align: 'center' });

    // ═══════════════════════════════════════════════════════
    // PAGE 2 — EXECUTIVE SUMMARY (Dashboard Metrics)
    // ═══════════════════════════════════════════════════════
    doc.addPage();
    addPageHeader(doc, logoBase64, pageWidth);

    let y = 28;
    doc.setFontSize(18);
    doc.setTextColor(...BRAND_DARK);
    doc.text('Executive Summary', 14, y);
    y += 12;

    // Metrics
    const totalReach = articles.reduce((sum, a) => sum + (a.reach || 0), 0);
    const totalAVE = articles.reduce((sum, a) => sum + (a.ave || 0), 0);
    const pos = articles.filter(a => a.sentiment === 'Positive').length;
    const neu = articles.filter(a => a.sentiment === 'Neutral').length;
    const neg = articles.filter(a => a.sentiment === 'Negative').length;

    // Summary boxes
    const boxW = (pageWidth - 42) / 3;
    const boxes: { label: string; value: string; color: [number, number, number] }[] = [
        { label: 'TOTAL REACH', value: totalReach.toLocaleString(), color: [31, 78, 120] },
        { label: 'AD VALUE (AVE)', value: `$${totalAVE.toLocaleString()}`, color: [218, 165, 32] },
        { label: 'TOTAL ARTICLES', value: articles.length.toString(), color: [16, 185, 129] },
    ];

    boxes.forEach((box, i) => {
        const x = 14 + i * (boxW + 7);
        doc.setFillColor(...ACCENT_BG);
        doc.roundedRect(x, y, boxW, 28, 3, 3, 'F');
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(box.label, x + boxW / 2, y + 10, { align: 'center' });
        doc.setFontSize(16);
        doc.setTextColor(...box.color);
        doc.text(box.value, x + boxW / 2, y + 22, { align: 'center' });
    });

    y += 38;

    // Sentiment Distribution
    doc.setFontSize(12);
    doc.setTextColor(...BRAND_DARK);
    doc.text('Sentiment Distribution', 14, y);
    y += 8;

    const sentimentData: { label: string; count: number; pct: number; color: [number, number, number] }[] = [
        { label: 'Positive', count: pos, pct: articles.length ? Math.round(pos / articles.length * 100) : 0, color: [16, 185, 129] },
        { label: 'Neutral', count: neu, pct: articles.length ? Math.round(neu / articles.length * 100) : 0, color: [59, 130, 246] },
        { label: 'Negative', count: neg, pct: articles.length ? Math.round(neg / articles.length * 100) : 0, color: [244, 63, 94] },
    ];

    sentimentData.forEach((s) => {
        doc.setFontSize(9);
        doc.setTextColor(80);
        doc.text(`${s.label}: ${s.count} (${s.pct}%)`, 20, y + 5);

        // Progress bar
        doc.setFillColor(230, 230, 230);
        doc.roundedRect(70, y + 1, 100, 5, 2, 2, 'F');
        if (s.pct > 0) {
            doc.setFillColor(s.color[0], s.color[1], s.color[2]);
            doc.roundedRect(70, y + 1, Math.max(s.pct, 2), 5, 2, 2, 'F');
        }
        y += 10;
    });

    y += 5;

    // Source Type Breakdown
    doc.setFontSize(12);
    doc.setTextColor(...BRAND_DARK);
    doc.text('Source Type Analysis', 14, y);
    y += 8;

    const sourceTypes: Record<string, number> = {};
    articles.forEach(a => { sourceTypes[a.sourceType] = (sourceTypes[a.sourceType] || 0) + 1; });

    Object.entries(sourceTypes).forEach(([type, count]) => {
        doc.setFontSize(9);
        doc.setTextColor(80);
        doc.text(`${type}: ${count}`, 20, y + 5);
        y += 8;
    });

    y += 5;

    // AI Recommendation
    doc.setFillColor(255, 250, 235);
    doc.roundedRect(14, y, pageWidth - 28, 20, 3, 3, 'F');
    doc.setDrawColor(...BRAND_AMBER);
    doc.roundedRect(14, y, pageWidth - 28, 20, 3, 3, 'S');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND_AMBER);
    doc.text('AI RECOMMENDATION', 20, y + 7);
    doc.setFontSize(8);
    doc.setTextColor(80);
    const negRatio = articles.length ? neg / articles.length : 0;
    const recommendation = negRatio > 0.5
        ? 'High negative sentiment detected. Recommend activating crisis management protocols immediately.'
        : negRatio > 0.3
            ? 'Moderate negative coverage. Monitor closely and prepare proactive messaging.'
            : 'Coverage sentiment is healthy. Continue current media strategy.';
    const splitRec = doc.splitTextToSize(recommendation, pageWidth - 40);
    doc.text(splitRec, 20, y + 14);

    // ═══════════════════════════════════════════════════════
    // PAGE 3+ — ARTICLES TABLE (consolidated, not one per page)
    // ═══════════════════════════════════════════════════════
    doc.addPage();
    addPageHeader(doc, logoBase64, pageWidth);

    doc.setFontSize(14);
    doc.setTextColor(...BRAND_DARK);
    doc.text('Coverage Log', 14, 28);

    const hasArabic = articles.some(a => /[\u0600-\u06FF]/.test(a.title));
    const tableData = articles.map(a => [
        a.publishedDate,
        a.title.length > 55 ? a.title.substring(0, 52) + "..." : a.title,
        a.sourceType,
        a.sourceCountry,
        a.sentiment,
        a.reach.toLocaleString(),
        `$${a.ave.toLocaleString()}`
    ]);

    autoTable(doc, {
        head: [['Date', 'Title', 'Type', 'Country', 'Sentiment', 'Reach', 'AVE']],
        body: tableData,
        startY: 33,
        margin: { top: 22, bottom: 18 },
        styles: {
            fontSize: 7,
            font: hasArabic ? 'Amiri' : 'helvetica',
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [31, 78, 120],
            halign: 'center',
            fontSize: 7,
            fontStyle: 'bold',
        },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 65, halign: hasArabic ? 'right' : 'left' },
            2: { cellWidth: 22 },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 18, halign: 'center' },
            5: { cellWidth: 20, halign: 'right' },
            6: { cellWidth: 20, halign: 'right' },
        },
        didDrawPage: () => {
            addPageHeader(doc, logoBase64, pageWidth);
        },
    });

    // ═══════════════════════════════════════════════════════
    // ADD PAGE NUMBERS TO ALL PAGES
    // ═══════════════════════════════════════════════════════
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addPageFooter(doc, pageWidth, pageHeight, i, totalPages);
    }

    // Save
    doc.save(`${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}
