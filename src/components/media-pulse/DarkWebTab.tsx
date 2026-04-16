/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useAction, useConvexAuth } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
  Search,
  GlobeLock,
  EyeOff,
  ShieldAlert,
  Trash2,
  Clock,
  Link as LinkIcon,
  SearchCode,
  FileDown,
  FileSpreadsheet,
  Sparkles,
  Wand2,
  Globe,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import clsx from 'clsx';
import Button from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { ReportGenerator } from '@/lib/report-generator';

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SOURCES = [
  { id: 'ahmia', icon: GlobeLock, labelKey: 'source_ahmia' },
  { id: 'diffbot', icon: SearchCode, labelKey: 'source_diffbot' },
  { id: 'zenrows', icon: EyeOff, labelKey: 'source_zenrows' },
] as const;

type SourceId = typeof SOURCES[number]['id'];

// Countries for ZenRows geo-targeting (tracker T-09)
const GEO_COUNTRIES = [
  { code: '', label: 'Auto (Default)' },
  { code: 'us', label: 'United States' },
  { code: 'gb', label: 'United Kingdom' },
  { code: 'ae', label: 'UAE' },
  { code: 'sa', label: 'Saudi Arabia' },
  { code: 'tr', label: 'Turkey' },
  { code: 'de', label: 'Germany' },
  { code: 'fr', label: 'France' },
  { code: 'nl', label: 'Netherlands' },
  { code: 'ru', label: 'Russia' },
  { code: 'ir', label: 'Iran' },
];

