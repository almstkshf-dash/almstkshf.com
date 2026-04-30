/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import ExcelJS from 'exceljs';
import type { jsPDF } from 'jspdf';
import { ReportTranslations, AiInspectorData, DarkWebResult, TerroristListItem } from '@/types/reports';
// import { fixArabicForPDF, isArabic } from '@/utils/arabic-utils';

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
    source?: string;
    sourceType?: string;
    sentiment?: string;
    reach?: number;
    ave?: number;
    content?: string;
    [key: string]: unknown;
}

export interface DeepWebRun {
    _id: string;
    _creationTime: number;
    status: string;
    source?: string;
    articlesCount?: number;
    errorMessage?: string;
}

export interface OsintResult {
    _id?: string;
    query: string;
    type: string;
    result: Record<string, unknown> | unknown[];
    createdAt?: number;
    timestamp?: number;
}

// -------------------------------------------------------------------------------------------------
// CONSTANTS & COLORS
// -------------------------------------------------------------------------------------------------

const BRAND_DARK = [31, 78, 120] as const;
const BRAND_AMBER = [218, 165, 32] as const;
const ACCENT_BG = [241, 245, 249] as const;

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
    public async generatePDF(): Promise<Blob> {
        const title = this.translations.Reports?.pr_title || 'Media Monitoring Report';
        const result = await ReportGenerator.generatePressReleasePDF(this.articles, this.translations, title, true);
        return result.doc.output('blob');
    }

    /**
     * Generate Excel as a Blob
     */
    public async generateExcel(): Promise<Blob> {
        const title = this.translations.Reports?.pr_title || 'Media Monitoring Report';
        return await ReportGenerator.generateExcel(this.articles, this.translations, title, true);
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
        const title = translations.Reports?.pr_title || 'Press Release Coverage Report';
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
        const { doc, pageWidth, fontLoaded, logoBase64 } = await this.initPDF();
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
            translations
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
        const { doc, pageWidth, fontLoaded, logoBase64 } = await this.initPDF();

        // Cover Page
        this.addCoverPage(doc, title, results.length, translations, logoBase64, fontLoaded);

        doc.addPage();
        this.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

        let y = 30;
        this.drawHeading(doc, translations.DarkWeb?.tab_label || 'Dark Web Search Results', 14, y, fontLoaded);
        y += 10;

        const tableData = results.map(r => [
            r.publishedDate ? new Date(r.publishedDate).toLocaleDateString() : '',
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
            translations
        });

        this.finalizePDF(doc, title, translations, fontLoaded);
    }

    private static async generatePressReleasePDF(articles: ReportArticle[], translations: ReportTranslations, title: string, returnOnly = false) {
        const { doc, pageWidth, pageHeight, fontLoaded, logoBase64 } = await this.initPDF();

        // Cover Page
        this.addCoverPage(doc, title, articles.length, translations, logoBase64, fontLoaded);

        // Summary Page with Reach/AVE charts
        doc.addPage();
        this.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

        let y = 30;
        this.drawHeading(doc, translations.Reports?.summary || 'Metrics Summary', 14, y, fontLoaded);
        y += 12;

        const totalReach = articles.reduce((sum, a) => sum + (a.reach || 0), 0);
        const totalAVE = articles.reduce((sum, a) => sum + (a.ave || 0), 0);

        this.drawMetricBoxes(doc, [
            { label: translations.Reports?.total_reach || 'TOTAL REACH', value: totalReach.toLocaleString(), color: BRAND_DARK },
            { label: translations.Reports?.total_ave || 'AD VALUE (AVE)', value: `$${totalAVE.toLocaleString()}`, color: BRAND_AMBER },
            { label: translations.Reports?.article_count || 'TOTAL ARTICLES', value: articles.length.toString(), color: [16, 185, 129] }
        ], y, pageWidth, fontLoaded);
        y += 40;

        // Article Table
        this.drawHeading(doc, translations.Reports?.coverage_details || 'Coverage Details', 14, y, fontLoaded);

        const tableData = articles.map(a => [
            a.publishedDate || '',
            this.fixArabic(a.title),
            a.source || '',
            (a.reach || 0).toLocaleString(),
            `$${(a.ave || 0).toLocaleString()}`
        ]);

        await this.addAutoTable(doc, {
            head: [[
                translations.Reports?.col_date || 'Date',
                translations.Reports?.col_title || 'Title',
                translations.Reports?.col_source || 'Source',
                translations.Reports?.col_reach || 'Reach',
                translations.Reports?.col_ave || 'AVE'
            ]],
            body: tableData,
            startY: y + 8,
            fontLoaded,
            logoBase64,
            translations
        });

        this.finalizePDF(doc, title, translations, fontLoaded, returnOnly);
        return { doc, pageWidth, pageHeight, fontLoaded, logoBase64 };
    }

    private static async generateDeepWebPDF(runs: DeepWebRun[], threats: ReportArticle[], translations: ReportTranslations, title: string) {
        const { doc, pageWidth, fontLoaded, logoBase64 } = await this.initPDF();

        this.addCoverPage(doc, title, threats.length, translations, logoBase64, fontLoaded);

        // Ingestion Logs Section
        doc.addPage();
        this.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

        let y = 30;
        this.drawHeading(doc, translations.Reports?.ingestion_logs || 'Ingestion Activity (Last 10 Runs)', 14, y, fontLoaded);

        const logsTable = runs.slice(0, 10).map(r => [
            new Date(r._creationTime).toLocaleString(),
            r.source || 'Generic',
            r.status.toUpperCase(),
            r.articlesCount?.toString() || '0'
        ]);

        await this.addAutoTable(doc, {
            head: [[
                translations.Reports?.col_time || 'Timestamp',
                translations.Reports?.col_source || 'Source',
                translations.Reports?.col_status || 'Status',
                translations.Reports?.col_count || 'Articles'
            ]],
            body: logsTable,
            startY: y + 8,
            fontLoaded,
            logoBase64,
            translations
        });

        // Identified Threats Section
        y = (doc as AutoTablejsPDF).lastAutoTable.finalY + 15;
        this.drawHeading(doc, translations.Reports?.identified_threats || 'High-Risk identified Threats', 14, y, fontLoaded);

        await this.addAutoTable(doc, {
            head: [[translations.Reports?.col_date || 'Date', translations.Reports?.col_title || 'Title', translations.Reports?.col_source || 'Source']],
            body: threats.map(a => [a.publishedDate || '', a.title, a.source || '']),
            startY: y + 8,
            fontLoaded,
            logoBase64,
            translations
        });
        y = (doc as AutoTablejsPDF).lastAutoTable.finalY + 15;

        this.finalizePDF(doc, title, translations, fontLoaded);
    }

    private static async generateOsintHistoryPDF(items: OsintResult[], translations: ReportTranslations, title: string) {
        const { doc, pageWidth, fontLoaded, logoBase64 } = await this.initPDF();

        this.addCoverPage(doc, title, items.length, translations, logoBase64, fontLoaded);

        doc.addPage();
        this.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

        const y = 30;
        this.drawHeading(doc, translations.OsintTab?.export_history || 'Investigation History', 14, y, fontLoaded);

        const tableData = items.map(item => [
            new Date(item.createdAt || item.timestamp || Date.now()).toLocaleString(),
            item.query,
            item.type.toUpperCase(),
            typeof item.result === 'object' ? Object.keys(item.result as Record<string, unknown>).length.toString() : '1'
        ]);

        await this.addAutoTable(doc, {
            head: [[
                translations.Reports?.col_time || 'Timestamp',
                translations.Reports?.investigation_target || 'Target',
                translations.Reports?.investigation_type || 'Type',
                translations.Reports?.data_points || 'Attributes'
            ]],
            body: tableData,
            startY: y + 8,
            fontLoaded,
            logoBase64,
            translations
        });

        this.finalizePDF(doc, title, translations, fontLoaded);
    }

    private static async generateOsintPDF(data: OsintResult, translations: ReportTranslations, title: string) {
        const { doc, pageWidth, fontLoaded, logoBase64 } = await this.initPDF();

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
        doc.text(data.query, 20, y);
        y += 8;
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`${translations.Reports?.investigation_type || 'Type'}: ${data.type.toUpperCase()}`, 20, y);
        y += 15;

        // Parse Results JSON into structured tables
        const result = data.result;
        if (result && typeof result === 'object') {
            // General Info Table
            const details = Object.entries(result)
                .filter(([, v]) => typeof v !== 'object')
                .slice(0, 25);

            if (details.length > 0) {
                this.drawHeading(doc, translations.Reports?.technical_details || 'Technical Attributes', 14, y, fontLoaded);
                await this.addAutoTable(doc, {
                    head: [[translations.Reports?.attribute || 'Attribute', translations.Reports?.value || 'Value']],
                    body: details.map(([k, v]) => [k, String(v)]),
                    startY: y + 8,
                    fontLoaded,
                    logoBase64,
                    translations
                });
                y = (doc as AutoTablejsPDF).lastAutoTable.finalY + 15;
            }

            // Entity Map
            const resultObj = result as Record<string, unknown>;
            const entities = (resultObj.entities || resultObj.associations || []) as Array<{ name?: string; type?: string; relevance?: string | number }>;

            await this.addAutoTable(doc, {
                head: [[
                    translations.Reports?.entity_name || 'Entity',
                    translations.Reports?.entity_type || 'Type',
                    translations.Reports?.relevance || 'Relevance'
                ]],
                body: entities.map((e) => [
                    e.name || 'Unknown',
                    e.type || 'N/A',
                    typeof e.relevance === 'number' ? `${(e.relevance * 100).toFixed(0)}%` : (e.relevance || 'N/A')
                ]),
                startY: y + 8,
                fontLoaded,
                logoBase64,
                translations
            });
            y = (doc as AutoTablejsPDF).lastAutoTable.finalY + 15;
        }

        this.finalizePDF(doc, title, translations, fontLoaded);
    }

    private static async generateAiInspectorPDF(mode: string, data: AiInspectorData, translations: ReportTranslations, title: string) {
        const { doc, pageWidth, fontLoaded, logoBase64 } = await this.initPDF();

        const modeTrans = translations.AiInspector?.[`mode_${mode}` as keyof typeof translations.AiInspector] || mode.toUpperCase();
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
        const rColor = colorMap[riskLevel?.toLowerCase()] || BRAND_DARK;

        const localizedRiskLevel = translations.AiInspector?.[`risk_${riskLevel?.toLowerCase()}` as keyof typeof translations.AiInspector] || riskLevel?.toUpperCase() || 'UNKNOWN';

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
                translations
            });
            y = (doc as AutoTablejsPDF).lastAutoTable?.finalY || y + 50;
        } else if (mode === 'image' && data) {
            this.drawHeading(doc, translations.AiInspector?.visual_signals || 'Visual Signals', 14, y, fontLoaded);
            const tableData = data.pixelLogicSignals?.map((s: { label?: string; description?: string; detectedValue?: string; risk?: string }) => [
                this.fixArabic(s.label),
                this.fixArabic(s.description),
                this.fixArabic(s.detectedValue),
                this.fixArabic(translations.AiInspector?.[`risk_${s.risk?.toLowerCase()}` as keyof typeof translations.AiInspector] || s.risk?.toUpperCase() || s.risk)
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
                            this.fixArabic(a.name || a.id),
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
                            this.fixArabic(w.name || w.id),
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
                    translations
                });
            }
        } else if (mode === 'video' && data) {
            this.drawHeading(doc, translations.AiInspector?.frame_analysis || 'Video Frame Analysis', 14, y, fontLoaded);
            const tableData = data.frameAnomalies?.map((f: { timestamp?: string | number; type?: string; severity?: number; description?: string }) => [
                f.timestamp,
                this.fixArabic(f.type),
                `${((f.severity ?? 0) * 100).toFixed(1)}%`,
                this.fixArabic(f.description)
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

    private static async initPDF() {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', hotfixes: ["px_line_height"] });
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        let fontLoaded = false;
        try {
            const fontUrl = 'https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHqUpvrIw74NL.ttf';
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout for font load

            const res = await fetch(fontUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (res.ok) {
                const arrayBuffer = await res.arrayBuffer();
                const base64 = this.arrayBufferToBase64(arrayBuffer);
                doc.addFileToVFS('Amiri-Regular.ttf', base64);
                doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
                fontLoaded = true;
            }
        } catch (e) {
            console.warn('Amiri font load failed or timed out. Falling back to system fonts.', e);
        }

        const logoBase64 = await this.loadLogo();

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
        doc.text(this.fixArabic(translations.brand_name || 'ALMSTKSHF'), pageWidth / 2, 55, { align: 'center' });

        doc.setFontSize(24);
        doc.setTextColor(...BRAND_DARK);
        doc.text(this.fixArabic(title.toUpperCase()), pageWidth / 2, pageHeight / 2 - 10, { align: 'center' });

        doc.setDrawColor(...BRAND_AMBER);
        doc.setLineWidth(1);
        doc.line(pageWidth / 4, pageHeight / 2, (pageWidth * 3) / 4, pageHeight / 2);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(this.fixArabic(`${translations.Reports?.generated_at || 'Generated'}: ${new Date().toLocaleDateString()}`), pageWidth / 2, pageHeight / 2 + 15, { align: 'center' });
        doc.text(this.fixArabic(`${translations.Reports?.data_points || 'Total Data Points'}: ${count}`), pageWidth / 2, pageHeight / 2 + 22, { align: 'center' });

        doc.setFillColor(...BRAND_DARK);
        doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    }

    private static async addAutoTable(doc: jsPDF, options: { head: string[][]; body: (string | number | undefined)[][]; startY: number; fontLoaded: boolean; logoBase64: string | null; translations: ReportTranslations }) {
        const autoTable = (await import('jspdf-autotable')).default;
        return autoTable(doc, {
            ...options,
            styles: {
                fontSize: 8,
                font: options.fontLoaded ? 'Amiri' : 'helvetica',
                cellPadding: 3,
            },
            headStyles: {
                fillColor: BRAND_DARK,
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: { fillColor: ACCENT_BG },
            didParseCell: (data) => {
                const text = String(data.cell.raw || '');
                if (data.section === 'body' && /[\u0600-\u06FF]/.test(text)) {
                    data.cell.styles.halign = 'right';
                }
                // Also align headers for Arabic
                if (data.section === 'head' && /[\u0600-\u06FF]/.test(text)) {
                    data.cell.styles.halign = 'right';
                }
            }
        });
    }

    private static finalizePDF(doc: jsPDF, title: string, translations: ReportTranslations, fontLoaded: boolean, returnOnly = false) {
        const pages = doc.getNumberOfPages();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        for (let i = 1; i <= pages; i++) {
            doc.setPage(i);
            doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(150);
            doc.text(this.fixArabic(`${translations.brand_name || 'ALMSTKSHF'} | ${title}`), 14, pageHeight - 10);
            const pageStr = translations.Reports?.page || 'Page';
            doc.text(this.fixArabic(`${pageStr} ${i} / ${pages}`), pageWidth - 14, pageHeight - 10, { align: 'right' });
        }

        if (returnOnly) return;

        const dateStr = new Date().toISOString().split('T')[0];
        doc.save(`${title.replace(/\s+/g, '_')}_${dateStr}.pdf`);
    }

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
    // PRIVATE HELPERS: COMMON UI
    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

    private static drawHeading(doc: jsPDF, text: string, x: number, y: number, fontLoaded: boolean) {
        doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(...BRAND_DARK);
        const processed = this.fixArabic(text);
        doc.text(processed, x, y);
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
        if (logoBase64) {
            try { doc.addImage(logoBase64, 'PNG', 5, 2, 11, 11); } catch { /* */ }
        }
        doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
        doc.setTextColor(255);
        doc.setFontSize(10);
        doc.text(this.fixArabic(translations.brand_name || 'ALMSTKSHF'), 18, 9);
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
            { header: translations.Reports?.col_date || 'Date', key: 'date', width: 15 },
            { header: translations.Reports?.col_title || 'Title', key: 'title', width: 40 },
            { header: translations.Reports?.col_source || 'Source', key: 'source', width: 15 },
            { header: translations.Reports?.col_url || 'URL', key: 'url', width: 30 },
            { header: translations.DarkWeb?.col_risk || 'Risk Assessment', key: 'risk_level', width: 15 },
            { header: translations.Reports?.col_summary || 'AI Summary', key: 'summary', width: 50 },
            { header: translations.Reports?.col_tags || 'Signal Tags', key: 'tags', width: 20 }
        ];

        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };

        results.forEach(r => {
            sheet.addRow({
                date: r.publishedDate ? new Date(r.publishedDate).toLocaleDateString() : '',
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

    private static async generateExcel(articles: ReportArticle[], translations: ReportTranslations, title: string, returnOnly = false): Promise<Blob | { doc: jsPDF }> {
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Report');

        // Detect if we should use RTL for the sheet
        const isArabicMode = /[\u0600-\u06FF]/.test(translations.Reports?.pr_title || '');
        if (isArabicMode) {
            sheet.views = [{ rightToLeft: true }];
        }

        sheet.columns = [
            { header: translations.Reports?.col_date || 'Date', key: 'date', width: 15 },
            { header: translations.Reports?.col_title || 'Title', key: 'title', width: 50 },
            { header: translations.Reports?.col_source || 'Source', key: 'source', width: 20 },
            { header: translations.Reports?.col_reach || 'Reach', key: 'reach', width: 15 },
            { header: translations.Reports?.col_ave || 'AVE ($)', key: 'ave', width: 15 },
        ];

        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };

        articles.forEach(a => {
            sheet.addRow({
                date: a.publishedDate,
                title: a.title,
                source: a.source,
                reach: a.reach,
                ave: a.ave
            });
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
            { header: translations.Reports?.investigation_target || 'Target', key: 'target', width: 30 },
            { header: translations.Reports?.investigation_type || 'Type', key: 'type', width: 15 },
            { header: translations.Reports?.data_points || 'Attributes', key: 'attrs', width: 15 },
        ];

        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };

        items.forEach(item => {
            sheet.addRow({
                time: new Date(item.createdAt || item.timestamp || Date.now()).toLocaleString(),
                target: item.query,
                type: item.type.toUpperCase(),
                attrs: typeof item.result === 'object' ? Object.keys(item.result).length : 1
            });
        });

        this.downloadWorkbook(workbook, title);
    }

    private static async generateAiInspectorExcel(mode: string, data: AiInspectorData, translations: ReportTranslations, title: string) {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Forensic Report');

        const modeTrans = translations.AiInspector?.[`mode_${mode}`] || mode.toUpperCase();
        const localizedRiskLevel = translations.AiInspector?.[`risk_${data.overallRisk?.toLowerCase()}`] || data.overallRisk?.toUpperCase() || 'LOW';

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

        this.downloadWorkbook(workbook, `${title}_${modeTrans}`);
    }

    static async exportOsintReport(history: OsintHistoryItem[], messages: Record<string, unknown>, format: 'pdf' | 'excel') {
        const translations = messages as ReportTranslations;
        const title = translations.Reports?.osint_title || 'OSINT Investigation History';

        if (format === 'pdf') {
            const doc = new jsPDF() as AutoTablejsPDF;
            const logo = await this.loadLogo();

            if (logo) {
                doc.addImage(logo, 'PNG', 10, 10, 30, 30);
            }

            doc.setFont('Amiri', 'bold');
            doc.setFontSize(22);
            doc.text(this.fixArabic(title), 105, 25, { align: 'center' });

            doc.setFontSize(10);
            const generatedAtText = translations.Reports?.generated_at || 'Generated at';
            doc.text(`${this.fixArabic(generatedAtText)}: ${new Date().toLocaleString()}`, 105, 35, { align: 'center' });

            const tableData = history.map((item) => [
                new Date(item.createdAt).toLocaleString(),
                item.type,
                item.query,
                'Success'
            ]);

            doc.autoTable({
                startY: 50,
                head: [[
                    this.fixArabic(translations.Reports?.col_date || 'Date'),
                    this.fixArabic(translations.Reports?.investigation_type || 'Type'),
                    this.fixArabic(translations.Reports?.investigation_target || 'Target'),
                    this.fixArabic(translations.Reports?.col_status || 'Status')
                ]],
                body: tableData,
                styles: { font: 'Amiri', halign: 'right' },
                headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            });

            doc.save(`OSINT_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } else {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('OSINT History');

            sheet.addRow([title]).font = { bold: true, size: 16 };
            sheet.addRow([`${translations.Reports?.generated_at || 'Generated at'}: ${new Date().toLocaleString()}`]);
            sheet.addRow([]);

            const headerRow = sheet.addRow([
                translations.Reports?.col_date || 'Date',
                translations.Reports?.investigation_type || 'Type',
                translations.Reports?.investigation_target || 'Target',
                translations.Reports?.col_status || 'Status'
            ]);
            headerRow.font = { bold: true };

            history.forEach((item) => {
                sheet.addRow([
                    new Date(item.createdAt).toLocaleString(),
                    item.type,
                    item.query,
                    'Success'
                ]);
            });

            sheet.getColumn(1).width = 25;
            sheet.getColumn(2).width = 15;
            sheet.getColumn(3).width = 40;
            sheet.getColumn(4).width = 15;

            this.downloadWorkbook(workbook, 'OSINT_History');
        }
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
        if (!text) return '';
        // If it doesn't contain Arabic, return as is
        if (!/[\u0600-\u06FF]/.test(text)) return text;

        const words = text.trim().split(/\s+/);
        // For jsPDF with Amiri font, we only need to reverse the word order
        // because it renders words LTR, but we want the overall flow to be RTL.
        // Reversing the individual letters is typically done for fonts that don't support Arabic,
        // but Amiri does. However, if the text is still showing as separate letters,
        // we might need a more advanced approach.
        return words.reverse().join(' ');
    }

    private static async loadLogo(): Promise<string | null> {
        try {
            const res = await fetch('/logo.png');
            if (!res.ok) return null;
            const blob = await res.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(blob);
            });
        } catch { return null; }
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

