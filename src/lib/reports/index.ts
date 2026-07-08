/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { PdfGenerators } from './pdf/PdfGenerators';
import { ExcelGenerators } from './excel/ExcelGenerators';
import { 
    ReportTranslations, 
    AiInspectorData, 
    DarkWebResult, 
    TerroristListItem, 
    DeepWebRun, 
    OsintResult, 
    ReportArticle 
} from './types';

/**
 * Sends the report payload to the server-side API to offload heavy compilation.
 * Triggers a native browser download once Vercel Blob returns the finished document URL.
 */
async function callServerReportAPI(
    reportType: string,
    format: string,
    payload: any,
    translations: ReportTranslations,
    extra: Record<string, any> = {}
): Promise<void> {
    try {
        const res = await fetch('/api/reports', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reportType,
                format,
                payload,
                translations,
                ...extra
            })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Server failed to generate report');
        }

        const data = await res.json();
        if (data.url && typeof window !== 'undefined') {
            const a = document.createElement('a');
            a.href = data.url;
            const ext = format === 'excel' ? 'xlsx' : format;
            const cleanTitle = (extra.customTitle || reportType).toLowerCase().replace(/\s+/g, '_');
            a.download = `${cleanTitle}-${Date.now()}.${ext}`;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    } catch (e) {
        console.error('[Reports Isomorphic Router] Failed server-side generation:', e);
        throw e;
    }
}

export class ReportGenerator {
    private articles: ReportArticle[];
    private translations: ReportTranslations;

    constructor(articles: ReportArticle[], translations: ReportTranslations) {
        this.articles = articles;
        this.translations = translations;
    }

    /**
     * Generate PDF as a Blob (instance method).
     */
    public async generatePDF(
        chartImages?: { reportsChart?: string; emotionRadar?: string; sentimentDonut?: string; articlesTrend?: string }
    ): Promise<Blob> {
        const title = this.translations.Reports?.pr_title || 'Media Coverage Report';
        const doc = await PdfGenerators.generatePressReleasePDF(this.articles, this.translations, title, true, chartImages);
        return doc.output('blob') as Blob;
    }

    /**
     * Generate Excel as a Blob (instance method).
     */
    public async generateExcel(): Promise<Blob> {
        const title = this.translations.Reports?.pr_title || 'Media Coverage Report';
        const blob = await ExcelGenerators.generateExcel(this.articles, this.translations, title, true);
        return blob as Blob;
    }

