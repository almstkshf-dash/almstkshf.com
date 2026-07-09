/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import React from 'react';
import { Search, XCircle, ShieldCheck, FolderPlus, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import SaveToCollectionModal from '@/components/ui/SaveToCollectionModal';
import StructuredResultView from '../results/StructuredResultView';
import { LookupType, OsintResult } from '../types';

interface ResultRendererProps {
  result: OsintResult | null;
  error: string;
  loading: boolean;
  activeType: LookupType;
  query: string;
  t: (key: string, values?: Record<string, string | number>) => string;
  tCommon: (key: string) => string;
  tDashboard: (key: string) => string;
  selectedMatches: Set<string>;
  onToggleMatch: (id: string) => void;
  onToggleAllMatches: (ids: string[]) => void;
  onSaveSelected: () => void;
  isCollectionModalOpen: boolean;
  onSetCollectionModalOpen: (open: boolean) => void;
}

export const ResultRenderer = ({
  result,
  error,
  loading,
  activeType,
  query,
  t,
  tCommon,
  tDashboard,
  selectedMatches,
  onToggleMatch,
  onToggleAllMatches,
  onSaveSelected,
  isCollectionModalOpen,
  onSetCollectionModalOpen,
}: ResultRendererProps) => {
  if (loading) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Ready to Investigate State */}
      {!result && !error && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-border rounded-xl bg-muted/5">
          <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center">
            <Search className="w-8 h-8 text-foreground/30" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Ready to Investigate</h3>
            <p className="text-xs text-foreground/60 max-w-sm mt-1">
              Select an OSINT tool above, enter your target query, and click analyze to begin gathering intelligence.
            </p>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 text-sm text-rose-700 dark:text-rose-300 bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-3"
          >
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold">{error}</span>
          </motion.div>
        )}

        {result && (
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground capitalize tracking-tight">
                    {activeType} {tDashboard('investigation_engine')}
                  </h3>
                  <p className="text-[10px] font-medium text-foreground/80 uppercase tracking-widest">
                    {t('result_view.fields.analysis_completed')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-[10px] font-black uppercase tracking-widest gap-2 bg-muted/50 hover:bg-muted/70 text-foreground"
                  onClick={() => onSetCollectionModalOpen(true)}
                >
                  <FolderPlus className="w-3 h-3" />
                  {t('result_view.fields.save_collection')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-[10px] font-black uppercase tracking-widest gap-2 bg-muted/50 hover:bg-muted/70 text-foreground"
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
                >
                  <Database className="w-3 h-3" />
                  {tCommon('copy')}
                </Button>
              </div>
            </div>

            <SaveToCollectionModal
              isOpen={isCollectionModalOpen}
              onClose={() => onSetCollectionModalOpen(false)}
              item={{
                id: Math.random().toString(36).substring(7),
                type: 'osint',
                title: `OSINT: ${activeType} lookup for ${query}`,
                data: result as any,
              }}
            />

            <StructuredResultView
              type={activeType}
              data={result}
              t={t}
              selectedMatches={selectedMatches}
              onToggleMatch={onToggleMatch}
              onToggleAllMatches={onToggleAllMatches}
              onSaveSelected={onSaveSelected}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResultRenderer;
