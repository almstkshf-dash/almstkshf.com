/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { fixArabic, isArabic, isArabicReport, fixArabicForPDF } from '../utils/arabic';
import { fetchImageAsBase64 } from '../utils/images';
import { PdfBase, AutoTablejsPDF } from './PdfBase';
import { 
    ReportTranslations, 
    AiInspectorData, 
    DarkWebResult, 
    TerroristListItem, 
    DeepWebRun, 
    OsintResult, 
    ReportArticle,
    BRAND_DARK,
    BRAND_AMBER
} from '../types';

export class PdfGenerators {
    public static async generateWatchlistPDF(
        items: TerroristListItem[], 
        translations: ReportTranslations, 
        title: string,
        returnOnly = false
    ) {
        const { doc, pageWidth, fontLoaded, logoBase64 } = await PdfBase.initPDF(translations.logo_url);
        PdfBase.addCoverPage(doc, title, items.length, translations, logoBase64, fontLoaded);

        doc.addPage();
        PdfBase.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

        const y = 30;
        PdfBase.drawHeading(doc, translations.TerroristList?.title || 'Sanctions Database Scan', 14, y, fontLoaded);

        const tableData = items.map(item => [
            fixArabic(item.nameArabic || ''),
            fixArabic(item.nameLatin || ''),
            item.nationality || '',
            item.documentNumber || '',
            item.category || ''
        ]);

        await PdfBase.addAutoTable(doc, {
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

        PdfBase.finalizePDF(doc, title, translations, fontLoaded, returnOnly);
        return doc;
    }

    public static async generateDarkWebPDF(
        results: DarkWebResult[], 
        translations: ReportTranslations, 
        title: string,
        returnOnly = false
    ) {
        const { doc, pageWidth, fontLoaded, logoBase64 } = await PdfBase.initPDF(translations.logo_url);

        PdfBase.addCoverPage(doc, title, results.length, translations, logoBase64, fontLoaded);

        doc.addPage();
        PdfBase.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

        let y = 30;
        PdfBase.drawHeading(doc, translations.DarkWeb?.tab_label || 'Dark Web Search Results', 14, y, fontLoaded);
        y += 10;

        const tableData = results.map(r => [
            r.discovered_at ? new Date(r.discovered_at).toLocaleDateString() : '',
            fixArabic(r.title || ''),
            r.source_type || '',
            r.risk_level || 'Neutral',
            fixArabic(r.summary || '')
        ]);

        await PdfBase.addAutoTable(doc, {
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

        PdfBase.finalizePDF(doc, title, translations, fontLoaded, returnOnly);
        return doc;
    }

    public static async generatePressReleasePDF(
        articles: ReportArticle[],
        translations: ReportTranslations,
        title: string,
        returnOnly = false,
        chartImages?: { reportsChart?: string; emotionRadar?: string; sentimentDonut?: string; articlesTrend?: string }
    ) {
        const { doc, pageWidth, pageHeight, fontLoaded, logoBase64 } = await PdfBase.initPDF(translations.logo_url);

        // Pre-load images to base64
        const articlesWithImages = await Promise.all(articles.slice(0, 50).map(async (a) => {
            if (!a.imageUrl) return a;
            if (a.imageUrl.startsWith('data:')) return a;
            const b64 = await fetchImageAsBase64(a.imageUrl);
            if (b64) return { ...a, imageUrl: b64 };
            return a;
        }));

        const allArticles = [...articlesWithImages, ...articles.slice(50)];

        PdfBase.addCoverPage(doc, title, allArticles.length, translations, logoBase64, fontLoaded);

        doc.addPage();
        PdfBase.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

        let y = 30;
        PdfBase.drawHeading(doc, translations.Reports?.summary || 'Executive Summary', 14, y, fontLoaded);
        y += 12;

        const totalReach = articles.reduce((sum, a) => sum + (a.reach || 0), 0);
        const totalAVE = articles.reduce((sum, a) => sum + (a.ave || 0), 0);

        PdfBase.drawMetricBoxes(doc, [
            { label: translations.Reports?.total_reach || 'TOTAL REACH', value: totalReach.toLocaleString(), color: BRAND_DARK },
            { label: translations.Reports?.total_ave || 'AD VALUE (AVE)', value: `$${totalAVE.toLocaleString()}`, color: BRAND_AMBER },
            { label: translations.Reports?.article_count || 'TOTAL ARTICLES', value: articles.length.toString(), color: [16, 185, 129] }
        ], y, pageWidth, fontLoaded);
        y += 40;

        if (chartImages && (chartImages.sentimentDonut || chartImages.emotionRadar || chartImages.reportsChart || chartImages.articlesTrend)) {
            y += 5;
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
                        PdfBase.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);
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
            PdfBase.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);
            y = 25;
        } else {
            y += 10;
        }

        PdfBase.drawHeading(doc, translations.Reports?.coverage_details || 'Media Coverage Log', 14, y, fontLoaded);

        const tableData = allArticles.map(a => {
            const titleText = a.title ?? '';
            let processedTitle = titleText;
            if (isArabic(titleText)) {
                const shaped = fixArabicForPDF(titleText);
                doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
                doc.setFontSize(7.5);
                const lines = doc.splitTextToSize(shaped, 85);
                processedTitle = lines.join('\n');
            }
            return [
                '',
                a.publishedDate || '',
                processedTitle,
                a.source || '',
                (a.reach || 0).toLocaleString(),
                `$${(a.ave || 0).toLocaleString()}`
            ];
        });

        await PdfBase.addAutoTable(doc, {
            head: [[
                '',
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
                const isArabicMode = isArabicReport(translations);
                const targetColIndex = isArabicMode ? 5 : 0;
                if (data.column.index === targetColIndex && data.cell.section === 'body' && allArticles[data.row.index]?.imageUrl) {
                    const img = allArticles[data.row.index].imageUrl;
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

        PdfBase.finalizePDF(doc, title, translations, fontLoaded, returnOnly);
        return doc;
    }

    public static async generateDeepWebPDF(
        runs: DeepWebRun[], 
        threats: ReportArticle[], 
        translations: ReportTranslations, 
        title: string,
        returnOnly = false
    ) {
        const { doc, pageWidth, fontLoaded, logoBase64 } = await PdfBase.initPDF(translations.logo_url);

        PdfBase.addCoverPage(doc, title, threats.length, translations, logoBase64, fontLoaded);

        doc.addPage();
        PdfBase.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

        let y = 30;
        PdfBase.drawHeading(doc, translations.Reports?.ingestion_logs || 'Media Monitoring Activity Log (Last 10 Runs)', 14, y, fontLoaded);

        const logsTable = runs.slice(0, 10).map(r => [
            new Date(r._creationTime).toLocaleString(),
            r.source || 'Generic',
            r.status.toUpperCase(),
            r.itemCount?.toString() || '0'
        ]);

        await PdfBase.addAutoTable(doc, {
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

        y = (doc as AutoTablejsPDF).lastAutoTable.finalY + 15;
        PdfBase.drawHeading(doc, translations.Reports?.identified_threats || 'High-Risk Identified Threats', 14, y, fontLoaded);

        await PdfBase.addAutoTable(doc, {
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

        PdfBase.finalizePDF(doc, title, translations, fontLoaded, returnOnly);
        return doc;
    }

    public static async generateOsintHistoryPDF(
        items: OsintResult[], 
        translations: ReportTranslations, 
        title: string,
        returnOnly = false
    ) {
        const { doc, pageWidth, fontLoaded, logoBase64 } = await PdfBase.initPDF(translations.logo_url);

        PdfBase.addCoverPage(doc, title, items.length, translations, logoBase64, fontLoaded);

        doc.addPage();
        PdfBase.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

        const y = 30;
        PdfBase.drawHeading(doc, translations.OsintTab?.export_history || 'Investigation History', 14, y, fontLoaded);

        const tableData = items.map(item => [
            new Date(item.createdAt || Date.now()).toLocaleString(),
            item.query,
            item.type.toUpperCase(),
            typeof item.result === 'object' ? Object.keys(item.result as Record<string, unknown>).length.toString() : '1'
        ]);

        await PdfBase.addAutoTable(doc, {
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

        PdfBase.finalizePDF(doc, title, translations, fontLoaded, returnOnly);
        return doc;
    }

    public static async generateOsintPDF(
        data: OsintResult, 
        translations: ReportTranslations, 
        title: string,
        returnOnly = false
    ) {
        const { doc, pageWidth, fontLoaded, logoBase64 } = await PdfBase.initPDF(translations.logo_url);

        PdfBase.addCoverPage(doc, title, 1, translations, logoBase64, fontLoaded);

        doc.addPage();
        PdfBase.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

        let y = 30;
        PdfBase.drawHeading(doc, translations.Reports?.investigation_target || 'Investigation Target', 14, y, fontLoaded);
        y += 10;

        doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(...BRAND_AMBER);
        
        const processedQuery = fixArabic(data.query);
        if (isArabic(data.query)) {
            doc.text(processedQuery, pageWidth - 20, y, { align: 'right' });
        } else {
            doc.text(processedQuery, 20, y);
        }
        y += 8;
        
        doc.setFontSize(9);
        doc.setTextColor(100);
        
        const typeText = `${translations.Reports?.investigation_type || 'Type'}: ${data.type.toUpperCase()}`;
        const processedType = fixArabic(typeText);
        if (isArabic(typeText)) {
            doc.text(processedType, pageWidth - 20, y, { align: 'right' });
        } else {
            doc.text(processedType, 20, y);
        }
        y += 15;

        const result = data.result;
        if (result && typeof result === 'object') {
            const details = Object.entries(result)
                .filter(([, v]) => typeof v !== 'object')
                .slice(0, 25);

            if (details.length > 0) {
                PdfBase.drawHeading(doc, translations.Reports?.technical_details || 'Technical Characteristics', 14, y, fontLoaded);
                await PdfBase.addAutoTable(doc, {
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

            const resultObj = result as Record<string, unknown>;
            const entities = (resultObj.entities || resultObj.associations || []) as Array<{ name?: string; type?: string; relevance?: string | number }>;

            await PdfBase.addAutoTable(doc, {
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
        }

        PdfBase.finalizePDF(doc, title, translations, fontLoaded, returnOnly);
        return doc;
    }

    public static async generateAiInspectorPDF(
        mode: string, 
        data: AiInspectorData, 
        translations: ReportTranslations, 
        title: string,
        returnOnly = false
    ) {
        const { doc, pageWidth, pageHeight, fontLoaded, logoBase64 } = await PdfBase.initPDF(translations.logo_url);

        const modeTrans = (translations.AiInspector as Record<string, any> | undefined)?.[`mode_${mode}`] || mode.toUpperCase();
        PdfBase.addCoverPage(doc, `${title} - ${modeTrans}`, typeof data === 'object' ? Object.keys(data).length : 1, translations, logoBase64, fontLoaded);

        doc.addPage();
        PdfBase.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

        let y = 30;
        PdfBase.drawHeading(doc, translations.AiInspector?.results_summary || 'Analysis Results', 14, y, fontLoaded);
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

        PdfBase.drawMetricBoxes(doc, [
            { label: translations.AiInspector?.label_mode || 'MODE', value: modeTrans, color: BRAND_DARK },
            { label: translations.AiInspector?.label_risk || 'RISK LEVEL', value: localizedRiskLevel, color: rColor },
            { label: translations.AiInspector?.label_confidence || 'CONFIDENCE', value: `${(confidence ?? 0).toFixed(1)}%`, color: BRAND_AMBER }
        ], y, pageWidth, fontLoaded);

        y += 40;

        if (mode === 'text' && data) {
            PdfBase.drawHeading(doc, translations.AiInspector?.linguistic_signals || 'Linguistic Signals', 14, y, fontLoaded);

            await PdfBase.addAutoTable(doc, {
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
        } else if (mode === 'image' && data) {
            PdfBase.drawHeading(doc, translations.AiInspector?.visual_signals || 'Visual Signals', 14, y, fontLoaded);
            const tableData = data.pixelLogicSignals?.map((s: { label?: string; description?: string; detectedValue?: string; risk?: string }) => [
                fixArabic(s.label || ''),
                fixArabic(s.description || ''),
                fixArabic(s.detectedValue || ''),
                fixArabic((translations.AiInspector as Record<string, any> | undefined)?.[`risk_${(s.risk || 'low').toLowerCase()}`] || s.risk?.toUpperCase() || s.risk || '')
            ]) || [];

            await PdfBase.addAutoTable(doc, {
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
                        PdfBase.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);
                    }
                }
            });

            if (data.deepMl) {
                y = (doc as AutoTablejsPDF).lastAutoTable?.finalY || y + 50;
                if (y > 220) { doc.addPage(); y = 30; PdfBase.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded); }
                else { y += 15; }

                PdfBase.drawHeading(doc, translations.AiInspector?.biometric_scouts || 'Biometric & Deep ML Signals', 14, y, fontLoaded);

                const mlData: string[][] = [];
                const faceAnomalies = data.deepMl.biometrics?.faceAnomalies || [];
                const handAnomalies = data.deepMl.biometrics?.handAnomalies || [];
                const allAnomalies = [...faceAnomalies, ...handAnomalies];
                if (allAnomalies.length > 0) {
                    allAnomalies.forEach((a: { name?: string; id?: string }) => {
                        mlData.push([
                            fixArabic(translations.AiInspector?.anatomy_consistency || 'Anatomy Consistency'),
                            fixArabic(a.name || a.id || ''),
                            fixArabic(translations.AiInspector?.anomaly_detected || 'Anomaly Detected'),
                            fixArabic(translations.AiInspector?.risk_high || 'High')
                        ]);
                    });
                } else {
                    mlData.push([
                        fixArabic(translations.AiInspector?.anatomy_consistency || 'Anatomy Consistency'),
                        fixArabic(translations.AiInspector?.none || 'None'),
                        fixArabic(translations.AiInspector?.anomaly_low_risk || 'No Anomalies'),
                        fixArabic(translations.AiInspector?.risk_low || 'Low')
                    ]);
                }

                if (data.deepMl.ocr) {
                    mlData.push([
                        fixArabic(translations.AiInspector?.ocr_detect || 'OCR Text Layer'),
                        fixArabic(data.deepMl.ocr.text ? 'Text found' : 'No text'),
                        fixArabic(data.deepMl.ocr.isGarbled ? 'Suspicious / Garbled' : 'Clean'),
                        fixArabic(data.deepMl.ocr.isGarbled ? (translations.AiInspector?.risk_medium || 'Medium') : (translations.AiInspector?.risk_low || 'Low'))
                    ]);
                }

                if (data.deepMl.watermarks && data.deepMl.watermarks.length > 0) {
                    data.deepMl.watermarks.forEach((w: { name?: string; id?: string }) => {
                        mlData.push([
                            fixArabic(translations.AiInspector?.detected_ai_signature || 'AI Watermark'),
                            fixArabic(w.name || w.id || ''),
                            fixArabic('Detected'),
                            fixArabic(translations.AiInspector?.risk_high || 'High')
                        ]);
                    });
                }

                await PdfBase.addAutoTable(doc, {
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
            PdfBase.drawHeading(doc, translations.AiInspector?.frame_analysis || 'Video Frame Analysis', 14, y, fontLoaded);
            const tableData = data.frameAnomalies?.map((f: { timestamp?: string | number; type?: string; severity?: number; description?: string }) => [
                f.timestamp,
                fixArabic(f.type || ''),
                `${((f.severity ?? 0) * 100).toFixed(1)}%`,
                fixArabic(f.description || '')
            ]) || [];

            await PdfBase.addAutoTable(doc, {
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

        PdfBase.finalizePDF(doc, title, translations, fontLoaded, returnOnly);
        return doc;
    }

    public static async generateMediaMonitoringPDF(
        articles: ReportArticle[],
        translations: ReportTranslations,
        logoUrl?: string,
        reportTitle?: string,
        chartImages?: { reportsChart?: string; emotionRadar?: string; sentimentDonut?: string; articlesTrend?: string },
        searchKeyword?: string,
        returnOnly = false
    ) {
        const brandName = (translations.brand_name as string | undefined) || 'ALMSTKSHF';
        const brandTagline = (translations.brand_tagline as string | undefined) || 'MEDIA MONITORING & DEVELOPMENT';
        const footerUrl = (translations.footer_url as string | undefined) || 'www.almstkshf.com';

        const finalReportTitle = reportTitle || translations.report_title || 'Media Coverage Report';
        const isArabicMode = /[\u0600-\u06FF]/.test(translations.Reports?.pr_title || '') || /[\u0600-\u06FF]/.test(finalReportTitle);

        const { jsPDF } = await import('jspdf');

        const useLandscape = true;
        const doc = new jsPDF({ orientation: useLandscape ? 'landscape' : 'portrait', unit: 'mm', format: 'a4', hotfixes: ['px_line_height'] });
        PdfBase.overrideJsPDFText(doc);
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        let fontLoaded = false;
        const amiriBase64 = await fetchImageAsBase64('/fonts/amiri.ttf').catch(() => null);
        if (amiriBase64) {
            try {
                const cleanBase64 = amiriBase64.replace(/^data:[^;]+;base64,/, '');
                doc.addFileToVFS('Amiri-Regular.ttf', cleanBase64);
                doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
                fontLoaded = true;
            } catch (e) {
                console.warn('Amiri font loading failed from local bundle', e);
            }
        }

        const effectiveLogoUrl = (translations.logo_url as string | undefined) || logoUrl;
        const logoBase64 = effectiveLogoUrl ? await fetchImageAsBase64(effectiveLogoUrl) : null;

        const articlesWithImages = await Promise.all(articles.slice(0, 50).map(async (a) => {
            if (!a.imageUrl) return a;
            if (a.imageUrl.startsWith('data:')) return a;
            const b64 = await fetchImageAsBase64(a.imageUrl);
            if (b64) return { ...a, imageUrl: b64 };
            return a;
        }));

        const allArticles = [...articlesWithImages, ...articles.slice(50)];

        const addText = (text: string, x: number, y: number, options: { align?: 'center' | 'right' | 'left' } = {}) => {
            doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
            const processedText = fixArabic(text);
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
        addText(brandName, pageWidth / 2, 55, { align: 'center' });
        doc.setFontSize(8);
        doc.setTextColor(200, 220, 255);
        addText(brandTagline.toUpperCase(), pageWidth / 2, 62, { align: 'center' });

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

        const keyword = searchKeyword || articles[0]?.keyword || 'N/A';
        const uniqueCountries = [...new Set(articles.map(a => a.sourceCountry))].filter((c): c is string => !!c);
        const isAllInList = uniqueCountries.some(c => c.toUpperCase() === 'ALL');
        const countriesList = (isAllInList || uniqueCountries.length > 5)
            ? (isArabicMode ? 'عالمي (كل الدول)' : 'Global (All Countries)')
            : uniqueCountries.length === 0
                ? 'N/A'
                : uniqueCountries.join(', ');
        const langs = 'EN / AR';

        doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
        doc.setFontSize(9.5);

        if (isArabicMode) {
            const fixedKeywordLabel = fixArabic(translations.keyword_label || 'الكلمة المفتاحية');
            const fixedRegionLabel = fixArabic(translations.region_label || 'المنطقة');
            const fixedLangsLabel = fixArabic(translations.langs_label || 'اللغات');

            const fixedKeyword = fixArabic(keyword);
            const fixedCountries = fixArabic(countriesList);

            doc.text(`${fixedKeyword} : ${fixedKeywordLabel}`, pageWidth / 2, pageHeight / 2 + 34, { align: 'center' });
            doc.text(`${fixedCountries} : ${fixedRegionLabel}`, pageWidth / 2, pageHeight / 2 + 40, { align: 'center' });
            doc.text(`${langs} : ${fixedLangsLabel}`, pageWidth / 2, pageHeight / 2 + 46, { align: 'center' });
        } else {
            doc.text(`${translations.keyword_label || 'Keyword'}: "${keyword}"`, pageWidth / 2, pageHeight / 2 + 34, { align: 'center' });
            doc.text(`${translations.region_label || 'Region'}: ${countriesList}`, pageWidth / 2, pageHeight / 2 + 40, { align: 'center' });
            doc.text(`${translations.langs_label || 'Languages'}: ${langs}`, pageWidth / 2, pageHeight / 2 + 46, { align: 'center' });
        }

        doc.setFillColor(...BRAND_DARK);
        doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
        doc.setFontSize(8);
        doc.setTextColor(200, 200, 200);

        let footerText = '';
        if (isArabicMode) {
            const rawFooter = `${footerUrl}  |  ${brandName}`;
            footerText = fixArabic(rawFooter);
        } else {
            const fixedBrand = fixArabic(brandName);
            footerText = `${footerUrl}  |  ${fixedBrand}`;
        }

        doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
        doc.text(footerText, pageWidth / 2, pageHeight - 5, { align: 'center' });

        // PAGE 2
        doc.addPage();
        PdfBase.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

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
        PdfBase.drawMetricBoxes(doc, activeBoxes, y, pageWidth, fontLoaded);
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
        const posRatio = articles.length ? pos / articles.length : 0;
        const neuRatio = articles.length ? neu / articles.length : 0;
        const negRatio = articles.length ? neg / articles.length : 0;

        let recommendation = '';
        if (negRatio > 0.25) {
            recommendation = translations.rec_high_neg || (isArabicMode 
                ? 'تم رصد نسبة عالية من التغطية السلبية. نوصي بتفعيل بروتوكولات إدارة الأزمات فوراً.' 
                : 'High negative sentiment detected. Recommend activating crisis management protocols immediately.');
        } else if (negRatio > 0.1) {
            recommendation = translations.rec_mod_neg || (isArabicMode 
                ? 'تم رصد تغطية سلبية متوسطة. يوصى بالمتابعة الدقيقة وإعداد رسائل إعلامية استباقية.' 
                : 'Moderate negative coverage. Monitor closely and prepare proactive messaging.');
        } else if (posRatio > 0.35) {
            recommendation = (translations.rec_positive as string | undefined) || (isArabicMode 
                ? 'تم رصد اتجاه إيجابي قوي في التغطية. نوصي باستغلال هذا الزخم للإعلانات الاستراتيجية والتفاعل الإعلامي.' 
                : 'Positive sentiment trend detected. Leverage this momentum for strategic announcements and media engagement.');
        } else if (neuRatio > 0.6) {
            recommendation = (translations.rec_neutral as string | undefined) || (isArabicMode 
                ? 'التغطية الإعلامية محايدة في الغالب. يوصى بالاستمرار في رصد الأخبار لتحديد الاتجاهات الناشئة.' 
                : 'Coverage is predominantly neutral. Continue current media monitoring to spot emerging trends.');
        } else {
            recommendation = translations.rec_healthy || (isArabicMode 
                ? 'نبرة التغطية متوازنة وصحية. استمر في الاستراتيجية الإعلامية الحالية.' 
                : 'Coverage sentiment is balanced and healthy. Continue current media strategy.');
        }

        doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
        doc.setTextColor(80);
        doc.setFontSize(8.5);

        const splitRec = doc.splitTextToSize(recommendation, pageWidth - 40);
        let lineY = y + 8;

        if (isArabicMode) {
            splitRec.forEach((line: string) => {
                doc.text(line, pageWidth - 20, lineY, { align: 'right' });
                lineY += 6;
            });
        } else {
            splitRec.forEach((line: string) => {
                doc.text(line, 20, lineY, { align: 'left' });
                lineY += 6;
            });
        }

        // PAGE 3: Charts Page
        if (chartImages && (chartImages.reportsChart || chartImages.sentimentDonut || chartImages.emotionRadar || chartImages.articlesTrend)) {
            doc.addPage();
            PdfBase.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

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
        PdfBase.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);

        doc.setFontSize(14);
        doc.setTextColor(...BRAND_DARK);
        if (isArabicMode) {
            addText(translations.coverage_log || 'Media Coverage Log', pageWidth - 14, 28, { align: 'right' });
        } else {
            addText(translations.coverage_log || 'Media Coverage Log', 14, 28);
        }

        const getShortHeader = (id: string, originalHeader: string) => {
            if (!isArabicMode) return originalHeader;
            const overrides: Record<string, string> = {
                ave: "المكافئ ($)",
                sentiment: "النبرة",
                reach: "الوصول"
            };
            return overrides[id] || originalHeader;
        };

        const columnDefinitions = [
            {
                id: 'image',
                header: '',
                width: 8,
                halign: 'center' as const,
                getValue: (a: ReportArticle) => ''
            },
            {
                id: 'date',
                header: getShortHeader('date', translations.date || 'Date'),
                width: 24,
                halign: 'center' as const,
                getValue: (a: ReportArticle) => a.publishedDate ?? ''
            },
            {
                id: 'title',
                header: getShortHeader('title', translations.title || 'Title'),
                width: 'auto' as const,
                halign: isArabicMode ? 'right' : 'left' as const,
                getValue: (a: ReportArticle) => {
                    const titleText = a.title ?? '';
                    const hashStr = Array.isArray(a.hashtags) && a.hashtags.length > 0 ? `\n#${a.hashtags.join(' #')}` : '';
                    const fullText = titleText + hashStr;
                    
                    if (isArabic(fullText)) {
                        doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
                        doc.setFontSize(7.5);
                        const shaped = fixArabicForPDF(fullText);
                        const lines = doc.splitTextToSize(shaped, 165);
                        return lines.join('\n');
                    }
                    return fullText;
                }
            },
            {
                id: 'type',
                header: getShortHeader('type', translations.type || 'Type'),
                width: 14,
                halign: 'center' as const,
                getValue: (a: ReportArticle) => a.sourceType ?? ''
            },
            {
                id: 'source',
                header: getShortHeader('source', translations.source || 'Source'),
                width: 22,
                halign: isArabicMode ? 'right' : 'left' as const,
                getValue: (a: ReportArticle) => {
                    const src = a.source ?? '';
                    const username = a.publisherUsername;
                    return username ? `${src} (@${username})` : src;
                }
            },
            {
                id: 'sentiment',
                header: getShortHeader('sentiment', translations.sentiment || 'Sentiment'),
                width: 16,
                halign: 'center' as const,
                getValue: (a: ReportArticle) => a.sentiment ?? ''
            },
            {
                id: 'reach',
                header: getShortHeader('reach', translations.reach || 'Reach'),
                width: 18,
                halign: isArabicMode ? 'left' : 'right' as const,
                getValue: (a: ReportArticle) => (a.reach ?? 0).toLocaleString()
            },
            {
                id: 'ave',
                header: getShortHeader('ave', translations.ave || 'AVE ($)'),
                width: 24,
                halign: isArabicMode ? 'left' : 'right' as const,
                getValue: (a: ReportArticle) => `${(a.ave ?? 0).toLocaleString()}`
            }
        ];

        const activeColumns = isArabicMode ? [...columnDefinitions].reverse() : columnDefinitions;

        const tableHead = [activeColumns.map(col => col.header)];
        const tableBody = allArticles.map(a => activeColumns.map(col => col.getValue(a)));

        const columnStyles: Record<number, { cellWidth: number | 'auto'; halign: string }> = {};
        activeColumns.forEach((col, idx) => {
            columnStyles[idx] = {
                cellWidth: col.width,
                halign: col.halign
            };
        });

        await PdfBase.addAutoTable(doc, {
            head: tableHead,
            body: tableBody as (string | number | undefined)[][],
            startY: 33,
            fontLoaded,
            logoBase64,
            translations,
            didDrawPage: () => {
                PdfBase.addPageHeader(doc, logoBase64, pageWidth, translations, fontLoaded);
            },
            columnStyles,
            didDrawCell: (data: any) => {
                const targetColIndex = isArabicMode ? 0 : 0;
                if (data.column.index === targetColIndex && data.cell.section === 'body' && allArticles[data.row.index]?.imageUrl) {
                    const img = allArticles[data.row.index].imageUrl;
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

        PdfBase.finalizePDF(doc, finalReportTitle, translations, fontLoaded, returnOnly);
        return doc;
    }
}
