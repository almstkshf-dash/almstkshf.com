/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useFormatter } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import {
  Rss,
  ExternalLink,
  RefreshCw,
  Clock,
  AlertCircle,
  ChevronRight,
  Database,
  BarChart3
} from 'lucide-react';
import { FeedItem } from '@/types/rss';
import { toast } from 'sonner';
import { RSSCategory } from '@/config/rss-sources';

interface RssFeederProps {
  initialFeedUrl: string;
  initialSourceName?: string;
  categories?: RSSCategory[];
  maxItems?: number;
  className?: string;
}

/**
 * Premium RSS Feeder Component for the Intelligence Dashboard.
 * Features real-time syncing, smooth animations, and multilingual support.
 */
export default function RssFeeder({
  initialFeedUrl,
  initialSourceName,
  categories = [],
  maxItems = 5,
  className = ""
}: RssFeederProps) {
  const t = useTranslations('RssFeeder');
  const tSources = useTranslations('RssSources');
  const format = useFormatter();
  const [activeUrl, setActiveUrl] = useState(initialFeedUrl);
  const [activeName, setActiveName] = useState(initialSourceName);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // Helper to translate source name if it's a key
  const translateSourceName = (name: string | undefined): string => {
    if (!name) return t('title');
    try {
      // Try to translate. If it fails or returns the same key, it might not be a key.
      const translated = tSources(name);
      return translated;
    } catch {
      return name;
    }
  };

  const fetchFeed = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/proxy-rss?url=${encodeURIComponent(activeUrl)}`);

      if (!response.ok) {
        throw new Error('Failed to fetch feed data');
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setItems(data.data.slice(0, maxItems));
        setLastSynced(new Date());
      } else {
        throw new Error(data.error || 'Invalid feed format');
      }
    } catch (err: unknown) {
      console.error('[RssFeeder] Fetch error:', err);
      // Explicitly check for browser-level network drops/blocks
      const message = err instanceof Error ? err.message : String(err);
      if (err instanceof TypeError && message === 'Failed to fetch') {
        setError('Network blocked. Please disable AdBlocker or check your connection.');
      } else {
        setError(message || t('error_fetching'));
      }
      if (!silent) toast.error(t('error_fetching'));
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [activeUrl, maxItems, t]);

  useEffect(() => {
    fetchFeed();
    // Auto-refresh every 15 minutes to match the proxy cache
    const interval = setInterval(() => fetchFeed(true), 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchFeed]);

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Header Section */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Rss size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground tracking-tight">
              {translateSourceName(activeName)}
            </h3>
            {lastSynced && (
              <p className="text-[10px] text-foreground/70 flex items-center gap-1">
                <Clock size={10} />
                {t('last_updated')}: {format.relativeTime(lastSynced, { now: new Date() })}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => fetchFeed()}
          disabled={isLoading}
          className="p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50 text-foreground/60 hover:text-foreground"
          aria-label={t('refresh')}
          title={t('refresh')}
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Categories Selection */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveUrl(cat.url);
                setActiveName(cat.name);
              }}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border ${activeUrl === cat.url
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-muted/30 text-foreground/70 border-border/50 hover:border-border hover:bg-muted/50'
                }`}
            >
              {translateSourceName(cat.name)}
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div className="relative min-h-[300px] bg-card/40 border border-border/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:border-border">
        <AnimatePresence mode="wait">
          {isLoading && items.length === 0 ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-foreground/60"
            >
              <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm font-medium">{t('loading')}</p>
            </motion.div>
          ) : error && items.length === 0 ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-3"
            >
              <div className="p-3 bg-destructive/10 rounded-full text-destructive">
                <AlertCircle size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{error}</p>
                <button
                  onClick={() => fetchFeed()}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Try again
                </button>
              </div>
            </motion.div>
          ) : items.length === 0 && !isLoading ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-3 text-foreground/60"
            >
              <Database size={32} strokeWidth={1.5} className="opacity-50" />
              <p className="text-sm">{t('no_items')}</p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="divide-y divide-border/30"
            >
              {items.map((item, index) => (
                <motion.div
                  key={item.guid || item.link}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative p-4 hover:bg-primary/[0.02] transition-colors"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium leading-normal text-foreground group-hover:text-primary transition-colors flex-1"
                      >
                        {item.title}
                      </a>
                      <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground/60 flex-shrink-0 mt-1" />
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-foreground/70 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1 px-1.5 py-0.5 bg-muted/50 rounded-md">
                        {item.source}
                      </span>
                      {item.isoDate && (
                        <span>{format.dateTime(new Date(item.isoDate), {
                          timeZone: 'UTC',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      )}
                    </div>

                    {/* Note: Sanitize and safely strip all HTML tags using DOMPurify */}
                    {item.description && (
                      <p className="text-xs text-foreground/70 line-clamp-2 leading-relaxed">
                        {typeof window !== 'undefined'
                          ? DOMPurify.sanitize(item.description, { ALLOWED_TAGS: [] }).slice(0, 150)
                          : item.description.replace(/<[^>]*>/g, '').slice(0, 150)}...
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        className="text-[11px] font-semibold text-primary/80 hover:text-primary flex items-center gap-1 transition-all group/btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Could open a custom drawer or modal here for reading full content
                        }}
                      >
                        {t('read_more')}
                        <ChevronRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Footer CTA */}
              <div className="p-3 bg-muted/20 flex justify-center">
                <button className="text-[11px] font-bold text-foreground/70 hover:text-primary transition-colors flex items-center gap-1.5 uppercase tracking-widest">
                  <BarChart3 size={12} />
                  {t('analyze')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
