/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import ExcelJS from 'exceljs';
import type { jsPDF } from 'jspdf';
import { ReportTranslations, AiInspectorData, DarkWebResult, TerroristListItem, DeepWebRun, OsintHistoryItem } from '@/types/reports';
import { fixArabicForPDF, isArabic } from '@/utils/arabic-utils';
import { AMIRI_FONT_BASE64 } from '@/lib/fonts/amiri-font-base64';

interface AutoTablejsPDF extends jsPDF {
    lastAutoTable: {
        finalY: number;
    };
}

// -------------------------------------------------------------------------------------------------
// TYPES & INTERFACES
// -------------------------------------------------------------------------------------------------

export interface ReportArticle {
    title: string;
    publishedDate?: string;
    url?: string;
    resolvedUrl?: string;
    imageUrl?: string;
    source?: string;
    sourceType?: string;
    publisherUsername?: string;
    sentiment?: string;
    reach?: number;
    ave?: number;
    likes?: number;
    retweets?: number;
    replies?: number;
    depth?: string;
    sourceCountry?: string;
    status?: string;
    relevancy_score?: number;
    hashtags?: string[];
    content?: string;
    keyword?: string;
    [key: string]: any;
}

export type OsintResult = OsintHistoryItem;

// -------------------------------------------------------------------------------------------------
// CONSTANTS & COLORS
// -------------------------------------------------------------------------------------------------

const BRAND_DARK = [31, 78, 120] as [number, number, number];
const BRAND_AMBER = [218, 165, 32] as [number, number, number];
const ACCENT_BG = [241, 245, 249] as [number, number, number];

// -------------------------------------------------------------------------------------------------
// UTILITY: REPORT GENERATOR
// -------------------------------------------------------------------------------------------------

export class ReportGenerator {
    private articles: ReportArticle[];
    private translations: ReportTranslations;

    constructor(articles: ReportArticle[], translations: ReportTranslations) {
        this.articles = articles;
        this.translations = translations;
    }

    /**
     * Generate PDF as a Blob
     */
    public async generatePDF(chartImages?: { reportsChart?: string; emotionRadar?: string; sentimentDonut?: string; articlesTrend?: string }): Promise<Blob> {
        const title = this.translations.Reports?.pr_title || 'Media Coverage Report';
        const result = await ReportGenerator.generatePressReleasePDF(this.articles, this.translations, title, true, chartImages);
        return (result as { doc: jsPDF }).doc.output('blob') as Blob;
    }

    /**
     * Generate Excel as a Blob
     */
    public async generateExcel(): Promise<Blob> {
        const title = this.translations.Reports?.pr_title || 'Media Coverage Report';
        const result = await ReportGenerator.generateExcel(this.articles, this.translations, title, true);
        return result as Blob;
    }