    /**
     * Generate CSV as a Blob (instance method).
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
        return new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    }

    // =========================================================================
    // STATIC EXPORTERS (Transparent Routing & Server-side Isomorphic Support)
    // =========================================================================

    public static async exportPressReleaseReport(
        articles: ReportArticle[], 
        translations: ReportTranslations, 
        format: 'pdf' | 'excel' = 'pdf',
        returnOnly = false
    ) {
        if (typeof window !== 'undefined' && !returnOnly) {
            return callServerReportAPI('press_release', format, articles, translations);
        }
        const title = translations.Reports?.pr_title || 'Press Release Coverage Report';
        if (format === 'excel') {
            return ExcelGenerators.generateExcel(articles, translations, title, returnOnly);
        }
        return PdfGenerators.generatePressReleasePDF(articles, translations, title, returnOnly);
    }

    public static async exportDeepWebReport(
        runs: DeepWebRun[], 
        threats: ReportArticle[] | Record<string, unknown>, 
        translations: ReportTranslations, 
        format: 'pdf' | 'excel' = 'pdf',
        returnOnly = false
    ) {
        if (typeof window !== 'undefined' && !returnOnly) {
            return callServerReportAPI('deep_web', format, { runs, threats }, translations);
        }
        const title = translations.Reports?.deep_title || 'Deep Web Risk Assessment';
        const threatList: ReportArticle[] = Array.isArray(threats) ? threats : [];
        if (format === 'excel') {
            return ExcelGenerators.generateExcel(threatList, translations, title, returnOnly);
        }
        return PdfGenerators.generateDeepWebPDF(runs, threatList, translations, title, returnOnly);
    }

    public static async exportDarkWebReport(
        results: DarkWebResult[], 
        translations: ReportTranslations, 
        format: 'pdf' | 'excel' = 'pdf',
        returnOnly = false
    ) {
        if (typeof window !== 'undefined' && !returnOnly) {
            return callServerReportAPI('dark_web', format, results, translations);
        }
        const title = translations.DarkWeb?.tab_label || 'Dark Web Search Results';
        if (format === 'excel') {
            return ExcelGenerators.generateDarkWebExcel(results, translations, title, returnOnly);
        }
        return PdfGenerators.generateDarkWebPDF(results, translations, title, returnOnly);
    }

    public static async exportOsintReport(
        items: OsintResult[], 
        translations: ReportTranslations, 
        format: 'pdf' | 'excel' = 'pdf',
        returnOnly = false
    ) {
        if (typeof window !== 'undefined' && !returnOnly) {
            return callServerReportAPI('osint', format, items, translations);
        }
        const title = translations.Reports?.osint_title || 'OSINT Technical Dossier';
        if (format === 'excel') {
            return ExcelGenerators.generateOsintHistoryExcel(items, translations, title, returnOnly);
        }
        return PdfGenerators.generateOsintHistoryPDF(items, translations, title, returnOnly);
    }

    public static async exportTerroristListReport(
        items: TerroristListItem[], 
        translations: ReportTranslations, 
        format: 'pdf' | 'excel' = 'pdf',
        returnOnly = false
    ) {
        if (typeof window !== 'undefined' && !returnOnly) {
            return callServerReportAPI('watchlist', format, items, translations);
        }
        const title = translations.TerroristList?.title || 'Watchlist Clearance Report';
        if (format === 'excel') {
            return ExcelGenerators.generateWatchlistExcel(items, translations, title, returnOnly);
        }
        return PdfGenerators.generateWatchlistPDF(items, translations, title, returnOnly);
    }

    public static async exportAiInspectorReport(
        mode: 'text' | 'image' | 'video', 
        data: AiInspectorData, 
        translations: ReportTranslations, 
        format: 'pdf' | 'excel' = 'pdf',
        returnOnly = false
    ) {
        if (typeof window !== 'undefined' && !returnOnly) {
            return callServerReportAPI('ai_inspector', format, { mode, data }, translations);
        }
        const title = translations.AiInspector?.results_summary || 'AI Forensic Analysis Report';
        if (format === 'excel') {
            return ExcelGenerators.generateAiInspectorExcel(mode, data, translations, title, returnOnly);
        }
        return PdfGenerators.generateAiInspectorPDF(mode, data, translations, title, returnOnly);
    }

    public static async exportMediaMonitoringReport(
        articles: ReportArticle[],
        translations: ReportTranslations,
        type: 'excel' | 'pdf',
        logoUrl?: string,
        chartImages?: { reportsChart?: string; emotionRadar?: string; sentimentDonut?: string; articlesTrend?: string },
        searchKeyword?: string,
        customTitle?: string,
        returnOnly = false
    ) {
        if (typeof window !== 'undefined' && !returnOnly) {
            return callServerReportAPI('media_monitoring', type, articles, translations, {
                logoUrl,
                chartImages,
                searchKeyword,
                customTitle
            });
        }
        if (type === 'excel') {
            return ExcelGenerators.generateMediaMonitoringExcel(
                articles, 
                translations, 
                customTitle || translations.report_title || 'Media_Monitoring_Report',
                returnOnly
            );
        }
        return PdfGenerators.generateMediaMonitoringPDF(
            articles, 
            translations, 
            logoUrl, 
            customTitle || translations.report_title, 
            chartImages, 
            searchKeyword,
            returnOnly
        );
    }
}
export type { ReportArticle };
