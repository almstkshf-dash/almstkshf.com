/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { useQuery, useMutation, api, type Id } from '@/lib/convex-compat';
import { useState } from 'react';
import { ReportGenerator } from '@/lib/report-generator';
import { ReportTranslations, OsintHistoryItem } from '@/types/reports';
import { useMessages } from 'next-intl';

export function useOsintHistory(isAuthenticated: boolean) {
  const messages = useMessages();
  const [isExporting, setIsExporting] = useState<'pdf' | 'excel' | null>(null);

  const deleteResultMutation = useMutation(api.osintDb.deleteOsintResult);
  const updateResultMutation = useMutation(api.osintDb.updateOsintResult);

  const history = useQuery(
    api.osintDb.getOsintResults,
    isAuthenticated ? { limit: 20 } : 'skip'
  );
  const settings = useQuery(api.settings.getSettings);
  const isAdmin = useQuery(api.authQueries.checkIsAdmin, isAuthenticated ? {} : 'skip');

  const deleteResult = async (id: string) => {
    await deleteResultMutation({ id: id as Id<'osint_results'> });
  };

  const updateResult = async (id: string, result: any) => {
    await updateResultMutation({ id: id as Id<'osint_results'>, result });
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (!history?.length) return;
    setIsExporting(format);
    try {
      const exportTranslations: ReportTranslations = {
        ...(messages as unknown as ReportTranslations),
        brand_name: settings?.brandName || 'ALMSTKSHF',
        brand_tagline: settings?.brandTagline || 'MEDIA MONITORING & DEVELOPMENT',
        footer_url: settings?.footerUrl || 'www.almstkshf.com',
        logo_url: settings?.logoUrl || undefined,
      };
      await ReportGenerator.exportOsintReport(history as OsintHistoryItem[], exportTranslations, format);
    } catch (err) {
      console.error('OSINT export failed:', err);
    } finally {
      setIsExporting(null);
    }
  };

  return {
    history,
    settings,
    isAdmin,
    deleteResult,
    updateResult,
    handleExport,
    isExporting,
  };
}
