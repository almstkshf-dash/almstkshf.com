/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import React from 'react';
import { LookupType } from '../types';
import clsx from 'clsx';
import { Mail, Globe, Wifi, User, Phone, Database, Cloud, Info, Shield } from 'lucide-react';

interface LookupSelectorProps {
  activeType: LookupType;
  onTypeChange: (type: LookupType) => void;
  t: (key: string) => string;
}

export const LookupSelector = ({ activeType, onTypeChange, t }: LookupSelectorProps) => {
  const LOOKUP_TYPES: Array<{
    type: LookupType;
    label: string;
    icon: React.ReactNode;
  }> = [
    { type: 'email', label: t('panels.email.title'), icon: <Mail className="w-4 h-4" aria-hidden="true" /> },
    { type: 'domain', label: t('panels.domain.title'), icon: <Globe className="w-4 h-4" aria-hidden="true" /> },
    { type: 'ip', label: t('panels.ip.title'), icon: <Wifi className="w-4 h-4" aria-hidden="true" /> },
    { type: 'username', label: t('panels.username.title'), icon: <User className="w-4 h-4" aria-hidden="true" /> },
    { type: 'phone', label: t('panels.phone.title'), icon: <Phone className="w-4 h-4" aria-hidden="true" /> },
    { type: 'news', label: t('panels.news.title'), icon: <Cloud className="w-4 h-4" aria-hidden="true" /> },
    { type: 'corporate', label: t('panels.corporate.title'), icon: <Database className="w-4 h-4" aria-hidden="true" /> },
    { type: 'location', label: t('panels.location.title'), icon: <Globe className="w-4 h-4" aria-hidden="true" /> },
    { type: 'wikipedia', label: t('panels.wikipedia.title'), icon: <Info className="w-4 h-4" aria-hidden="true" /> },
    { type: 'gleif', label: t('panels.gleif.title'), icon: <Database className="w-4 h-4" aria-hidden="true" /> },
    { type: 'watchlist', label: t('panels.watchlist.title'), icon: <Shield className="w-4 h-4" aria-hidden="true" /> },
  ];

  return (
    <div className="flex overflow-x-auto pb-4 pt-2 -mx-2 px-2 snap-x snap-mandatory gap-3 hide-scrollbar md:grid md:grid-cols-4 lg:grid-cols-5 md:overflow-visible md:pb-0 md:pt-0 md:mx-0 md:px-0 md:gap-2">
      {LOOKUP_TYPES.map((lt) => (
        <button
          key={lt.type}
          onClick={() => onTypeChange(lt.type)}
          aria-pressed={activeType === lt.type}
          className={clsx(
            'flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all min-w-[100px] shrink-0 snap-center md:min-w-0 md:shrink-auto',
            activeType === lt.type
              ? 'bg-primary/5 border-primary text-primary shadow-sm scale-105 md:scale-100'
              : 'border-border/60 bg-muted/20 hover:border-primary/30 text-foreground/60 hover:scale-[1.02]'
          )}
        >
          <div
            className={clsx(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
              activeType === lt.type ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground/60'
            )}
          >
            {lt.icon}
          </div>
          <span className="text-xs font-bold uppercase tracking-tight text-center">{lt.label}</span>
        </button>
      ))}
    </div>
  );
};

export default LookupSelector;
