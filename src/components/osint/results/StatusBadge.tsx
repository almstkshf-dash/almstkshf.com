/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import React from 'react';
import clsx from 'clsx';

interface StatusBadgeProps {
  label: string;
  value: string | boolean | number;
  type?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export const StatusBadge = ({ label, value, type = 'default' }: StatusBadgeProps) => {
  const isTrue = value === true || value === 'true' || value === 'yes';
  const isFalse = value === false || value === 'false' || value === 'no';

  const colors = {
    success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    error: 'bg-destructive/10 text-rose-700 dark:text-rose-300 border-destructive/20',
    info: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    default: 'bg-muted/50 text-foreground/85 dark:text-slate-400 border-border',
  };

  let activeColor = colors[type];
  if (type === 'default') {
    if (isTrue) activeColor = colors.success;
    if (isFalse) activeColor = colors.error;
  }

  return (
    <div
      className={clsx(
        'flex items-center justify-between px-3 py-2 rounded-xl border transition-all',
        activeColor
      )}
    >
      <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</span>
      <span className="text-xs font-bold">{String(value)}</span>
    </div>
  );
};

export default StatusBadge;
