const fs = require('fs');
const path = require('path');

const generatorPath = path.join(process.cwd(), 'src/lib/report-generator.ts');
const utilsPath = path.join(process.cwd(), 'src/utils/exportUtils.ts');

if (!fs.existsSync(generatorPath) || !fs.existsSync(utilsPath)) {
    console.error('Required files not found');
    process.exit(1);
}

let generatorContent = fs.readFileSync(generatorPath, 'utf8');

const newMethods = `
    public static async exportMediaMonitoringReport(
        articles: ReportArticle[],
        translations: ReportTranslations,
        type: 'excel' | 'pdf',
        logoUrl?: string
    ) {
        if (type === 'excel') {
            await this.generateMediaMonitoringExcel(articles, translations, translations.report_title || 'Media_Monitoring_Report');
        } else {
            await this.generateMediaMonitoringPDF(articles, translations, logoUrl, translations.report_title);
        }
    }

    private static async generateMediaMonitoringExcel(
        articles: ReportArticle[],
        translations: ReportTranslations,
        reportName: string = 'Media_Monitoring_Report'
    ) {
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(translations.sheet_name || 'Coverage Report');

        const isArabicMode = /[\\u0600-\\u06FF]/.test(translations.Reports?.pr_title || '');
        if (isArabicMode) {
            sheet.views = [{ rightToLeft: true }];
        }

        sheet.columns = [
            { header: translations.date || 'Publication Date', key: 'date', width: 12 },
            { header: translations.title || 'Title', key: 'title', width: 50 },
            { header: translations.url || 'URL', key: 'url', width: 40 },
            { header: translations.type || 'Source Type', key: 'type', width: 15 },
            { header: translations.source || 'Source', key: 'source', width: 18 },
            { header: translations.depth || 'Coverage Depth', key: 'depth', width: 10 },
            { header: translations.country || 'Country', key: 'country', width: 10 },
            { header: translations.sentiment || 'Sentiment Direction', key: 'sentiment', width: 12 },
            { header: translations.relevancy || 'Relevancy', key: 'relevancy', width: 10 },
            { header: translations.reach || 'Reach / Impressions', key: 'reach', width: 15 },
            { header: translations.likes || 'Likes', key: 'likes', width: 10 },
            { header: translations.retweets || 'Retweets', key: 'retweets', width: 10 },
            { header: translations.replies || 'Replies', key: 'replies', width: 10 },
            { header: translations.ave || 'AVE', key: 'ave', width: 15 },
            { header: translations.status || 'Status', key: 'status', width: 12 },
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
                relevancy: article.relevancy_score !== undefined ? \\\`\${article.relevancy_score}%\\\` : '-',
                reach: article.reach,
                likes: article.likes !== undefined ? article.likes : '-',
                retweets: article.retweets !== undefined ? article.retweets : '-',
                replies: article.replies !== undefined ? article.replies : '-',
                ave: article.ave,
                status: article.status === 'in_progress' ? 'In Progress' : (article.status || 'Live'),
                hashtags: Array.isArray(article.hashtags) ? article.hashtags.join(', ') : '',
            });
        });

        sheet.getColumn('reach').numFmt = '#,##0';
        sheet.getColumn('ave').numFmt = '\"$\"#,##0.00';

        await this.downloadWorkbook(workbook, reportName);
    }

    private static async generateMediaMonitoringPDF(
        articles: ReportArticle[],
        translations: ReportTranslations,
        logoUrl?: string,
        reportTitle?: string
    ) {
        if (typeof window === 'undefined') throw new Error('PDF export is client-only');

        const finalReportTitle = reportTitle || translations.report_title || 'Media Coverage Report';

        let JsPDF;
        try {
            const mod = await import('jspdf');
            JsPDF = mod.jsPDF ?? mod.default;
        } catch {
            const mod = await import('jspdf/dist/jspdf.umd.min.js');
            JsPDF = mod.jsPDF ?? mod.default;
        }

        const autoTableMod = await import('jspdf-autotable');
        const autoTable = autoTableMod.default ?? autoTableMod;

        const useLandscape = true;
        const doc = new JsPDF({ orientation: useLandscape ? 'landscape' : 'portrait', unit: 'mm', format: 'a4', hotfixes: ['px_line_height'] });
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        let fontLoaded = false;
        try {
            const fontUrl = 'https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHqUpvrIw74NL.ttf';
            const res = await fetch(fontUrl);
            if (res.ok) {
                const arrayBuffer = await res.arrayBuffer();
                const base64 = this.arrayBufferToBase64(arrayBuffer);
                doc.addFileToVFS('Amiri-Regular.ttf', base64);
                doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
                fontLoaded = true;
            }
        } catch (e) {
            console.warn('Amiri font load failed', e);
        }

        const logoBase64 = await this.loadLogo();

        const addText = (text: string, x: number, y: number, options: { align?: 'center' | 'right' | 'left' } = {}) => {
            doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
            const processedText = this.fixArabic(text);
            doc.text(processedText, x, y, options);
        };

        // PAGE 1
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
        doc.text(\`\${translations.total_articles || 'Total Articles'}: \${articles.length}\`, pageWidth / 2, pageHeight / 2 + 24, { align: 'center' });

        const keyword = articles[0]?.keyword || 'N/A';
        const countriesList = [...new Set(articles.map(a => a.sourceCountry))].join(', ');
        const langs = 'EN / AR';

        doc.setFontSize(9);
        addText(
            \`\${translations.keyword_label || 'Keyword'}: \"\${keyword}\"  |  \${translations.region_label || 'Region'}: \${countriesList}  |  \${translations.langs_label || 'Languages'}: \${langs}\`,
            pageWidth / 2,
            pageHeight / 2 + 36,
            { align: 'center' }
        );

        doc.setFillColor(...BRAND_DARK);
        doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
        doc.setFontSize(8);
        doc.setTextColor(200, 200, 200);
        addText(\`\${translations.footer_url || 'www.almstkshf.com'}  |  \${translations.brand_name || 'المستكشف'}\`, pageWidth / 2, pageHeight - 5, { align: 'center' });

        // PAGE 2
        doc.addPage();
        this.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

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
        const boxes = [
            { label: translations.total_reach || 'TOTAL REACH / IMPRESSIONS', value: totalReach.toLocaleString(), color: [31, 78, 120] },
            { label: translations.ad_value || 'ADVERTISING VALUE EQUIVALENT (AVE)', value: \`$\${totalAVE.toLocaleString()}\`, color: [218, 165, 32] },
            { label: translations.total_articles || 'TOTAL ARTICLES', value: articles.length.toString(), color: [16, 185, 129] },
        ];

        this.drawMetricBoxes(doc, boxes, y, pageWidth, fontLoaded);
        y += 38;

        doc.setFontSize(12);
        doc.setTextColor(...BRAND_DARK);
        addText(translations.sentiment_title || 'Sentiment Direction Distribution', 14, y);
        y += 8;

        const sentimentData = [
            { label: translations.sentiment_pos || 'Positive Direction', count: pos, pct: articles.length ? Math.round(pos / articles.length * 100) : 0, color: [16, 185, 129] },
            { label: translations.sentiment_neu || 'Neutral Direction', count: neu, pct: articles.length ? Math.round(neu / articles.length * 100) : 0, color: [59, 130, 246] },
            { label: translations.sentiment_neg || 'Negative Direction', count: neg, pct: articles.length ? Math.round(neg / articles.length * 100) : 0, color: [244, 63, 94] },
        ];

        sentimentData.forEach((s) => {
            doc.setFontSize(9);
            doc.setTextColor(80);
            addText(\`\${s.label}: \${s.count} (\${s.pct}%)\`, 20, y + 5);
            doc.setFillColor(230, 230, 230);
            doc.roundedRect(70, y + 1, 100, 5, 2, 2, 'F');
            if (s.pct > 0) {
                doc.setFillColor(...(s.color));
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
        doc.text(splitRec, 20, y + 10, { align: 'left' });

        // PAGE 3+
        doc.addPage();
        this.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

        doc.setFontSize(14);
        doc.setTextColor(...BRAND_DARK);
        addText(translations.coverage_log || 'Media Coverage Log', pageWidth - 14, 28, { align: 'right' });

        const tableData = articles.map(a => {
            const parsedTitle = this.fixArabic(a.title);
            const hashStr = Array.isArray(a.hashtags) && a.hashtags.length > 0 ? \`\\n#\${a.hashtags.join(' #')}\` : '';
            return [
                a.publishedDate ?? '',
                parsedTitle + hashStr,
                a.sourceType ?? '',
                a.sourceCountry ?? '',
                a.sentiment ?? '',
                a.relevancy_score !== undefined ? \`\${a.relevancy_score}%\` : '-',
                (a.reach ?? 0).toLocaleString(),
                a.likes !== undefined && a.likes !== null ? a.likes.toLocaleString() : '-',
                a.retweets !== undefined && a.retweets !== null ? a.retweets.toLocaleString() : '-',
                a.replies !== undefined && a.replies !== null ? a.replies.toLocaleString() : '-',
                \`$\${(a.ave ?? 0).toLocaleString()}\`,
                a.status === 'in_progress' ? 'In Progress' : (a.status || 'Live')
            ];
        });

        await this.addAutoTable(doc, {
            head: [[
                translations.date || 'Publication Date',
                translations.title || 'Title',
                translations.type || 'Source Type',
                translations.country || 'Country',
                translations.sentiment || 'Sentiment Direction',
                translations.relevancy || 'Relevancy',
                translations.reach || 'Reach',
                translations.likes || 'Likes',
                translations.retweets || 'Retweets',
                translations.replies || 'Replies',
                translations.ave || 'AVE ($)',
                translations.status || 'Status'
            ]],
            body: tableData,
            startY: 33,
            fontLoaded,
            logoBase64,
            translations,
            didDrawPage: () => {
                this.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);
            },
            columnStyles: {
                0: { cellWidth: 15 },
                1: { cellWidth: 55, halign: 'left' },
                2: { cellWidth: 20 },
                3: { cellWidth: 15, halign: 'center' },
                4: { cellWidth: 15, halign: 'center' },
                5: { cellWidth: 12, halign: 'center' },
                6: { cellWidth: 15, halign: 'right' },
                7: { cellWidth: 12, halign: 'right' },
                8: { cellWidth: 12, halign: 'right' },
                9: { cellWidth: 12, halign: 'right' },
                10: { cellWidth: 15, halign: 'right' },
                11: { cellWidth: 15, halign: 'center' },
            }
        });

        this.finalizePDF(doc, finalReportTitle, translations, fontLoaded);
    }
`;

generatorContent = generatorContent.replace('// PRIVATE HELPERS: COMMON UI', newMethods + '\n\n    // PRIVATE HELPERS: COMMON UI');

fs.writeFileSync(generatorPath, generatorContent);
console.log('Successfully updated report-generator.ts');
