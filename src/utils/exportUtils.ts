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

// ════════════════════════════════════════════════════════════════════════
// ARABIC SUPPORT HELPERS (Reshaping & Bidi)
// ════════════════════════════════════════════════════════════════════════

/**
 * A simple Arabic reshaper and Bidi logic to handle Arabic in jsPDF.
 * This is necessary because jsPDF does not natively handle Arabic script joining or RTL.
 */
function fixArabicForPDF(text: string): string {
    if (!text || !/[\u0600-\u06FF]/.test(text)) return text;

    // 1. Basic Arabic Reshaping (Simple version for joining characters)
    // In a production environment, you'd use 'arabic-reshaper' and 'bidi-js'.
    // Here we use a heuristic or at least handle the RTL reordering.

    // For jsPDF, if we have a proper UTF-8 font, we primarily need to reorder for RTL.
    // However, without a reshaper, letters will be isolated.
    // Given the user's issue (Mojibake), the priority is FONT and UTF-8 handling.

    // Let's at least handle the RTL reordering for mixed text.
    const isArabic = (char: string) => /[\u0600-\u06FF]/.test(char);

    // Split into segments of Arabic and non-Arabic
    const words = text.split(/(\s+)/);
    const processedWords = words.map(word => {
        if (isArabic(word)) {
            // Reverse Arabic words for RTL
            return word.split('').reverse().join('');
        }
        return word;
    });

    // If the whole string is primarily Arabic, reverse the order of segments too
    return processedWords.reverse().join('');
}

