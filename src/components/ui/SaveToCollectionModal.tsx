/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.\
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useInertBackground } from "@/hooks/useInertBackground";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ConvexError } from "convex/values";
import { Id } from "../../../convex/_generated/dataModel";
import { X, Plus, FolderPlus, Loader2, Check } from "lucide-react";
import Button from "./Button";
import { useTranslations } from "next-intl";

// ─── Constants ────────────────────────────────────────────────────────────────
const SUCCESS_DELAY = 1200;
const DUPLICATE_DELAY = 1800;

// ─── Types ────────────────────────────────────────────────────────────────────
export type CollectionItemType =
    | "media_monitoring"
    | "osint"
    | "ai_inspector"
    | "watchlist"
    | "deep_web"
    | "custom";

export interface CollectionItem {
    id: string;
    type: CollectionItemType;
    title: string;
    sourceId?: string;
    data: Record<string, unknown>;
}

interface Status {
    type: "success" | "error" | "info";
    text: string;
    /** Optional second line for split duplicate message */
    subText?: string;
}

interface SaveToCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    item?: CollectionItem;
    items?: CollectionItem[];
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SaveToCollectionModal({
    isOpen,
    onClose,
    item,
    items,
}: SaveToCollectionModalProps) {
    const tCommon = useTranslations("Common");
    const collections = useQuery(api.collections.getCollections);
    const createCollection = useMutation(api.collections.createCollection);
    const addMultipleToCollection = useMutation(api.collections.addMultipleToCollection);

    const [isCreating, setIsCreating] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState("");
    const [loading, setLoading] = useState(false);
    const [savingCollectionId, setSavingCollectionId] = useState<string | null>(null);
    const [status, setStatus] = useState<Status | null>(null);

    // Refs
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Apply `inert` to background content when modal is open
    useInertBackground(isOpen, overlayRef);

    /** Memoised list of items to save (avoids recomputing on every render) */
    const itemsToSave = useMemo(
        () => items ?? (item ? [item] : []),
        [items, item]
    );

    // ── Focus the name input whenever the create form opens ───────────────────
    useEffect(() => {
        if (isCreating) {
            inputRef.current?.focus();
        }
    }, [isCreating]);

    // ── Cleanup pending timeouts on unmount ───────────────────────────────────
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // ── Keyboard handler: Escape closes (only when not loading / not success) ─
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape" && !loading && status?.type !== "success") {
                onClose();
            }
        },
        [onClose, loading, status]
    );

    // ── Scroll lock + event listeners ─────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) {
            setIsCreating(false);
            setNewCollectionName("");
            setLoading(false);
            setSavingCollectionId(null);
            setStatus(null);
            return;
        }

        setStatus(null);
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = "";
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    // ─── Shared save logic ────────────────────────────────────────────────────
    const parseConvexError = (e: unknown, fallbackKey: "unable_to_save" | "unable_to_create"): string => {
        if (e instanceof ConvexError) {
            if (e.data === "Unauthenticated") return tCommon("must_be_signed_in");
            if (e.data === "Unauthorized") return tCommon("no_permission");
            if (typeof e.data === "string") return e.data;
            if (
                typeof e.data === "object" &&
                e.data !== null &&
                "message" in e.data
            ) {
                return String((e.data as { message: unknown }).message);
            }
        }
        return tCommon(fallbackKey);
    };

    /**
     * Core mutation logic shared by handleSave and handleCreateAndSave.
     * Returns true when a success timeout has been scheduled (caller should
     * not reset loading itself in that case).
     */
    const saveItems = async (
        collectionId: Id<"collections">,
        onSuccessExtra?: () => void
    ): Promise<void> => {
        const result = await addMultipleToCollection({
            collectionId,
            items: itemsToSave,
        });

        if (result.addedCount === 0 && result.duplicateCount > 0) {
            // All duplicates — show info and stay open
            setStatus({ type: "info", text: tCommon("all_already_in_collection") });
            setLoading(false);
            setSavingCollectionId(null);
            return;
        }

        const delay = result.duplicateCount > 0 ? DUPLICATE_DELAY : SUCCESS_DELAY;

        if (result.duplicateCount > 0) {
            setStatus({
                type: "success",
                text: tCommon("added_new_items", { count: result.addedCount }),
                subText: tCommon("items_already_present", { count: result.duplicateCount }),
            });
        } else {
            setStatus({
                type: "success",
                text: tCommon("saved_items_successfully", { count: result.addedCount }),
            });
        }

        timeoutRef.current = setTimeout(() => {
            setStatus(null);
            setLoading(false);
            setSavingCollectionId(null);
            onSuccessExtra?.();
            onClose();
        }, delay);
    };

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const handleSave = async (collectionId: string) => {
        if (loading) return; // Double-click guard
        if (itemsToSave.length === 0) {
            setStatus({ type: "error", text: tCommon("no_items_selected") });
            return;
        }

        setLoading(true);
        setSavingCollectionId(collectionId);
        setStatus(null);
        try {
            await saveItems(collectionId as Id<"collections">);
        } catch (e) {
            console.error(e);
            setStatus({ type: "error", text: parseConvexError(e, "unable_to_save") });
            setLoading(false);
            setSavingCollectionId(null);
        }
    };

    const handleCreateAndSave = async () => {
        if (loading) return; // Double-click guard
        if (!newCollectionName.trim()) return;
        if (itemsToSave.length === 0) {
            setStatus({ type: "error", text: tCommon("no_items_selected") });
            return;
        }

        setLoading(true);
        setStatus(null);
        try {
            const newId = await createCollection({ name: newCollectionName.trim() });
            await saveItems(newId, () => {
                setIsCreating(false);
                setNewCollectionName("");
            });
        } catch (e) {
            console.error(e);
            setStatus({ type: "error", text: parseConvexError(e, "unable_to_create") });
            setLoading(false);
        }
    };

    // ─── Derived flags ────────────────────────────────────────────────────────
    const isSuccess = status?.type === "success";
    /** All interaction should be blocked while showing success animation */
    const isLocked = loading || isSuccess;

    // ─── Render ───────────────────────────────────────────────────────────────
    if (typeof document === "undefined") return null;

    return createPortal(
        /* Overlay — purely visual, no ARIA role */
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-fade-in"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isLocked) onClose();
            }}
        >
            {/* Dialog panel — WAI-ARIA APG */}
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="save-collection-title"
                aria-describedby="save-collection-description"
                className="bg-card/90 backdrop-blur-md w-full max-w-md rounded-[2rem] border border-border/50 overflow-hidden shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
                    <div>
                        <h3 id="save-collection-title" className="text-lg font-bold text-foreground">
                            {tCommon("save_to_collection")}
                        </h3>
                        {itemsToSave.length > 0 && (
                            <p id="save-collection-description" className="text-xs text-foreground/60 mt-0.5">
                                {tCommon("save_modal_description")}
                                {" "}
                                <span className="font-semibold text-foreground/80">
                                    ({itemsToSave.length})
                                </span>
                            </p>
                        )}
                        {itemsToSave.length === 0 && (
                            <p id="save-collection-description" className="text-xs text-foreground/60 mt-0.5">
                                {tCommon("save_modal_description")}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isLocked}
                        aria-label={tCommon("cancel")}
                        className="p-2 hover:bg-muted rounded-full transition-colors text-foreground/60 hover:text-foreground disabled:opacity-50"
                    >
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>

                {/* ── Body ── */}
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {isSuccess ? (
                        /* ── Success state ── */
                        <div className="flex flex-col items-center justify-center py-8 space-y-3">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                                <Check className="w-8 h-8" aria-hidden="true" />
                            </div>
                            <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400 text-center">
                                {status!.text}
                            </p>
                            {status!.subText && (
                                <p className="text-sm text-foreground/60 text-center">
                                    {status!.subText}
                                </p>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Status alert (error / info) */}
                            {status && (
                                <div
                                    role="alert"
                                    className={`rounded-3xl border px-4 py-3 text-sm ${
                                        status.type === "error"
                                            ? "bg-rose-500/10 border-rose-200 text-rose-700"
                                            : "bg-amber-500/10 border-amber-200 text-amber-700"
                                    }`}
                                >
                                    {status.text}
                                </div>
                            )}

                            {isCreating ? (
                                /* ── Create new collection form ── */
                                <div className="space-y-4 animate-slide-in-from-end">
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="collection-name"
                                            className="text-sm font-medium text-foreground"
                                        >
                                            {tCommon("collection_name")}
                                        </label>
                                        <input
                                            ref={inputRef}
                                            id="collection-name"
                                            type="text"
                                            value={newCollectionName}
                                            onChange={(e) => setNewCollectionName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleCreateAndSave();
                                            }}
                                            placeholder={tCommon("collection_name_placeholder")}
                                            className="w-full bg-background border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 pt-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => setIsCreating(false)}
                                            disabled={isLocked}
                                        >
                                            {tCommon("cancel")}
                                        </Button>
                                        <Button
                                            variant="primary"
                                            className="flex-1"
                                            onClick={handleCreateAndSave}
                                            disabled={!newCollectionName.trim() || isLocked}
                                            leftIcon={
                                                loading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                                ) : (
                                                    <Check className="w-4 h-4" aria-hidden="true" />
                                                )
                                            }
                                        >
                                            {tCommon("create_and_save")}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                /* ── Existing collections list ── */
                                <div className="space-y-3">
                                    {/* Create new button */}
                                    <button
                                        onClick={() => setIsCreating(true)}
                                        disabled={isLocked}
                                        className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-start group disabled:opacity-50 disabled:pointer-events-none"
                                    >
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                            <Plus className="w-5 h-5" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-foreground">
                                                {tCommon("create_new_collection")}
                                            </p>
                                            <p className="text-xs text-foreground/60">
                                                {tCommon("start_new_collection")}
                                            </p>
                                        </div>
                                    </button>

                                    {/* Collection list */}
                                    {collections === undefined ? (
                                        <div className="flex justify-center p-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-foreground/60" aria-hidden="true" />
                                        </div>
                                    ) : collections.length === 0 ? (
                                        <div className="text-center p-6 text-sm text-foreground/60">
                                            {tCommon("no_collections_yet")}
                                        </div>
                                    ) : (
                                        <div className="space-y-2 pt-2">
                                            <p className="text-xs font-bold uppercase tracking-widest text-foreground/60 px-1 mb-2">
                                                {tCommon("existing_collections")}
                                            </p>
                                            {collections.map((col) => {
                                                const isSavingThis = savingCollectionId === col._id;
                                                return (
                                                    <button
                                                        key={col._id}
                                                        onClick={() => handleSave(col._id)}
                                                        disabled={isLocked}
                                                        className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-all text-start group disabled:opacity-50 disabled:pointer-events-none"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            {isSavingThis ? (
                                                                <Loader2
                                                                    className="w-5 h-5 text-primary animate-spin shrink-0"
                                                                    aria-hidden="true"
                                                                />
                                                            ) : (
                                                                <FolderPlus
                                                                    className="w-5 h-5 text-foreground/60 group-hover:text-primary transition-colors shrink-0"
                                                                    aria-hidden="true"
                                                                />
                                                            )}
                                                            <span className="font-medium text-sm text-foreground truncate">
                                                                {col.name}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-foreground/60 bg-background px-2 py-1 rounded-full border border-border">
                                                            {col.items.length} items
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── Footer ── */}
                {!isSuccess && !isCreating && (
                    <div className="p-4 border-t border-border bg-muted/10 shrink-0 flex justify-end">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isLocked}
                            className="text-sm px-6"
                        >
                            {tCommon("close")}
                        </Button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
