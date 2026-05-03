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
import { Rss, ExternalLink, Clock, ChevronRight, RefreshCw, BarChart3, AlertCircle, Database } from 'lucide-react';
import { clsx } from 'clsx';
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

    // Use AbortController to handle stale requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const proxyUrl = `${origin}/api/proxy-rss?url=${encodeURIComponent(activeUrl)}&t=${Date.now()}`;
      console.log(`[RssFeeder] [${new Date().toISOString()}] Attempting fetch to: ${proxyUrl} (Origin: ${origin})`);
      
      const performFetch = async (retries = 2): Promise<Response> => {
        try {
          return await fetch(proxyUrl, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            }
          });
        } catch (err) {
          if (retries > 0 && err instanceof TypeError) {
            console.warn(`[RssFeeder] Fetch failed, retrying in 1.5s... (${retries} left)`);
            await new Promise(r => setTimeout(r, 1500));
            return performFetch(retries - 1);
          }
          throw err;
        }
      };

      const response = await performFetch();

      if (!response.ok) {
        // Try to get error from JSON if possible
        let errorMsg = 'Failed to fetch feed data';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch {
          // Fallback to status text
          errorMsg = `${response.status} ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setItems(data.data.slice(0, maxItems));
        setLastSynced(new Date());
      } else {
        throw new Error(data.error || 'Invalid feed format');
      }
    } catch (err: unknown) {
      // Log full error details for debugging without triggering Next.js error overlays
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn(`[RssFeeder] Fetch error technical details for ${activeUrl}: ${errorMessage}`);
      
      const message = errorMessage;
      
      // Explicitly handle network-level failures vs API errors
      if (err instanceof TypeError && (message === 'Failed to fetch' || message.includes('network'))) {
        setError(t('failed_fetch') + ' - Network or CORS issue. See console for details.');
        console.warn('[RssFeeder] CRITICAL: Network failure detected. Possible causes:\n1. Ad-blocker or Firewall blocking the request.\n2. The server is not reachable at the current origin.\n3. SSL/TLS handshake failure.');
        console.warn('[RssFeeder] Full Error Object:', err);
      } else if (err instanceof Error && err.name === 'AbortError') {
        setError(t('error_fetching') + ' (Request Timed Out)');
        console.warn('[RssFeeder] Request was aborted due to timeout.');
      } else {
        setError(message || t('error_fetching'));
      }
      
      if (!silent) toast.error(t('error_fetching'));
    } finally {
      clearTimeout(timeoutId);
      if (!silent) setIsLoading(false);
    }
  }, [activeUrl, maxItems, t]);

  useEffect(() => {
    // Add a small delay to avoid race conditions during initial mount/hydration
    const initialTimer = setTimeout(() => {
      fetchFeed();
    }, 1200);

    // Auto-refresh every 15 minutes
    const interval = setInterval(() => fetchFeed(true), 15 * 60 * 1000);
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 -mb-1 scrollbar-hide px-1 select-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveUrl(cat.url);
                setActiveName(cat.name);
              }}
              className={clsx(
                "whitespace-nowrap px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
                "rtl:tracking-normal ltr:tracking-tight",
                activeUrl === cat.url
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                  : 'bg-muted/30 text-foreground/70 border-border/50 hover:border-border hover:bg-muted/50'
              )}
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
                  className="text-xs text-primary hover:underline font-medium flex items-center gap-1 mx-auto"
                >
                  <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                  {t('retry')}
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
