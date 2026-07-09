/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import resources from '../../data/osintResources.json';
import React, { useState, useReducer, useEffect, useMemo } from 'react';
import {
  ExternalLink,
  Shield,
  Clock,
  Trash2,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  XCircle,
  FolderPlus,
} from 'lucide-react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/routing';
import { useConvexAuth } from 'convex/react';
import Button from '@/components/ui/Button';
import SaveToCollectionModal from '@/components/ui/SaveToCollectionModal';
import { useMounted } from '@/hooks/useMounted';
import { toast } from 'sonner';

import { LookupType, OsintResult, HistoryItem, Resource } from './types';
import { useOsintLookup } from './hooks/useOsintLookup';
import { useOsintHistory } from './hooks/useOsintHistory';
import { validateInput } from './utils/validators';

import LookupSelector from './panels/LookupSelector';
import LookupInput from './panels/LookupInput';
import ResultRenderer from './panels/ResultRenderer';
import ResourceDirectory from './panels/ResourceDirectory';
import StructuredResultView from './results/StructuredResultView';

// Reducer implementation for core search state
interface OsintState {
  query: string;
  activeType: LookupType;
  loading: boolean;
  result: OsintResult | null;
  error: string;
  optimizationInfo: { original: string; explanation: string } | null;
  isOptimizing: boolean;
}

type OsintAction =
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_ACTIVE_TYPE'; payload: LookupType }
  | { type: 'START_LOOKUP' }
  | { type: 'LOOKUP_SUCCESS'; payload: OsintResult | null }
  | { type: 'LOOKUP_FAILURE'; payload: string }
  | { type: 'START_OPTIMIZATION' }
  | { type: 'OPTIMIZATION_SUCCESS'; payload: { original: string; explanation: string; optimized: string } }
  | { type: 'OPTIMIZATION_FAILURE' }
  | { type: 'CLEAR_OPTIMIZATION' }
  | { type: 'RESET_RESULT' };

const initialState = (initialTab: LookupType): OsintState => ({
  query: '',
  activeType: initialTab,
  loading: false,
  result: null,
  error: '',
  optimizationInfo: null,
  isOptimizing: false,
});

function osintReducer(state: OsintState, action: OsintAction): OsintState {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, query: action.payload };
    case 'SET_ACTIVE_TYPE':
      return {
        ...state,
        activeType: action.payload,
        query: '',
        result: null,
        error: '',
        optimizationInfo: null,
      };
    case 'START_LOOKUP':
      return { ...state, loading: true, error: '', result: null, optimizationInfo: null };
    case 'LOOKUP_SUCCESS':
      return { ...state, loading: false, result: action.payload, error: '' };
    case 'LOOKUP_FAILURE':
      return { ...state, loading: false, result: null, error: action.payload };
    case 'START_OPTIMIZATION':
      return { ...state, isOptimizing: true };
    case 'OPTIMIZATION_SUCCESS':
      return {
        ...state,
        isOptimizing: false,
        optimizationInfo: { original: action.payload.original, explanation: action.payload.explanation },
        query: action.payload.optimized,
      };
    case 'OPTIMIZATION_FAILURE':
      return { ...state, isOptimizing: false };
    case 'CLEAR_OPTIMIZATION':
      return { ...state, query: state.optimizationInfo?.original || state.query, optimizationInfo: null };
    case 'RESET_RESULT':
      return { ...state, result: null, error: '' };
    default:
      return state;
  }
}

