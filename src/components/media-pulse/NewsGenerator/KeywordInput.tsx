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
import { Search, Sparkles, Wand2 } from 'lucide-react';

interface KeywordInputProps {
    keyword: string;
    onChange: (val: string) => void;
    onOptimize: () => void;
    isOptimizing: boolean;
    error?: string;
    optimizationInfo: { original: string; explanation: string } | null;
    onResetOptimization: () => void;
    onEnter: () => void;
    t: any;
    tOpt: any;
}

export const KeywordInput: React.FC<KeywordInputProps> = React.memo(({
    keyword,
    onChange,
    onOptimize,
    isOptimizing,
    error,
    optimizationInfo,
    onResetOptimization,
    onEnter,
    t,
    tOpt,
}) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onEnter();
        }
    };

    return (
        <div>
            <label htmlFor="monitor_keyword" className="sr-only">
                {t('monitor_keyword')}
            </label>
            <div className="relative">
                <Search
                    className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/60"
                    aria-hidden="true"
                />
                <input
                    id="monitor_keyword"
                    name="monitor_keyword"
                    type="text"
                    placeholder={t('placeholder')}
                    value={keyword}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoComplete="on"
                    className={clsx(
                        "w-full bg-muted/50 rounded-xl ps-11 pe-12 py-3.5 text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none placeholder:text-foreground/40 border transition-colors",
                        error ? 'border-destructive/60 ring-2 ring-destructive/20' : 'border-border'
                    )}
                />
                <button
                    type="button"
                    onClick={onOptimize}
                    disabled={isOptimizing || !keyword.trim()}
                    title={tOpt('button_tooltip')}
                    aria-label={tOpt('button_tooltip')}
                    className="absolute end-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary/10 text-blue-800 dark:text-blue-300 hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
                >
                    <Wand2 className={clsx("w-4 h-4", isOptimizing && "animate-pulse")} aria-hidden="true" />
                    <Sparkles
                        className="absolute -top-1 -end-1 w-2 h-2 text-primary animate-bounce opacity-0 group-hover:opacity-100"
                        aria-hidden="true"
                    />
                </button>
            </div>

            {error && (
                <p className="mt-1.5 text-destructive text-xs transition-all">
                    {error}
                </p>
            )}

            {optimizationInfo && (
                <div className="mt-2 flex items-start gap-2 p-2.5 bg-primary/5 border border-primary/20 rounded-xl animate-slide-in-from-top duration-300">
                    <Sparkles className="w-4 h-4 text-primary mt-0.5" aria-hidden="true" />
                    <div className="flex-1">
                        <p className="text-[11px] font-bold text-primary uppercase tracking-tight">
                            {tOpt('explanation_title')}
                        </p>
                        <p className="text-xs text-foreground/80 leading-relaxed italic">
                            {optimizationInfo.explanation}
                        </p>
                    </div>
                    <button
                        onClick={onResetOptimization}
                        className="text-[10px] font-bold text-primary hover:underline"
                    >
                        {tOpt('original')}
                    </button>
                </div>
            )}
        </div>
    );
});

KeywordInput.displayName = 'KeywordInput';
