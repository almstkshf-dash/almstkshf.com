/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import React, { useState } from 'react';
import { Filter, Search, XCircle, ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Resource } from '../types';
import { useResourceFilter } from '../hooks/useResourceFilter';
import { CATEGORIES, LABELS } from '@/constants/osint';

interface ResourceDirectoryProps {
  isOpen: boolean;
  onClose: () => void;
  tOsint: (key: string, values?: Record<string, string | number>) => string;
  resources: Resource[];
}

export const ResourceDirectory = ({ isOpen, onClose, tOsint, resources }: ResourceDirectoryProps) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [labelFilter, setLabelFilter] = useState('all');
  const [freeOnly, setFreeOnly] = useState(false);
  const [language, setLanguage] = useState('all');
  const [page, setPage] = useState(0);
  const pageSize = 30;

  const filtered = useResourceFilter(resources, {
    category,
    labelFilter,
    freeOnly,
    language,
    search,
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice(page * pageSize, page * pageSize + pageSize);

  const handleResetSearch = (val: string) => {
    setSearch(val);
    setPage(0);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm animate-fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="osint-directory-title"
    >
      <div className="bg-card border border-border w-full max-w-6xl max-h-full overflow-hidden rounded-3xl shadow-2xl flex flex-col scale-in-center">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-primary" />
            <h3 id="osint-directory-title" className="font-bold text-foreground">
              {tOsint('title')}
            </h3>
            <span className="text-[10px] bg-primary/10 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-primary/20">
              {resources.length} {tOsint('filters.search')}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0 rounded-full hover:bg-muted text-foreground/75"
            aria-label="Close Directory"
          >
            <XCircle className="w-5 h-5" />
          </Button>
        </div>

        {/* Filters and Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div className="space-y-1.5 flex flex-col">
              <label htmlFor="dir-category" className="text-[10px] font-black text-foreground/70 dark:text-slate-400 uppercase px-1">
                {tOsint('filters.category')}
              </label>
              <select
                id="dir-category"
                name="category"
                aria-label={tOsint('filters.category')}
                className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 text-foreground cursor-pointer"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(0);
                }}
              >
                <option value="all">Global (All)</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Label Filter */}
            <div className="space-y-1.5 flex flex-col">
              <label htmlFor="dir-label" className="text-[10px] font-black text-foreground/70 dark:text-slate-400 uppercase px-1">
                {tOsint('filters.label')}
              </label>
              <select
                id="dir-label"
                name="label"
                aria-label={tOsint('filters.label')}
                className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 text-foreground cursor-pointer"
                value={labelFilter}
                onChange={(e) => {
                  setLabelFilter(e.target.value);
                  setPage(0);
                }}
              >
                <option value="all">Any Access</option>
                {LABELS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.text}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div className="space-y-1.5 flex flex-col">
              <label htmlFor="dir-lang" className="text-[10px] font-black text-foreground/70 dark:text-slate-400 uppercase px-1">
                {tOsint('filters.language')}
              </label>
              <select
                id="dir-lang"
                name="language"
                aria-label={tOsint('filters.language')}
                className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 text-foreground cursor-pointer"
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  setPage(0);
                }}
              >
                <option value="all">Multi-language</option>
                <option value="en">English Only</option>
                <option value="ar">Arabic Oriented</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="space-y-1.5 flex flex-col">
              <label htmlFor="dir-search" className="text-[10px] font-black text-foreground/70 dark:text-slate-400 uppercase px-1">
                {tOsint('filters.search')}
              </label>
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/60" aria-hidden="true" />
                <input
                  id="dir-search"
                  name="search"
                  className="w-full ps-9 pe-3 py-2.5 bg-muted/50 border border-border rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  placeholder={tOsint('filters.search_placeholder')}
                  value={search}
                  onChange={(e) => handleResetSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Toggle for Free Only */}
          <div className="flex items-center gap-2 px-1">
            <input
              id="dir-free"
              type="checkbox"
              checked={freeOnly}
              onChange={(e) => {
                setFreeOnly(e.target.checked);
                setPage(0);
              }}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 bg-card cursor-pointer"
            />
            <label htmlFor="dir-free" className="text-xs font-bold text-foreground cursor-pointer">
              Show Free Tools Only
            </label>
          </div>

          {/* Grid of tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {paged.map((r) => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col group p-4 bg-muted/20 border border-border rounded-2xl hover:border-primary/40 hover:bg-card hover:shadow-xl transition-all h-full"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                    {r.name}
                  </h4>
                  <ExternalLink className="w-3.5 h-3.5 text-foreground/60 group-hover:text-primary" />
                </div>
                <p className="text-[11px] text-foreground/70 line-clamp-2 mb-4 flex-1 font-medium">
                  {r.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {r.categories.slice(0, 2).map((c) => (
                    <span
                      key={c}
                      className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-primary/10 text-blue-800 dark:text-blue-300 border border-primary/10"
                    >
                      {c}
                    </span>
                  ))}
                  {r.freeTier && (
                    <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/10">
                      Free
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>

          {/* Pagination bar */}
          <div className="flex items-center justify-between pt-6 border-t border-border mt-auto sticky bottom-0 bg-card py-4">
            <span className="text-[11px] font-bold text-foreground/70">
              {tOsint('pagination.showing', { count: paged.length, total: filtered.length })}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="h-8 px-3 text-xs text-foreground"
              >
                {tOsint('pagination.prev')}
              </Button>
              <div className="flex items-center gap-1 px-3 h-8 bg-muted rounded-lg text-[10px] font-bold text-foreground">
                {tOsint('pagination.page', { page: page + 1, total: pageCount })}
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={page + 1 >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                className="h-8 px-3 text-xs text-foreground"
              >
                {tOsint('pagination.next')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDirectory;
