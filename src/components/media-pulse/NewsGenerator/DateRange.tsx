/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import * as React from 'react';
import clsx from 'clsx';

interface DateRangeProps {
    dateFrom: string;
    dateTo: string;
    onDateFromChange: (val: string) => void;
    onDateToChange: (val: string) => void;
    error?: string;
    t: any;
}

export const DateRange: React.FC<DateRangeProps> = React.memo(({
    dateFrom,
    dateTo,
    onDateFromChange,
    onDateToChange,
    error,
    t,
}) => {
    return (
        <div className="space-y-2">
            <span id="date-range-label" className="block text-[11px] text-foreground/70 font-bold uppercase tracking-widest transition-colors px-1">
                {t('date_range')}
            </span>
            <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="date-range-label">
                <div className="space-y-1">
                    <label htmlFor="date-from" className="sr-only">{t('date_from')}</label>
                    <input
                        id="date-from"
                        name="date-from"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => onDateFromChange(e.target.value)}
                        autoComplete="off"
                        className={clsx(
                            "w-full bg-muted/50 border rounded-xl px-2 py-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-colors",
                            error ? "border-destructive/60 ring-2 ring-destructive/10" : "border-border"
                        )}
                    />
                </div>
                <div className="space-y-1">
                    <label htmlFor="date-to" className="sr-only">{t('date_to')}</label>
                    <input
                        id="date-to"
                        name="date-to"
                        type="date"
                        value={dateTo}
                        onChange={(e) => onDateToChange(e.target.value)}
                        autoComplete="off"
                        className={clsx(
                            "w-full bg-muted/50 border rounded-xl px-2 py-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-colors",
                            error ? "border-destructive/60 ring-2 ring-destructive/10" : "border-border"
                        )}
                    />
                </div>
            </div>
            {error && (
                <p className="text-destructive text-[11px] px-1 transition-all">
                    {error}
                </p>
            )}
        </div>
    );
});

DateRange.displayName = 'DateRange';
