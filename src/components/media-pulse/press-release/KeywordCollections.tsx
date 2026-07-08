/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { ListFilter, FolderPlus, Trash2, Plus } from 'lucide-react';
import { Id } from '../../../../convex/_generated/dataModel';
import { KeywordCollection } from './hooks/useKeywordCollections';
import KeywordBadge from './KeywordBadge';

type KeywordCollectionsProps = {
    t: (key: string, options?: any) => string;
    collections: KeywordCollection[];
    activeCollectionId: Id<"keyword_collections"> | "";
    setActiveCollectionId: (id: Id<"keyword_collections"> | "") => void;
    activeCollection: KeywordCollection | undefined;
    newCollectionName: string;
    setNewCollectionName: (name: string) => void;
    newKeyword: string;
    setNewKeyword: (kw: string) => void;
    creatingCol: boolean;
    addingKeyword: boolean;
    handleCreateCollection: (e: React.FormEvent) => void;
    handleDeleteCollection: (colId: Id<"keyword_collections">) => void;
    handleAddKeyword: (e: React.FormEvent) => void;
    handleDeleteKeyword: (kw: string) => void;
    activeKeyword: string;
    setKeyword: (kw: string) => void;
};

export default function KeywordCollections({
    t,
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
    activeKeyword,
    setKeyword,
}: KeywordCollectionsProps) {
    return (
        <div className="bg-muted/30 border border-border/80 rounded-xl p-5 space-y-4">
            {/* Collection Header/Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="flex items-center gap-2">
                    <ListFilter className="w-4 h-4 text-primary" aria-hidden="true" />
                    <div>
                        <span className="text-xs font-semibold text-foreground/80">{t('collection_label')}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                            <select
                                value={activeCollectionId}
                                onChange={e => setActiveCollectionId(e.target.value as Id<"keyword_collections"> | "")}
                                className="bg-background border border-border rounded-lg text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/40 font-medium cursor-pointer"
                            >
                                <option value="">{t('select_collection_placeholder')}</option>
                                {collections.map((c) => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                            {activeCollectionId && (
                                <button
                                    type="button"
                                    onClick={() => handleDeleteCollection(activeCollectionId as Id<"keyword_collections">)}
                                    className="p-1.5 text-foreground/50 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-rose-500"
                                    title={t('delete_keyword_tooltip')}
                                    aria-label={t('delete_keyword_tooltip')}
                                >
                                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Inline Create Collection Form */}
                <form onSubmit={handleCreateCollection} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newCollectionName}
                        onChange={e => setNewCollectionName(e.target.value)}
                        placeholder={t('new_collection_placeholder')}
                        className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 w-44"
                        disabled={creatingCol}
                    />
                    <button
                        type="submit"
                        disabled={creatingCol || !newCollectionName.trim()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-all disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        <FolderPlus className="w-3.5 h-3.5" aria-hidden="true" />
                        {creatingCol ? '...' : t('create_collection_btn')}
                    </button>
                </form>
            </div>

            {/* Keywords pills display and inline add form */}
            {activeCollectionId ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-xs font-bold text-foreground">{t('keywords_card_title')}</h4>
                            <p className="text-[10px] text-foreground/60">{t('keywords_card_subtitle')}</p>
                        </div>
                    </div>

                    {!activeCollection || activeCollection.keywords.length === 0 ? (
                        <div className="text-center py-4 bg-background/40 border border-dashed border-border rounded-lg text-[11px] text-foreground/50">
                            {t('no_keywords')}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {activeCollection.keywords.map((kw) => (
                                <KeywordBadge
                                    key={kw}
                                    t={t}
                                    keyword={kw}
                                    activeKeyword={activeKeyword}
                                    onSelect={setKeyword}
                                    onDelete={handleDeleteKeyword}
                                />
                            ))}
                        </div>
                    )}

                    {/* Add Keyword Form */}
                    <form onSubmit={handleAddKeyword} className="flex items-center gap-2 pt-2 border-t border-border/20">
                        <input
                            type="text"
                            value={newKeyword}
                            onChange={e => setNewKeyword(e.target.value)}
                            placeholder={t('add_keyword_placeholder')}
                            className="flex-1 max-w-md px-3 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary/40"
                            disabled={addingKeyword}
                        />
                        <button
                            type="submit"
                            disabled={addingKeyword || !newKeyword.trim()}
                            className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-all disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                            {t('add_keyword_btn')}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="text-center py-6 text-xs text-foreground/50">
                    {t('no_collection_selected')}
                </div>
            )}
        </div>
    );
}