    /**
     * Generate CSV as a Blob
     */
    public generateCSV(): Blob {
        const headers = [
            this.translations.Reports?.col_date || 'Date',
            this.translations.Reports?.col_title || 'Title',
            this.translations.Reports?.col_source || 'Source',
            this.translations.Reports?.col_reach || 'Reach',
            this.translations.Reports?.col_ave || 'AVE ($)'
        ];

        const rows = this.articles.map(a => [
            a.publishedDate || '',
            `"${(a.title || '').replace(/"/g, '""')}"`,
            a.source || '',
            (a.reach || 0).toString(),
            (a.ave || 0).toString()
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // PUBLIC STATIC METHODS
    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
    // UTILITY: REPORT GENERATOR
    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â


    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
    // PUBLIC METHODS
    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

    /**
     * Specialized Press Release Report (Reach & AVE Focus)
     */
    static async exportPressReleaseReport(articles: ReportArticle[], translations: ReportTranslations, format: 'pdf' | 'excel' = 'pdf') {
        const title = translations.Reports?.pr_title || 'Press Release Coverage Report'; // ar: تقرير تغطية البيان الصحفي
        if (format === 'excel') {
            return this.generateExcel(articles, translations, title);
        }
        return this.generatePressReleasePDF(articles, translations, title);
    }

    /**
     * Deep Web Risk Assessment Report
     */
    static async exportDeepWebReport(runs: DeepWebRun[], threats: ReportArticle[] | Record<string, unknown>, translations: ReportTranslations, format: 'pdf' | 'excel' = 'pdf') {
        const title = translations.Reports?.deep_title || 'Deep Web Risk Assessment';
        const threatList: ReportArticle[] = Array.isArray(threats) ? threats : [];
        if (format === 'excel') {
            return this.generateExcel(threatList, translations, title);
        }
        return this.generateDeepWebPDF(runs, threatList, translations, title);
    }

    /**
     * Dark Web Results Report
     */
    static async exportDarkWebReport(results: DarkWebResult[], translations: ReportTranslations, format: 'pdf' | 'excel' = 'pdf') {
        const title = translations.DarkWeb?.tab_label || 'Dark Web Search Results';
        if (format === 'excel') {
            await this.generateDarkWebExcel(results, translations, title);
        } else {
            await this.generateDarkWebPDF(results, translations, title);
        }
    }

    /**
     * OSINT Technical Dossier (Single or History)
     */
    public static async exportOsintReport(items: OsintResult[], translations: ReportTranslations, format: 'pdf' | 'excel' = 'pdf') {
        const title = translations.Reports?.osint_title || 'OSINT Technical Dossier';
        if (format === 'excel') {
            await this.generateOsintHistoryExcel(items, translations, title);
        } else {
            await this.generateOsintHistoryPDF(items, translations, title);
        }
    }

    public static async exportTerroristListReport(items: TerroristListItem[], translations: ReportTranslations, format: 'pdf' | 'excel' = 'pdf') {
        const title = translations.TerroristList?.title || 'Watchlist Clearance Report';
        if (format === 'excel') {
            await this.generateWatchlistExcel(items, translations, title);
        } else {
            await this.generateWatchlistPDF(items, translations, title);
        }
    }

    private static async generateWatchlistPDF(items: TerroristListItem[], translations: ReportTranslations, title: string) {
        const { doc, pageWidth, fontLoaded, logoBase64 } = await this.initPDF(translations.logo_url);
        this.addCoverPage(doc, title, items.length, translations, logoBase64, fontLoaded);

        doc.addPage();
        this.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

        const y = 30;
        this.drawHeading(doc, translations.TerroristList?.title || 'Sanctions Database Scan', 14, y, fontLoaded);

        const tableData = items.map(item => [
            this.fixArabic(item.nameArabic || ''),
            this.fixArabic(item.nameLatin || ''),
            item.nationality || '',
            item.documentNumber || '',
            item.category || ''
        ]);

        await this.addAutoTable(doc, {
            head: [[
                translations.TerroristList?.fields?.name_arabic || 'Name (AR)',
                translations.TerroristList?.fields?.name_latin || 'Name (EN)',
                translations.TerroristList?.fields?.nationality || 'Nationality',
                translations.TerroristList?.fields?.doc_number || 'Document #',
                translations.TerroristList?.fields?.category || 'Category'
            ]],
            body: tableData,
            startY: y + 8,
            fontLoaded,
            logoBase64,
            translations,
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 30, halign: 'center' },
                3: { cellWidth: 25, halign: 'center' },
                4: { cellWidth: 25, halign: 'center' }
            }
        });

        this.finalizePDF(doc, title, translations, fontLoaded);
    }

    private static async generateWatchlistExcel(items: TerroristListItem[], translations: ReportTranslations, title: string) {
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Watchlist');

        sheet.addRow([title]);
        sheet.addRow([translations.Reports?.generated_at || 'Generated At', new Date().toLocaleString()]);
        sheet.addRow([]);

        sheet.addRow([
            translations.TerroristList?.fields?.name_arabic || 'Name (AR)',
            translations.TerroristList?.fields?.name_latin || 'Name (EN)',
            translations.TerroristList?.fields?.nationality || 'Nationality',
            translations.TerroristList?.fields?.doc_number || 'Document #',
            translations.TerroristList?.fields?.category || 'Category',
            translations.TerroristList?.fields?.reasons || 'Reasons'
        ]);

        items.forEach(item => {
            sheet.addRow([
                item.nameArabic,
                item.nameLatin,
                item.nationality,
                item.documentNumber,
                item.category,
                item.reasons
            ]);
        });

        await this.downloadWorkbook(workbook, title);
    }

    /**
     * AI Forensic Inspector Report
     */
    static async exportAiInspectorReport(mode: 'text' | 'image' | 'video', data: AiInspectorData, translations: ReportTranslations, format: 'pdf' | 'excel' = 'pdf') {
        const title = translations.AiInspector?.results_summary || 'AI Forensic Analysis Report';
        if (format === 'excel') {
            return this.generateAiInspectorExcel(mode, data, translations, title);
        }
        return this.generateAiInspectorPDF(mode, data, translations, title);
    }

    private static async generateDarkWebPDF(results: DarkWebResult[], translations: ReportTranslations, title: string) {
        const { doc, pageWidth, fontLoaded, logoBase64 } = await this.initPDF(translations.logo_url);

        // Cover Page
        this.addCoverPage(doc, title, results.length, translations, logoBase64, fontLoaded);

        doc.addPage();
        this.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

        let y = 30;
        this.drawHeading(doc, translations.DarkWeb?.tab_label || 'Dark Web Search Results', 14, y, fontLoaded);
        y += 10;

        const tableData = results.map(r => [
            r.discovered_at ? new Date(r.discovered_at).toLocaleDateString() : '',
            this.fixArabic(r.title || ''),
            r.source_type || '',
            r.risk_level || 'Neutral',
            this.fixArabic(r.summary || '')
        ]);

        await this.addAutoTable(doc, {
            head: [[
                translations.Reports?.col_date || 'Date',
                translations.Reports?.col_title || 'Title',
                translations.Reports?.col_source || 'Source',
                translations.DarkWeb?.col_risk || 'Risk Assessment',
                translations.Reports?.col_summary || 'AI Summary'
            ]],
            body: tableData,
            startY: y + 8,
            fontLoaded,
            logoBase64,
            translations,
            columnStyles: {
                0: { cellWidth: 22, halign: 'center' },
                1: { cellWidth: 45 },
                2: { cellWidth: 22, halign: 'center' },
                3: { cellWidth: 25, halign: 'center' },
                4: { cellWidth: 'auto' }
            }
        });

        this.finalizePDF(doc, title, translations, fontLoaded);
    }

    private static async generatePressReleasePDF(
        articles: ReportArticle[],
        translations: ReportTranslations,
        title: string,
        returnOnly = false,
        chartImages?: { reportsChart?: string; emotionRadar?: string; sentimentDonut?: string; articlesTrend?: string }
    ) {
        const { doc, pageWidth, pageHeight, fontLoaded, logoBase64 } = await this.initPDF(translations.logo_url);

        // Pre-load images to base64 using local CORS-bypassing proxy
        const articlesWithImages = await Promise.all(articles.slice(0, 50).map(async (a) => {
            if (!a.imageUrl) return a;
            // If it's already base64, keep it
            if (a.imageUrl.startsWith('data:')) return a;

            try {
                const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(a.imageUrl)}`;
                const response = await fetch(proxyUrl);
                if (response.ok) {
                    const blob = await response.blob();
                    const reader = new FileReader();
                    const b64 = await new Promise<string>((resolve) => {
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(blob);
                    });
                    return { ...a, imageUrl: b64 };
                }
            } catch (e) {
                console.warn("Could not pre-load image for report:", a.imageUrl);
            }
            return a;
        }));

        // Cover Page
        this.addCoverPage(doc, title, articles.length, translations, logoBase64, fontLoaded);

        // Summary Page with Reach/AVE charts
        doc.addPage();
        this.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

        let y = 30;
        this.drawHeading(doc, translations.Reports?.summary || 'Executive Summary', 14, y, fontLoaded);
        y += 12;

        const totalReach = articles.reduce((sum, a) => sum + (a.reach || 0), 0);
        const totalAVE = articles.reduce((sum, a) => sum + (a.ave || 0), 0);

        this.drawMetricBoxes(doc, [
            { label: translations.Reports?.total_reach || 'TOTAL REACH', value: totalReach.toLocaleString(), color: BRAND_DARK },
            { label: translations.Reports?.total_ave || 'AD VALUE (AVE — Advertising Value Equivalent)', value: `$${totalAVE.toLocaleString()}`, color: BRAND_AMBER },
            { label: translations.Reports?.article_count || 'TOTAL ARTICLES', value: articles.length.toString(), color: [16, 185, 129] }
        ], y, pageWidth, fontLoaded);
        y += 40;

        // Render charts if available
        if (chartImages && (chartImages.sentimentDonut || chartImages.emotionRadar || chartImages.reportsChart || chartImages.articlesTrend)) {
            y += 5; // spacing
            
            // Draw donut and radar side-by-side if both are available
            if (chartImages.sentimentDonut && chartImages.emotionRadar) {
                const chartW = 85;
                const chartH = 60;
                try {
                    doc.addImage(chartImages.sentimentDonut, 'PNG', 14, y, chartW, chartH);
                    doc.addImage(chartImages.emotionRadar, 'PNG', 14 + chartW + 12, y, chartW, chartH);
                    y += chartH + 10;
                } catch (e) {
                    console.warn("Error drawing charts side-by-side in PDF:", e);
                }
            } else {
                // Otherwise draw sequentially
                const chartW = 160;
                const chartH = 70;
                const chartsToDraw = [
                    chartImages.reportsChart,
                    chartImages.articlesTrend,
                    chartImages.sentimentDonut,
                    chartImages.emotionRadar
                ].filter(Boolean);

                chartsToDraw.forEach(img => {
                    if (y + chartH > pageHeight - 20) {
                        doc.addPage();
                        this.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);
                        y = 25;
                    }
                    try {
                        doc.addImage(img!, 'PNG', 25, y, chartW, chartH);
                        y += chartH + 10;
                    } catch (e) {
                        console.warn("Error drawing single chart in PDF:", e);
                    }
                });
            }
        }

        if (y > pageHeight - 35) {
            doc.addPage();
            this.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);
            y = 25;
        } else {
            y += 10;
        }

        // Article Table
        this.drawHeading(doc, translations.Reports?.coverage_details || 'Media Coverage Log', 14, y, fontLoaded);

        const tableData = articlesWithImages.map(a => [
            '', // Image Placeholder
            a.publishedDate || '',
            this.fixArabic(a.title),
            a.source || '',
            (a.reach || 0).toLocaleString(),
            `$${(a.ave || 0).toLocaleString()}`
        ]);

        await this.addAutoTable(doc, {
            head: [[
                '', // Image Header
                translations.Reports?.col_date || 'Publication Date',
                translations.Reports?.col_title || 'Title',
                translations.Reports?.col_source || 'Source',
                translations.Reports?.col_reach || 'Reach / Impressions',
                translations.Reports?.col_ave || 'AVE (Advertising Value Equivalent)'
            ]],
            body: tableData,
            startY: y + 8,
            fontLoaded,
            logoBase64,
            translations,
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' },
                1: { cellWidth: 22, halign: 'center' },
                2: { cellWidth: 'auto' },
                3: { cellWidth: 22, halign: 'center' },
                4: { cellWidth: 20, halign: 'center' },
                5: { cellWidth: 20, halign: 'center' }
            },
            didDrawCell: (data: any) => {
                if (data.column.index === 0 && data.cell.section === 'body' && articlesWithImages[data.row.index]?.imageUrl) {
                    const img = articlesWithImages[data.row.index].imageUrl;
                    if (img && img.startsWith('data:')) {
                        try {
                            const matches = img.match(/^data:image\/([a-zA-Z+]+);base64,/);
                            const format = matches ? matches[1].toUpperCase() : 'JPEG';
                            const padding = 2;
                            doc.addImage(
                                img,
                                format === 'PNG' ? 'PNG' : 'JPEG',
                                data.cell.x + padding,
                                data.cell.y + padding,
                                data.cell.width - (padding * 2),
                                data.cell.height - (padding * 2)
                            );
                        } catch (e) {
                            // Skip if image is invalid
                        }
                    }
                }
            }
        });

        this.finalizePDF(doc, title, translations, fontLoaded, returnOnly);
        return { doc, pageWidth, pageHeight, fontLoaded, logoBase64 };
    }

    private static async generateDeepWebPDF(runs: DeepWebRun[], threats: ReportArticle[], translations: ReportTranslations, title: string) {
        const { doc, pageWidth, fontLoaded, logoBase64 } = await this.initPDF(translations.logo_url);

        this.addCoverPage(doc, title, threats.length, translations, logoBase64, fontLoaded);

        // Ingestion Logs Section
        doc.addPage();
        this.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

        let y = 30;
        this.drawHeading(doc, translations.Reports?.ingestion_logs || 'Media Monitoring Activity Log (Last 10 Runs)', 14, y, fontLoaded);

        const logsTable = runs.slice(0, 10).map(r => [
            new Date(r._creationTime).toLocaleString(),
            r.source || 'Generic',
            r.status.toUpperCase(),
            r.itemCount?.toString() || '0'
        ]);

        await this.addAutoTable(doc, {
            head: [[
                translations.Reports?.col_time || 'Timestamp',
                translations.Reports?.col_source || 'Source',
                translations.Reports?.col_status || 'Status',
                translations.Reports?.col_count || 'Article Count'
            ]],
            body: logsTable,
            startY: y + 8,
            fontLoaded,
            logoBase64,
            translations,
            columnStyles: {
                0: { cellWidth: 45, halign: 'center' },
                1: { cellWidth: 45, halign: 'center' },
                2: { cellWidth: 35, halign: 'center' },
                3: { cellWidth: 35, halign: 'center' }
            }
        });

        // Identified Threats Section
        y = (doc as AutoTablejsPDF).lastAutoTable.finalY + 15;
        this.drawHeading(doc, translations.Reports?.identified_threats || 'High-Risk Identified Threats', 14, y, fontLoaded);

        await this.addAutoTable(doc, {
            head: [[translations.Reports?.col_date || 'Publication Date', translations.Reports?.col_title || 'Title', translations.Reports?.col_source || 'Source']],
            body: threats.map(a => [a.publishedDate || '', a.title, a.source || '']),
            startY: y + 8,
            fontLoaded,
            logoBase64,
            translations,
            columnStyles: {
                0: { cellWidth: 35, halign: 'center' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 35, halign: 'center' }
            }
        });
        y = (doc as AutoTablejsPDF).lastAutoTable.finalY + 15;

        this.finalizePDF(doc, title, translations, fontLoaded);
    }

    private static async generateOsintHistoryPDF(items: OsintResult[], translations: ReportTranslations, title: string) {
        const { doc, pageWidth, fontLoaded, logoBase64 } = await this.initPDF(translations.logo_url);

        this.addCoverPage(doc, title, items.length, translations, logoBase64, fontLoaded);

        doc.addPage();
        this.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

        const y = 30;
        this.drawHeading(doc, translations.OsintTab?.export_history || 'Investigation History', 14, y, fontLoaded);

        const tableData = items.map(item => [
            new Date(item.createdAt || Date.now()).toLocaleString(),
            item.query,
            item.type.toUpperCase(),
            typeof item.result === 'object' ? Object.keys(item.result as Record<string, unknown>).length.toString() : '1'
        ]);

        await this.addAutoTable(doc, {
            head: [[
                translations.Reports?.col_time || 'Timestamp',
                translations.Reports?.investigation_target || 'Investigation Target',
                translations.Reports?.investigation_type || 'Investigation Type',
                translations.Reports?.data_points || 'Total Data Points'
            ]],
            body: tableData,
            startY: y + 8,
            fontLoaded,
            logoBase64,
            translations,
            columnStyles: {
                0: { cellWidth: 45, halign: 'center' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 35, halign: 'center' },
                3: { cellWidth: 35, halign: 'center' }
            }
        });

        this.finalizePDF(doc, title, translations, fontLoaded);
    }

    private static async generateOsintPDF(data: OsintResult, translations: ReportTranslations, title: string) {
        const { doc, pageWidth, fontLoaded, logoBase64 } = await this.initPDF(translations.logo_url);

        // Custom Dossier Cover
        this.addCoverPage(doc, title, 1, translations, logoBase64, fontLoaded);

        doc.addPage();
        this.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

        let y = 30;
        this.drawHeading(doc, translations.Reports?.investigation_target || 'Investigation Target', 14, y, fontLoaded);
        y += 10;

        doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(...BRAND_AMBER);
        
        const processedQuery = this.fixArabic(data.query);
        if (isArabic(data.query)) {
            doc.text(processedQuery, pageWidth - 20, y, { align: 'right' });
        } else {
            doc.text(processedQuery, 20, y);
        }
        y += 8;
        
        doc.setFontSize(9);
        doc.setTextColor(100);
        
        const typeText = `${translations.Reports?.investigation_type || 'Type'}: ${data.type.toUpperCase()}`;
        const processedType = this.fixArabic(typeText);
        if (isArabic(typeText)) {
            doc.text(processedType, pageWidth - 20, y, { align: 'right' });
        } else {
            doc.text(processedType, 20, y);
        }
        y += 15;

        // Parse Results JSON into structured tables
        const result = data.result;
        if (result && typeof result === 'object') {
            // General Info Table
            const details = Object.entries(result)
                .filter(([, v]) => typeof v !== 'object')
                .slice(0, 25);

            if (details.length > 0) {
                this.drawHeading(doc, translations.Reports?.technical_details || 'Technical Characteristics', 14, y, fontLoaded);
                await this.addAutoTable(doc, {
                    head: [[translations.Reports?.attribute || 'Attribute / Property', translations.Reports?.value || 'Value']],
                    body: details.map(([k, v]) => [k, String(v)]),
                    startY: y + 8,
                    fontLoaded,
                    logoBase64,
                    translations,
                    columnStyles: {
                        0: { cellWidth: 60, fontStyle: 'bold' },
                        1: { cellWidth: 'auto' }
                    }
                });
                y = (doc as AutoTablejsPDF).lastAutoTable.finalY + 15;
            }

            // Entity Map
            const resultObj = result as Record<string, unknown>;
            const entities = (resultObj.entities || resultObj.associations || []) as Array<{ name?: string; type?: string; relevance?: string | number }>;

            await this.addAutoTable(doc, {
                head: [[
                    translations.Reports?.entity_name || 'Entity Name',
                    translations.Reports?.entity_type || 'Entity Type',
                    translations.Reports?.relevance || 'Relevance Score'
                ]],
                body: entities.map((e) => [
                    e.name || 'Unknown',
                    e.type || 'N/A',
                    typeof e.relevance === 'number' ? `${(e.relevance * 100).toFixed(0)}%` : (e.relevance || 'N/A')
                ]),
                startY: y + 8,
                fontLoaded,
                logoBase64,
                translations,
                columnStyles: {
                    0: { cellWidth: 'auto' },
                    1: { cellWidth: 40, halign: 'center' },
                    2: { cellWidth: 40, halign: 'center' }
                }
            });
            y = (doc as AutoTablejsPDF).lastAutoTable.finalY + 15;
        }

        this.finalizePDF(doc, title, translations, fontLoaded);
    }

    private static async generateAiInspectorPDF(mode: string, data: AiInspectorData, translations: ReportTranslations, title: string) {
        const { doc, pageWidth, fontLoaded, logoBase64 } = await this.initPDF(translations.logo_url);

        const modeTrans = (translations.AiInspector as Record<string, any> | undefined)?.[`mode_${mode}`] || mode.toUpperCase();
        this.addCoverPage(doc, `${title} - ${modeTrans}`, typeof data === 'object' ? Object.keys(data).length : 1, translations, logoBase64, fontLoaded);

        doc.addPage();
        this.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

        let y = 30;
        this.drawHeading(doc, translations.AiInspector?.results_summary || 'Analysis Results', 14, y, fontLoaded);
        y += 10;

        doc.setFontSize(10);
        doc.setTextColor(...BRAND_DARK);

        const riskLevel = data.overallRisk;
        const confidence = data.confidenceScore;

        const colorMap: Record<string, [number, number, number]> = {
            low: [16, 185, 129],
            medium: [245, 158, 11],
            high: [239, 68, 68]
        };
        const rColor = colorMap[(riskLevel || 'low').toLowerCase()] || BRAND_DARK;

        const localizedRiskLevel = (translations.AiInspector as Record<string, any> | undefined)?.[`risk_${(riskLevel || 'low').toLowerCase()}`] || riskLevel?.toUpperCase() || 'UNKNOWN';

        this.drawMetricBoxes(doc, [
            { label: translations.AiInspector?.label_mode || 'MODE', value: modeTrans, color: BRAND_DARK },
            { label: translations.AiInspector?.label_risk || 'RISK LEVEL', value: localizedRiskLevel, color: rColor },
            { label: translations.AiInspector?.label_confidence || 'CONFIDENCE', value: `${(confidence ?? 0).toFixed(1)}%`, color: BRAND_AMBER }
        ], y, pageWidth, fontLoaded);

        y += 40;

        if (mode === 'text' && data) {
            this.drawHeading(doc, translations.AiInspector?.linguistic_signals || 'Linguistic Signals', 14, y, fontLoaded);

            await this.addAutoTable(doc, {
                head: [[
                    translations.AiInspector?.col_sentence || 'Sentence Segment',
                    translations.AiInspector?.col_flags || 'Detected Flags',
                    translations.AiInspector?.col_ai_prob || 'AI Probability'
                ]],
                body: data.sentenceBreakdown?.map(s => [
                    s.text,
                    s.flags.join(', ') || translations.AiInspector?.none || 'None',
                    `${((s.aiProbability ?? 0) * 100).toFixed(1)}%`
                ]) || [],
                startY: y + 8,
                fontLoaded,
                logoBase64,
                translations,
                columnStyles: {
                    0: { cellWidth: 'auto' },
                    1: { cellWidth: 40, halign: 'center' },
                    2: { cellWidth: 35, halign: 'center' }
                }
            });
            y = (doc as AutoTablejsPDF).lastAutoTable?.finalY || y + 50;
        } else if (mode === 'image' && data) {
            this.drawHeading(doc, translations.AiInspector?.visual_signals || 'Visual Signals', 14, y, fontLoaded);
            const tableData = data.pixelLogicSignals?.map((s: { label?: string; description?: string; detectedValue?: string; risk?: string }) => [
                this.fixArabic(s.label || ''),
                this.fixArabic(s.description || ''),
                this.fixArabic(s.detectedValue || ''),
                this.fixArabic((translations.AiInspector as Record<string, any> | undefined)?.[`risk_${(s.risk || 'low').toLowerCase()}`] || s.risk?.toUpperCase() || s.risk || '')
            ]) || [];

            await this.addAutoTable(doc, {
                head: [[
                    translations.AiInspector?.col_signal || 'Signal',
                    translations.AiInspector?.col_desc || 'Description',
                    translations.AiInspector?.col_value || 'Value',
                    translations.AiInspector?.col_risk || 'Risk'
                ]],
                body: tableData,
                startY: y + 8,
                fontLoaded,
                logoBase64,
                translations,
                columnStyles: {
                    0: { cellWidth: 35 },
                    1: { cellWidth: 'auto' },
                    2: { cellWidth: 35 },
                    3: { cellWidth: 25, halign: 'center' }
                },
                didDrawPage: (data) => {
                    if (data.pageNumber > 1) {
                        this.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);
                    }
                }
            });

            if (data.deepMl) {
                y = (doc as AutoTablejsPDF).lastAutoTable?.finalY || y + 50;
                if (y > 220) { doc.addPage(); y = 30; this.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded); }
                else { y += 15; }

                this.drawHeading(doc, translations.AiInspector?.biometric_scouts || 'Biometric & Deep ML Signals', 14, y, fontLoaded);

                const mlData: string[][] = [];
                // Biometrics
                const faceAnomalies = data.deepMl.biometrics?.faceAnomalies || [];
                const handAnomalies = data.deepMl.biometrics?.handAnomalies || [];
                const allAnomalies = [...faceAnomalies, ...handAnomalies];
                if (allAnomalies.length > 0) {
                    allAnomalies.forEach((a: { name?: string; id?: string }) => {
                        mlData.push([
                            this.fixArabic(translations.AiInspector?.anatomy_consistency || 'Anatomy Consistency'),
                            this.fixArabic(a.name || a.id || ''),
                            this.fixArabic(translations.AiInspector?.anomaly_detected || 'Anomaly Detected'),
                            this.fixArabic(translations.AiInspector?.risk_high || 'High')
                        ]);
                    });
                } else {
                    mlData.push([
                        this.fixArabic(translations.AiInspector?.anatomy_consistency || 'Anatomy Consistency'),
                        this.fixArabic(translations.AiInspector?.none || 'None'),
                        this.fixArabic(translations.AiInspector?.anomaly_low_risk || 'No Anomalies'),
                        this.fixArabic(translations.AiInspector?.risk_low || 'Low')
                    ]);
                }

                // OCR
                if (data.deepMl.ocr) {
                    mlData.push([
                        this.fixArabic(translations.AiInspector?.ocr_detect || 'OCR Text Layer'),
                        this.fixArabic(data.deepMl.ocr.text ? 'Text found' : 'No text'),
                        this.fixArabic(data.deepMl.ocr.isGarbled ? 'Suspicious / Garbled' : 'Clean'),
                        this.fixArabic(data.deepMl.ocr.isGarbled ? (translations.AiInspector?.risk_medium || 'Medium') : (translations.AiInspector?.risk_low || 'Low'))
                    ]);
                }

                // Watermarks
                if (data.deepMl.watermarks && data.deepMl.watermarks.length > 0) {
                    data.deepMl.watermarks.forEach((w: { name?: string; id?: string }) => {
                        mlData.push([
                            this.fixArabic(translations.AiInspector?.detected_ai_signature || 'AI Watermark'),
                            this.fixArabic(w.name || w.id || ''),
                            this.fixArabic('Detected'),
                            this.fixArabic(translations.AiInspector?.risk_high || 'High')
                        ]);
                    });
                }

                await this.addAutoTable(doc, {
                    head: [[
                        translations.AiInspector?.col_feature || 'Feature',
                        translations.AiInspector?.col_detail || 'Detail',
                        translations.AiInspector?.col_status || 'Status',
                        translations.AiInspector?.col_risk || 'Risk'
                    ]],
                    body: mlData,
                    startY: y + 8,
                    fontLoaded,
                    logoBase64,
                    translations,
                    columnStyles: {
                        0: { cellWidth: 35 },
                        1: { cellWidth: 'auto' },
                        2: { cellWidth: 35 },
                        3: { cellWidth: 25, halign: 'center' }
                    }
                });
            }
        } else if (mode === 'video' && data) {
            this.drawHeading(doc, translations.AiInspector?.frame_analysis || 'Video Frame Analysis', 14, y, fontLoaded);
            const tableData = data.frameAnomalies?.map((f: { timestamp?: string | number; type?: string; severity?: number; description?: string }) => [
                f.timestamp,
                this.fixArabic(f.type || ''),
                `${((f.severity ?? 0) * 100).toFixed(1)}%`,
                this.fixArabic(f.description || '')
            ]) || [];

            await this.addAutoTable(doc, {
                head: [[
                    translations.AiInspector?.col_time || 'Timestamp',
                    translations.AiInspector?.col_anomaly || 'Anomaly Type',
                    translations.AiInspector?.col_severity || 'Severity',
                    translations.AiInspector?.col_desc || 'Description'
                ]],
                body: tableData,
                startY: y + 8,
                fontLoaded,
                logoBase64,
                translations
            });
        }

        this.finalizePDF(doc, title, translations, fontLoaded);
    }

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
    // PRIVATE HELPERS: PDF CORE
    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

    private static async initPDF(logoUrl?: string) {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', hotfixes: ["px_line_height"] });
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        let fontLoaded = false;
        try {
            doc.addFileToVFS('Amiri-Regular.ttf', AMIRI_FONT_BASE64);
            doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
            fontLoaded = true;
        } catch (e) {
            console.warn('Amiri font loading failed from local bundle', e);
        }

        const logoBase64 = await this.loadLogo(logoUrl);

        return { doc, pageWidth, pageHeight, fontLoaded, logoBase64 };
    }

    private static addCoverPage(doc: jsPDF, title: string, count: number, translations: ReportTranslations, logoBase64: string | null, fontLoaded: boolean) {
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        doc.setFillColor(...BRAND_DARK);
        doc.rect(0, 0, pageWidth, 70, 'F');

        if (logoBase64) {
            try { doc.addImage(logoBase64, 'PNG', pageWidth / 2 - 15, 15, 30, 30); } catch { /* */ }
        }

        doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text(this.fixArabic(translations.brand_name || 'ALMSTKSHF'), pageWidth / 2, 53, { align: 'center' });

        if (translations.brand_tagline) {
            doc.setFontSize(8);
            doc.setTextColor(220, 220, 220);
            doc.text(this.fixArabic(translations.brand_tagline), pageWidth / 2, 60, { align: 'center' });
        }

        doc.setFontSize(24);
        doc.setTextColor(...BRAND_DARK);
        doc.text(this.fixArabic(title.toUpperCase()), pageWidth / 2, pageHeight / 2 - 10, { align: 'center' });

        doc.setDrawColor(...BRAND_AMBER);
        doc.setLineWidth(1);
        doc.line(pageWidth / 4, pageHeight / 2, (pageWidth * 3) / 4, pageHeight / 2);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(this.fixArabic(`${translations.Reports?.generated_at || 'Issue Date'}: ${new Date().toLocaleDateString()}`), pageWidth / 2, pageHeight / 2 + 15, { align: 'center' });
        doc.text(this.fixArabic(`${translations.Reports?.data_points || 'Total Data Points'}: ${count}`), pageWidth / 2, pageHeight / 2 + 22, { align: 'center' });

        doc.setFillColor(...BRAND_DARK);
        doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    }

    private static async addAutoTable(doc: jsPDF, options: {
        head: string[][];
        body: any[];
        startY: number;
        fontLoaded: boolean;
        logoBase64: string | null;
        translations: ReportTranslations;
        didDrawPage?: (data: any) => void;
        didDrawCell?: (data: any) => void;
        columnStyles?: any;
    }) {
        const autoTable = (await import('jspdf-autotable')).default;

        // Process head and body cells to automatically apply fixArabic if they contain Arabic text
        const processedHead = options.head.map(row => row.map(cell => this.fixArabic(cell || '')));
        const sanitizedBody = (options.body || []).map((row: any) => {
            if (Array.isArray(row)) {
                return row.map((cell: any) => {
                    if (typeof cell === 'string') {
                        return this.fixArabic(cell);
                    }
                    return cell ?? '';
                });
            }
            return row;
        });

        const {
            fontLoaded,
            logoBase64,
            translations,
            ...autoTableOptions
        } = options;

        return autoTable(doc, {
            ...autoTableOptions,
            head: processedHead,
            body: sanitizedBody as any,
            margin: { horizontal: 10 },
            styles: {
                fontSize: 7.5,
                font: fontLoaded ? 'Amiri' : 'helvetica',
                cellPadding: { top: 2.5, bottom: 2.5, left: 2, right: 2 },
                overflow: 'linebreak', // Ensure long text wraps instead of pushing table width
                cellWidth: 'auto',    // Allow columns to shrink/expand based on content
                valign: 'middle'
            },
            headStyles: {
                fillColor: [31, 78, 120], // BRAND_DARK
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 8.5,
                cellPadding: { top: 3.5, bottom: 3.5, left: 2.5, right: 2.5 },
                valign: 'middle'
            },
            alternateRowStyles: {
                fillColor: [241, 245, 249] // Explicitly pass mutable array for ACCENT_BG
            },
            columnStyles: options.columnStyles || {
                // Default: Title columns often need more room, while numeric ones are small
                1: { cellWidth: 'auto', minCellWidth: 40 }, // Usually the Title column
            },
            didDrawCell: options.didDrawCell,
            didDrawPage: options.didDrawPage,
            didParseCell: (data) => {
                const text = String(data.cell.raw || '');
                const hasArabic = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
                if (data.section === 'body' && hasArabic) {
                    data.cell.styles.halign = 'right';
                }
                // Also align headers for Arabic
                if (data.section === 'head' && hasArabic) {
                    data.cell.styles.halign = 'right';
                }
            }
        });
    }

    private static finalizePDF(doc: jsPDF, title: string, translations: ReportTranslations, fontLoaded: boolean, returnOnly = false) {
        const pages = doc.getNumberOfPages();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        const isArabicMode = /[\u0600-\u06FF]/.test(translations.Reports?.pr_title || '') || /[\u0600-\u06FF]/.test(title);

        for (let i = 1; i <= pages; i++) {
            doc.setPage(i);
            doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(150);

            const brandInfo = this.fixArabic(`${translations.brand_name || 'ALMSTKSHF'} | ${title}`);
            const pageStr = translations.Reports?.page || 'Page';
            const pageInfo = this.fixArabic(`${pageStr} ${i} / ${pages}`);

            if (isArabicMode) {
                doc.text(brandInfo, pageWidth - 14, pageHeight - 10, { align: 'right' });
                doc.text(pageInfo, 14, pageHeight - 10, { align: 'left' });
            } else {
                doc.text(brandInfo, 14, pageHeight - 10);
                doc.text(pageInfo, pageWidth - 14, pageHeight - 10, { align: 'right' });
            }
        }

        if (returnOnly) return;

        const dateStr = new Date().toISOString().split('T')[0];
        doc.save(`${title.replace(/\s+/g, '_')}_${dateStr}.pdf`);
    }

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

    public static async exportMediaMonitoringReport(
        articles: ReportArticle[],
        translations: ReportTranslations,
        type: 'excel' | 'pdf',
        logoUrl?: string,
        chartImages?: { reportsChart?: string; emotionRadar?: string; sentimentDonut?: string; articlesTrend?: string }
    ) {
        if (type === 'excel') {
            await this.generateMediaMonitoringExcel(articles, translations, translations.report_title || 'Media_Monitoring_Report');
        } else {
            await this.generateMediaMonitoringPDF(articles, translations, logoUrl, translations.report_title, chartImages);
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

        const isArabicMode = /[\u0600-\u06FF]/.test(translations.Reports?.pr_title || '');
        if (isArabicMode) {
            sheet.views = [{ rightToLeft: true }];
        }

        sheet.columns = [
            { header: translations.date || 'Publication Date', key: 'date', width: 12 },
            { header: translations.title || 'Title', key: 'title', width: 50 },
            { header: translations.url || 'URL', key: 'url', width: 40 },
            { header: translations.type || 'Source Type', key: 'type', width: 15 },
            { header: translations.source || 'Source Name', key: 'source', width: 20 },
            { header: translations.publisher_username || 'Publisher Account Name', key: 'publisher_username', width: 22 },
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
                publisher_username: article.publisherUsername || '-',
                depth: article.depth || 'standard',
                country: article.sourceCountry,
                sentiment: article.sentiment,
                relevancy: article.relevancy_score !== undefined ? `${article.relevancy_score}%` : '-',
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
        sheet.getColumn('ave').numFmt = '"$"#,##0.00';

        await this.downloadWorkbook(workbook, reportName);
    }

    private static async generateMediaMonitoringPDF(
        articles: ReportArticle[],
        translations: ReportTranslations,
        logoUrl?: string,
        reportTitle?: string,
        chartImages?: { reportsChart?: string; emotionRadar?: string; sentimentDonut?: string; articlesTrend?: string }
    ) {
        if (typeof window === 'undefined') throw new Error('PDF export is client-only');

        const finalReportTitle = reportTitle || translations.report_title || 'Media Coverage Report';
        const isArabicMode = /[\u0600-\u06FF]/.test(translations.Reports?.pr_title || '') || /[\u0600-\u06FF]/.test(finalReportTitle);

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
            doc.addFileToVFS('Amiri-Regular.ttf', AMIRI_FONT_BASE64);
            doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
            fontLoaded = true;
        } catch (e) {
            console.warn('Amiri font loading failed from local bundle', e);
        }

        const logoBase64 = await this.loadLogo(logoUrl);

        // Pre-load images to base64 for up to top 50 articles using local CORS proxy
        const articlesWithImages = await Promise.all(articles.map(async (a, idx) => {
            if (idx >= 50 || !a.imageUrl) return a;
            if (a.imageUrl.startsWith('data:')) return a;

            try {
                const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(a.imageUrl)}`;
                const response = await fetch(proxyUrl);
                if (response.ok) {
                    const blob = await response.blob();
                    const reader = new FileReader();
                    const b64 = await new Promise<string>((resolve) => {
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(blob);
                    });
                    return { ...a, imageUrl: b64 };
                }
            } catch (e) {
                console.warn("Could not pre-load image for report:", a.imageUrl);
            }
            return a;
        }));

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
        addText(genText, pageWidth / 2, pageHeight / 2 + 15, { align: 'center' });
        addText(`${translations.total_articles || 'Total Articles'}: ${articles.length}`, pageWidth / 2, pageHeight / 2 + 24, { align: 'center' });

        const keyword = articles[0]?.keyword || 'N/A';
        const countriesList = [...new Set(articles.map(a => a.sourceCountry))].join(', ');
        const langs = 'EN / AR';

        doc.setFontSize(9);
        addText(
            `${translations.keyword_label || 'Keyword'}: "${keyword}"  |  ${translations.region_label || 'Region'}: ${countriesList}  |  ${translations.langs_label || 'Languages'}: ${langs}`,
            pageWidth / 2,
            pageHeight / 2 + 36,
            { align: 'center' }
        );

        doc.setFillColor(...BRAND_DARK);
        doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
        doc.setFontSize(8);
        doc.setTextColor(200, 200, 200);
        addText(`${translations.footer_url || 'www.almstkshf.com'}  |  ${translations.brand_name || 'المستكشف'}`, pageWidth / 2, pageHeight - 5, { align: 'center' });

        // PAGE 2
        doc.addPage();
        this.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

        let y = 28;
        doc.setFontSize(18);
        doc.setTextColor(...BRAND_DARK);
        if (isArabicMode) {
            addText(translations.summary_title || 'Executive Summary', pageWidth - 14, y, { align: 'right' });
        } else {
            addText(translations.summary_title || 'Executive Summary', 14, y);
        }
        y += 12;

        const totalReach = articles.reduce((sum, a) => sum + (a.reach || 0), 0);
        const totalAVE = articles.reduce((sum, a) => sum + (a.ave || 0), 0);
        const pos = articles.filter(a => a.sentiment === 'Positive').length;
        const neu = articles.filter(a => a.sentiment === 'Neutral').length;
        const neg = articles.filter(a => a.sentiment === 'Negative').length;

        const boxes = [
            { label: translations.total_reach || 'TOTAL REACH / IMPRESSIONS', value: totalReach.toLocaleString(), color: [31, 78, 120] as [number, number, number] },
            { label: translations.ad_value || 'ADVERTISING VALUE EQUIVALENT (AVE)', value: `${totalAVE.toLocaleString()}`, color: [218, 165, 32] as [number, number, number] },
            { label: translations.total_articles || 'TOTAL ARTICLES', value: articles.length.toString(), color: [16, 185, 129] as [number, number, number] },
        ];

        const activeBoxes = isArabicMode ? [...boxes].reverse() : boxes;
        this.drawMetricBoxes(doc, activeBoxes, y, pageWidth, fontLoaded);
        y += 38;

        doc.setFontSize(12);
        doc.setTextColor(...BRAND_DARK);
        if (isArabicMode) {
            addText(translations.sentiment_title || 'Sentiment Direction Distribution', pageWidth - 14, y, { align: 'right' });
        } else {
            addText(translations.sentiment_title || 'Sentiment Direction Distribution', 14, y);
        }
        y += 8;

        const sentimentData = [
            { label: translations.sentiment_pos || 'Positive Direction', count: pos, pct: articles.length ? Math.round(pos / articles.length * 100) : 0, color: [16, 185, 129] },
            { label: translations.sentiment_neu || 'Neutral Direction', count: neu, pct: articles.length ? Math.round(neu / articles.length * 100) : 0, color: [59, 130, 246] },
            { label: translations.sentiment_neg || 'Negative Direction', count: neg, pct: articles.length ? Math.round(neg / articles.length * 100) : 0, color: [244, 63, 94] },
        ];

        sentimentData.forEach((s) => {
            doc.setFontSize(9);
            doc.setTextColor(80);

            if (isArabicMode) {
                addText(`${s.label}: ${s.count} (${s.pct}%)`, pageWidth - 20, y + 5, { align: 'right' });
                doc.setFillColor(230, 230, 230);
                doc.roundedRect(pageWidth - 180, y + 1, 100, 5, 2, 2, 'F');
                if (s.pct > 0) {
                    doc.setFillColor(...(s.color as [number, number, number]));
                    const filledWidth = Math.max(s.pct, 2);
                    const barX = (pageWidth - 180) + 100 - filledWidth;
                    doc.roundedRect(barX, y + 1, filledWidth, 5, 2, 2, 'F');
                }
            } else {
                addText(`${s.label}: ${s.count} (${s.pct}%)`, 20, y + 5);
                doc.setFillColor(230, 230, 230);
                doc.roundedRect(70, y + 1, 100, 5, 2, 2, 'F');
                if (s.pct > 0) {
                    doc.setFillColor(...(s.color as [number, number, number]));
                    doc.roundedRect(70, y + 1, Math.max(s.pct, 2), 5, 2, 2, 'F');
                }
            }
            y += 10;
        });

        y += 10;
        doc.setFontSize(12);
        doc.setTextColor(...BRAND_DARK);
        if (isArabicMode) {
            addText(translations.ai_recommendation || 'AI Strategic Recommendation', pageWidth - 14, y, { align: 'right' });
        } else {
            addText(translations.ai_recommendation || 'AI Strategic Recommendation', 14, y);
        }
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

        doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
        const splitRec = doc.splitTextToSize(recommendation, pageWidth - 40);
        const processedRec = splitRec.map((line: string) => this.fixArabic(line));
        doc.setTextColor(80);
        if (isArabicMode) {
            doc.text(processedRec, pageWidth - 20, y + 10, { align: 'right' });
        } else {
            doc.text(processedRec, 20, y + 10, { align: 'left' });
        }

        // PAGE 3: Charts Page (only if chartImages are provided)
        if (chartImages && (chartImages.reportsChart || chartImages.sentimentDonut || chartImages.emotionRadar || chartImages.articlesTrend)) {
            doc.addPage();
            this.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

            let chartY = 28;
            doc.setFontSize(18);
            doc.setTextColor(...BRAND_DARK);
            if (isArabicMode) {
                addText(translations.Reports?.visualizations || 'Analytical Insights & Charts', pageWidth - 14, chartY, { align: 'right' });
            } else {
                addText(translations.Reports?.visualizations || 'Analytical Insights & Charts', 14, chartY);
            }
            chartY += 10;

            const trendImg = chartImages.reportsChart || chartImages.articlesTrend;
            if (trendImg) {
                try {
                    doc.addImage(trendImg, 'PNG', 14, chartY, pageWidth - 28, 65);
                    chartY += 75;
                } catch (e) {
                    console.warn("Error rendering trend chart in PDF:", e);
                }
            }

            // Draw donut and radar side-by-side if available
            if (chartImages.sentimentDonut || chartImages.emotionRadar) {
                const chartW = (pageWidth - 34) / 2;
                const chartH = 60;
                if (chartImages.sentimentDonut) {
                    try { doc.addImage(chartImages.sentimentDonut, 'PNG', 14, chartY, chartW, chartH); } catch (e) { }
                }
                if (chartImages.emotionRadar) {
                    try { doc.addImage(chartImages.emotionRadar, 'PNG', 14 + chartW + 6, chartY, chartW, chartH); } catch (e) { }
                }
            }
        }

        // PAGE 3+
        doc.addPage();
        this.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

        doc.setFontSize(14);
        doc.setTextColor(...BRAND_DARK);
        if (isArabicMode) {
            addText(translations.coverage_log || 'Media Coverage Log', pageWidth - 14, 28, { align: 'right' });
        } else {
            addText(translations.coverage_log || 'Media Coverage Log', 14, 28);
        }

        // Define columns dynamically to cleanly support dynamic sizing, custom alignments, and RTL mirroring
        const columnDefinitions = [
            {
                id: 'image',
                header: '',
                width: 8,
                halign: 'center',
                getValue: (a: ReportArticle) => ''
            },
            {
                id: 'date',
                header: translations.date || 'Date',
                width: 15,
                halign: 'center',
                getValue: (a: ReportArticle) => a.publishedDate ?? ''
            },
            {
                id: 'title',
                header: translations.title || 'Title',
                width: 'auto' as const,
                halign: isArabicMode ? 'right' : 'left',
                getValue: (a: ReportArticle) => {
                    const titleText = a.title ?? '';
                    const hashStr = Array.isArray(a.hashtags) && a.hashtags.length > 0 ? `\n#${a.hashtags.join(' #')}` : '';
                    return titleText + hashStr;
                }
            },
            {
                id: 'type',
                header: translations.type || 'Type',
                width: 14,
                halign: 'center',
                getValue: (a: ReportArticle) => a.sourceType ?? ''
            },
            {
                id: 'source',
                header: translations.source || 'Source',
                width: 18,
                halign: isArabicMode ? 'right' : 'left',
                getValue: (a: ReportArticle) => a.source ?? ''
            },
            {
                id: 'publisher_username',
                header: translations.publisher_username || 'Publisher',
                width: 18,
                halign: isArabicMode ? 'right' : 'left',
                getValue: (a: ReportArticle) => a.publisherUsername ?? '-'
            },
            {
                id: 'country',
                header: translations.country || 'Country',
                width: 11,
                halign: 'center',
                getValue: (a: ReportArticle) => a.sourceCountry ?? ''
            },
            {
                id: 'sentiment',
                header: translations.sentiment || 'Sentiment',
                width: 12,
                halign: 'center',
                getValue: (a: ReportArticle) => a.sentiment ?? ''
            },
            {
                id: 'relevancy',
                header: translations.relevancy || 'Relevancy',
                width: 10,
                halign: 'center',
                getValue: (a: ReportArticle) => a.relevancy_score !== undefined ? `${a.relevancy_score}%` : '-'
            },
            {
                id: 'reach',
                header: translations.reach || 'Reach',
                width: 14,
                halign: isArabicMode ? 'left' : 'right', // Numbers are LTR so align opposite in RTL
                getValue: (a: ReportArticle) => (a.reach ?? 0).toLocaleString()
            },
            {
                id: 'likes',
                header: translations.likes || 'Likes',
                width: 9,
                halign: isArabicMode ? 'left' : 'right',
                getValue: (a: ReportArticle) => a.likes !== undefined && a.likes !== null ? a.likes.toLocaleString() : '-'
            },
            {
                id: 'retweets',
                header: translations.retweets || 'Retweets',
                width: 9,
                halign: isArabicMode ? 'left' : 'right',
                getValue: (a: ReportArticle) => a.retweets !== undefined && a.retweets !== null ? a.retweets.toLocaleString() : '-'
            },
            {
                id: 'replies',
                header: translations.replies || 'Replies',
                width: 9,
                halign: isArabicMode ? 'left' : 'right',
                getValue: (a: ReportArticle) => a.replies !== undefined && a.replies !== null ? a.replies.toLocaleString() : '-'
            },
            {
                id: 'ave',
                header: translations.ave || 'AVE ($)',
                width: 14,
                halign: isArabicMode ? 'left' : 'right',
                getValue: (a: ReportArticle) => `${(a.ave ?? 0).toLocaleString()}`
            },
            {
                id: 'status',
                header: translations.status || 'Status',
                width: 14,
                halign: 'center',
                getValue: (a: ReportArticle) => a.status === 'in_progress' ? 'In Progress' : (a.status || 'Live')
            }
        ];

        const activeColumns = isArabicMode ? [...columnDefinitions].reverse() : columnDefinitions;

        const tableHead = [activeColumns.map(col => col.header)];
        const tableBody = articlesWithImages.map(a => activeColumns.map(col => col.getValue(a)));

        const columnStyles: Record<number, { cellWidth: number | 'auto'; halign: string }> = {};
        activeColumns.forEach((col, idx) => {
            columnStyles[idx] = {
                cellWidth: col.width,
                halign: col.halign
            };
        });

        await this.addAutoTable(doc, {
            head: tableHead,
            body: tableBody as (string | number | undefined)[][],
            startY: 33,
            fontLoaded,
            logoBase64,
            translations,
            didDrawPage: () => {
                this.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);
            },
            columnStyles,
            didDrawCell: (data: any) => {
                const imageColIndex = activeColumns.findIndex(col => col.id === 'image');
                if (data.column.index === imageColIndex && data.cell.section === 'body' && articlesWithImages[data.row.index]?.imageUrl) {
                    const img = articlesWithImages[data.row.index].imageUrl;
                    if (img && img.startsWith('data:')) {
                        try {
                            const matches = img.match(/^data:image\/([a-zA-Z+]+);base64,/);
                            const format = matches ? matches[1].toUpperCase() : 'JPEG';
                            const padding = 1.5;
                            doc.addImage(
                                img,
                                format === 'PNG' ? 'PNG' : 'JPEG',
                                data.cell.x + padding,
                                data.cell.y + padding,
                                data.cell.width - (padding * 2),
                                data.cell.height - (padding * 2)
                            );
                        } catch (e) {
                            // Skip if image is invalid
                        }
                    }
                }
            }
        });

