/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { X } from 'lucide-react';
import clsx from 'clsx';

type KeywordBadgeProps = {
    t: (key: string, options?: any) => string;
    keyword: string;
    activeKeyword: string;
    onSelect: (kw: string) => void;
    onDelete: (kw: string) => void;
};

export default function KeywordBadge({
    t,
    keyword,
    activeKeyword,
    onSelect,
    onDelete,
}: KeywordBadgeProps) {
    const isActive = activeKeyword === keyword;

    return (
        <div
            className={clsx(
                "flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border shadow-sm transition-all",
                isActive
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-background border-border text-foreground hover:border-primary/40 hover:text-primary"
            )}
        >
            <button
                type="button"
                onClick={() => onSelect(keyword)}
                className="focus:outline-none"
                title={t('sync_keyword_tooltip')}
            >
                <span>{keyword}</span>
            </button>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(keyword);
                }}
                className="p-0.5 rounded-full text-foreground/40 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors focus:outline-none focus:ring-1 focus:ring-rose-500"
                title={t('delete_keyword_tooltip')}
                aria-label={t('delete_keyword_tooltip')}
            >
                <X className="w-3 h-3" aria-hidden="true" />
            </button>
        </div>
    );
}
