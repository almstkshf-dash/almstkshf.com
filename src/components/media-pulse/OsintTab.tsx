/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import resources from '../../../data/osintResources.json';
import { useState, useMemo, useEffect } from 'react';
import {
  ExternalLink, Filter, Shield, Search, Mail, Globe,
  Wifi, User, Phone, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, Clock, Trash2,
  FileText, FileSpreadsheet, Cloud, Sparkles, Wand2
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import { useTranslations, useMessages, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/routing';
import { useAction, useQuery, useMutation, useConvexAuth } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { ReportGenerator } from '@/lib/report-generator';
import SaveToCollectionModal from "@/components/ui/SaveToCollectionModal";
import { AlertCircle, ArrowRight, ShieldCheck, Database, Server, Smartphone, Info, FolderPlus } from 'lucide-react';

// Types
import { OsintLookupType, OsintHistoryItem } from '@/types/reports';

// â”€â”€â”€ Static directory data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Lookup type definition â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type LookupType = OsintLookupType;

interface HistoryItem extends Omit<OsintHistoryItem, '_id'> {
  _id: Id<"osint_results">;
}

// â”€â”€â”€ Result Components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const StatusBadge = ({ label, value, type = 'default' }: { label: string; value: string | boolean; type?: 'default' | 'success' | 'warning' | 'error' | 'info' }) => {
  const isTrue = value === true || value === 'true' || value === 'yes';
  const isFalse = value === false || value === 'false' || value === 'no';

  const colors = {
    success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    error: 'bg-destructive/10 text-rose-700 dark:text-rose-300 border-destructive/20',
    info: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    default: 'bg-muted/50 text-foreground/85 dark:text-slate-400 border-border'
  };

  let activeColor = colors[type];
  if (type === 'default') {
    if (isTrue) activeColor = colors.success;
    if (isFalse) activeColor = colors.error;
  }

  return (
    <div className={clsx("flex items-center justify-between px-3 py-2 rounded-xl border transition-all", activeColor)}>
      <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</span>
      <span className="text-xs font-bold">{String(value)}</span>
    </div>
  );
};

const DataSection = ({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; children: React.ReactNode }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 px-1">
      <Icon className="w-3.5 h-3.5 text-primary/70" />
      <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/80 dark:text-slate-400">{title}</h4>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {children}
    </div>
  </div>
);

// â”€â”€â”€ Social Platform Presence Grid (Holehe-style results display) â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PLATFORM_ICONS: Record<string, string> = {
  'Twitter/X': 'ð•', 'Spotify': 'ðŸŽµ', 'Duolingo': 'ðŸ¦‰', 'WordPress': 'ðŸ“',
  'ProtonMail': 'ðŸ”’', 'Foursquare': 'ðŸ“', 'Flickr': 'ðŸ“·', 'Airbnb': 'ðŸ ',
  'Snapchat': 'ðŸ‘»', 'Pinterest': 'ðŸ“Œ', 'Zoom': 'ðŸ“¹', 'Instagram': 'ðŸ“¸',
  'GitHub': 'ðŸ™', 'Adobe': 'ðŸŽ¨', 'Last.fm': 'ðŸŽ§', 'Disqus': 'ðŸ’¬',
  'MyAnimeList': 'ðŸŽŒ', 'Quora': 'â“',
};

const CATEGORY_COLORS: Record<string, string> = {
  social: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
  professional: 'from-purple-500/10 to-violet-500/10 border-purple-500/20',
  entertainment: 'from-pink-500/10 to-rose-500/10 border-pink-500/20',
  productivity: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20',
  ecommerce: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
};

type SocialPresenceData = {
  platforms: Array<{ platform: string; found: boolean | null; url: string; category: string }>;
  foundOn: string[];
  notFoundOn: string[];
  unknownOn: string[];
  totalChecked: number;
  totalFound: number;
};

