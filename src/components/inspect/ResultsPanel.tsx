/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { Scan, RefreshCw, Download } from 'lucide-react';
import TextResults from '@/components/analyzers/TextResults';
import ImageResults from '@/components/analyzers/ImageResults';
import VideoResults from '@/components/analyzers/VideoResults';
import type { TextAnalysisResult } from '@/lib/engines/textEngine';
import type { ImageAnalysisReport } from '@/lib/engines/imageEngine';
import type { VideoAnalysisResult } from '@/lib/engines/videoEngine';

interface ResultsPanelProps {
  mode: 'text' | 'image' | 'video';
  textResult: TextAnalysisResult | null;
  imageResult: ImageAnalysisReport | null;
  videoResult: VideoAnalysisResult | null;
  inputText: string;
  filePreview: string | null;
  uploadedFileName?: string;
  resetAnalysis: () => void;
}

export const ResultsPanel = memo(function ResultsPanel({
  mode,
  textResult,
  imageResult,
  videoResult,
  inputText,
  filePreview,
  uploadedFileName,
  resetAnalysis,
}: ResultsPanelProps) {
  const t = useTranslations('AiInspector');

  // Guard to only render if we have results
  if (!textResult && !imageResult && !videoResult) return null;

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900">
            <Scan className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">
              {t('results_summary')}
            </h2>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
              {uploadedFileName || 'Local Buffer'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={resetAnalysis}
            aria-label={t('reset')}
            className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-zinc-500"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-6 py-3 bg-zinc-200 dark:bg-zinc-900 rounded-2xl text-xs font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <Download className="w-4 h-4" />
            {t('export_pdf')}
          </button>
        </div>
      </div>

      {mode === 'text' && textResult && (
        <TextResults result={textResult} rawText={inputText} />
      )}
      {mode === 'image' && imageResult && filePreview && (
        <ImageResults report={imageResult} originalImage={filePreview} />
      )}
      {mode === 'video' && videoResult && (
        <VideoResults result={videoResult} />
      )}

      <div className="h-40" /> {/* Extra padding for footer etc */}
    </div>
  );
});
