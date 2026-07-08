/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useMessages } from 'next-intl';
import { ReportGenerator } from '@/lib/report-generator';
import { toast } from 'sonner';
import { ReportTranslations } from '@/types/reports';

export function useReportExport() {
    const messages = useMessages();
    const settings = useQuery(api.settings.getSettings);
    const [isExporting, setIsExporting] = useState<'pdf' | 'excel' | 'csv' | null>(null);

    const getExportTranslations = (): ReportTranslations => {
        return {
            ...(messages as unknown as ReportTranslations),
            brand_name: settings?.brandName || 'ALMSTKSHF',
            brand_tagline: settings?.brandTagline || 'MEDIA MONITORING & DEVELOPMENT',
            footer_url: settings?.footerUrl || 'www.almstkshf.com',
            logo_url: settings?.logoUrl || undefined,
        };
    };

    const exportDeepWeb = async (runs: any[], format: 'pdf' | 'excel') => {
        if (!runs || runs.length === 0) {
            toast.error('No runs available to export');
            return;
        }
        setIsExporting(format);
        try {
            const translations = getExportTranslations();
            // Automatically routed to server-side API by static exporter
            await ReportGenerator.exportDeepWebReport(runs, [], translations, format);
            toast.success('Report exported successfully');
        } catch (err) {
            console.error('Deep Web export failed:', err);
            toast.error('Deep Web export failed: ' + (err instanceof Error ? err.message : String(err)));
            throw err;
        } finally {
            setIsExporting(null);
        }
    };

    const exportPressRelease = async (
        articles: any[],
        format: 'pdf' | 'excel' | 'csv',
        chartImages?: { reportsChart?: string; emotionRadar?: string; sentimentDonut?: string; articlesTrend?: string }
    ) => {
        if (!articles || articles.length === 0) {
            toast.error('No articles available to export');
            return;
        }
        setIsExporting(format);
        try {
            const translations = getExportTranslations();
            
            if (format === 'csv') {
                // Keep CSV fast client-side compilation since it does not require heavy JS libraries
                const generator = new ReportGenerator(articles, translations);
                const blob = generator.generateCSV();
                const filename = `media-monitoring-report-${new Date().toISOString().split('T')[0]}.csv`;
                
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                // Route PDF & Excel to server-side generator
                await ReportGenerator.exportMediaMonitoringReport(
                    articles,
                    translations,
                    format,
                    settings?.logoUrl || undefined,
                    chartImages,
                    articles[0]?.keyword || undefined,
                    translations.report_title || undefined
                );
            }

            toast.success('Report exported successfully');
        } catch (err) {
            console.error('Report export failed:', err);
            toast.error('Report export failed: ' + (err instanceof Error ? err.message : String(err)));
            throw err;
        } finally {
            setIsExporting(null);
        }
    };

    return {
        isExporting,
        exportDeepWeb,
        exportPressRelease,
    };
}
