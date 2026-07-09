/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { isArabicReport } from '../utils/arabic';
import { fetchImageAsBase64 } from '../utils/images';
import { ExcelBase } from './ExcelBase';
import { 
    ReportTranslations, 
    AiInspectorData, 
    DarkWebResult, 
    TerroristListItem, 
    OsintResult, 
    ReportArticle 
} from '../types';

export class ExcelGenerators {
    public static async generateWatchlistExcel(
        items: TerroristListItem[], 
        translations: ReportTranslations, 
        title: string,
        returnOnly = false
    ): Promise<Blob | void> {
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Watchlist');

        const isArabicMode = isArabicReport(translations);
        if (isArabicMode) {
            sheet.views = [{ rightToLeft: true }];
        }

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

        if (isArabicMode) {
            ExcelBase.formatArabicSheet(sheet);
        }

        return ExcelBase.downloadOrReturn(workbook, title, returnOnly);
    }

    public static async generateDarkWebExcel(
        results: DarkWebResult[], 
        translations: ReportTranslations, 
        title: string,
        returnOnly = false
    ): Promise<Blob | void> {
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Dark Web Results');

        const isArabicMode = isArabicReport(translations);
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

        if (isArabicMode) {
            ExcelBase.formatArabicSheet(sheet);
        }

        return ExcelBase.downloadOrReturn(workbook, title, returnOnly);
    }

    public static async generateExcel(
        articles: ReportArticle[], 
        translations: ReportTranslations, 
        title: string, 
        returnOnly = false
    ): Promise<Blob | void> {
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Report');

        const articlesWithImages = await Promise.all(articles.slice(0, 100).map(async (a) => {
            if (!a.imageUrl) return a;
            if (a.imageUrl.startsWith('data:')) return a;
            const b64 = await fetchImageAsBase64(a.imageUrl);
            if (b64) return { ...a, imageUrl: b64 };
            return a;
        }));

        const isArabicMode = isArabicReport(translations);
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
                image: '',
                date: a.publishedDate,
                title: a.title,
                type: a.sourceType || '',
                source: a.source || '',
                publisher_username: a.publisherUsername || '',
                reach: a.reach,
                ave: a.ave
            });
            row.height = 40;
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
                        tl: { col: 0, row: row.number - 1 },
                        ext: { width: 45, height: 45 }
                    });
                } catch (e) {
                    console.warn("Could not embed image into excel sheet", e);
                }
            }
        });

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

        if (isArabicMode) {
            ExcelBase.formatArabicSheet(sheet);
        }

        return ExcelBase.downloadOrReturn(workbook, title, returnOnly);
    }

    public static async generateOsintHistoryExcel(
        items: OsintResult[], 
        translations: ReportTranslations, 
        title: string,
        returnOnly = false
    ): Promise<Blob | void> {
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('OSINT History');

        const isArabicMode = isArabicReport(translations);
        if (isArabicMode) {
            sheet.views = [{ rightToLeft: true }];
        }

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
                attrs: typeof item.result === 'object' ? Object.keys(item.result as Record<string, unknown>).length : 1
            });
        });

        if (isArabicMode) {
            ExcelBase.formatArabicSheet(sheet);
        }

        return ExcelBase.downloadOrReturn(workbook, title, returnOnly);
    }

    public static async generateAiInspectorExcel(
        mode: string, 
        data: AiInspectorData, 
        translations: ReportTranslations, 
        title: string,
        returnOnly = false
    ): Promise<Blob | void> {
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Forensic Report');

        const isArabicMode = isArabicReport(translations);
        if (isArabicMode) {
            sheet.views = [{ rightToLeft: true }];
        }

        const modeTrans = translations.AiInspector?.[`mode_${mode}`] || mode.toUpperCase();
        const localizedRiskLevel = (translations.AiInspector as Record<string, any> | undefined)?.[`risk_${data.overallRisk?.toLowerCase()}`] || data.overallRisk?.toUpperCase() || 'LOW';

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
                    (s.flags || []).join(', ') || translations.AiInspector?.none || 'None',
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

        sheet.getColumn(1).width = 40;
        sheet.getColumn(2).width = 40;
        sheet.getColumn(3).width = 15;
        if (mode === 'video') sheet.getColumn(4).width = 40;

        if (isArabicMode) {
            ExcelBase.formatArabicSheet(sheet);
        }

        return ExcelBase.downloadOrReturn(workbook, `${title}_${modeTrans}`, returnOnly);
    }

    public static async generateMediaMonitoringExcel(
        articles: ReportArticle[],
        translations: ReportTranslations,
        reportName = 'Media_Monitoring_Report',
        returnOnly = false
    ): Promise<Blob | void> {
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(translations.sheet_name || 'Coverage Report');

        const isArabicMode = isArabicReport(translations);
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
        headerRow.alignment = { vertical: 'middle', horizontal: isArabicMode ? 'right' : 'center' };
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

        if (isArabicMode) {
            ExcelBase.formatArabicSheet(sheet);
        }

        return ExcelBase.downloadOrReturn(workbook, reportName, returnOnly);
    }
}
