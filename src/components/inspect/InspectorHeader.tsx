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
import { motion, useReducedMotion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

export const InspectorHeader = memo(function InspectorHeader() {
  const t = useTranslations('AiInspector');
  const shouldReduceMotion = useReducedMotion();

  const badgeVariants = {
    initial: shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 }
  };

  return (
    <header className="mb-12 space-y-4">
      <motion.div
        initial="initial"
        animate="animate"
        variants={badgeVariants}
        className="flex items-center gap-2 px-3 py-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg w-fit text-[10px] font-black uppercase tracking-widest"
      >
        <ShieldAlert className="w-3 h-3" />
        Forensic Privacy Safe
      </motion.div>
      <h1 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter uppercase leading-[0.9]">
        {t('title')}
      </h1>
      <p className="text-zinc-500 max-w-xl text-sm md:text-base font-medium leading-relaxed">
        {t('subtitle')}
      </p>
    </header>
  );
});
