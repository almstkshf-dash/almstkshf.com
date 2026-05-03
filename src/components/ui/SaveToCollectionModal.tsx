/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { X, Plus, FolderPlus, Loader2, Check } from "lucide-react";
import Button from "./Button";
import { useTranslations } from "next-intl";

interface SaveToCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: {
        id: string;
        type: "media_monitoring" | "osint" | "ai_inspector" | "watchlist" | "deep_web" | "custom";
        title: string;
        sourceId?: string;
        data: Record<string, unknown>;
    };
}

export default function SaveToCollectionModal({ isOpen, onClose, item }: SaveToCollectionModalProps) {
    const tCommon = useTranslations("Common");
    const collections = useQuery(api.collections.getCollections);
    const createCollection = useMutation(api.collections.createCollection);
    const addToCollection = useMutation(api.collections.addToCollection);

    const [isCreating, setIsCreating] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

    // Keyboard: close on Escape
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape' && !loading) onClose();
    }, [onClose, loading]);

    useEffect(() => {
        if (!isOpen) {
            setIsCreating(false);
            setNewCollectionName("");
            setLoading(false);
            setStatus(null);
            return;
        }
        setStatus(null);
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const handleSave = async (collectionId: string) => {
        setLoading(true);
        setStatus(null);
        try {
            const result = await addToCollection({ collectionId: collectionId as Id<"collections">, item });
            if (result.isDuplicate) {
                setStatus({ type: 'info', text: 'This item is already in the selected collection.' });
            } else {
                setStatus({ type: 'success', text: 'Saved successfully!' });
                setTimeout(() => {
                    setStatus(null);
                    onClose();
                }, 1000);
            }
        } catch (e) {
            console.error(e);
            setStatus({ type: 'error', text: 'Unable to save item. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAndSave = async () => {
        if (!newCollectionName.trim()) return;
        setLoading(true);
        setStatus(null);
        try {
            const newId = await createCollection({ name: newCollectionName.trim() });
            const result = await addToCollection({ collectionId: newId, item });
            if (result.isDuplicate) {
                setStatus({ type: 'info', text: 'This item is already in the created collection.' });
            } else {
                setStatus({ type: 'success', text: 'Created collection and saved successfully!' });
                setTimeout(() => {
                    setStatus(null);
                    setIsCreating(false);
                    setNewCollectionName("");
                    onClose();
                }, 1000);
            }
        } catch (e) {
            console.error(e);
            setStatus({ type: 'error', text: 'Unable to create collection. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        /* Overlay â€” no ARIA role, purely visual */
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in"
            onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
        >
            {/* Dialog panel â€” where role/aria-modal/aria-labelledby live (WAI-ARIA APG) */}
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="save-collection-title"
                className="bg-card w-full max-w-md rounded-[2rem] border border-border overflow-hidden shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
                    <h3 id="save-collection-title" className="text-lg font-bold text-foreground">
                        {tCommon('save_to_collection')}
                    </h3>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        aria-label={tCommon('cancel')}
                        className="p-2 hover:bg-muted rounded-full transition-colors text-foreground/60 hover:text-foreground disabled:opacity-50"
                    >
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {status?.type === 'success' ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                                <Check className="w-8 h-8" />
                            </div>
                            <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">{status.text}</p>
                        </div>
                    ) : (
                        <>
                            {status && status.type !== 'success' && (
                                <div
                                    role="alert"
                                    className={`rounded-3xl border px-4 py-3 text-sm ${
                                        status.type === 'error'
                                            ? 'bg-rose-500/10 border-rose-200 text-rose-700'
                                            : 'bg-amber-500/10 border-amber-200 text-amber-700'
                                    }`}
                                >
                                    {status.text}
                                </div>
                            )}
                            {isCreating ? (
                                <div className="space-y-4 animate-in slide-in-from-right-4">
                                    <div className="space-y-2">
                                        <label htmlFor="collection-name" className="text-sm font-medium text-foreground">Collection Name</label>
                                        <input
                                            id="collection-name"
                                            /* eslint-disable-next-line jsx-a11y/no-autofocus */
                                            autoFocus
                                            type="text"
                                            value={newCollectionName}
                                            onChange={(e) => setNewCollectionName(e.target.value)}
                                            placeholder="e.g. Investigation Q3"
                                            className="w-full bg-background border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 pt-2">
                                        <Button variant="outline" className="flex-1" onClick={() => setIsCreating(false)}>
                                            {tCommon('cancel')}
                                        </Button>
                                        <Button
                                            variant="primary"
                                            className="flex-1"
                                            onClick={handleCreateAndSave}
                                            disabled={!newCollectionName.trim() || loading}
                                            leftIcon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        >
                                            Create & Save
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setIsCreating(true)}
                                        className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                                    >
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                            <Plus className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-foreground">Create New Collection</p>
                                            <p className="text-xs text-foreground/60">Start a new report collection</p>
                                        </div>
                                    </button>

                                    {collections === undefined ? (
                                        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-foreground/60" /></div>
                                    ) : collections.length === 0 ? (
                                        <div className="text-center p-6 text-sm text-foreground/60">
                                            No collections yet.
                                        </div>
                                    ) : (
                                        <div className="space-y-2 pt-2">
                                            <p className="text-xs font-bold uppercase tracking-widest text-foreground/60 px-1 mb-2">Existing Collections</p>
                                            {collections.map(col => (
                                                <button
                                                    key={col._id}
                                                    onClick={() => handleSave(col._id)}
                                                    disabled={loading}
                                                    className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-all text-left group disabled:opacity-50"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <FolderPlus className="w-5 h-5 text-foreground/60 group-hover:text-primary transition-colors shrink-0" />
                                                        <span className="font-medium text-sm text-foreground truncate">{col.name}</span>
                                                    </div>
                                                    <span className="text-xs text-foreground/60 bg-background px-2 py-1 rounded-full border border-border">{col.items.length} items</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
