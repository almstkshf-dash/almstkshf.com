/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import NextImage from 'next/image';
import { ShieldAlert, Info } from 'lucide-react';

export const InspectorFooter = memo(function InspectorFooter() {
  const t = useTranslations('AiInspector');

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 pt-12 pb-24 grid grid-cols-1 md:grid-cols-3 gap-12">
      <div className="space-y-2">
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
          <ShieldAlert className="w-3 h-3" />
          Zero-API Policy
        </span>
        <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">{t('browser_only')}</p>
      </div>
      <div className="space-y-2">
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
          <Info className="w-3 h-3" />
          Methodology
        </span>
        <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">{t('footer_disclaimer')}</p>
      </div>
      <div className="flex items-start justify-end">
        <NextImage
          src="/logo.png"
          alt="ALMSTKSHF"
          width={128}
          height={32}
          className="h-8 w-auto grayscale opacity-40 dark:opacity-60"
        />
      </div>
    </footer>
  );
});