        this.finalizePDF(doc, finalReportTitle, translations, fontLoaded);
    }


    // PRIVATE HELPERS: COMMON UI
    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

    private static drawHeading(doc: jsPDF, text: string, x: number, y: number, fontLoaded: boolean) {
        doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(...BRAND_DARK);
        const processed = this.fixArabic(text);
        if (isArabic(text)) {
            const pageWidth = doc.internal.pageSize.width;
            doc.text(processed, pageWidth - x, y, { align: 'right' });
        } else {
            doc.text(processed, x, y);
        }
    }

    private static drawMetricBoxes(doc: jsPDF, boxes: { label: string, value: string, color: readonly [number, number, number] | [number, number, number] }[], y: number, pageWidth: number, fontLoaded: boolean) {
        const boxW = (pageWidth - 40) / boxes.length;
        boxes.forEach((box, i) => {
            const x = 14 + i * (boxW + 6);
            doc.setFillColor(...ACCENT_BG);
            doc.roundedRect(x, y, boxW, 25, 2, 2, 'F');
            doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(100);
            doc.text(this.fixArabic(box.label), x + boxW / 2, y + 8, { align: 'center' });
            doc.setFontSize(14);
            doc.setTextColor(...(box.color as [number, number, number]));
            doc.text(this.fixArabic(box.value), x + boxW / 2, y + 18, { align: 'center' });
        });
    }

    private static addPageHeader(doc: jsPDF, logoBase64: string | null, pageWidth: number, translations: ReportTranslations, fontLoaded: boolean) {
        doc.setFillColor(...BRAND_DARK);
        doc.rect(0, 0, pageWidth, 15, 'F');
        
        const isHeaderArabic = isArabic(translations.brand_name || 'ALMSTKSHF');
        
        if (logoBase64) {
            try { 
                const logoX = isHeaderArabic ? pageWidth - 16 : 5;
                doc.addImage(logoBase64, 'PNG', logoX, 2, 11, 11); 
            } catch { /* */ }
        }
        
        doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
        doc.setTextColor(255);
        doc.setFontSize(10);
        
        const headerText = translations.brand_name || 'ALMSTKSHF';
        if (isHeaderArabic) {
            doc.text(this.fixArabic(headerText), pageWidth - 18, 9, { align: 'right' });
        } else {
            doc.text(this.fixArabic(headerText), 18, 9);
        }
    }

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
    // EXCEL EXPORT (Unified)
    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

    private static async generateDarkWebExcel(results: DarkWebResult[], translations: ReportTranslations, title: string) {
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Dark Web Results');

        const isArabicMode = /[\u0600-\u06FF]/.test(translations.DarkWeb?.tab_label || '');
        if (isArabicMode) {
            sheet.views = [{ rightToLeft: true }];
        }

        sheet.columns = [
            { header: translations.Reports?.col_date || 'Publication Date', key: 'date', width: 15 },
            { header: translations.Reports?.col_title || 'Title', key: 'title', width: 40 },
            { header: translations.Reports?.col_source || 'Source', key: 'source', width: 15 },
            { header: translations.Reports?.col_url || 'URL', key: 'url', width: 30 },
            { header: translations.DarkWeb?.col_risk || 'Risk Level', key: 'risk_level', width: 15 },
            { header: translations.Reports?.col_summary || 'AI Analysis Summary', key: 'summary', width: 50 },
            { header: translations.Reports?.col_tags || 'Signal Tags', key: 'tags', width: 20 }
        ];

        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };

        results.forEach(r => {
            sheet.addRow({
                date: r.discovered_at ? new Date(r.discovered_at).toLocaleDateString() : '',
                title: r.title,
                source: r.source_type,
                url: r.url,
                risk_level: r.risk_level,
                summary: r.summary,
                tags: Array.isArray(r.tags) ? r.tags.join(', ') : (r.tags || '')
            });
        });

        await this.downloadWorkbook(workbook, title);
    }

    private static async generateExcel(articles: ReportArticle[], translations: ReportTranslations, title: string, returnOnly = false): Promise<Blob | void> {
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Report');

        // Pre-load images to base64 using local CORS-bypassing proxy (limit to 100 for Excel to prevent massive file bloat)
        const articlesWithImages = await Promise.all(articles.slice(0, 100).map(async (a) => {
            if (!a.imageUrl) return a;
            if (a.imageUrl.startsWith('data:')) return a;

            try {
                const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(a.imageUrl)}`;
                const response = await fetch(proxyUrl);
                if (response.ok) {
                    const blob = await response.blob();
                    const reader = new FileReader();
                    const b64 = await new Promise<string>((resolve) => {
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(blob);
                    });
                    return { ...a, imageUrl: b64 };
                }
            } catch (e) {
                console.warn("Could not pre-load image for excel:", a.imageUrl);
            }
            return a;
        }));

        // Detect if we should use RTL for the sheet
        const isArabicMode = /[\u0600-\u06FF]/.test(translations.Reports?.pr_title || '');
        if (isArabicMode) {
            sheet.views = [{ rightToLeft: true }];
        }

        sheet.columns = [
            { header: translations.Reports?.col_image || 'Image', key: 'image', width: 15 },
            { header: translations.Reports?.col_date || translations.date || 'Publication Date', key: 'date', width: 15 },
            { header: translations.Reports?.col_title || translations.title || 'Title', key: 'title', width: 50 },
            { header: translations.type || 'Source Type', key: 'type', width: 20 },
            { header: translations.Reports?.col_source || translations.source || 'Source', key: 'source', width: 20 },
            { header: translations.publisher_username || 'Publisher Account Name', key: 'publisher_username', width: 25 },
            { header: translations.Reports?.col_reach || translations.reach || 'Reach / Impressions', key: 'reach', width: 15 },
            { header: translations.Reports?.col_ave || translations.ave || 'AVE (Advertising Value Equivalent)', key: 'ave', width: 15 },
        ];

        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };

        articlesWithImages.forEach(a => {
            const row = sheet.addRow({
                image: '', // Image placeholder
                date: a.publishedDate,
                title: a.title,
                type: a.sourceType || '',
                source: a.source || '',
                publisher_username: a.publisherUsername || '',
                reach: a.reach,
                ave: a.ave
            });
            row.height = 40; // Expand height for thumbnail
            row.alignment = { vertical: 'middle', wrapText: true };

            if (a.imageUrl && a.imageUrl.startsWith('data:')) {
                try {
                    const matches = a.imageUrl.match(/^data:image\/([a-zA-Z+]+);base64,/);
                    const format = matches ? matches[1].toLowerCase() : 'jpeg';
                    const base64Data = a.imageUrl.split(',')[1];

                    const imageId = workbook.addImage({
                        base64: base64Data,
                        extension: format === 'png' ? 'png' : 'jpeg',
                    });

                    sheet.addImage(imageId, {
                        tl: { col: 0, row: row.number - 1 }, // 0-indexed positioning relative to cell corner
                        ext: { width: 45, height: 45 }
                    });
                } catch (e) {
                    console.warn("Could not embed image into excel sheet", e);
                }
            }
        });

        // Add remaining articles without images
        articles.slice(100).forEach(a => {
            const row = sheet.addRow({
                image: '',
                date: a.publishedDate,
                title: a.title,
                type: a.sourceType || '',
                source: a.source || '',
                publisher_username: a.publisherUsername || '',
                reach: a.reach,
                ave: a.ave
            });
            row.alignment = { vertical: 'middle', wrapText: true };
        });

        if (returnOnly) {
            const buffer = await workbook.xlsx.writeBuffer();
            return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        }

        await this.downloadWorkbook(workbook, title);
    }

    private static async generateOsintHistoryExcel(items: OsintResult[], translations: ReportTranslations, title: string) {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('OSINT History');

        sheet.columns = [
            { header: translations.Reports?.col_time || 'Timestamp', key: 'time', width: 25 },
            { header: translations.Reports?.investigation_target || 'Investigation Target', key: 'target', width: 30 },
            { header: translations.Reports?.investigation_type || 'Investigation Type', key: 'type', width: 15 },
            { header: translations.Reports?.data_points || 'Total Data Points', key: 'attrs', width: 15 },
        ];

        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };

        items.forEach(item => {
            sheet.addRow({
                time: new Date(item.createdAt || Date.now()).toLocaleString(),
                target: item.query,
                type: item.type.toUpperCase(),
                attrs: typeof item.result === 'object' ? Object.keys(item.result).length : 1
            });
        });

        await this.downloadWorkbook(workbook, title);
    }

    private static async generateAiInspectorExcel(mode: string, data: AiInspectorData, translations: ReportTranslations, title: string) {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Forensic Report');

        const modeTrans = translations.AiInspector?.[`mode_${mode}`] || mode.toUpperCase();
        const localizedRiskLevel = (translations.AiInspector as Record<string, any> | undefined)?.[`risk_${data.overallRisk?.toLowerCase()}`] || data.overallRisk?.toUpperCase() || 'LOW';

        // Summary Section
        sheet.addRow([translations.AiInspector?.results_summary || 'Analysis Results']).font = { bold: true, size: 14 };
        sheet.addRow([translations.AiInspector?.label_mode || 'MODE', modeTrans]);
        sheet.addRow([translations.AiInspector?.label_risk || 'RISK LEVEL', localizedRiskLevel]);
        sheet.addRow([translations.AiInspector?.label_confidence || 'CONFIDENCE', `${(data.confidenceScore || 0).toFixed(1)}%`]);
        sheet.addRow([]);

        if (mode === 'text') {
            sheet.addRow([translations.AiInspector?.linguistic_signals || 'Linguistic Signals']).font = { bold: true };
            const subHeader = sheet.addRow([
                translations.AiInspector?.col_sentence || 'Sentence Segment',
                translations.AiInspector?.col_flags || 'Detected Flags',
                translations.AiInspector?.col_ai_prob || 'AI Probability'
            ]);
            subHeader.font = { bold: true };

            data.sentenceBreakdown?.forEach((s) => {
                sheet.addRow([
                    s.text,
                    s.flags.join(', ') || translations.AiInspector?.none || 'None',
                    `${((s.aiProbability ?? 0) * 100).toFixed(1)}%`
                ]);
            });
        } else if (mode === 'image') {
            sheet.addRow([translations.AiInspector?.visual_signals || 'Visual Signals']).font = { bold: true };
            const subHeader = sheet.addRow([
                translations.AiInspector?.col_signal || 'Signal',
                translations.AiInspector?.col_desc || 'Description',
                translations.AiInspector?.col_value || 'Value',
                translations.AiInspector?.col_risk || 'Risk'
            ]);
            subHeader.font = { bold: true };

            data.pixelLogicSignals?.forEach((s) => {
                sheet.addRow([
                    s.label,
                    s.description,
                    s.detectedValue,
                    translations.AiInspector?.[`risk_${s.risk?.toLowerCase()}`] || s.risk
                ]);
            });

            if (data.deepMl) {
                sheet.addRow([]);
                sheet.addRow([translations.AiInspector?.biometric_scouts || 'Biometric & Deep ML Signals']).font = { bold: true };
                const mlSubHeader = sheet.addRow([
                    translations.AiInspector?.col_feature || 'Feature',
                    translations.AiInspector?.col_detail || 'Detail',
                    translations.AiInspector?.col_status || 'Status',
                    translations.AiInspector?.col_risk || 'Risk'
                ]);
                mlSubHeader.font = { bold: true };

                const faceAnomalies = data.deepMl.biometrics?.faceAnomalies || [];
                const handAnomalies = data.deepMl.biometrics?.handAnomalies || [];
                const allAnomalies = [...faceAnomalies, ...handAnomalies];

                if (allAnomalies.length > 0) {
                    allAnomalies.forEach((a) => {
                        sheet.addRow([
                            translations.AiInspector?.anatomy_consistency || 'Anatomy Consistency',
                            a.name || a.id,
                            translations.AiInspector?.anomaly_detected || 'Anomaly Detected',
                            translations.AiInspector?.risk_high || 'High'
                        ]);
                    });
                } else {
                    sheet.addRow([
                        translations.AiInspector?.anatomy_consistency || 'Anatomy Consistency',
                        translations.AiInspector?.none || 'None',
                        translations.AiInspector?.anomaly_low_risk || 'No Anomalies',
                        translations.AiInspector?.risk_low || 'Low'
                    ]);
                }

                if (data.deepMl.ocr) {
                    sheet.addRow([
                        translations.AiInspector?.ocr_detect || 'OCR Text Layer',
                        data.deepMl.ocr.text ? 'Text found' : 'No text',
                        data.deepMl.ocr.isGarbled ? 'Suspicious / Garbled' : 'Clean',
                        data.deepMl.ocr.isGarbled ? (translations.AiInspector?.risk_medium || 'Medium') : (translations.AiInspector?.risk_low || 'Low')
                    ]);
                }

                if (data.deepMl.watermarks && data.deepMl.watermarks.length > 0) {
                    data.deepMl.watermarks.forEach((w) => {
                        sheet.addRow([
                            translations.AiInspector?.detected_ai_signature || 'AI Watermark',
                            w.name || w.id,
                            'Detected',
                            translations.AiInspector?.risk_high || 'High'
                        ]);
                    });
                }
            }
        } else if (mode === 'video') {
            sheet.addRow([translations.AiInspector?.frame_analysis || 'Video Frame Analysis']).font = { bold: true };
            const subHeader = sheet.addRow([
                translations.AiInspector?.col_time || 'Timestamp',
                translations.AiInspector?.col_anomaly || 'Anomaly Type',
                translations.AiInspector?.col_severity || 'Severity',
                translations.AiInspector?.col_desc || 'Description'
            ]);
            subHeader.font = { bold: true };

            data.frameAnomalies?.forEach((f) => {
                sheet.addRow([
                    f.timestamp,
                    f.type,
                    `${((f.severity ?? 0) * 100).toFixed(1)}%`,
                    f.description
                ]);
            });
        }

        // Apply basic styling
        sheet.getColumn(1).width = 40;
        sheet.getColumn(2).width = 40;
        sheet.getColumn(3).width = 15;
        if (mode === 'video') sheet.getColumn(4).width = 40;

        await this.downloadWorkbook(workbook, `${title}_${modeTrans}`);
    }

    private static async downloadWorkbook(workbook: ExcelJS.Workbook, title: string) {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const dateStr = new Date().toISOString().split('T')[0];
        link.download = `${title.replace(/\s+/g, '_')}_${dateStr}.xlsx`;
        link.click();
    }

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
    // SHARED UTILS (Arabic & Logo)
    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

    private static fixArabic(text: string): string {
        return fixArabicForPDF(text);
    }

    private static async loadLogo(logoUrl?: string): Promise<string | null> {
        try {
            const urlToFetch = logoUrl
                ? (logoUrl.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(logoUrl)}` : logoUrl)
                : '/logo.png';
            const res = await fetch(urlToFetch);
            if (!res.ok) {
                if (logoUrl) {
                    const fallbackRes = await fetch('/logo.png');
                    if (!fallbackRes.ok) return null;
                    const blob = await fallbackRes.blob();
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                        reader.readAsDataURL(blob);
                    });
                }
                return null;
            }
            const blob = await res.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(blob);
            });
        } catch {
            if (logoUrl) {
                try {
                    const fallbackRes = await fetch('/logo.png');
                    if (fallbackRes.ok) {
                        const blob = await fallbackRes.blob();
                        return new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                            reader.readAsDataURL(blob);
                        });
                    }
                } catch { }
            }
            return null;
        }
    }

    private static arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
}

