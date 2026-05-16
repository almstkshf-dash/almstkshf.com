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
import { Rss, ExternalLink, Clock, ChevronRight, RefreshCw, BarChart3, AlertCircle, Database, Save, Eye, X } from 'lucide-react';
import { clsx } from 'clsx';
import { FeedItem } from '@/types/rss';
import { toast } from 'sonner';
import { RSSCategory } from '@/config/rss-sources';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import Button from '@/components/ui/Button';
import Image from 'next/image';

interface RssFeederProps {
  initialFeedUrl: string;
  initialSourceName?: string;
  categories?: RSSCategory[];
  allSources?: Record<string, RSSCategory[]>;
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
  allSources = {},
  maxItems = 5,
  className = ""
}: RssFeederProps) {
  const t = useTranslations('RssFeeder');
  const tSources = useTranslations('RssSources');
  const format = useFormatter();
  const [activeUrl, setActiveUrl] = useState(initialFeedUrl);
  const [activeName, setActiveName] = useState(initialSourceName);
  const [activeCountry, setActiveCountry] = useState<string>(categories.find((c: RSSCategory) => c.url === initialFeedUrl)?.country || 'UAE');
  const [activePublisher, setActivePublisher] = useState<string | null>(Object.keys(allSources).find((p: string) => allSources[p].some((c: RSSCategory) => c.url === initialFeedUrl)) || null);
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  
  const articlesQuery = useQuery(api.monitoring.getArticles, {
    limit: 100, // Fetch enough to filter locally
    sourceType: 'Press Release' // Assuming RSS is mostly press releases
  });

  const isLoading = articlesQuery === undefined;
  const error = null;

  // Filter and map articles to match the FeedItem interface
  useEffect(() => {
    if (!articlesQuery?.items) return;

    let filtered = articlesQuery.items;
    
    // Filter by publisher/source name if active
    if (activeName) {
      filtered = filtered.filter(a => a.source === activeName || a.source === activePublisher);
    }

    // Map to FeedItem format
    const mappedItems: FeedItem[] = filtered.map(a => {
      // Convert DD/MM/YYYY to ISO for the component's existing logic
      let isoDate = new Date().toISOString();
      if (a.publishedDate) {
        const parts = a.publishedDate.split('/');
        if (parts.length === 3) {
          isoDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).toISOString();
        }
      }

      return {
        title: a.title,
        link: a.url,
        description: a.content,
        isoDate: isoDate,
        pubDate: a.publishedDate,
        image: a.imageUrl,
        source: a.source || 'RSS',
        country: a.sourceCountry,
        language: a.language,
        guid: a._id
      };
    });

    setItems(mappedItems.slice(0, maxItems));
    setLastSynced(new Date()); // Or use the latest createdAt from the items
  }, [articlesQuery, activeName, activePublisher, maxItems]);

  const fetchFeed = useCallback(async (silent = false) => {
     // No-op since we are using Convex reactivity
  }, []);

  // Helper to translate source name if it's a key
  const translateSourceName = (name: string | undefined): string => {
    if (!name) return t('title');
    try {
      return tSources(name);
    } catch {
      return name;
    }
  };

  useEffect(() => {
    // Component mounted, setup complete. No need for polling anymore as Convex is reactive.
  }, []);

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

      {/* Publisher & Categories Selection */}
      <div className="flex flex-col gap-3">
        {allSources && Object.keys(allSources).length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide px-1">
            {Object.keys(allSources).map((publisher: string) => (
              <button
                key={publisher}
                onClick={() => {
                  const pubCats = allSources[publisher];
                  if (pubCats && pubCats.length > 0) {
                    setActivePublisher(publisher);
                    setActiveUrl(pubCats[0].url);
                    setActiveName(pubCats[0].name);
                    setActiveCountry(pubCats[0].country || 'UAE');
                  }
                }}
                className={clsx(
                  "whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-black transition-all",
                  activePublisher === publisher
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-muted/50 text-foreground/50 border border-transparent hover:border-border'
                )}
              >
                {translateSourceName(publisher)}
              </button>
            ))}
          </div>
        )}

        {(categories.length > 0 || (activePublisher && allSources?.[activePublisher])) && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 -mb-1 scrollbar-hide px-1 select-none">
            {activePublisher && allSources[activePublisher]?.map((cat: RSSCategory) => (
              <button
                key={cat.url}
                onClick={() => {
                  setActiveUrl(cat.url);
                  setActiveName(cat.name);
                  setActiveCountry(cat.country || 'UAE');
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
      </div>

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
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    {item.image && (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-border/40 group-hover:border-primary/30 transition-colors bg-muted">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                          sizes="80px"
                          unoptimized // RSS images can be unpredictable
                        />
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-bold leading-snug text-foreground group-hover:text-primary transition-colors flex-1 line-clamp-2"
                        >
                          {item.title}
                        </a>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-foreground/60 font-bold uppercase tracking-wider">
                        <span className="text-[9px] px-1.5 py-0 h-4 border border-primary/20 bg-primary/5 text-primary rounded-full flex items-center">
                          {item.source}
                        </span>
                        {item.isoDate && (
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {format.dateTime(new Date(item.isoDate), {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-[11px] text-foreground/70 line-clamp-2 leading-relaxed mt-1">
                          {typeof window !== 'undefined'
                            ? DOMPurify.sanitize(item.description, { ALLOWED_TAGS: [] }).slice(0, 120)
                            : item.description.replace(/<[^>]*>/g, '').slice(0, 120)}...
                        </p>
                      )}

                      <div className="flex items-center gap-4 pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsDetailOpen(true);
                          }}
                          className="h-8 px-2 text-primary hover:bg-primary/5"
                        >
                          <Eye size={14} className="mr-1 rtl:ml-1 rtl:mr-0" />
                          {t('read_more')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Article Detail Modal */}
              <AnimatePresence>
                {isDetailOpen && selectedItem && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsDetailOpen(false)}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="relative w-full max-w-2xl bg-background rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]"
                    >
                      <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <Rss size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground leading-tight line-clamp-1">{selectedItem.source}</h3>
                            <p className="text-[10px] text-foreground/50 uppercase tracking-widest font-bold">
                              {selectedItem.isoDate ? format.dateTime(new Date(selectedItem.isoDate), { dateStyle: 'medium' }) : ''}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsDetailOpen(false)} className="rounded-full">
                          <X size={20} />
                        </Button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                        {selectedItem.image && (
                          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border bg-muted">
                            <Image src={selectedItem.image} alt="" fill className="object-cover" unoptimized />
                          </div>
                        )}
                        
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                          {selectedItem.title}
                        </h2>

                        <div 
                          className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 leading-relaxed"
                          dangerouslySetInnerHTML={{ 
                            __html: DOMPurify.sanitize(selectedItem.description || '') 
                          }}
                        />
                      </div>

                      <div className="p-6 border-t border-border bg-muted/10 flex flex-wrap gap-3 justify-end">
                        <Button variant="ghost" onClick={() => setIsDetailOpen(false)}>
                          {t('close')}
                        </Button>
                        <a 
                          href={selectedItem.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex"
                        >
                          <Button variant="secondary" leftIcon={<ExternalLink size={18} />}>
                            {t('open_source')}
                          </Button>
                        </a>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

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
