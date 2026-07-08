/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DataSectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export const DataSection = ({ title, icon: Icon, children }: DataSectionProps) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 px-1">
      <Icon className="w-3.5 h-3.5 text-primary/70" />
      <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/80 dark:text-slate-400">
        {title}
      </h4>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{children}</div>
  </div>
);

export default DataSection;
