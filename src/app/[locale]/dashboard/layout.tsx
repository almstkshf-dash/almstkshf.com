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
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background/50 text-foreground relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
            </div>

            {/* Sidebar — needs Suspense because it uses useSearchParams() */}
            <Suspense fallback={null}>
                <DashboardSidebar />
            </Suspense>

            {/*
             * Main content area
             * ltr:pl-0 → ltr:pl-16 (lg) → ltr:pl-60 (xl)
             * rtl mirrors via ltr:/rtl: variants
             * pb-20 on mobile reserves space for the bottom nav bar
             */}
            <main
                className={[
                    'min-h-screen',
                    // LTR offsets
                    'ltr:pl-0 ltr:md:pl-16 ltr:lg:pl-60',
                    // RTL offsets (sidebar is on the right)
                    'rtl:pr-0 rtl:md:pr-16 rtl:lg:pr-60',
                    // Bottom space for mobile nav bar
                    'pb-20 md:pb-0',
                ].join(' ')}
            >
                <Suspense
                    fallback={
                        <div className="flex h-[80vh] items-center justify-center">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        </div>
                    }
                >
                    {children}
                </Suspense>
            </main>
        </div>
    );
}
