'use client';

import resources from '../../../data/osintResources.json';
import { useState, useMemo, useEffect } from 'react';
import {
  ExternalLink, Filter, Shield, Search, Mail, Globe,
  Wifi, User, Phone, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, Clock, Trash2,
  FileText, FileSpreadsheet, Cloud
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
type LookupType = 'email' | 'domain' | 'ip' | 'username' | 'phone' | 'news' | 'corporate' | 'location' | 'wikipedia' | 'gleif' | 'watchlist';

interface HistoryItem {
  _id: Id<"osint_results">;
  _creationTime: number;
  type: LookupType;
  query: string;
  result: any;
  userId: string;
  createdAt: number;
}

// ─── Result Components ──────────────────────────────────────────────────
const StatusBadge = ({ label, value, type = 'default' }: { label: string; value: string | boolean; type?: 'default' | 'success' | 'warning' | 'error' | 'info' }) => {
  const isTrue = value === true || value === 'true' || value === 'yes';
  const isFalse = value === false || value === 'false' || value === 'no';

  const colors = {
    success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    error: 'bg-destructive/10 text-destructive border-destructive/20',
    info: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    default: 'bg-muted/50 text-foreground/70 dark:text-slate-400 border-border'
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

const DataSection = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 px-1">
      <Icon className="w-3.5 h-3.5 text-primary/70" />
      <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/70 dark:text-slate-400">{title}</h4>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {children}
    </div>
  </div>
);

const StructuredResultView = ({ type, data, t }: { type: LookupType; data: any; t: any }) => {
  if (!data) return null;

  // Helper to get nested values safely
  const get = (obj: any, path: string) => path.split('.').reduce((acc, part) => acc && acc[part], obj);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header/Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {type === 'email' && (
          <>
            <StatusBadge label="Deliverable" value={get(data, 'deliverability') || get(data, 'format_valid') || 'Unknown'} />
            <StatusBadge label="Disposable" value={get(data, 'is_disposable') || false} type={get(data, 'is_disposable') ? 'error' : 'success'} />
            <StatusBadge label="Risk Score" value={get(data, 'reputation') || 'Low'} type={get(data, 'reputation') === 'High' ? 'error' : 'success'} />
          </>
        )}
        {type === 'ip' && (
          <>
            <StatusBadge label="Country" value={get(data, 'country_name') || get(data, 'country') || 'Unknown'} type="info" />
            <StatusBadge label="VPN/Proxy" value={get(data, 'security.is_vpn') || get(data, 'is_proxy') || false} type={get(data, 'security.is_vpn') ? 'warning' : 'success'} />
            <StatusBadge label="Threat Level" value={get(data, 'security.threat_level') || 'Low'} type={get(data, 'security.threat_level') === 'High' ? 'error' : 'success'} />
          </>
        )}
        {type === 'domain' && (
          <>
            <StatusBadge label="Registered" value={get(data, 'registered') || 'Yes'} />
            <StatusBadge label="DNSSEC" value={get(data, 'dnssec') || 'Unknown'} type="info" />
            <StatusBadge label="Status" value={get(data, 'status') || 'Active'} type="success" />
          </>
        )}
        {type === 'phone' && (
          <>
            <StatusBadge label="Valid" value={get(data, 'valid') || false} />
            <StatusBadge label="Line Type" value={get(data, 'line_type') || 'Mobile'} type="info" />
            <StatusBadge label="Carrier" value={get(data, 'carrier') || 'Unknown'} type="info" />
          </>
        )}
        {type === 'news' && (
          <>
            <StatusBadge label="Provider" value={get(data, 'provider') || 'Unknown'} type="info" />
            <StatusBadge label="Data Feeds" value="Global RSS" type="info" />
            <StatusBadge label="Articles Found" value={get(data, 'totalArticles') || '0'} type="success" />
          </>
        )}
        {type === 'corporate' && (
          <>
            <StatusBadge label="Provider" value="OpenCorporates" type="info" />
            <StatusBadge label="Companies Found" value={get(data, 'companies')?.length || '0'} type={get(data, 'companies')?.length > 0 ? "success" : "warning"} />
          </>
        )}
        {type === 'location' && (
          <>
            <StatusBadge label="Provider" value="Nominatim OSM" type="info" />
            <StatusBadge label="Locations Found" value={get(data, 'locations')?.length || '0'} type={get(data, 'locations')?.length > 0 ? "success" : "warning"} />
          </>
        )}
        {type === 'wikipedia' && (
          <>
            <StatusBadge label="Provider" value="Wikipedia" type="info" />
            <StatusBadge label="Match Found" value={get(data, 'wiki') ? 'Yes' : 'No'} type={get(data, 'wiki') ? "success" : "warning"} />
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
          <DataSection title="Identity Details" icon={User}>
            <StatusBadge label="Username" value={get(data, 'user') || 'N/A'} />
            <StatusBadge label="Domain" value={get(data, 'domain') || 'N/A'} />
            <StatusBadge label="Free Provider" value={get(data, 'is_free') || false} />
            <StatusBadge label="Catch All" value={get(data, 'catch_all') || false} />
          </DataSection>
        )}

        {type === 'ip' && (
          <>
            <DataSection title="Geolocation" icon={Globe}>
              <StatusBadge label="City" value={get(data, 'city') || 'Unknown'} />
              <StatusBadge label="Region" value={get(data, 'region') || 'Unknown'} />
              <StatusBadge label="Postal" value={get(data, 'zip') || 'N/A'} />
              <StatusBadge label="Timezone" value={get(data, 'time_zone.name') || 'N/A'} />
            </DataSection>
            <DataSection title="Network Infrastructure" icon={Server}>
              <StatusBadge label="ASN" value={get(data, 'asn') || 'N/A'} />
              <StatusBadge label="ISP" value={get(data, 'isp') || 'N/A'} />
              <StatusBadge label="Organization" value={get(data, 'org') || 'N/A'} />
              <StatusBadge label="Type" value={get(data, 'type') || 'IPv4'} />
            </DataSection>
          </>
        )}

        {type === 'domain' && (
          <>
            <DataSection title="WHOIS Information" icon={Database}>
              <StatusBadge label="Registrar" value={get(data, 'registrar') || 'N/A'} />
              <StatusBadge label="Created" value={get(data, 'created_date') || 'N/A'} />
              <StatusBadge label="Expiry" value={get(data, 'expiration_date') || 'N/A'} />
              <StatusBadge label="Updated" value={get(data, 'updated_date') || 'N/A'} />
            </DataSection>
            <DataSection title="Technical Records" icon={Wifi}>
              <StatusBadge label="Nameservers" value={Array.isArray(get(data, 'name_servers')) ? get(data, 'name_servers').length : 0} />
              <StatusBadge label="MX Check" value={get(data, 'mx_found') || false} />
            </DataSection>
          </>
        )}

        {type === 'phone' && (
          <DataSection title="Carrier Details" icon={Smartphone}>
            <StatusBadge label="Local Format" value={get(data, 'local_format') || 'N/A'} />
            <StatusBadge label="Intl Format" value={get(data, 'international_format') || 'N/A'} />
            <StatusBadge label="Country Prefix" value={get(data, 'country_prefix') || 'N/A'} />
            <StatusBadge label="Location" value={get(data, 'location') || 'N/A'} />
          </DataSection>
        )}

        {type === 'news' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 px-1">
                <Cloud className="w-4 h-4 text-primary" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/70 tracking-widest">Global News Feed</h4>
              </div>
            </div>

            {get(data, 'articles') && Array.isArray(get(data, 'articles')) && (
              <DataSection title="Recent News Mentions" icon={FileText}>
                {get(data, 'articles').slice(0, 10).map((art: any, i: number) => (
                  <a
                    key={i}
                    href={art.link}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-3 rounded-xl border border-border bg-card/50 hover:bg-muted/50 transition-colors"
                  >
                    <h5 className="text-xs font-bold text-foreground line-clamp-2">{art.title}</h5>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[9px] text-muted-foreground uppercase font-black">{art.source}</span>
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
            <DataSection title="Corporate Entities" icon={Database}>
                {get(data, 'companies')?.map((c: any, i: number) => (
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
            <DataSection title="Geographic Targets" icon={Globe}>
                {get(data, 'locations')?.map((loc: any, i: number) => (
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
            <DataSection title="General Information" icon={Info}>
                  <a
                    href={get(data, 'wiki.url')}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-4 rounded-xl border border-border bg-card/50 hover:bg-muted/50 transition-colors col-span-1 sm:col-span-2"
                  >
                    <h5 className="text-sm font-bold text-foreground">{get(data, 'wiki.title')}</h5>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{get(data, 'wiki.summary')}</p>
                  </a>
            </DataSection>
          </div>
        )}

        {type === 'gleif' && (
          <div className="space-y-6">
            <DataSection title={t('result_view.sections.lei_registration')} icon={Database}>
                {get(data, 'records')?.map((r: any, i: number) => (
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
                {get(data, 'matches')?.map((m: any, i: number) => (
                  <div
                    key={i}
                    className="block p-3 rounded-xl border border-border bg-card/50 col-span-1 sm:col-span-2 border-l-4 border-l-destructive/50"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-foreground uppercase tracking-tight">{m.caption}</h5>
                      <span className="text-[10px] font-black text-destructive uppercase tracking-widest">
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
                      <p className="text-xs font-bold text-emerald-600">{t('result_view.fields.no_matches')}</p>
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
            }}
            className="text-[9px] font-black text-muted-foreground hover:text-primary uppercase tracking-widest flex items-center gap-1.5 transition-colors"
          >
            <Info className="w-3 h-3" />
            Toggle Developer Raw Data
          </button>
          <pre id="raw-json-view" className="hidden mt-3 text-[10px] text-foreground/60 whitespace-pre-wrap break-all bg-black/5 p-4 rounded-xl font-mono">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

// ─── Main component ─────────────────────────────────────────────────────
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
      { type: 'email', label: t('panels.email.title'), icon: <Mail className="w-4 h-4" />, placeholder: t('panels.email.placeholder'), hint: t('panels.email.desc') },
      { type: 'domain', label: t('panels.domain.title'), icon: <Globe className="w-4 h-4" />, placeholder: t('panels.domain.placeholder'), hint: t('panels.domain.desc') },
      { type: 'ip', label: t('panels.ip.title'), icon: <Wifi className="w-4 h-4" />, placeholder: t('panels.ip.placeholder'), hint: t('panels.ip.desc') },
      { type: 'username', label: t('panels.username.title'), icon: <User className="w-4 h-4" />, placeholder: t('panels.username.placeholder'), hint: t('panels.username.desc') },
      { type: 'phone', label: t('panels.phone.title'), icon: <Phone className="w-4 h-4" />, placeholder: t('panels.phone.placeholder'), hint: t('panels.phone.desc') },
      { type: 'news', label: t('panels.news.title'), icon: <Cloud className="w-4 h-4" />, placeholder: t('panels.news.placeholder'), hint: t('panels.news.desc') },
      { type: 'corporate', label: t('panels.corporate.title'), icon: <Database className="w-4 h-4" />, placeholder: t('panels.corporate.placeholder'), hint: t('panels.corporate.desc') },
      { type: 'location', label: t('panels.location.title'), icon: <Globe className="w-4 h-4" />, placeholder: t('panels.location.placeholder'), hint: t('panels.location.desc') },
      { type: 'wikipedia', label: t('panels.wikipedia.title'), icon: <Info className="w-4 h-4" />, placeholder: t('panels.wikipedia.placeholder'), hint: t('panels.wikipedia.desc') },
      { type: 'gleif', label: t('panels.gleif.title'), icon: <Database className="w-4 h-4" />, placeholder: t('panels.gleif.placeholder'), hint: t('panels.gleif.desc') },
      { type: 'watchlist', label: t('panels.watchlist.title'), icon: <Shield className="w-4 h-4" />, placeholder: t('panels.watchlist.placeholder'), hint: t('panels.watchlist.desc') },
    ];

  // ── Hydration guard ──
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // ── Active lookup state ──
  // Use a state synchronized with URL for persistence
  const [activeType, setActiveType] = useState<LookupType>(
    (searchParams.get('osint_tab') as LookupType) || 'watchlist'
  );

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

  // ── Convex actions (Node.js runtime — osint.ts) ──
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
    if (!isAdmin) { setError(t('admin_only')); return; }
    if (!query.trim()) { setError(tCommon('search_placeholder')); return; }

    setLoading(true);
    setError('');
    setResult(null);

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
        setResult(res.data ?? null);
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

  // ── Resource filtering for the active panel ──
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
                onClick={() => { handleTypeChange(lt.type); setQuery(''); setResult(null); setError(''); }}
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
                <label htmlFor="lookup-input" className="sr-only">{currentType.placeholder}</label>
                <input
                  id="lookup-input"
                  name="lookup"
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
            <div className="flex items-center gap-2 px-1">
              <div className={clsx("w-1.5 h-1.5 rounded-full", isAdmin ? "bg-primary/40" : "bg-amber-500")} />
              <p className={clsx("text-[11px] font-medium", isAdmin ? "text-muted-foreground" : "text-amber-600 font-bold")}>
                {!isAdmin ? t('admin_only') : currentType.hint}
              </p>
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
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                    <h3 className="text-sm font-bold text-foreground capitalize tracking-tight">{activeType} {tDashboard('investigation_engine')}</h3>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Analysis Completed Successfully</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-black uppercase tracking-widest gap-2 bg-muted/50" onClick={() => setIsCollectionModalOpen(true)}>
                        <FolderPlus className="w-3 h-3" />
                        Save to Collection
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
                <Clock className="w-4 h-4 text-primary" />
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
                        item.type === 'email' && 'bg-blue-500/10 border-blue-500/20 text-blue-600',
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
                      <button
                        onClick={(e) => { e.stopPropagation(); setHistoryItemToSave(item); }}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 transition-all"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
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
                  <label htmlFor="dir-category" className="text-[10px] font-black text-foreground/70 dark:text-slate-400 uppercase px-1">{tOsint('filters.category')}</label>
                  <select id="dir-category" name="category" className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20" value={category} onChange={e => { setCategory(e.target.value); setPage(0); }}>
                    <option value="all">Global (All)</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="dir-label" className="text-[10px] font-black text-foreground/70 dark:text-slate-400 uppercase px-1">{tOsint('filters.label')}</label>
                  <select id="dir-label" name="label" className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20" value={labelFilter} onChange={e => { setLabelFilter(e.target.value); setPage(0); }}>
                    <option value="all">Any Access</option>
                    {LABELS.map(l => <option key={l.code} value={l.code}>{l.text}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="dir-lang" className="text-[10px] font-black text-foreground/70 dark:text-slate-400 uppercase px-1">{tOsint('filters.language')}</label>
                  <select id="dir-lang" name="language" className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20" value={language} onChange={e => { setLanguage(e.target.value); setPage(0); }}>
                    <option value="all">Multi-language</option>
                    <option value="en">English Only</option>
                    <option value="ar">Arabic Oriented</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="dir-search" className="text-[10px] font-black text-foreground/70 dark:text-slate-400 uppercase px-1">{tOsint('filters.search')}</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
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