export async function exportToPDF(articles: Article[], _logoUrl?: string, reportTitle: string = 'Media Coverage Report') {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', hotfixes: ["px_line_height"] });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Load Arabic font with higher reliability
    let fontLoaded = false;
    try {
        // Use a more reliable CDN for the font (Google Fonts Gstatic)
        const fontUrl = 'https://fonts.gstatic.com/s/amiri/v26/J7afF9i7VnKU6OTvXqE.ttf';
        const res = await fetch(fontUrl);
        if (res.ok) {
            const arrayBuffer = await res.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            let binary = '';
            for (let i = 0; i < uint8Array.byteLength; i++) {
                binary += String.fromCharCode(uint8Array[i]);
            }
            const base64 = btoa(binary);

            doc.addFileToVFS('Amiri-Regular.ttf', base64);
            doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
            fontLoaded = true;
        }
    } catch (e) {
        console.warn("Could not load Arabic font, falling back to standard fonts.", e);
    }

    // Load logo
    const logoBase64 = await loadLogo();

    // Helper to set font and handle Arabic text
    const addText = (text: string, x: number, y: number, options: any = {}) => {
        if (fontLoaded) {
            doc.setFont('Amiri');
        } else {
            doc.setFont('helvetica');
        }

        // If it's Arabic, we should apply our fix
        const processedText = isArabic(text) ? fixArabicForPDF(text) : text;
        const align = options.align || 'left';

        // Adjust x for RTL if needed, though jsPDF's align 'right' handles it if text is reversed
        doc.text(processedText, x, y, options);
    };

    const isArabic = (str: string) => /[\u0600-\u06FF]/.test(str);

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
    addText('ALMSTKSHF', pageWidth / 2, 55, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(200, 220, 255);
    addText('MEDIA MONITORING & DEVELOPMENT', pageWidth / 2, 62, { align: 'center' });

    // Title
    doc.setFontSize(28);
    doc.setTextColor(...BRAND_DARK);
    addText(reportTitle.toUpperCase(), pageWidth / 2, pageHeight / 2 - 10, { align: 'center' });

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
    const countriesList = [...new Set(articles.map(a => a.sourceCountry))].join(', ');
    const langs = [...new Set(articles.map(a => a.content))].length > 0 ? 'EN / AR' : 'EN';

    doc.setFontSize(9);
    addText(`Keyword: "${keyword}"  |  Region: ${countriesList}  |  Languages: ${langs}`, pageWidth / 2, pageHeight / 2 + 36, { align: 'center' });

    // Footer branding
    doc.setFillColor(...BRAND_DARK);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    addText('www.almstkshf.com  |  المستكشف', pageWidth / 2, pageHeight - 5, { align: 'center' });

    // ═══════════════════════════════════════════════════════
    // PAGE 2 — EXECUTIVE SUMMARY
    // ═══════════════════════════════════════════════════════
    doc.addPage();
    addPageHeader(doc, logoBase64, pageWidth);

    let y = 28;
    doc.setFontSize(18);
    doc.setTextColor(...BRAND_DARK);
    addText('Executive Summary', 14, y);
    y += 12;

    // Metrics
    const totalReach = articles.reduce((sum, a) => sum + (a.reach || 0), 0);
    const totalAVE = articles.reduce((sum, a) => sum + (a.ave || 0), 0);
    const pos = articles.filter(a => a.sentiment === 'Positive').length;
    const neu = articles.filter(a => a.sentiment === 'Neutral').length;
    const neg = articles.filter(a => a.sentiment === 'Negative').length;

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
        addText(box.label, x + boxW / 2, y + 10, { align: 'center' });
        doc.setFontSize(16);
        doc.setTextColor(...box.color);
        addText(box.value, x + boxW / 2, y + 22, { align: 'center' });
    });

    y += 38;

    doc.setFontSize(12);
    doc.setTextColor(...BRAND_DARK);
    addText('Sentiment Distribution', 14, y);
    y += 8;

    const sentimentData = [
        { label: 'Positive', count: pos, pct: articles.length ? Math.round(pos / articles.length * 100) : 0, color: [16, 185, 129] },
        { label: 'Neutral', count: neu, pct: articles.length ? Math.round(neu / articles.length * 100) : 0, color: [59, 130, 246] },
        { label: 'Negative', count: neg, pct: articles.length ? Math.round(neg / articles.length * 100) : 0, color: [244, 63, 94] },
    ];

    sentimentData.forEach((s) => {
        doc.setFontSize(9);
        doc.setTextColor(80);
        addText(`${s.label}: ${s.count} (${s.pct}%)`, 20, y + 5);
        doc.setFillColor(230, 230, 230);
        doc.roundedRect(70, y + 1, 100, 5, 2, 2, 'F');
        if (s.pct > 0) {
            doc.setFillColor(s.color[0], s.color[1], s.color[2]);
            doc.roundedRect(70, y + 1, Math.max(s.pct, 2), 5, 2, 2, 'F');
        }
        y += 10;
    });

    y += 10;
    doc.setFontSize(12);
    doc.setTextColor(...BRAND_DARK);
    addText('AI Recommendation', 14, y);
    y += 8;

    doc.setFillColor(255, 250, 235);
    doc.roundedRect(14, y, pageWidth - 28, 20, 3, 3, 'F');
    doc.setDrawColor(...BRAND_AMBER);
    doc.roundedRect(14, y, pageWidth - 28, 20, 3, 3, 'S');

    doc.setFontSize(8);
    const negRatio = articles.length ? neg / articles.length : 0;
    const recommendation = negRatio > 0.5
        ? 'High negative sentiment detected. Recommend activating crisis management protocols immediately.'
        : negRatio > 0.3
            ? 'Moderate negative coverage. Monitor closely and prepare proactive messaging.'
            : 'Coverage sentiment is healthy. Continue current media strategy.';

    const splitRec = doc.splitTextToSize(recommendation, pageWidth - 40);
    doc.setTextColor(80);
    doc.text(splitRec, 20, y + 10);

    // ═══════════════════════════════════════════════════════
    // PAGE 3+ — ARTICLES TABLE
    // ═══════════════════════════════════════════════════════
    doc.addPage();
    addPageHeader(doc, logoBase64, pageWidth);

    doc.setFontSize(14);
    doc.setTextColor(...BRAND_DARK);
    addText('Coverage Log / سجل التغطية', pageWidth - 14, 28, { align: 'right' });

    const tableData = articles.map(a => [
        a.publishedDate,
        a.title,
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
            font: fontLoaded ? 'Amiri' : 'helvetica',
            cellPadding: 3,
            halign: 'left' // Standard left for the table grid
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
            1: { cellWidth: 65, halign: 'left' },
            2: { cellWidth: 22 },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 18, halign: 'center' },
            5: { cellWidth: 20, halign: 'right' },
            6: { cellWidth: 20, halign: 'right' },
        },
        didParseCell: (data) => {
            // If the cell contains Arabic, we can try to fix it,
            // though autoTable might handle it differently.
            if (data.section === 'body' && typeof data.cell.raw === 'string' && isArabic(data.cell.raw)) {
                data.cell.text = [fixArabicForPDF(data.cell.raw)];
            }
        },
        didDrawPage: () => {
            addPageHeader(doc, logoBase64, pageWidth);
        },
    });

    // ═══════════════════════════════════════════════════════
    // ADD PAGE NUMBERS
    // ═══════════════════════════════════════════════════════
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addPageFooter(doc, pageWidth, pageHeight, i, totalPages);
    }

    // Save
    doc.save(`${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}