export default function OsintTab() {
  const { isAuthenticated } = useConvexAuth();
  const t = useTranslations('OsintTab');
  const tCommon = useTranslations('Common');
  const tOsint = useTranslations('Osint');
  const tDashboard = useTranslations('Dashboard');
  const tOpt = useTranslations('SearchOptimizer');

  const mounted = useMounted();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Active lookup state URL sync
  const initialTab = (searchParams.get('osint_tab') as LookupType) || 'watchlist';
  const [state, dispatch] = useReducer(osintReducer, initialTab, initialState);

  // Sync state with URL changes
  useEffect(() => {
    const tab = searchParams.get('osint_tab') as LookupType;
    const allowedTabs: LookupType[] = [
      'email',
      'domain',
      'ip',
      'username',
      'phone',
      'news',
      'corporate',
      'location',
      'wikipedia',
      'gleif',
      'watchlist',
    ];
    if (tab && allowedTabs.includes(tab) && tab !== state.activeType) {
      dispatch({ type: 'SET_ACTIVE_TYPE', payload: tab });
    }
  }, [searchParams, state.activeType]);

  const handleTypeChange = (type: LookupType) => {
    dispatch({ type: 'SET_ACTIVE_TYPE', payload: type });
    const params = new URLSearchParams(searchParams.toString());
    params.set('osint_tab', type);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Convex actions & hooks
  const { performLookup, optimizeQuery } = useOsintLookup();
  const { history, settings, isAdmin, deleteResult, updateResult, handleExport, isExporting } =
    useOsintHistory(isAuthenticated);

  // Modal UI States
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [historyItemToSave, setHistoryItemToSave] = useState<HistoryItem | null>(null);
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set());
  const [isBulkCollectionModalOpen, setIsBulkCollectionModalOpen] = useState(false);
  const [historyItemToEdit, setHistoryItemToEdit] = useState<HistoryItem | null>(null);
  const [editJsonStr, setEditJsonStr] = useState<string>('');
  const [dirOpen, setDirOpen] = useState(false);

  const toggleMatchSelection = (matchId: string) => {
    const newSet = new Set(selectedMatches);
    if (newSet.has(matchId)) newSet.delete(matchId);
    else newSet.add(matchId);
    setSelectedMatches(newSet);
  };

  const toggleAllMatches = (matchIds: string[]) => {
    setSelectedMatches(prev => {
      const allSelected = matchIds.every(id => prev.has(id));
      const next = new Set(prev);
      if (allSelected) {
        matchIds.forEach(id => next.delete(id));
      } else {
        matchIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  const handleOptimize = async () => {
    if (!state.query.trim()) return;
    dispatch({ type: 'START_OPTIMIZATION' });
    try {
      const res = await optimizeQuery(state.query, state.activeType);
      if (res && res.optimized) {
        dispatch({
          type: 'OPTIMIZATION_SUCCESS',
          payload: {
            original: state.query,
            explanation: res.explanation,
            optimized: res.optimized,
          },
        });
      } else {
        dispatch({ type: 'OPTIMIZATION_FAILURE' });
      }
    } catch (e) {
      console.error('OSINT query optimization failed:', e);
      dispatch({ type: 'OPTIMIZATION_FAILURE' });
    }
  };

  const handleLookup = async () => {
    if (!isAuthenticated) {
      toast.error(tDashboard('not_authenticated'));
      return;
    }
    if (!isAdmin) {
      toast.error(t('admin_only'));
      return;
    }

    const validationError = validateInput(state.activeType, state.query);
    if (validationError) {
      const localizedError = t(`validation.${validationError}` as any) || (
        validationError === 'empty'
          ? 'Input query cannot be empty'
          : validationError === 'too_short'
            ? 'Query is too short'
            : 'Invalid query format'
      );
      toast.error(localizedError);
      dispatch({ type: 'LOOKUP_FAILURE', payload: localizedError });
      return;
    }

    dispatch({ type: 'START_LOOKUP' });
    try {
      const data = await performLookup(state.activeType, state.query);
      dispatch({ type: 'LOOKUP_SUCCESS', payload: data });
    } catch (e: any) {
      const msg = e instanceof Error ? e.message : 'No results returned';
      dispatch({ type: 'LOOKUP_FAILURE', payload: msg });
    }
  };

  // Resource directories suggested list
  const suggestedTools = useMemo(() => {
    let cat: string[] = [];
    switch (state.activeType) {
      case 'email':
        cat = ['email', 'security'];
        break;
      case 'domain':
        cat = ['geolocation', 'maps', 'business', 'search', 'security'];
        break;
      case 'ip':
        cat = ['geolocation', 'security'];
        break;
      case 'username':
        cat = ['social', 'people', 'dating'];
        break;
      case 'phone':
        cat = ['phone'];
        break;
      case 'news':
        cat = ['news', 'misc'];
        break;
      case 'corporate':
        cat = ['business', 'public records'];
        break;
      case 'location':
        cat = ['geolocation', 'maps'];
        break;
      case 'wikipedia':
        cat = ['search', 'misc'];
        break;
      case 'gleif':
        cat = ['business', 'public records'];
        break;
      case 'watchlist':
        cat = ['security', 'public records'];
        break;
    }
    return (resources as Resource[]).filter((r) => r.categories.some((c) => cat.includes(c))).slice(0, 6);
  }, [state.activeType]);

  const lookupMetadata = useMemo(() => {
    const mappings: Record<LookupType, { placeholder: string; hint: string }> = {
      email: { placeholder: t('panels.email.placeholder'), hint: t('panels.email.desc') },
      domain: { placeholder: t('panels.domain.placeholder'), hint: t('panels.domain.desc') },
      ip: { placeholder: t('panels.ip.placeholder'), hint: t('panels.ip.desc') },
      username: { placeholder: t('panels.username.placeholder'), hint: t('panels.username.desc') },
      phone: { placeholder: t('panels.phone.placeholder'), hint: t('panels.phone.desc') },
      news: { placeholder: t('panels.news.placeholder'), hint: t('panels.news.desc') },
      corporate: { placeholder: t('panels.corporate.placeholder'), hint: t('panels.corporate.desc') },
      location: { placeholder: t('panels.location.placeholder'), hint: t('panels.location.desc') },
      wikipedia: { placeholder: t('panels.wikipedia.placeholder'), hint: t('panels.wikipedia.desc') },
      gleif: { placeholder: t('panels.gleif.placeholder'), hint: t('panels.gleif.desc') },
      watchlist: { placeholder: t('panels.watchlist.placeholder'), hint: t('panels.watchlist.desc') },
      gdelt: { placeholder: t('panels.gdelt.placeholder'), hint: t('panels.gdelt.desc') },
    };
    return mappings[state.activeType];
  }, [state.activeType, t]);

  if (!mounted) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN: INVESTIGATION ENGINE */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 animate-pulse">
              <Shield className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-bold text-foreground">{t('title')}</h2>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">
                {t('live_badge')}
              </span>
            </div>
          </div>

          {/* Type Grid Selector */}
          <LookupSelector activeType={state.activeType} onTypeChange={handleTypeChange} t={t as any} />

          {/* Search Row Input */}
          <LookupInput
            query={state.query}
            onQueryChange={(val) => dispatch({ type: 'SET_QUERY', payload: val })}
            onLookup={handleLookup}
            onOptimize={handleOptimize}
            loading={state.loading}
            isOptimizing={state.isOptimizing}
            isAuthenticated={isAuthenticated}
            isAdmin={!!isAdmin}
            placeholder={lookupMetadata.placeholder}
            hint={lookupMetadata.hint}
            tCommon={tCommon as any}
            tOpt={tOpt as any}
            t={t as any}
            optimizationInfo={state.optimizationInfo}
            onClearOptimization={() => dispatch({ type: 'CLEAR_OPTIMIZATION' })}
          />

          {/* Result Output Area */}
          <ResultRenderer
            result={state.result}
            error={state.error}
            loading={state.loading}
            activeType={state.activeType}
            query={state.query}
            t={t as any}
            tCommon={tCommon as any}
            tDashboard={tDashboard as any}
            selectedMatches={selectedMatches}
            onToggleMatch={toggleMatchSelection}
            onToggleAllMatches={toggleAllMatches}
            onSaveSelected={() => setIsBulkCollectionModalOpen(true)}
            isCollectionModalOpen={isCollectionModalOpen}
            onSetCollectionModalOpen={setIsCollectionModalOpen}
          />
        </div>

        {/* Investigation History Logs */}
        {mounted && isAuthenticated && history && history.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
                  {tDashboard('coverage_log')}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExport('pdf')}
                  disabled={!!isExporting}
                  isLoading={isExporting === 'pdf'}
                  className="h-7 text-[9px] uppercase tracking-widest font-bold gap-1.5 rounded-lg px-2 text-foreground bg-muted/10 hover:bg-muted/20 border border-border"
                >
                  <FileText className="w-3 h-3" />
                  PDF
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExport('excel')}
                  disabled={!!isExporting}
                  isLoading={isExporting === 'excel'}
                  className="h-7 text-[9px] uppercase tracking-widest font-bold gap-1.5 rounded-lg px-2 text-foreground bg-muted/10 hover:bg-muted/20 border border-border"
                >
                  <FileSpreadsheet className="w-3 h-3" />
                  EXCEL
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item._id}
                  className="group border border-border rounded-xl overflow-hidden transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedHistory(expandedHistory === item._id ? null : item._id);
                      }
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 bg-muted/10 hover:bg-muted/30 text-left text-sm transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-primary/20"
                    onClick={() => setExpandedHistory(expandedHistory === item._id ? null : item._id)}
                    aria-expanded={expandedHistory === item._id}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={clsx(
                          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border bg-muted',
                          item.type === 'email' && 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
                          item.type === 'domain' && 'bg-purple-500/10 border-purple-500/20 text-purple-600',
                          item.type === 'ip' && 'bg-orange-500/10 border-orange-500/20 text-orange-600',
                          item.type === 'username' && 'bg-green-500/10 border-green-500/20 text-green-600',
                          item.type === 'phone' && 'bg-pink-500/10 border-pink-500/20 text-pink-600',
                          item.type === 'corporate' && 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600',
                          item.type === 'location' && 'bg-teal-500/10 border-teal-500/20 text-teal-600',
                          item.type === 'wikipedia' && 'bg-zinc-500/10 border-zinc-500/20 text-zinc-600',
                          item.type === 'gleif' && 'bg-blue-600/10 border-blue-600/20 text-blue-700',
                          item.type === 'watchlist' && 'bg-red-500/10 border-red-500/20 text-red-600'
                        )}
                      >
                        <Shield className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{item.query}</span>
                        <span
                          className="text-[10px] font-black text-foreground/70 uppercase opacity-80 tracking-tighter"
                          suppressHydrationWarning
                        >
                          {new Date(item.createdAt).toLocaleDateString()} •{' '}
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setHistoryItemToEdit(item);
                          setEditJsonStr(JSON.stringify(item.result, null, 2));
                        }}
                        className="p-1.5 rounded-lg opacity-100 hover:bg-blue-500/10 text-foreground/60 hover:text-blue-500 transition-all cursor-pointer"
                        aria-label={tCommon('edit')}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await deleteResult(item._id);
                        }}
                        className="p-1.5 rounded-lg opacity-100 hover:bg-destructive/10 text-foreground/60 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer"
                        aria-label={tCommon('delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setHistoryItemToSave(item);
                        }}
                        className="p-1.5 rounded-lg opacity-100 hover:bg-emerald-500/10 text-foreground/60 hover:text-emerald-500 transition-all cursor-pointer"
                        aria-label={t('result_view.fields.save_collection')}
                      >
                        <FolderPlus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-foreground/60 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {expandedHistory === item._id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>
                  {expandedHistory === item._id && (
                    <div className="border-t border-border bg-background/30 p-6">
                      <StructuredResultView
                        type={item.type as LookupType}
                        data={item.result as OsintResult}
                        t={t as any}
                        selectedMatches={selectedMatches}
                        onToggleMatch={toggleMatchSelection}
                        onToggleAllMatches={toggleAllMatches}
                        onSaveSelected={() => setIsBulkCollectionModalOpen(true)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Edit Result Modal */}
            {historyItemToEdit && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in duration-200">
                <div className="bg-card w-full max-w-2xl rounded-2xl shadow-xl border border-border flex flex-col max-h-[90vh]">
                  <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                    <h3 className="font-bold text-lg text-foreground">Edit Result Data</h3>
                    <button
                      onClick={() => setHistoryItemToEdit(null)}
                      className="text-foreground/50 hover:text-foreground cursor-pointer"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4 flex-1 overflow-hidden flex flex-col">
                    <p className="text-xs text-foreground/60 mb-2">
                      You can manually modify the JSON data below (e.g., removing unwanted array items like false
                      positive Watchlist matches).
                    </p>
                    <textarea
                      className="w-full flex-1 bg-muted/20 border border-border rounded-lg p-4 font-mono text-xs focus:ring-1 focus:ring-primary outline-none resize-none text-foreground"
                      value={editJsonStr}
                      onChange={(e) => setEditJsonStr(e.target.value)}
                    />
                  </div>
                  <div className="p-4 border-t border-border flex justify-end gap-3">
                    <Button variant="ghost" className="text-foreground" onClick={() => setHistoryItemToEdit(null)}>Cancel</Button>
                    <Button
                      onClick={async () => {
                        try {
                          const parsed = JSON.parse(editJsonStr);
                          await updateResult(historyItemToEdit._id, parsed);
                          setHistoryItemToEdit(null);
                          toast.success('Successfully updated lookup result.');
                        } catch (e) {
                          toast.error('Invalid JSON format. Please make sure the structure is correct.');
                        }
                      }}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {historyItemToSave && (
              <SaveToCollectionModal
                isOpen={!!historyItemToSave}
                onClose={() => setHistoryItemToSave(null)}
                item={{
                  id: historyItemToSave._id,
                  type: 'osint',
                  title: `OSINT: ${historyItemToSave.type} lookup for ${historyItemToSave.query}`,
                  data: historyItemToSave.result,
                }}
              />
            )}

            {isBulkCollectionModalOpen && selectedMatches.size > 0 && (
              <SaveToCollectionModal
                isOpen={isBulkCollectionModalOpen}
                onClose={() => {
                  setIsBulkCollectionModalOpen(false);
                  setSelectedMatches(new Set());
                }}
                item={{
                  id: `bulk_osint_watchlist_${Date.now()}`,
                  type: 'osint',
                  title: `OSINT: Watchlist Selected Matches (${selectedMatches.size})`,
                  data: {
                    type: 'watchlist',
                    matches: (expandedHistory
                      ? history?.find((h) => h._id === expandedHistory)?.result?.matches
                      : (state.result as any)?.matches || []
                    ).filter((m: any) => selectedMatches.has(m.id || m.caption)),
                  },
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: EXTERNAL TOOLS */}
      <div className="lg:col-span-4 space-y-6">
        {/* Suggested External Tools */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">{t('suggested_tools')}</h3>
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed">{t('subtitle')}</p>

          <div className="grid grid-cols-1 gap-2">
            {suggestedTools.map((tool) => (
              <a
                key={tool.id}
                href={tool.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    {tool.name}
                  </h4>
                  <p className="text-[10px] text-foreground/70 truncate">{tool.description}</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-background border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all ms-3">
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full text-[10px] font-black uppercase tracking-widest text-primary border border-primary/10 hover:bg-primary/5 shadow-none h-9"
            onClick={() => setDirOpen(true)}
          >
            {tOsint('filters.search')}
          </Button>
        </div>

        {/* Quick Tips */}
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider">{tOsint('legend.title')}</h4>
          <p className="text-xs text-foreground/70 leading-relaxed italic">
            &quot;{tOsint('legend.notice')}&quot;
          </p>
        </div>
      </div>

      {/* FULL DIRECTORY MODAL */}
      <ResourceDirectory
        isOpen={dirOpen}
        onClose={() => setDirOpen(false)}
        tOsint={tOsint as any}
        resources={resources as Resource[]}
      />
    </div>
  );
}
