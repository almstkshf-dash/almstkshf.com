'use client';

import resources from '../../../data/osintResources.json';
import { useState, useMemo } from 'react';
import { ExternalLink, Filter, Shield } from 'lucide-react';
import clsx from 'clsx';
import Button from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

const CATEGORIES = [
  'social', 'people', 'dating', 'phone', 'public records', 'geolocation', 'maps', 'business', 'search', 'directory', 'misc', 'news', 'email', 'security'
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

export default function OsintTab() {
  const t = useTranslations('Osint');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [labelFilter, setLabelFilter] = useState<string>('all');
  const [freeOnly, setFreeOnly] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('all');
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const filtered = useMemo(() => {
    let list = resources as Resource[];
    if (category !== 'all') list = list.filter(r => r.categories.includes(category));
    if (labelFilter !== 'all') list = list.filter(r => r.labels.includes(labelFilter));
    if (freeOnly) list = list.filter(r => r.freeTier);
    if (language !== 'all') list = list.filter(r => (r.language === language || r.language === 'both'));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
    }
    return list;
  }, [category, labelFilter, freeOnly, language, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <section className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" />
            {t('title')}
          </h2>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="space-y-1">
          <label htmlFor="filter-category" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('filters.category')}</label>
          <select
            id="filter-category"
            name="filter-category"
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(0); }}
          >
            <option value="all">All</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="filter-label" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('filters.label')}</label>
          <select
            id="filter-label"
            name="filter-label"
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
            value={labelFilter}
            onChange={(e) => { setLabelFilter(e.target.value); setPage(0); }}
          >
            <option value="all">All</option>
            {LABELS.map(l => <option key={l.code} value={l.code}>{l.code} - {l.text}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="filter-language" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('filters.language')}</label>
          <select
            id="filter-language"
            name="filter-language"
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
            value={language}
            onChange={(e) => { setLanguage(e.target.value); setPage(0); }}
          >
            <option value="all">All</option>
            <option value="en">English</option>
            <option value="ar">Arabic</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('filters.free')}</label>
          <div className="flex items-center gap-2">
            <input
              id="free-only"
              name="free-only"
              type="checkbox"
              checked={freeOnly}
              onChange={(e) => { setFreeOnly(e.target.checked); setPage(0); }}
            />
            <label htmlFor="free-only" className="text-sm text-foreground">{t('filters.free_label')}</label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="filter-search" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('filters.search')}</label>
        <input
          id="filter-search"
          name="filter-search"
          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
          placeholder={t('filters.search_placeholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          autoComplete="off"
        />
      </div>

      <div className="bg-muted/50 border border-border rounded-xl p-4 text-sm text-foreground/80 flex gap-3">
        <Filter className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <div className="font-semibold">{t('legend.title')}</div>
          <div className="text-xs flex flex-wrap gap-2 mt-2">
            {LABELS.map(l => <span key={l.code} className="px-2 py-1 rounded bg-muted text-foreground border border-border whitespace-nowrap">{l.code} — {t(`legend.${l.code}` as any)}</span>)}
          </div>
          <div className="text-xs mt-2 leading-relaxed opacity-80">{t('legend.notice')}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {paged.map(r => (
          <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="border border-border rounded-xl p-4 hover:border-primary/50 transition-colors bg-muted/40">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-foreground">{r.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex flex-wrap gap-2 mt-3 text-[11px] font-bold uppercase tracking-widest">
              {r.categories.map(c => <span key={c} className="px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">{c}</span>)}
              {r.labels.map(l => <span key={l} className="px-2 py-1 rounded bg-muted text-muted-foreground border border-border">{l}</span>)}
              {r.freeTier && <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">{t('badges.free')}</span>}
              {r.region && <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/30">{r.region}</span>}
            </div>
            {r.notes && <p className="text-xs text-muted-foreground mt-2">{r.notes}</p>}
          </a>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{t('pagination.showing', { count: paged.length, total: filtered.length })}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            className={clsx("px-3 py-1 rounded border h-auto", page === 0 && "opacity-40 cursor-not-allowed")}
          >
            {t('pagination.prev')}
          </Button>
          <span>{t('pagination.page', { page: page + 1, total: pageCount })}</span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page + 1 >= pageCount}
            onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
            className={clsx("px-3 py-1 rounded border h-auto", page + 1 >= pageCount && "opacity-40 cursor-not-allowed")}
          >
            {t('pagination.next')}
          </Button>
        </div>
      </div>
    </section>
  );
}
