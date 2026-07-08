/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import React from 'react';
import { SocialPresenceData } from '../types';
import { PLATFORM_ICONS, CATEGORY_COLORS } from '@/constants/osint';

interface SocialPresenceGridProps {
  data: SocialPresenceData;
  t: (key: string, values?: Record<string, string | number>) => string;
}

export const SocialPresenceGrid = ({ data, t }: SocialPresenceGridProps) => {
  if (!data?.platforms?.length) return null;
  const { platforms, totalFound, totalChecked } = data;
  const exposure = Math.round((totalFound / Math.max(totalChecked, 1)) * 100);

  return (
    <div className="space-y-5">
      {/* Summary Bar */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
        <div>
          <p className="text-sm font-semibold text-foreground">🔍 {t('result_view.sections.social_presence')}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('result_view.fields.holehe_note')} • {t('result_view.fields.platforms_checked_full', { count: totalChecked })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{totalFound}</p>
            <p className="text-xs text-muted-foreground">{t('result_view.headers.found')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-rose-400">
              {totalChecked - totalFound - data.unknownOn.length}
            </p>
            <p className="text-xs text-muted-foreground">{t('result_view.headers.clear')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">{data.unknownOn.length}</p>
            <p className="text-xs text-muted-foreground">{t('result_view.headers.unknown')}</p>
          </div>
        </div>
      </div>

      {/* Exposure Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{t('result_view.fields.digital_exposure')}</span>
          <span
            className={`font-semibold ${
              exposure >= 70 ? 'text-rose-400' : exposure >= 40 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {exposure}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              exposure >= 70
                ? 'bg-gradient-to-r from-rose-500 to-red-600'
                : exposure >= 40
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500'
            }`}
            style={{ width: `${exposure}%` }}
          />
        </div>
      </div>

      {/* Platform Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {platforms.map((p) => (
          <a
            key={p.platform}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${p.platform}: ${
              p.found === true
                ? t('result_view.headers.found')
                : p.found === false
                  ? t('result_view.headers.clear')
                  : t('result_view.headers.unknown')
            }`}
            className={`group relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border bg-gradient-to-br ${
              CATEGORY_COLORS[p.category] || 'from-muted/20 to-muted/10 border-border'
            } hover:scale-105 transition-all duration-200 cursor-pointer`}
          >
            {/* Status indicator dot */}
            <span
              className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                p.found === true
                  ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                  : p.found === false
                    ? 'bg-rose-400'
                    : 'bg-amber-400'
              }`}
              aria-hidden="true"
            />
            {/* Icon */}
            <span className="text-2xl" aria-hidden="true">
              {PLATFORM_ICONS[p.platform] || '🌐'}
            </span>
            {/* Name */}
            <span className="text-xs font-medium text-center text-foreground leading-tight">
              {p.platform}
            </span>
            {/* Status label */}
            <span
              className={`text-[10px] font-semibold uppercase tracking-wide ${
                p.found === true
                  ? 'text-emerald-400'
                  : p.found === false
                    ? 'text-rose-400'
                    : 'text-amber-400'
              }`}
            >
              {p.found === true
                ? t('result_view.headers.found')
                : p.found === false
                  ? t('result_view.headers.clear')
                  : t('result_view.headers.unknown')}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default SocialPresenceGrid;
