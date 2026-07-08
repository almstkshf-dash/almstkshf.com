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
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Upload, Image as ImageIcon, Film, Trash2, Layers, RefreshCw, ChevronRight } from 'lucide-react';

interface UploadPanelProps {
  mode: 'text' | 'image' | 'video';
  inputText: string;
  setInputText: (text: string) => void;
  uploadedFile: File | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleStartOver: () => void;
  isAnalyzing: boolean;
  runAnalysis: () => void;
  progress: number;
  error: string | null;
}

export const UploadPanel = memo(function UploadPanel({
  mode,
  inputText,
  setInputText,
  uploadedFile,
  handleFileUpload,
  handleStartOver,
  isAnalyzing,
  runAnalysis,
  progress,
  error,
}: UploadPanelProps) {
  const t = useTranslations('AiInspector');
  const shouldReduceMotion = useReducedMotion();

  const fadeVariants = {
    initial: shouldReduceMotion ? { opacity: 1 } : { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const analyzingVariants = {
    initial: shouldReduceMotion ? { opacity: 1 } : { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 }
  };

  const ctaVariants = {
    initial: shouldReduceMotion ? { opacity: 1 } : { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 }
  };

  return (
    <motion.div
      layout={!shouldReduceMotion}
      className="bg-white dark:bg-zinc-950 p-1 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-none overflow-hidden"
    >
      <div className="p-8 md:p-12">
        <AnimatePresence mode="wait">
          {mode === 'text' ? (
            <motion.div
              key="text-input"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeVariants}
            >
              <label htmlFor="inspector-textarea" className="sr-only">
                {t('text.placeholder')}
              </label>
              <textarea
                id="inspector-textarea"
                name="inspector-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t('text.placeholder')}
                className="w-full h-80 bg-transparent border-none focus:ring-0 text-2xl md:text-3xl font-medium placeholder:text-zinc-500 dark:placeholder:text-zinc-500 text-zinc-800 dark:text-zinc-200 resize-none font-sans"
              />
            </motion.div>
          ) : (
            <motion.div
              key="file-input"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeVariants}
            >
              <label
                htmlFor="inspector-file-upload"
                className="relative group/upload h-[400px] flex flex-col items-center justify-center border-4 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[32px] hover:border-zinc-200 dark:hover:border-zinc-800 transition-all cursor-pointer"
              >
                <input
                  id="inspector-file-upload"
                  name="inspector-file-upload"
                  type="file"
                  accept={mode === 'image' ? "image/*" : "video/*"}
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                {uploadedFile ? (
                  <div className="flex flex-col items-center">
                    <div className="p-6 rounded-3xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 mb-6 shadow-2xl">
                      {mode === 'image' ? <ImageIcon className="w-12 h-12" /> : <Film className="w-12 h-12" />}
                    </div>
                    <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-100 truncate max-w-xs">{uploadedFile.name}</h4>
                    <p className="text-zinc-500 font-mono text-xs uppercase mt-2">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleStartOver();
                      }}
                      className="mt-8 text-rose-500 hover:text-rose-600 font-bold uppercase tracking-widest text-xs flex items-center gap-1.5 z-20 relative font-sans"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('start_over')}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center px-6">
                    <div className="p-8 rounded-full bg-zinc-50 dark:bg-zinc-900 mb-8 group-hover/upload:scale-110 transition-transform">
                      <Upload className="w-16 h-16 text-zinc-500 dark:text-zinc-500" />
                    </div>
                    <h4 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-4">{t('upload.title')}</h4>
                    <p className="text-sm text-zinc-500 max-w-xs font-medium leading-relaxed">
                      {t(mode === 'image' ? 'upload.image_desc' : 'upload.video_desc')}
                    </p>
                  </div>
                )}
              </label>
            </motion.div>
          )}
        </AnimatePresence>
        {error && (
          <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm font-semibold">
            {error}
          </div>
        )}
      </div>

      <div className="p-4 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-6 ml-6">
          <div className="hidden md:flex items-center gap-2 text-zinc-500">
            <Layers className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Multi-Engine Forensic Mode</span>
          </div>
          {isAnalyzing && (
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-900 dark:bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[10px] font-mono text-zinc-500">{progress}%</span>
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={isAnalyzing || (mode === 'text' ? !inputText.trim() : !uploadedFile)}
          onClick={runAnalysis}
          className="group relative overflow-hidden flex items-center gap-3 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-3xl text-sm font-black uppercase tracking-widest disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-zinc-900/20 dark:shadow-white/20"
        >
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div
                key="analyzing"
                initial="initial"
                animate="animate"
                variants={analyzingVariants}
                className="flex items-center gap-3"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                {t('analyzing')}
              </motion.div>
            ) : (
              <motion.div
                key="cta"
                initial="initial"
                animate="animate"
                variants={ctaVariants}
                className="flex items-center gap-3"
              >
                {t(mode === 'text' ? 'text.cta' : 'analyzing')}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
});
