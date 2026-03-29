'use client';

import resources from '../../../data/osintResources.json';
import { useState, useMemo, useEffect } from 'react';
import {
  ExternalLink, Filter, Shield, Search, Mail, Globe,
  Wifi, User, Phone, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, Clock, Trash2,
} from 'lucide-react';
import clsx from 'clsx';
import Button from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { useAction, useQuery, useMutation, useConvexAuth } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Static directory data ─────────────────────────────────────────────
const CATEGORIES = [
  'social', 'people', 'dating', 'phone', 'public records',
  'geolocation', 'maps', 'business', 'search', 'directory',
  'misc', 'news', 'email', 'security',
];
const LABELS = [
  { code: 'T', text: 'Tool (local install)' },
  { code: 'R', text: 'Registration required' },
  { code: 'M', text: 'Manual URL edit' },
  { code: 'D', text: 'Google dork' },
];

type Resource = {
  id: string;
  name: string;
  url: string;
  description: string;
  categories: string[];
  labels: string[];
  language: string;
  region?: string | null;
  freeTier: boolean;
  notes?: string | null;
};

// ─── Lookup type definition ─────────────────────────────────────────────
type LookupType = 'email' | 'domain' | 'ip' | 'username' | 'phone';

// ─── History record shape from Convex ─────────────────────────────────────────
type HistoryItem = {
  _id: string;
  type: LookupType;
  query: string;
  result: Record<string, unknown>;
  createdAt: number;
};

