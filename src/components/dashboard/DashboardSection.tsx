/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface DashboardSectionProps {
    id: string;
    title: string;
    icon: LucideIcon;
    children: ReactNode;
    /** Optional extra element placed to the right of the heading (e.g. a badge) */
    headerSlot?: ReactNode;
    /** Hide the divider line — useful when the section is the first visual element */
    noDivider?: boolean;
}

/**
 * DashboardSection
 * ─────────────────
 * A named, anchor-able wrapper for dashboard content sections. Replaces the
 * undifferentiated `topLeftSlotMemo` blob. Each section has:
 *   • A stable `id` for deep-linking / scroll targeting
 *   • A section heading (h2) with an icon and gradient rule
 *   • `scroll-mt-24` so sticky-header doesn't obscure anchor jumps
 */
export function DashboardSection({
    id,
    title,
    icon: Icon,
    children,
    headerSlot,
    noDivider = false,
}: DashboardSectionProps) {
    return (
        <section id={id} aria-labelledby={`section-heading-${id}`} className="scroll-mt-24">
            {/* Section heading row */}
            <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                        <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
                    </div>
                    <h2
                        id={`section-heading-${id}`}
                        className="text-sm font-black text-foreground tracking-widest uppercase"
                    >
                        {title}
                    </h2>
                </div>

                {!noDivider && (
                    <div className="flex-1 h-px bg-gradient-to-r from-primary/20 via-border/30 to-transparent" />
                )}

                {headerSlot && (
                    <div className="shrink-0">{headerSlot}</div>
                )}
            </div>

            {children}
        </section>
    );
}
