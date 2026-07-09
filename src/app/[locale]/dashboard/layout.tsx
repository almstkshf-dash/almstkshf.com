/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { cn } from '@/utils/cn';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
        },
    },
};

/**
 * SidebarSkeleton
 * ───────────────
 * Responsive skeleton loader for the dashboard sidebar.
 * Prevents Cumulative Layout Shift (CLS) by mirroring the sidebar layout.
 */
function SidebarSkeleton() {
    return (
        <>
            {/* Desktop Skeleton (lg+) */}
            <div className="hidden lg:flex flex-col fixed top-0 bottom-0 z-50 w-60 start-0 bg-background/95 backdrop-blur-xl border-border/60 border-e pt-20 pb-6 px-4">
                <div className="flex flex-col gap-4 flex-1">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="w-full h-11 rounded-2xl bg-muted/40 animate-pulse" />
                    ))}
                </div>
                <div className="my-4 h-px bg-border/40" />
                <div className="w-full h-11 rounded-2xl bg-muted/40 animate-pulse" />
                <div className="mt-4 p-3 rounded-2xl bg-muted/20 border border-border/40 h-16 animate-pulse" />
            </div>

            {/* Tablet Skeleton (md to lg) */}
            <div className="hidden md:flex lg:hidden flex-col items-center gap-4 fixed top-0 bottom-0 z-50 w-16 start-0 bg-background/95 backdrop-blur-xl border-e border-border/60 pt-20 pb-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-10 h-10 rounded-2xl bg-muted/40 animate-pulse" />
                ))}
                <div className="my-2 w-8 h-px bg-border/40" />
                <div className="w-10 h-10 rounded-2xl bg-muted/40 animate-pulse" />
            </div>

            {/* Mobile Skeleton (< md) */}
            <div className="md:hidden fixed bottom-0 inset-x-0 z-50 h-16 bg-background/95 backdrop-blur-xl border-t border-border/60 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] flex items-center justify-around px-4">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="w-10 h-10 rounded-xl bg-muted/40 animate-pulse" />
                ))}
            </div>
        </>
    );
}

/**
 * DashboardLayout
 * ───────────────
 * Two-column app shell:
 *
 *   ┌──────────────────────────────────────────────────┐
 *   │  [Sidebar 240px xl+ / 64px lg / bottom bar mob] │
 *   │  ┌──────────────────────────────────────────┐    │
 *   │  │  <children> (main content)               │    │
 *   │  └──────────────────────────────────────────┘    │
 *   └──────────────────────────────────────────────────┘
 *
 * DashboardSidebar is a Client Component (Suspense boundary required)
 * and handles all view-switching navigation internally via URL params.
 * This layout itself stays a Server Component.
 */
export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { userId } = await auth();
    const { locale } = await params;

    if (!userId) {
        redirect(`/${locale}/sign-in`);
    }

    return (
        <div className="min-h-screen bg-background/50 text-foreground relative overflow-x-hidden">
            {/* Ambient background glows with optimized performance (no animation, lower blur radius) */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div 
                    className="absolute top-[-10%] -start-[10%] w-[40%] h-[40%] bg-primary/10 blur-[80px] rounded-full opacity-40 will-change-transform transform-gpu"
                />
                <div 
                    className="absolute bottom-[-10%] -end-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[80px] rounded-full opacity-40 will-change-transform transform-gpu"
                />
            </div>

            {/* Sidebar — needs Suspense because it uses useSearchParams() */}
            <Suspense fallback={<SidebarSkeleton />}>
                <DashboardSidebar />
            </Suspense>

            {/*
             * Main content area
             * ps-0 → ps-16 (md) → ps-60 (lg)
             * Logical ps- auto-flips to pe- in RTL (sidebar moves to the end side)
             * pb-20 on mobile reserves space for the bottom nav bar
             */}
            <main
                aria-label="Dashboard content"
                className={cn(
                    'min-h-screen',
                    // Logical inline-start offset mirrors sidebar width at each breakpoint
                    'ps-0 md:ps-16 lg:ps-60',
                    // Bottom space for mobile nav bar
                    'pb-20 md:pb-0'
                )}
            >
                {children}
            </main>
        </div>
    );
}