// ─── Main component ─────────────────────────────────────────────────────
export default function OsintTab() {
  const { isAuthenticated } = useConvexAuth();
  const t = useTranslations('OsintTab');
  const tCommon = useTranslations('Common');
  const tOsint = useTranslations('Osint');
  const tDashboard = useTranslations('Dashboard');

  const LOOKUP_TYPES: Array<{
    type: LookupType;
    label: string;
    icon: React.ReactNode;
    placeholder: string;
    hint: string;
  }> = [
      { type: 'email', label: t('panels.email.title'), icon: <Mail className="w-4 h-4" />, placeholder: t('panels.email.placeholder'), hint: t('panels.email.desc') },
      { type: 'domain', label: t('panels.domain.title'), icon: <Globe className="w-4 h-4" />, placeholder: t('panels.domain.placeholder'), hint: t('panels.domain.desc') },
      { type: 'ip', label: t('panels.ip.title'), icon: <Wifi className="w-4 h-4" />, placeholder: t('panels.ip.placeholder'), hint: t('panels.ip.desc') },
      { type: 'username', label: t('panels.username.title'), icon: <User className="w-4 h-4" />, placeholder: t('panels.username.placeholder'), hint: t('panels.username.desc') },
      { type: 'phone', label: t('panels.phone.title'), icon: <Phone className="w-4 h-4" />, placeholder: t('panels.phone.placeholder'), hint: t('panels.phone.desc') },
    ];

  // ── Hydration guard ──
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // ── Active lookup state ──
  const [activeType, setActiveType] = useState<LookupType>('email');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);

  // ── Convex actions (Node.js runtime — osint.ts) ──
  const lookupEmail = useAction(api.osint.lookupEmail);
  const lookupDomain = useAction(api.osint.lookupDomain);
  const lookupIp = useAction(api.osint.lookupIp);
  const lookupUsername = useAction(api.osint.lookupUsername);
  const lookupPhone = useAction(api.osint.lookupPhone);
  // ── DB operations (default runtime — osintDb.ts) ──
  const deleteResult = useMutation(api.osintDb.deleteOsintResult);
  const history = useQuery(
    api.osintDb.getOsintResults,
    isAuthenticated ? { limit: 20 } : 'skip'
  ) as HistoryItem[] | undefined;

  // ── Resource directory state ──
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [labelFilter, setLabelFilter] = useState<string>('all');
  const [freeOnly, setFreeOnly] = useState(false);
  const [language, setLanguage] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [dirOpen, setDirOpen] = useState(false);
  const pageSize = 30;

  const filtered = useMemo(() => {
    let list = resources as Resource[];
    if (category !== 'all') list = list.filter(r => r.categories.includes(category));
    if (labelFilter !== 'all') list = list.filter(r => r.labels.includes(labelFilter));
    if (freeOnly) list = list.filter(r => r.freeTier);
    if (language !== 'all') list = list.filter(r => r.language === language || r.language === 'both');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [category, labelFilter, freeOnly, language, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice(page * pageSize, page * pageSize + pageSize);

  // ── Run lookup ──
  const handleLookup = async () => {
    if (!isAuthenticated) { setError(tDashboard('not_authenticated')); return; }
    if (!query.trim()) { setError(tCommon('search_placeholder')); return; }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      let res: { data?: Record<string, unknown> } | undefined;
      switch (activeType) {
        case 'email': res = await lookupEmail({ email: query }); break;
        case 'domain': res = await lookupDomain({ domain: query }); break;
        case 'ip': res = await lookupIp({ ip: query }); break;
        case 'username': res = await lookupUsername({ username: query }); break;
        case 'phone': res = await lookupPhone({ phone: query }); break;
      }
      setResult(res?.data ?? null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : tCommon('no_results'));
    } finally {
      setLoading(false);
    }
  };

  // ── Resource filtering for the active panel ──
  const suggestedTools = useMemo(() => {
    let cat: string[] = [];
    switch (activeType) {
      case 'email': cat = ['email', 'security']; break;
      case 'domain': cat = ['geolocation', 'maps', 'business', 'search', 'security']; break;
      case 'ip': cat = ['geolocation', 'security']; break;
      case 'username': cat = ['social', 'people', 'dating']; break;
      case 'phone': cat = ['phone']; break;
    }
    return (resources as Resource[]).filter(r => r.categories.some(c => cat.includes(c))).slice(0, 6);
  }, [activeType]);

  if (!mounted) return null;
  const currentType = LOOKUP_TYPES.find(l => l.type === activeType)!;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ══ LEFT COLUMN: INVESTIGATION ENGINE ═══════════════════════ */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-bold">{t('title')}</h2>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{tCommon('status')}</span>
            </div>
          </div>

          {/* Type Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {LOOKUP_TYPES.map(lt => (
              <button
                key={lt.type}
                onClick={() => { setActiveType(lt.type); setQuery(''); setResult(null); setError(''); }}
                className={clsx(
                  'flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all',
                  activeType === lt.type
                    ? 'bg-primary/5 border-primary text-primary shadow-sm'
                    : 'border-border/60 bg-muted/20 hover:border-primary/30 text-muted-foreground'
                )}
              >
                <div className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                  activeType === lt.type ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                  {lt.icon}
                </div>
                <span className="text-xs font-bold uppercase tracking-tight">{lt.label}</span>
              </button>
            ))}
          </div>

          {/* Search Row */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLookup()}
                  placeholder={currentType.placeholder}
                  className="w-full pl-11 pr-4 py-3 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  disabled={loading}
                />
              </div>
              <Button
                variant="primary"
                onClick={handleLookup}
                isLoading={loading}
                disabled={loading || !isAuthenticated}
                className="px-8 py-3 font-bold text-sm h-auto shadow-lg shadow-primary/20"
              >
                {loading ? tCommon('analyze_tone') : tCommon('generate_report')}
              </Button>
            </div>
            <div className="flex items-center gap-2 px-1">
              <div className="w-1 h-1 rounded-full bg-primary/40" />
              <p className="text-[11px] text-muted-foreground font-medium">{currentType.hint}</p>
            </div>
          </div>

          {/* Result Area */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-3"
              >
                <XCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold">{error}</span>
              </motion.div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 px-1">
                  <CheckCircle2 className="w-4 h-4" /> {tCommon('copied')}
                </div>
                <div className="bg-muted/30 border border-border rounded-2xl overflow-hidden">
                  <div className="px-4 py-2 border-b border-border bg-muted/50 flex items-center justify-between">
                    <span className="text-[10px] font-black text-muted-foreground uppercase">RAW DATA</span>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] uppercase font-bold" onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}>{tCommon('copy')}</Button>
                  </div>
                  <pre className="text-xs text-foreground/80 whitespace-pre-wrap break-all overflow-auto max-h-[400px] p-4 font-mono scrollbar-thin">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Investigation History */}
        {mounted && isAuthenticated && history && history.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">{tDashboard('coverage_log')}</h3>
            </div>
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item._id} className="group border border-border rounded-xl overflow-hidden transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
                  <div
                    className="w-full flex items-center justify-between px-4 py-3 bg-muted/10 hover:bg-muted/30 text-left text-sm transition-colors cursor-pointer"
                    onClick={() => setExpandedHistory(expandedHistory === item._id ? null : item._id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={clsx(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border',
                        item.type === 'email' && 'bg-blue-500/10 border-blue-500/20 text-blue-600',
                        item.type === 'domain' && 'bg-purple-500/10 border-purple-500/20 text-purple-600',
                        item.type === 'ip' && 'bg-orange-500/10 border-orange-500/20 text-orange-600',
                        item.type === 'username' && 'bg-green-500/10 border-green-500/20 text-green-600',
                        item.type === 'phone' && 'bg-pink-500/10 border-pink-500/20 text-pink-600',
                      )}>
                        {LOOKUP_TYPES.find(l => l.type === item.type)?.icon || <Shield className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{item.query}</span>
                        <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60 tracking-tighter" suppressHydrationWarning>
                          {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async (e) => { e.stopPropagation(); await deleteResult({ id: item._id as Id<"osint_results"> }); }}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {expandedHistory === item._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                  {expandedHistory === item._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="border-t border-border bg-background/50"
                    >
                      <pre className="text-[10px] text-foreground/70 whitespace-pre-wrap break-all p-4 overflow-auto max-h-60 font-mono leading-relaxed">
                        {JSON.stringify(item.result, null, 2)}
                      </pre>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══ RIGHT COLUMN: EXTERNAL TOOLS ═══════════════════════════ */}
      <div className="lg:col-span-4 space-y-6">
        {/* Suggested External Tools */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">{t('suggested_tools')}</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('subtitle')}
          </p>

          <div className="grid grid-cols-1 gap-2">
            {suggestedTools.map(tool => (
              <a
                key={tool.id}
                href={tool.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{tool.name}</h4>
                  <p className="text-[10px] text-muted-foreground truncate">{tool.description}</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-background border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all ml-3">
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full text-[10px] font-black uppercase tracking-widest text-primary border border-primary/10 hover:bg-primary/5 shadow-none"
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

      {/* ══ FULL DIRECTORY MODAL (reusing directory UI) ════════════ */}
      {dirOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border w-full max-w-6xl max-h-full overflow-hidden rounded-3xl shadow-2xl flex flex-col scale-in-center">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="font-bold">{tOsint('title')}</h3>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-primary/20">
                  {resources.length} {tOsint('filters.search')}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setDirOpen(false)} className="w-8 h-8 p-0 rounded-full hover:bg-muted"><XCircle className="w-5 h-5" /></Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {/* Reuse of standard filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase px-1">{tOsint('filters.category')}</label>
                  <select className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20" value={category} onChange={e => { setCategory(e.target.value); setPage(0); }}>
                    <option value="all">Global (All)</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase px-1">{tOsint('filters.label')}</label>
                  <select className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20" value={labelFilter} onChange={e => { setLabelFilter(e.target.value); setPage(0); }}>
                    <option value="all">Any Access</option>
                    {LABELS.map(l => <option key={l.code} value={l.code}>{l.text}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase px-1">{tOsint('filters.language')}</label>
                  <select className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20" value={language} onChange={e => { setLanguage(e.target.value); setPage(0); }}>
                    <option value="all">Multi-language</option>
                    <option value="en">English Only</option>
                    <option value="ar">Arabic Oriented</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase px-1">{tOsint('filters.search')}</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input className="w-full pl-9 pr-3 py-2.5 bg-muted/50 border border-border rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20" placeholder={tOsint('filters.search_placeholder')} value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
                  </div>
                </div>
              </div>

              {/* Grid of tools */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {paged.map(r => (
                  <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="flex flex-col group p-4 bg-muted/20 border border-border rounded-2xl hover:border-primary/40 hover:bg-card hover:shadow-xl transition-all h-full">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{r.name}</h4>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mb-4 flex-1 font-medium">{r.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {r.categories.slice(0, 2).map(c => (
                        <span key={c} className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/10">{c}</span>
                      ))}
                      {r.freeTier && <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/10">Free</span>}
                    </div>
                  </a>
                ))}
              </div>

              {/* Pagination bar */}
              <div className="flex items-center justify-between pt-6 border-t border-border mt-auto sticky bottom-0 bg-card py-4">
                <span className="text-[11px] font-bold text-muted-foreground">{tOsint('pagination.showing', { count: paged.length, total: filtered.length })}</span>
                <div className="flex items-center gap-1.5">
                  <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} className="h-8 px-3 text-xs">{tOsint('pagination.prev')}</Button>
                  <div className="flex items-center gap-1 px-3 h-8 bg-muted rounded-lg text-[10px] font-bold">{tOsint('pagination.page', { page: page + 1, total: pageCount })}</div>
                  <Button variant="ghost" size="sm" disabled={page + 1 >= pageCount} onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} className="h-8 px-3 text-xs">{tOsint('pagination.next')}</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
