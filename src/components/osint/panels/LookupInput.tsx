/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import React from 'react';
import { Search, Wand2, Sparkles, Shield } from 'lucide-react';
import clsx from 'clsx';
import Button from '@/components/ui/Button';

interface LookupInputProps {
  query: string;
  onQueryChange: (val: string) => void;
  onLookup: () => void;
  onOptimize: () => void;
  loading: boolean;
  isOptimizing: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  placeholder: string;
  hint: string;
  tCommon: (key: string) => string;
  tOpt: (key: string) => string;
  t: (key: string) => string;
  optimizationInfo: { original: string; explanation: string } | null;
  onClearOptimization: () => void;
}

export const LookupInput = ({
  query,
  onQueryChange,
  onLookup,
  onOptimize,
  loading,
  isOptimizing,
  isAuthenticated,
  isAdmin,
  placeholder,
  hint,
  tCommon,
  tOpt,
  t,
  optimizationInfo,
  onClearOptimization,
}: LookupInputProps) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/60" aria-hidden="true" />
          <label htmlFor="lookup-input" className="sr-only">
            {placeholder}
          </label>
          <input
            id="lookup-input"
            name="lookup"
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onLookup()}
            placeholder={placeholder}
            className="w-full ps-11 pe-12 py-3 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-foreground"
            disabled={loading}
          />
          <button
            type="button"
            onClick={onOptimize}
            disabled={isOptimizing || !query.trim() || loading}
            title={tOpt('button_tooltip')}
            className="absolute end-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all group cursor-pointer"
          >
            <Wand2 className={clsx('w-4 h-4', isOptimizing && 'animate-pulse')} aria-hidden="true" />
            <Sparkles
              className="absolute -top-1 -end-1 w-2 h-2 text-primary animate-bounce opacity-0 group-hover:opacity-100"
              aria-hidden="true"
            />
          </button>
        </div>
        <Button
          variant={isAdmin ? 'primary' : 'secondary'}
          onClick={onLookup}
          isLoading={loading}
          disabled={loading || !isAuthenticated}
          className={clsx('px-8 py-3 font-bold text-sm h-auto shadow-lg', isAdmin ? 'shadow-primary/20' : 'opacity-85')}
        >
          {!isAdmin ? <Shield className="w-4 h-4 me-2 inline" /> : null}
          {loading ? tCommon('analyze_tone') : tCommon('generate_report')}
        </Button>
      </div>

      <p className={clsx('text-[11px] font-medium', isAdmin ? 'text-foreground/60' : 'text-amber-600 font-bold')}>
        {!isAdmin ? t('admin_only') : hint}
      </p>

      {optimizationInfo && (
        <div className="mt-2 flex items-start gap-2 p-2.5 bg-primary/5 border border-primary/20 rounded-xl animate-slide-in-from-top duration-300">
          <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-[10px] font-bold text-primary uppercase tracking-tight">
              {tOpt('explanation_title')}
            </p>
            <p className="text-[11px] text-foreground/80 leading-relaxed italic">
              {optimizationInfo.explanation}
            </p>
          </div>
          <button
            onClick={onClearOptimization}
            className="text-[10px] font-bold text-primary hover:underline flex-shrink-0 cursor-pointer"
          >
            {tOpt('original')}
          </button>
        </div>
      )}
    </div>
  );
};

export default LookupInput;
