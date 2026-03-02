'use client';

import resources from '../../../data/osintResources.json';
import { useState, useMemo } from 'react';
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
const LOOKUP_TYPES: Array<{
  type: LookupType;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  hint: string;
}> = [
    { type: 'email', label: 'Email', icon: <Mail className="w-4 h-4" />, placeholder: 'target@example.com', hint: 'Check breaches, Gravatar, MX records' },
    { type: 'domain', label: 'Domain', icon: <Globe className="w-4 h-4" />, placeholder: 'example.com', hint: 'WHOIS, DNS, SSL certs, IP geo, Wayback' },
    { type: 'ip', label: 'IP Address', icon: <Wifi className="w-4 h-4" />, placeholder: '1.2.3.4', hint: 'Geo, ASN, reverse DNS, abuse check' },
    { type: 'username', label: 'Username', icon: <User className="w-4 h-4" />, placeholder: 'johndoe', hint: 'Existence check on 10+ platforms' },
    { type: 'phone', label: 'Phone', icon: <Phone className="w-4 h-4" />, placeholder: '+97150XXXXXXX', hint: 'Carrier, country, validity check' },
  ];

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
  const t = useTranslations('Osint');
  const { isAuthenticated } = useConvexAuth();

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
  const [freeOnly, setFreeOnly] = useState<boolean>(false);
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
    if (!isAuthenticated) { setError('Please sign in first.'); return; }
    if (!query.trim()) { setError('Please enter a value to look up.'); return; }

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
      setError(e instanceof Error ? e.message : 'Lookup failed.');
    } finally {
      setLoading(false);
    }
  };

  const currentType = LOOKUP_TYPES.find(l => l.type === activeType)!;

  return (
    <section className="space-y-6">
      {/* ══ ACTIVE LOOKUP ENGINE ════════════════════════════════ */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-500" />
          <h2 className="text-base font-bold">Active OSINT Lookup</h2>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 ml-auto">
            LIVE ENGINE
          </span>
        </div>

        {/* Type selector */}
        <div className="flex flex-wrap gap-2">
          {LOOKUP_TYPES.map(lt => (
            <button
              key={lt.type}
              onClick={() => { setActiveType(lt.type); setQuery(''); setResult(null); setError(''); }}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all',
                activeType === lt.type
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground'
              )}
            >
              {lt.icon}
              {lt.label}
            </button>
          ))}
        </div>

        {/* Search row */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLookup()}
              placeholder={currentType.placeholder}
              className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
              disabled={loading}
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleLookup}
            isLoading={loading}
            disabled={loading || !isAuthenticated}
            className="px-4 py-2.5 font-bold text-sm h-auto"
          >
            {loading ? 'Looking up...' : 'Lookup'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">{currentType.hint}</p>

        {/* Status */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
            <XCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Result display */}
        {result && (
          <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-600">
              <CheckCircle2 className="w-4 h-4" /> Lookup complete
            </div>
            <pre className="text-xs text-foreground/80 whitespace-pre-wrap break-all overflow-auto max-h-64 bg-background/60 rounded-lg p-3 border border-border">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* ══ HISTORY ═══════════════════════════════════════════════ */}
      {isAuthenticated && history && history.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Investigation History
            </h3>
          </div>
          <div className="space-y-2">
            {(history ?? []).map((item: HistoryItem) => (
              <div key={item._id} className="border border-border rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/60 text-left text-sm transition-colors"
                  onClick={() => setExpandedHistory(expandedHistory === item._id ? null : item._id)}
                >
                  <div className="flex items-center gap-3">
                    <span className={clsx(
                      'text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-widest',
                      item.type === 'email' && 'bg-blue-500/10 text-blue-600',
                      item.type === 'domain' && 'bg-purple-500/10 text-purple-600',
                      item.type === 'ip' && 'bg-orange-500/10 text-orange-600',
                      item.type === 'username' && 'bg-green-500/10 text-green-600',
                      item.type === 'phone' && 'bg-pink-500/10 text-pink-600',
                    )}>
                      {item.type}
                    </span>
                    <span className="font-semibold">{item.query}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await deleteResult({ id: item._id });
                      }}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      aria-label="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {expandedHistory === item._id
                      ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    }
                  </div>
                </button>
                {expandedHistory === item._id && (
                  <pre className="text-xs text-foreground/80 whitespace-pre-wrap break-all p-4 overflow-auto max-h-60 bg-background/60">
                    {JSON.stringify(item.result, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ RESOURCE DIRECTORY (collapsible) ═════════════════════ */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
          onClick={() => setDirOpen(o => !o)}
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="font-bold text-sm">OSINT Resource Directory</span>
            <span className="text-xs text-muted-foreground">
              {(resources as Resource[]).length} tools
            </span>
          </div>
          {dirOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {dirOpen && (
          <div className="px-6 pb-6 space-y-5 border-t border-border pt-5">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label htmlFor="filter-category" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('filters.category')}</label>
                <select
                  id="filter-category"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
                  value={category}
                  onChange={e => { setCategory(e.target.value); setPage(0); }}
                >
                  <option value="all">All</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="filter-label" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('filters.label')}</label>
                <select
                  id="filter-label"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
                  value={labelFilter}
                  onChange={e => { setLabelFilter(e.target.value); setPage(0); }}
                >
                  <option value="all">All</option>
                  {LABELS.map(l => <option key={l.code} value={l.code}>{l.code} - {l.text}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="filter-language" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('filters.language')}</label>
                <select
                  id="filter-language"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
                  value={language}
                  onChange={e => { setLanguage(e.target.value); setPage(0); }}
                >
                  <option value="all">All</option>
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('filters.free')}</label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="free-only"
                    type="checkbox"
                    checked={freeOnly}
                    onChange={e => { setFreeOnly(e.target.checked); setPage(0); }}
                  />
                  <label htmlFor="free-only" className="text-sm">{t('filters.free_label')}</label>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="filter-search" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('filters.search')}</label>
              <input
                id="filter-search"
                className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
                placeholder={t('filters.search_placeholder')}
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(0); }}
                autoComplete="off"
              />
            </div>

            {/* Legend */}
            <div className="bg-muted/50 border border-border rounded-xl p-4 text-sm flex gap-3">
              <Filter className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="font-semibold">{t('legend.title')}</div>
                <div className="text-xs flex flex-wrap gap-2 mt-2">
                  {LABELS.map(l => (
                    <span key={l.code} className="px-2 py-1 rounded bg-muted text-foreground border border-border whitespace-nowrap">
                      {l.code} — {t(`legend.${l.code}` as Parameters<typeof t>[0])}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {paged.map(r => (
                <a key={r.id} href={r.url} target="_blank" rel="noreferrer"
                  className="border border-border rounded-xl p-4 hover:border-primary/50 transition-colors bg-muted/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-foreground">{r.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 text-[11px] font-bold uppercase tracking-widest">
                    {r.categories.map(c => (
                      <span key={c} className="px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">{c}</span>
                    ))}
                    {r.labels.map(l => (
                      <span key={l} className="px-2 py-1 rounded bg-muted text-foreground border border-border">{l}</span>
                    ))}
                    {r.freeTier && (
                      <span className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30">
                        {t('badges.free')}
                      </span>
                    )}
                    {r.region && (
                      <span className="px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-400 border border-indigo-500/30">
                        {r.region}
                      </span>
                    )}
                  </div>
                  {r.notes && <p className="text-xs text-muted-foreground mt-2">{r.notes}</p>}
                </a>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{t('pagination.showing', { count: paged.length, total: filtered.length })}</span>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" disabled={page === 0}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  className={clsx('px-3 py-1 rounded border h-auto', page === 0 && 'opacity-40 cursor-not-allowed')}
                >
                  {t('pagination.prev')}
                </Button>
                <span>{t('pagination.page', { page: page + 1, total: pageCount })}</span>
                <Button variant="secondary" size="sm" disabled={page + 1 >= pageCount}
                  onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
                  className={clsx('px-3 py-1 rounded border h-auto', page + 1 >= pageCount && 'opacity-40 cursor-not-allowed')}
                >
                  {t('pagination.next')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