const SocialPresenceGrid = ({ data, t }: { data: SocialPresenceData; t: (key: string, values?: Record<string, string | number>) => string }) => {
  if (!data?.platforms?.length) return null;
  const { platforms, totalFound, totalChecked } = data;
  const exposure = Math.round((totalFound / Math.max(totalChecked, 1)) * 100);

  return (
    <div className="space-y-5">
      {/* Summary Bar */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
        <div>
          <p className="text-sm font-semibold text-foreground">ðŸ” {t('result_view.sections.social_presence')}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t('result_view.fields.holehe_note')} Â· {t('result_view.fields.platforms_checked_full', { count: totalChecked })}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{totalFound}</p>
            <p className="text-xs text-muted-foreground">{t('result_view.headers.found')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-rose-400">{totalChecked - totalFound - data.unknownOn.length}</p>
            <p className="text-xs text-muted-foreground">{t('result_view.headers.clear')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">{data.unknownOn.length}</p>
            <p className="text-xs text-muted-foreground">{t('result_view.headers.unknown')}</p>
          </div>
        </div>
      </div>

      {/* Exposure Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{t('result_view.fields.digital_exposure')}</span>
          <span className={`font-semibold ${exposure >= 70 ? 'text-rose-400' : exposure >= 40 ? 'text-amber-400' : 'text-emerald-400'
            }`}>{exposure}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${exposure >= 70 ? 'bg-gradient-to-r from-rose-500 to-red-600'
                : exposure >= 40 ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500'
              }`}
            style={{ width: `${exposure}%` }}
          />
        </div>
      </div>

      {/* Platform Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {platforms.map((p) => (
          <a
            key={p.platform}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${p.platform}: ${p.found === true ? t('result_view.headers.found') : p.found === false ? t('result_view.headers.clear') : t('result_view.headers.unknown')}`}
            className={`group relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border bg-gradient-to-br ${CATEGORY_COLORS[p.category] || 'from-muted/20 to-muted/10 border-border'
              } hover:scale-105 transition-all duration-200 cursor-pointer`}
          >
            {/* Status indicator dot */}
            <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${p.found === true ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                : p.found === false ? 'bg-rose-400'
                  : 'bg-amber-400'
              }`} aria-hidden="true" />
            {/* Icon */}
            <span className="text-2xl" aria-hidden="true">
              {PLATFORM_ICONS[p.platform] || '🌐'}
            </span>
            {/* Name */}
            <span className="text-xs font-medium text-center text-foreground leading-tight">{p.platform}</span>
            {/* Status label */}
            <span className={`text-[10px] font-semibold uppercase tracking-wide ${p.found === true ? 'text-emerald-400'
                : p.found === false ? 'text-rose-400'
                  : 'text-amber-400'
              }`}>
              {p.found === true ? t('result_view.headers.found') : p.found === false ? t('result_view.headers.clear') : t('result_view.headers.unknown')}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

const StructuredResultView = ({ type, data, t }: { type: LookupType; data: Record<string, unknown>; t: (key: string, values?: Record<string, string | number>) => string }) => {
  if (!data) return null;

  // Helper to get nested values safely
  const get = (obj: Record<string, unknown>, path: string): unknown => path.split('.').reduce<unknown>((acc, part) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[part] : undefined), obj);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header/Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {type === 'email' && (
          <>
            <StatusBadge
              label={t('result_view.headers.platforms_found')}
              value={`${data.socialPresence?.totalFound ?? 'â€”'} / ${data.socialPresence?.totalChecked ?? 18}`}
              type={data.socialPresence?.totalFound > 0 ? 'warning' : 'success'}
            />
            <StatusBadge label={t('result_view.headers.disposable')} value={get(data, 'is_disposable') || false} type={get(data, 'is_disposable') ? 'error' : 'success'} />
            <StatusBadge label={t('result_view.headers.mx_valid')} value={get(data, 'mx_records') ? t('result_view.headers.valid') : 'N/A'} type="info" />
          </>
        )}
        {type === 'ip' && (
          <>
            <StatusBadge label={t('result_view.headers.country')} value={get(data, 'country_name') || get(data, 'country') || t('result_view.headers.unknown')} type="info" />
            <StatusBadge label={t('result_view.headers.vpn_proxy')} value={get(data, 'security.is_vpn') || get(data, 'is_proxy') || false} type={get(data, 'security.is_vpn') ? 'warning' : 'success'} />
            <StatusBadge label={t('result_view.headers.threat_level')} value={get(data, 'security.threat_level') || 'Low'} type={get(data, 'security.threat_level') === 'High' ? 'error' : 'success'} />
          </>
        )}
        {type === 'domain' && (
          <>
            <StatusBadge label={t('result_view.headers.registered')} value={get(data, 'registered') || t('result_view.headers.valid')} />
            <StatusBadge label={t('result_view.headers.dnssec')} value={get(data, 'dnssec') || t('result_view.headers.unknown')} type="info" />
            <StatusBadge label={t('result_view.headers.status')} value={get(data, 'status') || t('result_view.headers.valid')} type="success" />
          </>
        )}
        {type === 'phone' && (
          <>
            <StatusBadge label={t('result_view.headers.valid')} value={get(data, 'valid') || false} />
            <StatusBadge label={t('result_view.headers.line_type')} value={get(data, 'line_type') || 'Mobile'} type="info" />
            <StatusBadge label={t('result_view.headers.carrier')} value={get(data, 'carrier') || t('result_view.headers.unknown')} type="info" />
          </>
        )}
        {type === 'news' && (
          <>
            <StatusBadge label={t('result_view.headers.provider')} value={get(data, 'provider') || t('result_view.headers.unknown')} type="info" />
            <StatusBadge label="Data Feeds" value="Global RSS" type="info" />
            <StatusBadge label={t('result_view.fields.articles_found')} value={get(data, 'totalArticles') || '0'} type="success" />
          </>
        )}
        {type === 'corporate' && (
          <>
            <StatusBadge label="Provider" value="OpenCorporates" type="info" />
            <StatusBadge label={t('result_view.fields.companies_found')} value={get(data, 'companies')?.length || '0'} type={get(data, 'companies')?.length > 0 ? "success" : "warning"} />
          </>
        )}
        {type === 'location' && (
          <>
            <StatusBadge label="Provider" value="Nominatim OSM" type="info" />
            <StatusBadge label={t('result_view.fields.locations_found')} value={get(data, 'locations')?.length || '0'} type={get(data, 'locations')?.length > 0 ? "success" : "warning"} />
          </>
        )}
        {type === 'wikipedia' && (
          <>
            <StatusBadge label="Provider" value="Wikipedia" type="info" />
            <StatusBadge label={t('result_view.fields.match_found')} value={get(data, 'wiki') ? t('result_view.headers.valid') : t('result_view.headers.clear')} type={get(data, 'wiki') ? "success" : "warning"} />
          </>
        )}
        {type === 'gleif' && (
          <>
            <StatusBadge label={t('result_view.headers.provider')} value="GLEIF" type="info" />
            <StatusBadge label={t('result_view.headers.status')} value={get(data, 'records')?.length || '0'} type={get(data, 'records')?.length > 0 ? "success" : "warning"} />
          </>
        )}
        {type === 'watchlist' && (
          <>
            <StatusBadge label={t('result_view.headers.provider')} value="OpenSanctions" type="info" />
            <StatusBadge label={t('result_view.headers.status')} value={get(data, 'isClean') ? t('result_view.headers.valid') : t('result_view.headers.status')} type={get(data, 'isClean') ? "success" : "error"} />
            <StatusBadge label={t('result_view.fields.match_count') || "Matches"} value={get(data, 'totalMatches') || '0'} type={get(data, 'totalMatches') > 0 ? "error" : "success"} />
          </>
        )}
      </div>

      {/* Detailed Sections */}
      <div className="bg-muted/10 border border-border rounded-2xl p-5 space-y-6">
        {type === 'email' && (
          <>
            {/* Social Platform Presence Grid */}
            {data.socialPresence && (
              <SocialPresenceGrid data={data.socialPresence} t={t} />
            )}
            {data.socialPresenceNote && (
              <div className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg p-3">
                âš ï¸ {data.socialPresenceNote}
              </div>
            )}
            {/* Email Technical Breakdown */}
            <DataSection title={t('result_view.sections.email_breakdown')} icon={User}>
              <StatusBadge label={t('result_view.fields.username')} value={get(data, 'user') || 'N/A'} />
              <StatusBadge label={t('result_view.fields.domain')} value={get(data, 'domain') || 'N/A'} />
              <StatusBadge label={t('result_view.fields.free_provider')} value={get(data, 'is_free') || false} />
              <StatusBadge label={t('result_view.fields.catch_all')} value={get(data, 'catch_all') || false} />
              {get(data, 'mx_records') && (
                <StatusBadge label={t('result_view.fields.mx_check')} value={Array.isArray(get(data, 'mx_records')) ? get(data, 'mx_records').join(', ') : get(data, 'mx_records')} type="info" />
              )}
              {get(data, 'gravatar') && (
                <StatusBadge label="Gravatar Profile" value={get(data, 'gravatar.displayName') || 'Found'} type="success" />
              )}
            </DataSection>
          </>
        )}

        {type === 'ip' && (
          <>
            <DataSection title={t('result_view.sections.geolocation')} icon={Globe}>
              <StatusBadge label={t('result_view.fields.city')} value={get(data, 'city') || 'Unknown'} />
              <StatusBadge label={t('result_view.fields.region')} value={get(data, 'region') || 'Unknown'} />
              <StatusBadge label={t('result_view.fields.postal')} value={get(data, 'zip') || 'N/A'} />
              <StatusBadge label={t('result_view.fields.timezone')} value={get(data, 'time_zone.name') || 'N/A'} />
            </DataSection>
            <DataSection title={t('result_view.sections.infrastructure')} icon={Server}>
              <StatusBadge label={t('result_view.fields.asn')} value={get(data, 'asn') || 'N/A'} />
              <StatusBadge label={t('result_view.fields.isp')} value={get(data, 'isp') || 'N/A'} />
              <StatusBadge label={t('result_view.fields.organization')} value={get(data, 'org') || 'N/A'} />
              <StatusBadge label={t('result_view.fields.type')} value={get(data, 'type') || 'IPv4'} />
            </DataSection>
          </>
        )}

        {type === 'domain' && (
          <>
            <DataSection title={t('result_view.sections.whois')} icon={Database}>
              <StatusBadge label={t('result_view.fields.registrar')} value={get(data, 'registrar') || 'N/A'} />
              <StatusBadge label={t('result_view.fields.created')} value={get(data, 'created_date') || 'N/A'} />
              <StatusBadge label={t('result_view.fields.expiry')} value={get(data, 'expiration_date') || 'N/A'} />
              <StatusBadge label={t('result_view.fields.updated')} value={get(data, 'updated_date') || 'N/A'} />
            </DataSection>
            <DataSection title={t('result_view.sections.technical_records')} icon={Wifi}>
              <StatusBadge label={t('result_view.fields.nameservers')} value={Array.isArray(get(data, 'name_servers')) ? get(data, 'name_servers').length : 0} />
              <StatusBadge label={t('result_view.fields.mx_check')} value={get(data, 'mx_found') || false} />
            </DataSection>
          </>
        )}

        {type === 'phone' && (
          <DataSection title={t('result_view.sections.carrier_details')} icon={Smartphone}>
            <StatusBadge label={t('result_view.fields.local_format')} value={get(data, 'local_format') || 'N/A'} />
            <StatusBadge label={t('result_view.fields.international_format')} value={get(data, 'international_format') || 'N/A'} />
            <StatusBadge label={t('result_view.fields.country_prefix')} value={get(data, 'country_prefix') || 'N/A'} />
            <StatusBadge label={t('result_view.fields.location')} value={get(data, 'location') || 'N/A'} />
          </DataSection>
        )}

        {type === 'news' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 px-1">
                <Cloud className="w-4 h-4 text-primary" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/80 tracking-widest">{t('result_view.fields.data_feeds')}</h4>
              </div>
            </div>

            {get(data, 'articles') && Array.isArray(get(data, 'articles')) && (
              <DataSection title={t('result_view.fields.articles_found')} icon={FileText}>
                {(get(data, 'articles') as Array<Record<string, unknown>>).slice(0, 10).map((art, i: number) => (
                  <a
                    key={i}
                    href={art.link}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-3 rounded-xl border border-border bg-card/50 hover:bg-muted/50 transition-colors"
                  >
                    <h5 className="text-xs font-bold text-foreground line-clamp-2">{art.title}</h5>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[9px] text-foreground/80 uppercase font-black">{art.source}</span>
                      <span className="text-[9px] text-primary font-bold line-clamp-1">{art.date}</span>
                    </div>
                  </a>
                ))}
              </DataSection>
            )}
          </div>
        )}

        {type === 'corporate' && (
          <div className="space-y-6">
            <DataSection title={t('result_view.fields.companies_found')} icon={Database}>
              {(get(data, 'companies') as Array<Record<string, unknown>> | undefined)?.map((c, i: number) => (
                <a
                  key={i}
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-3 rounded-xl border border-border bg-card/50 hover:bg-muted/50 transition-colors col-span-1 sm:col-span-2"
                >
                  <h5 className="text-xs font-bold text-foreground">{c.name}</h5>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <StatusBadge label="Jurisdiction" value={c.jurisdiction || 'N/A'} type="default" />
                    <StatusBadge label="Status" value={c.status || 'N/A'} type="info" />
                    <StatusBadge label="Company Number" value={c.number || 'N/A'} type="default" />
                  </div>
                </a>
              ))}
            </DataSection>
          </div>
        )}

        {type === 'location' && (
          <div className="space-y-6">
            <DataSection title={t('result_view.fields.locations_found')} icon={Globe}>
              {(get(data, 'locations') as Array<Record<string, unknown>> | undefined)?.map((loc, i: number) => (
                <a
                  key={i}
                  href={loc.osmUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-3 rounded-xl border border-border bg-card/50 hover:bg-muted/50 transition-colors col-span-1 sm:col-span-2"
                >
                  <h5 className="text-xs font-bold text-foreground">{loc.displayName}</h5>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <StatusBadge label="Type" value={loc.type || 'N/A'} type="info" />
                    <StatusBadge label="City" value={loc.city || 'N/A'} type="default" />
                    <StatusBadge label="Country" value={loc.country || 'N/A'} type="default" />
                  </div>
                </a>
              ))}
            </DataSection>
          </div>
        )}

        {type === 'wikipedia' && get(data, 'wiki') && (
          <div className="space-y-6">
            <DataSection title={t('result_view.headers.provider')} icon={Info}>
              <a
                href={get(data, 'wiki.url')}
                target="_blank"
                rel="noreferrer"
                className="block p-4 rounded-xl border border-border bg-card/50 hover:bg-muted/50 transition-colors col-span-1 sm:col-span-2"
              >
                <h5 className="text-sm font-bold text-foreground">{get(data, 'wiki.title')}</h5>
                <p className="text-xs text-foreground/70 mt-2 leading-relaxed">{get(data, 'wiki.summary')}</p>
              </a>
            </DataSection>
          </div>
        )}

        {type === 'gleif' && (
          <div className="space-y-6">
            <DataSection title={t('result_view.sections.lei_registration')} icon={Database}>
              {(get(data, 'records') as Array<Record<string, unknown>> | undefined)?.map((r, i: number) => (
                <div
                  key={i}
                  className="block p-3 rounded-xl border border-border bg-card/50 col-span-1 sm:col-span-2"
                >
                  <h5 className="text-xs font-bold text-foreground">{r.legalName}</h5>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <StatusBadge label={t('result_view.headers.lei')} value={r.lei || 'N/A'} type="default" />
                    <StatusBadge label={t('result_view.headers.status')} value={r.status || 'N/A'} type="info" />
                    <StatusBadge label={t('result_view.headers.jurisdiction')} value={r.jurisdiction || 'N/A'} type="default" />
                  </div>
                </div>
              ))}
            </DataSection>
          </div>
        )}

        {type === 'watchlist' && (
          <div className="space-y-6">
            <DataSection title={t('result_view.sections.sanctions_matches')} icon={Shield}>
              {(get(data, 'matches') as Array<Record<string, unknown>> | undefined)?.map((m, i: number) => (
                <div
                  key={i}
                  className="block p-3 rounded-xl border border-border bg-card/50 col-span-1 sm:col-span-2 border-l-4 border-l-destructive/50"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-foreground uppercase tracking-tight">{m.caption}</h5>
                    <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">
                      {t('result_view.fields.match_percent', { count: Math.round(m.matchScore * 100) })}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <StatusBadge label={t('result_view.headers.schema')} value={m.schema || 'N/A'} type="info" />
                    <StatusBadge label={t('result_view.headers.datasets')} value={m.datasets?.join(', ') || 'N/A'} type="default" />
                    <StatusBadge label={t('result_view.headers.topics')} value={m.topics?.join(', ') || 'None'} type="default" />
                  </div>
                </div>
              ))}
              {!get(data, 'matches')?.length && (
                <div className="col-span-1 sm:col-span-2 p-4 text-center border border-emerald-500/20 bg-emerald-500/5 rounded-xl">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">{t('result_view.fields.no_matches')}</p>
                </div>
              )}
            </DataSection>
          </div>
        )}

        {/* Raw View Toggle */}
        <div className="pt-4 border-t border-border mt-4">
          <button
            onClick={() => {
              const pre = document.getElementById('raw-json-view');
              if (pre) pre.classList.toggle('hidden');
              const isExpanded = pre && !pre.classList.contains('hidden');
              const btn = document.querySelector('[aria-controls="raw-json-view"]');
              if (btn) btn.setAttribute('aria-expanded', String(isExpanded));
            }}
            aria-expanded="false"
            aria-controls="raw-json-view"
            className="text-[9px] font-black text-foreground/80 hover:text-primary uppercase tracking-widest flex items-center gap-1.5 transition-colors"
          >
            <Info className="w-3 h-3" aria-hidden="true" />
            {t('result_view.fields.toggle_raw')}
          </button>
          <pre id="raw-json-view" className="hidden mt-3 text-[10px] text-foreground/60 whitespace-pre-wrap break-all bg-black/5 p-4 rounded-xl font-mono">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

// â”€â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function OsintTab() {
  const { isAuthenticated } = useConvexAuth();
  const t = useTranslations('OsintTab');
  const tCommon = useTranslations('Common');
  const tOsint = useTranslations('Osint');
  const tDashboard = useTranslations('Dashboard');
  const isAdmin = useQuery(api.authQueries.checkIsAdmin);

  const LOOKUP_TYPES: Array<{
    type: LookupType;
    label: string;
    icon: React.ReactNode;
    placeholder: string;
    hint: string;
  }> = [
      { type: 'email', label: t('panels.email.title'), icon: <Mail className="w-4 h-4" aria-hidden="true" />, placeholder: t('panels.email.placeholder'), hint: t('panels.email.desc') },
      { type: 'domain', label: t('panels.domain.title'), icon: <Globe className="w-4 h-4" aria-hidden="true" />, placeholder: t('panels.domain.placeholder'), hint: t('panels.domain.desc') },
      { type: 'ip', label: t('panels.ip.title'), icon: <Wifi className="w-4 h-4" aria-hidden="true" />, placeholder: t('panels.ip.placeholder'), hint: t('panels.ip.desc') },
      { type: 'username', label: t('panels.username.title'), icon: <User className="w-4 h-4" aria-hidden="true" />, placeholder: t('panels.username.placeholder'), hint: t('panels.username.desc') },
      { type: 'phone', label: t('panels.phone.title'), icon: <Phone className="w-4 h-4" aria-hidden="true" />, placeholder: t('panels.phone.placeholder'), hint: t('panels.phone.desc') },
      { type: 'news', label: t('panels.news.title'), icon: <Cloud className="w-4 h-4" aria-hidden="true" />, placeholder: t('panels.news.placeholder'), hint: t('panels.news.desc') },
      { type: 'corporate', label: t('panels.corporate.title'), icon: <Database className="w-4 h-4" aria-hidden="true" />, placeholder: t('panels.corporate.placeholder'), hint: t('panels.corporate.desc') },
      { type: 'location', label: t('panels.location.title'), icon: <Globe className="w-4 h-4" aria-hidden="true" />, placeholder: t('panels.location.placeholder'), hint: t('panels.location.desc') },
      { type: 'wikipedia', label: t('panels.wikipedia.title'), icon: <Info className="w-4 h-4" aria-hidden="true" />, placeholder: t('panels.wikipedia.placeholder'), hint: t('panels.wikipedia.desc') },
      { type: 'gleif', label: t('panels.gleif.title'), icon: <Database className="w-4 h-4" aria-hidden="true" />, placeholder: t('panels.gleif.placeholder'), hint: t('panels.gleif.desc') },
      { type: 'watchlist', label: t('panels.watchlist.title'), icon: <Shield className="w-4 h-4" aria-hidden="true" />, placeholder: t('panels.watchlist.placeholder'), hint: t('panels.watchlist.desc') },
    ];

  // â”€â”€ Hydration guard â”€â”€
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // â”€â”€ Active lookup state â”€â”€
  // Use a state synchronized with URL for persistence
  const [activeType, setActiveType] = useState<LookupType>(
    (searchParams.get('osint_tab') as LookupType) || 'watchlist'
  );

  const tOpt = useTranslations('SearchOptimizer');

  // Sync state with URL
  useEffect(() => {
    const tab = searchParams.get('osint_tab') as LookupType;
    if (tab && ['email', 'domain', 'ip', 'username', 'phone', 'news', 'corporate', 'location', 'wikipedia', 'gleif', 'watchlist'].includes(tab)) {
      setActiveType(tab);
    }
  }, [searchParams]);

  const handleTypeChange = (type: LookupType) => {
    setActiveType(type);
    const params = new URLSearchParams(searchParams.toString());
    params.set('osint_tab', type);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [optimizationInfo, setOptimizationInfo] = useState<{ original: string; explanation: string } | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isExporting, setIsExporting] = useState<'pdf' | 'excel' | null>(null);
  const messages = useMessages();
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [historyItemToSave, setHistoryItemToSave] = useState<HistoryItem | null>(null);

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (!history || history.length === 0) return;
    setIsExporting(format);
    try {
      await ReportGenerator.exportOsintReport(history, messages, format);
    } catch (err) {
      console.error('OSINT export failed:', err);
    } finally {
      setIsExporting(null);
    }
  };

  // â”€â”€ Convex actions (Node.js runtime â€” osint.ts) â”€â”€
  const lookupEmail = useAction(api.osint.lookupEmail);
  const lookupDomain = useAction(api.osint.lookupDomain);
  const lookupIp = useAction(api.osint.lookupIp);
  const lookupUsername = useAction(api.osint.lookupUsername);
  const lookupPhone = useAction(api.osint.lookupPhone);
  const lookupNews = useAction(api.osint.lookupNews);
  const lookupCorporate = useAction(api.osint.lookupCorporate);
  const lookupLocation = useAction(api.osint.lookupLocation);
  const lookupWikipedia = useAction(api.osint.lookupWikipedia);
  const lookupGleif = useAction(api.osint.lookupGleif);
  const lookupWatchlist = useAction(api.osint.lookupWatchlist);
  const optimizeSearch = useAction(api.searchOptimizer.optimizeQuery);
  // â”€â”€ DB operations (default runtime â€” osintDb.ts) â”€â”€
  const deleteResult = useMutation(api.osintDb.deleteOsintResult);
  const history = useQuery(
    api.osintDb.getOsintResults,
    isAuthenticated ? { limit: 20 } : 'skip'
  ) as HistoryItem[] | undefined;

  // â”€â”€ Resource directory state â”€â”€
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

  const handleOptimize = async () => {
    if (!query.trim()) return;
    setIsOptimizing(true);
    try {
      const res = await optimizeSearch({
        keyword: query.trim(),
        context: activeType === 'news' ? 'news' : 'osint',
        targetLanguages: ['en', 'ar']
      });
      if (res && res.optimized) {
        setOptimizationInfo({
          original: query,
          explanation: res.explanation
        });
        setQuery(res.optimized);
      }
    } catch (e) {
      console.error("OSINT optimization failed:", e);
    } finally {
      setIsOptimizing(false);
    }
  };

  // â”€â”€ Run lookup â”€â”€
  const handleLookup = async () => {
    if (!isAuthenticated) { setError(tDashboard('not_authenticated')); return; }
    if (!isAdmin) { setError(t('admin_only')); return; }
    if (!query.trim()) { setError(tCommon('search_placeholder')); return; }

    setLoading(true);
    setError('');
    setResult(null);
    setOptimizationInfo(null);

    try {
      let res: { success: boolean; data?: Record<string, unknown>; error?: string } | undefined;
      switch (activeType) {
        case 'email': res = await lookupEmail({ email: query }); break;
        case 'domain': res = await lookupDomain({ domain: query }); break;
        case 'ip': res = await lookupIp({ ip: query }); break;
        case 'username': res = await lookupUsername({ username: query }); break;
        case 'phone': res = await lookupPhone({ phone: query }); break;
        case 'news': res = await lookupNews({ query: query }); break;
        case 'corporate': res = await lookupCorporate({ companyName: query }); break;
        case 'location': res = await lookupLocation({ locationName: query }); break;
        case 'wikipedia': res = await lookupWikipedia({ query: query }); break;
        case 'gleif': res = await lookupGleif({ companyName: query }); break;
        case 'watchlist': res = await lookupWatchlist({ query: query }); break;
      }

      if (res?.success) {
        setResult((res.data as Record<string, unknown>) ?? null);
        setError('');
      } else {
        setError(res?.error || tCommon('no_results'));
        setResult(null);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : tCommon('no_results'));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // â”€â”€ Resource filtering for the active panel â”€â”€
  const suggestedTools = useMemo(() => {
    let cat: string[] = [];
    switch (activeType) {
      case 'email': cat = ['email', 'security']; break;
      case 'domain': cat = ['geolocation', 'maps', 'business', 'search', 'security']; break;
      case 'ip': cat = ['geolocation', 'security']; break;
      case 'username': cat = ['social', 'people', 'dating']; break;
      case 'phone': cat = ['phone']; break;
      case 'news': cat = ['news', 'misc']; break;
      case 'corporate': cat = ['business', 'public records']; break;
      case 'location': cat = ['geolocation', 'maps']; break;
      case 'wikipedia': cat = ['search', 'misc']; break;
      case 'gleif': cat = ['business', 'public records']; break;
      case 'watchlist': cat = ['security', 'public records']; break;
    }
    return (resources as Resource[]).filter(r => r.categories.some(c => cat.includes(c))).slice(0, 6);
  }, [activeType]);

  if (!mounted) return null;
  const currentType = LOOKUP_TYPES.find(l => l.type === activeType)!;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* â•â• LEFT COLUMN: INVESTIGATION ENGINE â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-bold">{t('title')}</h2>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">{t('live_badge')}</span>
            </div>
          </div>

          {/* Type Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {LOOKUP_TYPES.map(lt => (
              <button
                key={lt.type}
                onClick={() => { handleTypeChange(lt.type); setQuery(''); setResult(null); setError(''); }}
                aria-pressed={activeType === lt.type}
                className={clsx(
                  'flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all',
                  activeType === lt.type
                    ? 'bg-primary/5 border-primary text-primary shadow-sm'
                    : 'border-border/60 bg-muted/20 hover:border-primary/30 text-foreground/60'
                )}
              >
                <div className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                  activeType === lt.type ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground/60'
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
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/60" aria-hidden="true" />
                <label htmlFor="lookup-input" className="sr-only">{currentType.placeholder}</label>
                <input
                  id="lookup-input"
                  name="lookup"
                  type="text"
                  value={query}
                  onChange={e => {
                    setQuery(e.target.value);
                    if (optimizationInfo) setOptimizationInfo(null);
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleLookup()}
                  placeholder={currentType.placeholder}
                  className="w-full pl-11 pr-12 py-3 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleOptimize}
                  disabled={isOptimizing || !query.trim() || loading}
                  title={tOpt('button_tooltip')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
                >
                  <Wand2 className={clsx("w-4 h-4", isOptimizing && "animate-pulse")} aria-hidden="true" />
                  <Sparkles className="absolute -top-1 -right-1 w-2 h-2 text-primary animate-bounce opacity-0 group-hover:opacity-100" aria-hidden="true" />
                </button>
              </div>
              <Button
                variant={isAdmin ? "primary" : "secondary"}
                onClick={handleLookup}
                isLoading={loading}
                disabled={loading || !isAuthenticated || (!isAdmin && !!query)}
                className={clsx(
                  "px-8 py-3 font-bold text-sm h-auto shadow-lg",
                  isAdmin ? "shadow-primary/20" : "opacity-80 grayscale"
                )}
              >
                {!isAdmin ? <Shield className="w-4 h-4 mr-2 inline" /> : null}
                {loading ? tCommon('analyze_tone') : tCommon('generate_report')}
              </Button>
            </div>
            <p className={clsx("text-[11px] font-medium", isAdmin ? "text-foreground/60" : "text-amber-600 font-bold")}>
              {!isAdmin ? t('admin_only') : currentType.hint}
            </p>
          </div>

          {optimizationInfo && (
            <div className="mt-2 flex items-start gap-2 p-2.5 bg-primary/5 border border-primary/20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-primary uppercase tracking-tight">
                  {tOpt('explanation_title')}
                </p>
                <p className="text-[11px] text-foreground/80 leading-relaxed italic">
                  {optimizationInfo.explanation}
                </p>
              </div>
              <button
                onClick={() => {
                  setQuery(optimizationInfo.original);
                  setOptimizationInfo(null);
                }}
                className="text-[10px] font-bold text-primary hover:underline flex-shrink-0"
              >
                {tOpt('original')}
              </button>
            </div>
          )}

          {/* Result Area */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 text-sm text-rose-700 dark:text-rose-300 bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-3"
              >
                <XCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold">{error}</span>
              </motion.div>
            )}

            {result && (
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground capitalize tracking-tight">{activeType} {tDashboard('investigation_engine')}</h3>
                      <p className="text-[10px] font-medium text-foreground/80 uppercase tracking-widest">{t('result_view.fields.analysis_completed')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-black uppercase tracking-widest gap-2 bg-muted/50" onClick={() => setIsCollectionModalOpen(true)}>
                      <FolderPlus className="w-3 h-3" />
                      {t('result_view.fields.save_collection')}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-black uppercase tracking-widest gap-2 bg-muted/50" onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}>
                      <Database className="w-3 h-3" />
                      {tCommon('copy')}
                    </Button>
                  </div>
                </div>

                <SaveToCollectionModal
                  isOpen={isCollectionModalOpen}
                  onClose={() => setIsCollectionModalOpen(false)}
                  item={{
                    id: Math.random().toString(36).substring(7),
                    type: "osint",
                    title: `OSINT: ${activeType} lookup for ${query}`,
                    data: result
                  }}
                />

                <StructuredResultView type={activeType} data={result} t={t} />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Investigation History */}
        {mounted && isAuthenticated && history && history.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">{tDashboard('coverage_log')}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExport('pdf')}
                  disabled={!!isExporting}
                  isLoading={isExporting === 'pdf'}
                  className="h-7 text-[9px] uppercase tracking-widest font-bold gap-1.5 rounded-lg px-2"
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
                  className="h-7 text-[9px] uppercase tracking-widest font-bold gap-1.5 rounded-lg px-2"
                >
                  <FileSpreadsheet className="w-3 h-3" />
                  EXCEL
                </Button>
              </div>
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
                        item.type === 'email' && 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
                        item.type === 'domain' && 'bg-purple-500/10 border-purple-500/20 text-purple-600',
                        item.type === 'ip' && 'bg-orange-500/10 border-orange-500/20 text-orange-600',
                        item.type === 'username' && 'bg-green-500/10 border-green-500/20 text-green-600',
                        item.type === 'phone' && 'bg-pink-500/10 border-pink-500/20 text-pink-600',
                        item.type === 'corporate' && 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600',
                        item.type === 'location' && 'bg-teal-500/10 border-teal-500/20 text-teal-600',
                        item.type === 'wikipedia' && 'bg-zinc-500/10 border-zinc-500/20 text-zinc-600',
                        item.type === 'gleif' && 'bg-blue-600/10 border-blue-600/20 text-blue-700',
                        item.type === 'watchlist' && 'bg-red-500/10 border-red-500/20 text-red-600',
                      )}>
                        {LOOKUP_TYPES.find(l => l.type === item.type)?.icon || <Shield className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{item.query}</span>
                        <span className="text-[10px] font-black text-foreground/70 uppercase opacity-80 tracking-tighter" suppressHydrationWarning>
                          {new Date(item.createdAt).toLocaleDateString()} â€¢ {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async (e) => { e.stopPropagation(); await deleteResult({ id: item._id as Id<"osint_results"> }); }}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-foreground/60 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
                        aria-label={tCommon('delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setHistoryItemToSave(item); }}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-emerald-500/10 text-foreground/60 hover:text-emerald-500 transition-all"
                        aria-label={t('result_view.fields.save_collection')}
                      >
                        <FolderPlus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-foreground/60 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {expandedHistory === item._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                  {expandedHistory === item._id && (
                    <div className="border-t border-border bg-background/30 p-6">
                      <StructuredResultView type={item.type} data={item.result} t={t} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {historyItemToSave && (
              <SaveToCollectionModal
                isOpen={!!historyItemToSave}
                onClose={() => setHistoryItemToSave(null)}
                item={{
                  id: historyItemToSave._id,
                  type: "osint",
                  title: `OSINT: ${historyItemToSave.type} lookup for ${historyItemToSave.query}`,
                  data: historyItemToSave.result
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* â•â• RIGHT COLUMN: EXTERNAL TOOLS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="lg:col-span-4 space-y-6">
        {/* Suggested External Tools */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">{t('suggested_tools')}</h3>
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed">
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
                  <p className="text-[10px] text-foreground/70 truncate">{tool.description}</p>
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

      {/* â•â• FULL DIRECTORY MODAL (reusing directory UI) â•â•â•â•â•â•â•â•â•â•â•â• */}
      {dirOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          role="dialog"
          aria-modal="true"
          aria-labelledby="osint-directory-title"
        >
          <div className="bg-card border border-border w-full max-w-6xl max-h-full overflow-hidden rounded-3xl shadow-2xl flex flex-col scale-in-center">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-primary" />
                <h3 id="osint-directory-title" className="font-bold">{tOsint('title')}</h3>
                <span className="text-[10px] bg-primary/10 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-primary/20">
                  {resources.length} {tOsint('filters.search')}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setDirOpen(false)} className="w-8 h-8 p-0 rounded-full hover:bg-muted"><XCircle className="w-5 h-5" /></Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {/* Reuse of standard filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="dir-category" className="text-[10px] font-black text-foreground/70 dark:text-slate-400 uppercase px-1">{tOsint('filters.category')}</label>
                  <select id="dir-category" name="category" aria-label={tOsint('filters.category')} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20" value={category} onChange={e => { setCategory(e.target.value); setPage(0); }}>
                    <option value="all">Global (All)</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="dir-label" className="text-[10px] font-black text-foreground/70 dark:text-slate-400 uppercase px-1">{tOsint('filters.label')}</label>
                  <select id="dir-label" name="label" aria-label={tOsint('filters.label')} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20" value={labelFilter} onChange={e => { setLabelFilter(e.target.value); setPage(0); }}>
                    <option value="all">Any Access</option>
                    {LABELS.map(l => <option key={l.code} value={l.code}>{l.text}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="dir-lang" className="text-[10px] font-black text-foreground/70 dark:text-slate-400 uppercase px-1">{tOsint('filters.language')}</label>
                  <select id="dir-lang" name="language" aria-label={tOsint('filters.language')} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20" value={language} onChange={e => { setLanguage(e.target.value); setPage(0); }}>
                    <option value="all">Multi-language</option>
                    <option value="en">English Only</option>
                    <option value="ar">Arabic Oriented</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="dir-search" className="text-[10px] font-black text-foreground/70 dark:text-slate-400 uppercase px-1">{tOsint('filters.search')}</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/60" aria-hidden="true" />
                    <input id="dir-search" name="search" className="w-full pl-9 pr-3 py-2.5 bg-muted/50 border border-border rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20" placeholder={tOsint('filters.search_placeholder')} value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
                  </div>
                </div>
              </div>

              {/* Grid of tools */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {paged.map(r => (
                  <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="flex flex-col group p-4 bg-muted/20 border border-border rounded-2xl hover:border-primary/40 hover:bg-card hover:shadow-xl transition-all h-full">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{r.name}</h4>
                      <ExternalLink className="w-3.5 h-3.5 text-foreground/60 group-hover:text-primary" />
                    </div>
                    <p className="text-[11px] text-foreground/70 line-clamp-2 mb-4 flex-1 font-medium">{r.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {r.categories.slice(0, 2).map(c => (
                        <span key={c} className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-primary/10 text-blue-800 dark:text-blue-300 border border-primary/10">{c}</span>
                      ))}
                      {r.freeTier && <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/10">Free</span>}
                    </div>
                  </a>
                ))}
              </div>

              {/* Pagination bar */}
              <div className="flex items-center justify-between pt-6 border-t border-border mt-auto sticky bottom-0 bg-card py-4">
                <span className="text-[11px] font-bold text-foreground/70">{tOsint('pagination.showing', { count: paged.length, total: filtered.length })}</span>
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