// â”€â”€â”€ Skeleton Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SkeletonRow() {
  return (
    <tr className="border-b border-border/40">
      <td className="px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="w-4 h-4 rounded bg-muted animate-pulse mt-1 flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-2 bg-muted/60 animate-pulse rounded w-full" />
            <div className="h-2 bg-muted/60 animate-pulse rounded w-2/3" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-36 bg-muted animate-pulse rounded-md" />
      </td>
      <td className="px-6 py-4 text-center">
        <div className="h-6 w-16 bg-muted animate-pulse rounded-md mx-auto" />
      </td>
      <td className="px-6 py-4 text-center">
        <div className="h-6 w-16 bg-muted animate-pulse rounded-full mx-auto" />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="h-6 w-8 bg-muted animate-pulse rounded-lg ml-auto" />
      </td>
    </tr>
  );
}

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function DarkWebTab() {
  const t = useTranslations('DarkWeb');
  const tCommon = useTranslations('Common');
  const tOpt = useTranslations('SearchOptimizer');

  // â”€â”€ Search state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [searchQuery, setSearchQuery] = useState('');
  const [source, setSource] = useState<SourceId>('ahmia');
  const [selectedCountry, setSelectedCountry] = useState(''); // For ZenRows geo-targeting
  const [isLoading, setIsLoading] = useState(false);

  // â”€â”€ Optimization state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationInfo, setOptimizationInfo] = useState<{
    original: string;
    explanation: string;
  } | null>(null);

  // â”€â”€ Inline result state for Diffbot / ZenRows (replaces alert()) â”€â”€
  const [fetchResult, setFetchResult] = useState<{
    title: string;
    text?: string;
    source: SourceId;
  } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // â”€â”€ Convex hooks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { isAuthenticated } = useConvexAuth();
  const searchAhmia = useAction(api.darkWeb.searchAhmia);
  const fetchDiffbot = useAction(api.darkWeb.fetchDiffbot);
  const stealthFetch = useAction(api.darkWeb.stealthFetch);
  const optimizeSearch = useAction(api.searchOptimizer.optimizeQuery);
  const deleteById = useMutation(api.darkWebDb.deleteById);
  const results = useQuery(
    api.darkWebDb.getByUserId,
    isAuthenticated ? { limit: 50 } : 'skip'
  ) || [];

  // â”€â”€ Risk badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const getRiskBadgeStyles = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'high':     return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'medium':   return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'low':      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      default:         return 'bg-muted text-foreground/70 border-border';
    }
  };

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSearch = async () => {
    if (!searchQuery.trim() || isLoading) return;
    setIsLoading(true);
    setSearchError(null);
    setFetchResult(null);

    try {
      if (source === 'ahmia') {
        // Ahmia stores results directly to DB via Convex action â€” results stream in via useQuery
        await searchAhmia({ query: searchQuery });
        setSearchQuery('');
        setOptimizationInfo(null);

      } else if (source === 'diffbot') {
        // Diffbot returns structured content for a given URL â€” show inline
        const res = await fetchDiffbot({ url: searchQuery });
        if (res) {
          setFetchResult({ title: res.title, text: res.text?.slice(0, 400), source: 'diffbot' });
        }

      } else if (source === 'zenrows') {
        // ZenRows stealth scrape â€” supports geo-targeting via selectedCountry
        const res = await stealthFetch({
          url: searchQuery,
          country: selectedCountry || undefined,
        });
        if (res) {
          setFetchResult({ title: res.title, text: res.text?.slice(0, 400), source: 'zenrows' });
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Search failed';
      setSearchError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!searchQuery.trim() || isOptimizing) return;
    setIsOptimizing(true);
    try {
      const res = await optimizeSearch({
        keyword: searchQuery.trim(),
        context: 'darkweb',
        targetLanguages: ['en', 'ar'],
      });
      if (res?.optimized) {
        setOptimizationInfo({ original: searchQuery, explanation: res.explanation });
        setSearchQuery(res.optimized);
      }
    } catch (e) {
      console.error('Dark web optimization failed:', e);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (!results || results.length === 0) return;
    try {
      const exportTranslations = {
        DarkWeb: { 
          tab_label: t('tab_label'),
          col_risk: t('col_risk') 
        },
        Reports: {
          col_date: tCommon('date') || 'Date',
          col_title: t('col_title') || 'Title',
          col_source: t('col_source') || 'Source',
          col_url: t('col_url') || 'URL',
          col_summary: t('ai_summary') || 'AI Summary',
          col_tags: t('detected_tags') || 'Signal Tags',
        },
      };
      await ReportGenerator.exportDarkWebReport(results, exportTranslations, format);
    } catch (err) {
      console.error('Dark Web export failed:', err);
    }
  };

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="space-y-6">
      {/* â”€â”€ Search Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <GlobeLock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">{t('tab_label')}</h2>
              <p className="text-xs text-foreground/70 font-medium">{t('tab_description')}</p>
            </div>
          </div>

          {results.length > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} className="h-9 px-3 text-xs">
                <FileDown className="w-3.5 h-3.5 mr-1.5" /> PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('excel')} className="h-9 px-3 text-xs">
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" /> Excel
              </Button>
            </div>
          )}
        </div>

        {/* â”€â”€ Source Toggles (Ahmia / Diffbot / ZenRows) â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex gap-2 text-nowrap overflow-x-auto pb-1 scrollbar-none">
          {SOURCES.map((s) => {
            const Icon = s.icon;
            const isSelected = source === s.id;
            return (
              <button
                key={s.id}
                onClick={() => { setSource(s.id); setFetchResult(null); setSearchError(null); }}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap',
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-600/20'
                    : 'bg-muted/20 border-border/60 text-foreground/60 hover:border-purple-500/30'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {t(s.labelKey)}
              </button>
            );
          })}
        </div>

        {/* â”€â”€ Search Input Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {/* FIX: added `relative` so the absolute optimizationInfo banner anchors correctly */}
        <div className="relative flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (optimizationInfo) setOptimizationInfo(null);
                if (searchError) setSearchError(null);
              }}
              placeholder={
                source === 'ahmia'
                  ? t('search_placeholder')
                  : 'Enter a URL to extract / scrape...'
              }
              className="w-full pl-11 pr-12 py-3 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={isLoading}
            />
            {/* Wand: only meaningful for Ahmia keyword searches */}
            {source === 'ahmia' && (
              <button
                type="button"
                onClick={handleOptimize}
                disabled={isOptimizing || !searchQuery.trim() || isLoading}
                title={tOpt('button_tooltip')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
              >
                <Wand2 className={clsx('w-4 h-4', isOptimizing && 'animate-pulse')} />
                <Sparkles className="absolute -top-1 -right-1 w-2 h-2 text-purple-600 animate-bounce opacity-0 group-hover:opacity-100" />
              </button>
            )}
          </div>

          {/* Country selector for ZenRows geo-targeting (tracker T-09) */}
          {(source === 'zenrows' || source === 'diffbot') && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-foreground/50 flex-shrink-0" />
              <select
                id="darkweb-country-select"
                aria-label={t('country_filter')}
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-muted/40 border border-border rounded-xl px-3 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-foreground"
              >
                {GEO_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>
          )}

          <Button
            onClick={handleSearch}
            disabled={isLoading || isOptimizing || !searchQuery.trim()}
            className="h-[50px] bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 px-8 flex-shrink-0"
          >
            {isLoading ? <Clock className="w-4 h-4 animate-spin" /> : tCommon('search')}
          </Button>

          {/* FIX: Optimization info banner â€” now anchors to `relative` parent above */}
          <AnimatePresence>
            {optimizationInfo && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute top-full left-0 right-0 z-30 mt-2 flex items-start gap-2 p-2.5 bg-purple-500/5 border border-purple-500/20 rounded-xl backdrop-blur-md shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-purple-600 uppercase tracking-tight">
                    {tOpt('explanation_title')}
                  </p>
                  <p className="text-[11px] text-foreground/80 leading-relaxed italic truncate">
                    {optimizationInfo.explanation}
                  </p>
                </div>
                <button
                  onClick={() => { setSearchQuery(optimizationInfo.original); setOptimizationInfo(null); }}
                  className="text-[10px] font-bold text-purple-600 hover:underline flex-shrink-0"
                >
                  {tOpt('original')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* â”€â”€ Inline result for Diffbot / ZenRows â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <AnimatePresence>
          {searchError && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-xl text-sm"
            >
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-destructive text-xs uppercase tracking-tight">Search Error</p>
                <p className="text-xs text-foreground/70 mt-0.5">{searchError}</p>
              </div>
            </motion.div>
          )}

          {fetchResult && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-2"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-600">
                  {fetchResult.source === 'diffbot' ? 'Diffbot' : 'ZenRows'} â€” Extracted Content
                </span>
              </div>
              <p className="text-sm font-bold text-foreground">{fetchResult.title}</p>
              {fetchResult.text && (
                <p className="text-xs text-foreground/70 leading-relaxed line-clamp-3">
                  {fetchResult.text}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* â”€â”€ Results Table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/70 min-w-[300px]">
                  {t('col_title')}
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/70">
                  {t('col_url')}
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/70 text-center">
                  {t('col_source')}
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/70 text-center">
                  {t('col_risk')}
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/70 text-right">
                  {tCommon('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {/* Loading skeleton rows */}
              {isLoading && source === 'ahmia' && (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              )}

              <AnimatePresence mode="popLayout" initial={false}>
                {results.map((entry) => (
                  <motion.tr
                    key={entry._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-muted/30 transition-colors border-b border-border/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0">
                          {entry.risk_level === 'critical' ? (
                            <ShieldAlert className="w-4 h-4 text-red-500" />
                          ) : (
                            <GlobeLock className="w-4 h-4 text-purple-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground line-clamp-1">{entry.title}</p>
                          <p className="text-xs text-foreground/70 mt-1 line-clamp-2">{entry.snippet}</p>
                          {entry.tags && entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {entry.tags.map((tag, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 rounded bg-muted text-[9px] font-bold uppercase tracking-wider text-foreground/60 border border-border/50">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 bg-purple-500/10 px-2 py-1 rounded transition-colors"
                      >
                        <LinkIcon className="w-3 h-3 flex-shrink-0" />
                        <span className="max-w-[200px] truncate">{entry.url}</span>
                      </a>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[10px] uppercase font-black tracking-widest text-foreground/60 border border-border px-2 py-1 rounded-md bg-muted/50">
                        {entry.source_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={clsx(
                        'inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tight border',
                        getRiskBadgeStyles(entry.risk_level)
                      )}>
                        {t(`risk_${entry.risk_level}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteById({ id: entry._id })}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-foreground/40 hover:text-destructive transition-colors group-hover:opacity-100 opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {results.length === 0 && !isLoading && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <GlobeLock className="w-8 h-8 text-foreground/20 opacity-20" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg">{t('no_results')}</h3>
              <p className="text-sm text-foreground/70 max-w-xs mx-auto">
                {t('no_results_desc')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
