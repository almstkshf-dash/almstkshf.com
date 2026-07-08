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
import { Type, Image as ImageIcon, Film } from 'lucide-react';

interface ModeSelectorProps {
  mode: 'text' | 'image' | 'video';
  setMode: (mode: 'text' | 'image' | 'video') => void;
}

export const ModeSelector = memo(function ModeSelector({ mode, setMode }: ModeSelectorProps) {
  const t = useTranslations('AiInspector');

  const modes = [
    { id: 'text', icon: Type, label: t('modes.text') },
    { id: 'image', icon: ImageIcon, label: t('modes.image') },
    { id: 'video', icon: Film, label: t('modes.video') }
  ] as const;

  return (
    <div className="flex flex-wrap gap-2 mb-12 bg-zinc-200/50 dark:bg-zinc-900/50 p-1.5 rounded-2xl w-fit border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
      {modes.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => setMode(m.id)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 ${mode === m.id ? 'bg-white dark:bg-zinc-100 text-zinc-900 shadow-xl shadow-zinc-200 dark:shadow-none' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        >
          <m.icon className="w-4 h-4" />
          {m.label}
        </button>
      ))}
    </div>
  );
});
