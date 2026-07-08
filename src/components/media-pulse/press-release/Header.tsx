/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Rss, TrendingUp } from 'lucide-react';

type HeaderProps = {
    t: (key: string, options?: any) => string;
    prCount: number;
    totalWires: number;
};

export default function Header({ t, prCount, totalWires }: HeaderProps) {
    return (
        <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Rss className="w-4 h-4 text-blue-500" aria-hidden="true" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-foreground">{t('title')}</h3>
                    <p className="text-[11px] text-foreground/70">
                        {t('subtitle', { count: totalWires })}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {/* Badge removed */}
            </div>
        </div>
    );
}
