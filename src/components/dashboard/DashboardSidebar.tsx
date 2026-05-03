/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/routing';
import { useQuery, useConvexAuth } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useTransition } from 'react';
import {
    Globe,
    Search,
    GlobeLock,
    ShieldCheck,
    Shield,
    Settings,
    Loader2,
    Fingerprint as InspectIcon,
    type LucideIcon,
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { HoverPrefetchLink } from '@/components/ui/HoverPrefetchLink';

type ViewId = 'standard' | 'deep' | 'osint' | 'terrorist_list' | 'inspect' | 'darkweb';

interface NavItem {
    id: ViewId;
    labelKey: string;
    icon: LucideIcon;
    adminOnly: boolean;
}

const NAV_ITEMS: NavItem[] = [
    { id: 'standard', labelKey: 'sidebar.standard', icon: Globe, adminOnly: false },
    { id: 'deep', labelKey: 'sidebar.deep', icon: Search, adminOnly: false },
    { id: 'osint', labelKey: 'sidebar.osint', icon: ShieldCheck, adminOnly: false },
    { id: 'inspect', labelKey: 'sidebar.inspect', icon: InspectIcon, adminOnly: false },
    { id: 'darkweb', labelKey: 'sidebar.darkweb', icon: GlobeLock, adminOnly: false },
    { id: 'terrorist_list', labelKey: 'sidebar.terrorist_list', icon: Shield, adminOnly: false },
];

/**
 * DashboardSidebar
 * ─────────────────
 * Persistent navigation sidebar for the dashboard shell.
 *
 * Breakpoint behaviour:
 *   • Mobile (< lg):  Fixed bottom icon bar (h-16, full-width)
 *   • Tablet (lg):    Fixed left icon-only strip (w-16)
 *   • Desktop (xl+):  Fixed left expanded sidebar (w-60, icons + labels)
 *
 * Admin-restricted tabs are NOT rendered at all for non-admins.
 * While admin status is loading, those slots show a skeleton.
 */
export default function DashboardSidebar() {
    const t = useTranslations();
    const locale = useLocale();
    const isAr = locale === 'ar';
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const activeView = (searchParams.get('view') as ViewId) || 'standard';

    const { isAuthenticated } = useConvexAuth();
    const isAdminResult = useQuery(
        (api as any).authQueries?.checkIsAdmin,
        isAuthenticated ? {} : 'skip'
    );
    const isAdminLoading = isAuthenticated && isAdminResult === undefined;
    const isAdmin = isAdminResult === true;

    const changeView = (newView: ViewId) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', newView);
        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        });
    };

    const visibleItems = NAV_ITEMS;

    /* ─── Shared item renderer ──────────────────────────────────────── */
    const renderItem = (item: NavItem, layout: 'expanded' | 'icon') => {
        const Icon = item.icon;
        const isActive = activeView === item.id;

        return (
            <button
                key={item.id}
                onClick={() => changeView(item.id)}
                disabled={isPending}
                aria-current={isActive ? 'page' : undefined}
                title={layout === 'icon' ? t(`Dashboard.${item.labelKey}` as any) : undefined}
                className={clsx(
                    'relative flex items-center gap-3 rounded-2xl transition-all duration-200 group',
                    layout === 'expanded'
                        ? 'w-full h-11 px-4 text-xs font-black tracking-widest uppercase'
                        : 'w-10 h-10 justify-center',
                    layout === 'expanded' && isAr && '!tracking-normal !uppercase-none',
                    isActive
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
            >
                {/* Framer active indicator */}
                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            layoutId={`sidebar-active-${layout}`}
                            className="absolute inset-0 bg-primary rounded-2xl -z-10"
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                        />
                    )}
                </AnimatePresence>

                <Icon className={clsx('shrink-0', layout === 'expanded' ? 'w-4 h-4' : 'w-5 h-5')} />
                {layout === 'expanded' && (
                    <span className="truncate">{t(`Dashboard.${item.labelKey}` as any)}</span>
                )}
            </button>
        );
    };

    /* ─── Settings link (bottom of sidebar / end of mobile bar) ──────── */
    const renderSettings = (layout: 'expanded' | 'icon') => (
        <HoverPrefetchLink href="/dashboard/settings">
            <button
                title={layout === 'icon' ? t('Dashboard.sidebar.settings') : undefined}
                className={clsx(
                    'flex items-center gap-3 rounded-2xl transition-all duration-200',
                    'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                    layout === 'expanded'
                        ? 'w-full h-11 px-4 text-xs font-black uppercase tracking-widest'
                        : 'w-10 h-10 justify-center'
                )}
            >
                <Settings className={clsx('shrink-0', layout === 'expanded' ? 'w-4 h-4' : 'w-5 h-5')} />
                {layout === 'expanded' && <span className="truncate">{t('Dashboard.sidebar.settings')}</span>}
            </button>
        </HoverPrefetchLink>
    );

    return (
        <>
            {/* ── DESKTOP EXPANDED (lg+) ─────────────────────────────────── */}
            <aside
                aria-label="Dashboard navigation"
                className={clsx(
                    'hidden lg:flex flex-col',
                    'fixed top-0 bottom-0 z-50',
                    'w-60',
                    'ltr:left-0 rtl:right-0',
                    'bg-background/95 backdrop-blur-xl border-border/60',
                    'ltr:border-r rtl:border-l',
                    'pt-20 pb-6 px-4',
                    'overflow-y-auto'
                )}
            >
                {/* Brand accent line */}
                <div className="absolute top-0 ltr:left-0 rtl:right-0 h-full w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent pointer-events-none" />

                {/* Nav items */}
                <nav className="flex flex-col gap-1.5 flex-1">
                    {visibleItems.map((item) => renderItem(item, 'expanded'))}
                </nav>

                {/* Divider */}
                <div className="my-4 h-px bg-border/40" />

                {/* Settings */}
                {renderSettings('expanded')}

                {/* Live status indicator */}
                <div className="mt-4 mx-1 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                        <span className={clsx(
                            "text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400",
                            isAr ? "tracking-normal" : "tracking-widest"
                        )}>
                            {t('RssSources.live_status')}
                        </span>
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1 leading-relaxed">
                        {t('RssSources.live_desc')}
                    </p>
                </div>
            </aside>

            {/* ── TABLET STRIP (md to lg) ────────────────────────────────── */}
            <aside
                aria-label="Dashboard navigation"
                className={clsx(
                    'hidden md:flex lg:hidden flex-col items-center gap-2',
                    'fixed top-0 bottom-0 z-50 w-16',
                    'ltr:left-0 rtl:right-0',
                    'bg-background/95 backdrop-blur-xl',
                    'ltr:border-r rtl:border-l border-border/60',
                    'pt-20 pb-6',
                    'overflow-y-auto'
                )}
            >
                <nav className="flex flex-col items-center gap-2 flex-1">
                    {visibleItems.map((item) => renderItem(item, 'icon'))}
                </nav>
                <div className="my-2 w-8 h-px bg-border/40" />
                {renderSettings('icon')}
            </aside>

            {/* ── MOBILE BOTTOM BAR (< md) ───────────────────────────────── */}
            <nav
                aria-label="Dashboard navigation"
                className={clsx(
                    'md:hidden fixed bottom-0 inset-x-0 z-50 h-16',
                    'bg-background/95 backdrop-blur-xl border-t border-border/60 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]',
                    'flex items-center justify-around px-1'
                )}
            >
                {visibleItems.map((item) => {
                    const Icon: LucideIcon = item.icon;
                    const isActive = activeView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => changeView(item.id)}
                            disabled={isPending}
                            aria-current={isActive ? 'page' : undefined}
                            className={clsx(
                                'relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200',
                                isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-[10px] font-bold uppercase tracking-tight truncate max-w-[64px] opacity-90 leading-tight">
                                {t(`Dashboard.${item.labelKey}` as any)}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="mobile-active-tab"
                                    className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"
                                />
                            )}
                        </button>
                    );
                })}

                {/* Settings icon on mobile */}
                <HoverPrefetchLink href="/dashboard/settings">
                    <button className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground transition-all">
                        <Settings className="w-5 h-5" />
                        <span className="text-[8px] font-black uppercase tracking-wider">
                            {t('Dashboard.sidebar.settings')}
                        </span>
                    </button>
                </HoverPrefetchLink>

                {isPending && (
                    <div className="absolute top-1 ltr:right-2 rtl:left-2">
                        <Loader2 className="w-3 h-3 text-primary animate-spin" />
                    </div>
                )}
            </nav>
        </>
    );
}
