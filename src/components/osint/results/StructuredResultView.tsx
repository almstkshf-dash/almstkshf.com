/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import React, { useState } from 'react';
import { LookupType, OsintResult, WatchlistMatch } from '../types';
import StatusBadge from './StatusBadge';
import DataSection from './DataSection';
import SocialPresenceGrid from './SocialPresenceGrid';
import { sanitizeResult } from '../utils/lookupHandlers';
import {
  User,
  Globe,
  Server,
  Database,
  Wifi,
  Smartphone,
  Cloud,
  FileText,
  Info,
  Shield,
  FolderPlus,
  ShieldCheck,
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface StructuredResultViewProps {
  type: LookupType;
  data: OsintResult;
  t: (key: string, values?: Record<string, string | number>) => string;
  selectedMatches?: Set<string>;
  onToggleMatch?: (id: string) => void;
  onSaveSelected?: () => void;
}

export const StructuredResultView = ({
  type,
  data,
  t,
  selectedMatches,
  onToggleMatch,
  onSaveSelected,
}: StructuredResultViewProps) => {
  const [showRaw, setShowRaw] = useState(false);

  if (!data) return null;

  // Helper to get nested values safely
  const get = (obj: any, path: string): any =>
    path.split('.').reduce<any>((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), obj);

  return (
    <div className="space-y-6 animate-slide-in-from-bottom duration-500">
      {/* Header/Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {type === 'email' && (
          <>
            <StatusBadge
              label={t('result_view.headers.platforms_found')}
              value={`${get(data, 'socialPresence.totalFound') ?? '—'} / ${get(data, 'socialPresence.totalChecked') ?? 18}`}
              type={get(data, 'socialPresence.totalFound') > 0 ? 'warning' : 'success'}
            />
            <StatusBadge
              label={t('result_view.headers.disposable')}
              value={get(data, 'is_disposable') || false}
              type={get(data, 'is_disposable') ? 'error' : 'success'}
            />
            <StatusBadge
              label={t('result_view.headers.mx_valid')}
              value={get(data, 'mx_records') ? t('result_view.headers.valid') : 'N/A'}
              type="info"
            />
          </>
        )}
        {type === 'ip' && (
          <>
            <StatusBadge
              label={t('result_view.headers.country')}
              value={get(data, 'country_name') || get(data, 'country') || t('result_view.headers.unknown')}
              type="info"
            />
            <StatusBadge
              label={t('result_view.headers.vpn_proxy')}
              value={get(data, 'security.is_vpn') || get(data, 'is_proxy') || false}
              type={get(data, 'security.is_vpn') ? 'warning' : 'success'}
            />
            <StatusBadge
              label={t('result_view.headers.threat_level')}
              value={get(data, 'security.threat_level') || 'Low'}
              type={get(data, 'security.threat_level') === 'High' ? 'error' : 'success'}
            />
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
            <StatusBadge
              label={t('result_view.fields.companies_found')}
              value={get(data, 'companies')?.length || '0'}
              type={get(data, 'companies')?.length > 0 ? 'success' : 'warning'}
            />
          </>
        )}
        {type === 'location' && (
          <>
            <StatusBadge label="Provider" value="Nominatim OSM" type="info" />
            <StatusBadge
              label={t('result_view.fields.locations_found')}
              value={get(data, 'locations')?.length || '0'}
              type={get(data, 'locations')?.length > 0 ? 'success' : 'warning'}
            />
          </>
        )}
        {type === 'wikipedia' && (
          <>
            <StatusBadge label="Provider" value="Wikipedia" type="info" />
            <StatusBadge
              label={t('result_view.fields.match_found')}
              value={get(data, 'wiki') ? t('result_view.headers.valid') : t('result_view.headers.clear')}
              type={get(data, 'wiki') ? 'success' : 'warning'}
            />
          </>
        )}
        {type === 'gleif' && (
          <>
            <StatusBadge label={t('result_view.headers.provider')} value="GLEIF" type="info" />
            <StatusBadge
              label={t('result_view.headers.status')}
              value={get(data, 'records')?.length || '0'}
              type={get(data, 'records')?.length > 0 ? 'success' : 'warning'}
            />
          </>
        )}
        {type === 'watchlist' && (
          <>
            <StatusBadge label={t('result_view.headers.provider')} value="OpenSanctions" type="info" />
            <StatusBadge
              label={t('result_view.headers.status')}
              value={get(data, 'isClean') ? t('result_view.headers.valid') : t('result_view.headers.status')}
              type={get(data, 'isClean') ? 'success' : 'error'}
            />
            <StatusBadge label={t('result_view.fields.match_count') || 'Matches'} value={get(data, 'totalMatches') || '0'} type={get(data, 'totalMatches') > 0 ? 'error' : 'success'} />
          </>
        )}
      </div>

      {/* Detailed Sections */}
      <div className="bg-muted/10 border border-border rounded-2xl p-5 space-y-6">
        {type === 'email' && (
          <>
            {/* Social Platform Presence Grid */}
            {get(data, 'socialPresence') && (
              <SocialPresenceGrid data={get(data, 'socialPresence')} t={t} />
            )}
            {get(data, 'socialPresenceNote') && (
              <div className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg p-3">
                ⚠️ {get(data, 'socialPresenceNote')}
              </div>
            )}
            {/* Email Technical Breakdown */}
            <DataSection title={t('result_view.sections.email_breakdown')} icon={User}>
              <StatusBadge label={t('result_view.fields.username')} value={get(data, 'user') || 'N/A'} />
              <StatusBadge label={t('result_view.fields.domain')} value={get(data, 'domain') || 'N/A'} />
              <StatusBadge label={t('result_view.fields.free_provider')} value={get(data, 'is_free') || false} />
              <StatusBadge label={t('result_view.fields.catch_all')} value={get(data, 'catch_all') || false} />
              {!!get(data, 'mx_records') && (
                <StatusBadge
                  label={t('result_view.fields.mx_check')}
                  value={Array.isArray(get(data, 'mx_records')) ? get(data, 'mx_records').join(', ') : get(data, 'mx_records')}
                  type="info"
                />
              )}
              {!!get(data, 'gravatar') && (
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
                <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/80 tracking-widest">
                  {t('result_view.fields.data_feeds')}
                </h4>
              </div>
            </div>

            {!!get(data, 'articles') && Array.isArray(get(data, 'articles')) && (
              <DataSection title={t('result_view.fields.articles_found')} icon={FileText}>
                {(get(data, 'articles') as any[]).slice(0, 10).map((art, i: number) => (
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
              {(get(data, 'companies') as any[] | undefined)?.map((c, i: number) => (
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
              {(get(data, 'locations') as any[] | undefined)?.map((loc, i: number) => (
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

        {type === 'wikipedia' && !!get(data, 'wiki') && (
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
              {(get(data, 'records') as any[] | undefined)?.map((r, i: number) => (
                <div key={i} className="block p-3 rounded-xl border border-border bg-card/50 col-span-1 sm:col-span-2">
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
              <div className="col-span-1 sm:col-span-2 flex justify-between items-center mb-2">
                <span className="text-xs text-muted-foreground">{t('result_view.sections.sanctions_matches')}</span>
                {selectedMatches && selectedMatches.size > 0 && onSaveSelected && (
                  <Button
                    variant="primary"
                    onClick={onSaveSelected}
                    className="px-3 py-1.5 text-xs h-auto bg-emerald-600 hover:bg-emerald-700"
                  >
                    <FolderPlus className="w-3.5 h-3.5 mr-1" />
                    {t('result_view.fields.save_selected')} ({selectedMatches.size})
                  </Button>
                )}
              </div>
              {(get(data, 'matches') as WatchlistMatch[] | undefined)?.map((m, i: number) => {
                const isSelected = selectedMatches?.has(m.id || m.caption);
                return (
                  <div
                    key={i}
                    className="block p-3 rounded-xl border border-border bg-card/50 col-span-1 sm:col-span-2 border-l-4 border-l-destructive/50 flex gap-3"
                  >
                    {onToggleMatch && (
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={isSelected || false}
                          onChange={() => onToggleMatch(m.id || m.caption)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 bg-card cursor-pointer"
                        />
                      </div>
                    )}
                    <div className="flex-1">
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
                  </div>
                );
              })}
              {!get(data, 'matches')?.length && (
                <div className="col-span-1 sm:col-span-2 p-4 text-center border border-emerald-500/20 bg-emerald-500/5 rounded-xl">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                    {t('result_view.fields.no_matches')}
                  </p>
                </div>
              )}
            </DataSection>
          </div>
        )}

        {/* Raw View Toggle */}
        <div className="pt-4 border-t border-border mt-4">
          <button
            onClick={() => setShowRaw((prev) => !prev)}
            aria-expanded={showRaw}
            aria-controls="raw-json-view"
            className="text-[9px] font-black text-foreground/80 hover:text-primary uppercase tracking-widest flex items-center gap-1.5 transition-colors"
          >
            <Info className="w-3 h-3" aria-hidden="true" />
            {t('result_view.fields.toggle_raw')}
          </button>
          {showRaw && (
            <pre
              id="raw-json-view"
              className="mt-3 text-[10px] text-foreground/60 whitespace-pre-wrap break-all bg-black/5 p-4 rounded-xl font-mono"
            >
              {JSON.stringify(sanitizeResult(data), null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default StructuredResultView;
