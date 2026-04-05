import ExcelJS from 'exceljs';
import type { jsPDF } from 'jspdf';

interface Article {
    title: string;
    publishedDate?: string;
    url?: string;
    resolvedUrl?: string;
    sourceType?: string;
    sourceCountry?: string;
    source?: string;
    sentiment?: string;
    reach?: number;
    ave?: number;
    content?: string;
    imageUrl?: string;
    keyword?: string;
    hashtags?: string[];
    [key: string]: unknown;
}

// ════════════════════════════════════════════════════════════════════════
// EXCEL EXPORT
// ════════════════════════════════════════════════════════════════════════
export async function exportToExcel(articles: Article[], translations: any, reportName: string = 'Media_Monitoring_Report') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(translations.sheet_name || 'Coverage Report');

    sheet.columns = [
        { header: translations.date || 'Date', key: 'date', width: 12 },
        { header: translations.title || 'Title', key: 'title', width: 50 },
        { header: translations.url || 'URL', key: 'url', width: 40 },
        { header: translations.type || 'Type', key: 'type', width: 15 },
        { header: translations.source || 'Source', key: 'source', width: 18 },
        { header: translations.depth || 'Depth', key: 'depth', width: 10 },
        { header: translations.country || 'Country', key: 'country', width: 10 },
        { header: translations.sentiment || 'Sentiment', key: 'sentiment', width: 12 },
        { header: translations.reach || 'Reach', key: 'reach', width: 15 },
        { header: translations.ave || 'AVE ($)', key: 'ave', width: 15 },
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
            source: (article as any).source || '',
            depth: (article as any).depth || 'standard',
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
function addPageHeader(doc: jsPDF, logoBase64: string | null, pageWidth: number, translations: any, fontLoaded: boolean = false) {
    // Top bar
    doc.setFillColor(...BRAND_DARK);
    doc.rect(0, 0, pageWidth, 18, 'F');

    // Logo
    if (logoBase64) {
        try {
            doc.addImage(logoBase64, 'PNG', 6, 2, 14, 14);
        } catch { /* ignore */ }
    }

    // Set correct font before writing text
    doc.setFont(fontLoaded ? 'Amiri' : 'helvetica');

    // Company name
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    const companyName = translations.brand_name || 'ALMSTKSHF';
    doc.text(companyName, logoBase64 ? 22 : 8, 11);

    // Tagline
    doc.setFontSize(7);
    doc.setTextColor(200, 200, 200);
    const tagline = translations.brand_tagline || 'Media Monitoring & Development';
    doc.text(tagline, logoBase64 ? 22 : 8, 15);
}

// Helper: add footer with page number and URL
function addPageFooter(doc: jsPDF, pageWidth: number, pageHeight: number, pageNum: number, totalPages: number, translations: any) {
    const footerY = pageHeight - 10;

    doc.setDrawColor(200, 200, 200);
    doc.line(14, footerY - 3, pageWidth - 14, footerY - 3);

    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(translations.footer_url || 'www.almstkshf.com', 14, footerY);

    const genDate = new Date().toLocaleDateString('en-GB');
    const genText = (translations.generated_at || 'Generated: {date}').replace('{date}', genDate);
    doc.text(genText, pageWidth / 2, footerY, { align: 'center' });

    const pageText = (translations.page_count || 'Page {current} / {total}')
        .replace('{current}', pageNum.toString())
        .replace('{total}', totalPages.toString());
    doc.text(pageText, pageWidth - 14, footerY, { align: 'right' });
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
 * Arabic letter forms map for reshaping (isolated, final, initial, medial)
 * Amiri font supports full Unicode Arabic, so we only need proper Bidi reordering.
 * We do NOT reverse individual characters — that destroys Arabic letter shapes.
 * Instead, we reverse the word order for RTL paragraph display in jsPDF.
 */
function fixArabicForPDF(text: string): string {
    if (!text || !/[\u0600-\u06FF]/.test(text)) return text;

    // Split into RTL (Arabic) and LTR (Latin/numbers) segments
    // Preserve whitespace as-is between segments
    const segments = text.split(/(\s+)/);

    // Separate Arabic word-groups from Latin word-groups
    const result: string[] = [];
    let arabicBuffer: string[] = [];

    for (const seg of segments) {
        if (/[\u0600-\u06FF]/.test(seg)) {
            // Arabic segment — collect for RTL reversal
            arabicBuffer.push(seg);
        } else {
            if (arabicBuffer.length > 0) {
                // Flush: reverse word order for RTL (NOT characters, only words)
                result.push(...arabicBuffer.reverse());
                arabicBuffer = [];
            }
            result.push(seg);
        }
    }
    // Flush remaining Arabic
    if (arabicBuffer.length > 0) {
        result.push(...arabicBuffer.reverse());
    }

    // If entire string is Arabic, reverse segment order for RTL paragraph
    const isFullyArabic = /^[\u0600-\u06FF\s\u060C\u061B\u061F\u0640]+$/.test(text);
    if (isFullyArabic) {
        return result.reverse().join('');
    }

    return result.join('');
}

export async function exportToPDF(articles: Article[], translations: any, _logoUrl?: string, reportTitle?: string) {
    if (typeof window === 'undefined') throw new Error('PDF export is client-only');

    const finalReportTitle = reportTitle || translations.report_title || 'Media Coverage Report';

    // Dynamically load jspdf to avoid SSR bundling issues and provide a fallback path.
    let jsPDF: any;
    try {
        const mod = await import('jspdf');
        jsPDF = mod.jsPDF || (mod as any).default;
        if (!jsPDF) throw new Error();
    } catch (err) {
        // Fallback for different bundling environments
        const mod = await import('jspdf/dist/jspdf.umd.min.js');
        jsPDF = mod.jsPDF || (mod as any).default;
    }
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', hotfixes: ["px_line_height"] });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Load Arabic font with multiple fallback CDN URLs
    let fontLoaded = false;
    const fontUrls = [
        'https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHqUpvrIw74NL.ttf',
        'https://fonts.gstatic.com/s/amiri/v26/J7afF9i7VnKU6OTvXqE.ttf',
        'https://cdn.jsdelivr.net/npm/amiri-font@1.0.0/fonts/Amiri-Regular.ttf',
    ];

    for (const fontUrl of fontUrls) {
        try {
            const res = await fetch(fontUrl);
            if (!res.ok) continue;

            const arrayBuffer = await res.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            // Use chunk-based btoa to avoid call stack overflow on large fonts
            let binary = '';
            const chunkSize = 8192;
            for (let i = 0; i < uint8Array.byteLength; i += chunkSize) {
                binary += String.fromCharCode(...uint8Array.subarray(i, i + chunkSize));
            }
            const base64 = btoa(binary);

            doc.addFileToVFS('Amiri-Regular.ttf', base64);
            doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
            fontLoaded = true;
            break; // Success — stop trying fallbacks
        } catch (e) {
            console.warn(`Could not load font from ${fontUrl}`, e);
        }
    }

    if (!fontLoaded) {
        console.warn('All Arabic font sources failed. Arabic text may not render correctly.');
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
    addText(translations.brand_name || 'ALMSTKSHF', pageWidth / 2, 55, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(200, 220, 255);
    addText((translations.brand_tagline || 'MEDIA MONITORING & DEVELOPMENT').toUpperCase(), pageWidth / 2, 62, { align: 'center' });

    // Title
    doc.setFontSize(28);
    doc.setTextColor(...BRAND_DARK);
    addText(finalReportTitle.toUpperCase(), pageWidth / 2, pageHeight / 2 - 10, { align: 'center' });

    // Decorative line
    doc.setDrawColor(...BRAND_AMBER);
    doc.setLineWidth(1.5);
    doc.line(pageWidth / 4, pageHeight / 2, (pageWidth * 3) / 4, pageHeight / 2);

    // Metadata
    doc.setFontSize(11);
    doc.setTextColor(100);
    const genDate = new Date().toLocaleDateString('en-GB');
    const genText = (translations.generated_at || 'Generated: {date}').replace('{date}', genDate);
    doc.text(genText, pageWidth / 2, pageHeight / 2 + 15, { align: 'center' });
    doc.text(`${translations.total_articles || 'Total Articles'}: ${articles.length}`, pageWidth / 2, pageHeight / 2 + 24, { align: 'center' });

    // Keyword info
    const keyword = articles[0]?.keyword || 'N/A';
    const countriesList = [...new Set(articles.map(a => a.sourceCountry))].join(', ');
    const isActuallyArabic = articles.some(a => isArabic(a.title));
    const langs = isActuallyArabic ? 'EN / AR' : 'EN';

    doc.setFontSize(9);
    addText(`${translations.keyword_label || 'Keyword'}: "${keyword}"  |  ${translations.region_label || 'Region'}: ${countriesList}  |  ${translations.langs_label || 'Languages'}: ${langs}`, pageWidth / 2, pageHeight / 2 + 36, { align: 'center' });

    // Footer branding
    doc.setFillColor(...BRAND_DARK);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    addText(`${translations.footer_url || 'www.almstkshf.com'}  |  ${translations.brand_name || 'المستكشف'}`, pageWidth / 2, pageHeight - 5, { align: 'center' });

    // ═══════════════════════════════════════════════════════
    // PAGE 2 — EXECUTIVE SUMMARY
    // ═══════════════════════════════════════════════════════
    doc.addPage();
    addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

    let y = 28;
    doc.setFontSize(18);
    doc.setTextColor(...BRAND_DARK);
    addText(translations.summary_title || 'Executive Summary', 14, y);
    y += 12;

    // Metrics
    const totalReach = articles.reduce((sum, a) => sum + (a.reach || 0), 0);
    const totalAVE = articles.reduce((sum, a) => sum + (a.ave || 0), 0);
    const pos = articles.filter(a => a.sentiment === 'Positive').length;
    const neu = articles.filter(a => a.sentiment === 'Neutral').length;
    const neg = articles.filter(a => a.sentiment === 'Negative').length;

    const boxW = (pageWidth - 42) / 3;
    const boxes: { label: string; value: string; color: [number, number, number] }[] = [
        { label: translations.total_reach || 'TOTAL REACH', value: totalReach.toLocaleString(), color: [31, 78, 120] },
        { label: translations.ad_value || 'AD VALUE (AVE)', value: `$${totalAVE.toLocaleString()}`, color: [218, 165, 32] },
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
    addText(translations.sentiment_title || 'Sentiment Distribution', 14, y);
    y += 8;

    const sentimentData = [
        { label: translations.sentiment_pos || 'Positive', count: pos, pct: articles.length ? Math.round(pos / articles.length * 100) : 0, color: [16, 185, 129] },
        { label: translations.sentiment_neu || 'Neutral', count: neu, pct: articles.length ? Math.round(neu / articles.length * 100) : 0, color: [59, 130, 246] },
        { label: translations.sentiment_neg || 'Negative', count: neg, pct: articles.length ? Math.round(neg / articles.length * 100) : 0, color: [244, 63, 94] },
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
    addText(translations.ai_recommendation || 'AI Recommendation', 14, y);
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
    // Align based on language
    const recAlign = isArabic(recommendation) ? 'right' : 'left';
    const recX = recAlign === 'right' ? pageWidth - 20 : 20;
    doc.text(splitRec, recX, y + 10, { align: recAlign });

    // ═══════════════════════════════════════════════════════
    // PAGE 3+ — ARTICLES TABLE
    // ═══════════════════════════════════════════════════════
    doc.addPage();
    addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

    doc.setFontSize(14);
    doc.setTextColor(...BRAND_DARK);
    addText(translations.coverage_log || 'Coverage Log', pageWidth - 14, 28, { align: 'right' });

    const tableData = articles.map(a => {
        const parsedTitle = isArabic(a.title) ? fixArabicForPDF(a.title) : a.title;
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
            translations.date || 'Date',
            translations.title || 'Title',
            translations.type || 'Type',
            translations.country || 'Country',
            translations.sentiment || 'Sentiment',
            translations.reach || 'Reach',
            translations.ave || 'AVE'
        ]],
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
        didParseCell: (data) => {
            // Apply Arabic fix only to body cells containing Arabic text
            // We apply it here so autoTable uses the corrected text for rendering
            if (data.section === 'body' && typeof data.cell.raw === 'string') {
                const raw = data.cell.raw as string;
                if (/[\u0600-\u06FF]/.test(raw)) {
                    data.cell.text = [fixArabicForPDF(raw)];
                    // Force right-align Arabic cells
                    data.cell.styles.halign = 'right';
                }
            }
        },
        didDrawPage: () => {
            addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);
        },
    });

    // ═══════════════════════════════════════════════════════
    // ADD PAGE NUMBERS
    // ═══════════════════════════════════════════════════════
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addPageFooter(doc, pageWidth, pageHeight, i, totalPages, translations);
    }

    // Save
    doc.save(`${finalReportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}
