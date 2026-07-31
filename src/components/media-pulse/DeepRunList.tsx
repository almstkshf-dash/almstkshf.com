/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import { useState } from 'react';
import { Clock, FileText, FileSpreadsheet, Loader2, FolderPlus } from 'lucide-react';
import Button from '@/components/ui/Button';
import SaveToCollectionModal from '@/components/ui/SaveToCollectionModal';
import { useReportExport } from '@/hooks/useReportExport';
import { DeepWebRun } from '@/types/reports';

interface DeepRunListProps {
    t: (key: string, options?: any) => string;
    tDashboard: (key: string, options?: any) => string;
}

export default function DeepRunList({ t, tDashboard }: DeepRunListProps) {
    const isAuthenticated = true;
    const runs: any[] = [];

    const { isExporting, exportDeepWeb } = useReportExport();
    const [runToSave, setRunToSave] = useState<DeepWebRun | null>(null);

    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-foreground/80 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    {t('recent_runs')}
                </div>
                {runs && runs.length > 0 && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => exportDeepWeb(runs, 'pdf')}
                            disabled={!!isExporting}
                            isLoading={isExporting === 'pdf'}
                            className="h-7 text-[9px] uppercase tracking-widest font-bold gap-1.5 rounded-lg px-2 text-foreground bg-muted/10 hover:bg-muted/20 border border-border"
                        >
                            <FileText className="w-3 h-3" aria-hidden="true" />
                            {tDashboard('export_pdf')}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => exportDeepWeb(runs, 'excel')}
                            disabled={!!isExporting}
                            isLoading={isExporting === 'excel'}
                            className="h-7 text-[9px] uppercase tracking-widest font-bold gap-1.5 rounded-lg px-2 text-foreground bg-muted/10 hover:bg-muted/20 border border-border"
                        >
                            <FileSpreadsheet className="w-3 h-3" aria-hidden="true" />
                            {tDashboard('export_excel')}
                        </Button>
                    </div>
                )}
            </div>

            {runs === undefined && (
                <div className="flex items-center gap-2 text-sm text-foreground/70 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    {t('status_scanning')}
                </div>
            )}
            {runs && runs.length === 0 && (
                <p className="text-sm text-foreground/70 py-2">{t('no_runs')}</p>
            )}
            <div className="space-y-2">
                {runs?.map((run) => (
                    <div
                        key={run._id}
                        className="flex flex-wrap items-center justify-between bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm gap-2"
                    >
                        <span className="font-semibold text-xs text-foreground/80" suppressHydrationWarning>
                            {new Date(run._creationTime).toLocaleString()}
                        </span>
                        <span
                            className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-widest ${run.status === 'success'
                                ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400'
                                : 'bg-rose-500/10 text-rose-500'
                                }`}
                        >
                            {run.status === 'success' ? t('status_success') : t('status_failed')}
                        </span>
                        <span className="text-foreground/70 text-xs">
                            {run.itemCount} {t('items')}
                        </span>
                        {run.error && (
                            <span className="text-[11px] text-rose-700 dark:text-rose-300 w-full mt-0.5">
                                {run.error}
                            </span>
                        )}
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="p-1.5 h-auto text-emerald-800 dark:text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"
                                onClick={() => setRunToSave(run)}
                                title={tDashboard('save_to_collection')}
                                aria-label={tDashboard('save_to_collection')}
                            >
                                <FolderPlus className="w-4 h-4" aria-hidden="true" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {runToSave && (
                <SaveToCollectionModal
                    isOpen={!!runToSave}
                    onClose={() => setRunToSave(null)}
                    item={{
                        id: runToSave._id,
                        type: "deep_web",
                        title: `${t('export_deep_title')} — ${new Date(runToSave._creationTime).toLocaleString()}`,
                        data: runToSave
                    }}
                />
            )}
        </div>
    );
}
