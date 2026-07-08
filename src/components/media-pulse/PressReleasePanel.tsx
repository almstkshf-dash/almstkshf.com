/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import { useTranslations } from 'next-intl';
import { Clock } from 'lucide-react';
import clsx from 'clsx';

// Subcomponents
import Header from './press-release/Header';
import SyncControls from './press-release/SyncControls';
import KeywordCollections from './press-release/KeywordCollections';
import WireList, { PR_WIRES } from './press-release/WireList';
import SyncResult from './press-release/SyncResult';
import StatusMessages from './press-release/StatusMessages';

// Custom Hooks
import { usePressReleaseSync } from './press-release/hooks/usePressReleaseSync';
import { useKeywordCollections } from './press-release/hooks/useKeywordCollections';

export default function PressReleasePanel({ hideHeader }: { hideHeader?: boolean }) {
    const tRaw = useTranslations('PressReleasePanel');
    // Type-erase the strict namespaced translator so it satisfies
    // the `(key: string, options?: any) => string` signature used by child components.
    const t = ((key: string, options?: any) => tRaw(key as any, options)) as (key: string, options?: any) => string;

    // Sync options and background job controller hook
    const {
        keyword,
        setKeyword,
        limitPerFeed,
        setLimitPerFeed,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        retryCountdown,
        syncState,
        handleSync,
        prCount,
        isAdmin,
        isAuthenticated,
    } = usePressReleaseSync(t);

    // Keyword collections mutation hook
    const {
        collections,
        activeCollectionId,
        setActiveCollectionId,
        activeCollection,
        newCollectionName,
        setNewCollectionName,
        newKeyword,
        setNewKeyword,
        creatingCol,
        addingKeyword,
        handleCreateCollection,
        handleDeleteCollection,
        handleAddKeyword,
        handleDeleteKeyword,
    } = useKeywordCollections(t);

    return (
        <div className={clsx("overflow-hidden transition-all", !hideHeader && "bg-card border border-border rounded-2xl shadow-sm")}>
            {/* Header bar */}
            {!hideHeader && (
                <Header
                    t={t}
                    prCount={prCount}
                    totalWires={PR_WIRES.length}
                />
            )}

            <div className={clsx(hideHeader ? "space-y-4" : "p-6 space-y-4")}>
                {/* Filters, inputs and sync buttons */}
                <SyncControls
                    t={t}
                    keyword={keyword}
                    setKeyword={setKeyword}
                    limitPerFeed={limitPerFeed}
                    setLimitPerFeed={setLimitPerFeed}
                    dateFrom={dateFrom}
                    setDateFrom={setDateFrom}
                    dateTo={dateTo}
                    setDateTo={setDateTo}
                    syncState={syncState}
                    handleSync={handleSync}
                    retryCountdown={retryCountdown}
                    isAdmin={isAdmin}
                    isAuthenticated={isAuthenticated}
                />

                {/* Monitored Keyword Collections Card */}
                <KeywordCollections
                    t={t}
                    collections={collections}
                    activeCollectionId={activeCollectionId}
                    setActiveCollectionId={setActiveCollectionId}
                    activeCollection={activeCollection}
                    newCollectionName={newCollectionName}
                    setNewCollectionName={setNewCollectionName}
                    newKeyword={newKeyword}
                    setNewKeyword={setNewKeyword}
                    creatingCol={creatingCol}
                    addingKeyword={addingKeyword}
                    handleCreateCollection={handleCreateCollection}
                    handleDeleteCollection={handleDeleteCollection}
                    handleAddKeyword={handleAddKeyword}
                    handleDeleteKeyword={handleDeleteKeyword}
                    activeKeyword={keyword}
                    setKeyword={setKeyword}
                />

                {/* Error and countdown status messages */}
                <StatusMessages
                    t={t}
                    error=""
                    syncStateError={syncState.error}
                    retryCountdown={retryCountdown}
                />

                {/* Ingestion results display */}
                <SyncResult
                    t={t}
                    syncState={syncState}
                    keyword={keyword}
                />

                {/* Cron hint */}
                <p className="text-[11px] text-foreground/60 flex items-center gap-1.5 border-t border-border/50 pt-4">
                    <Clock className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                    {t('cron_hint')}
                </p>
            </div>
        </div>
    );
}
