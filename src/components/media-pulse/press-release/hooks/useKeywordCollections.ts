/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, api, type Id, type Doc } from '@/lib/convex-compat';
import { toast } from 'sonner';

export type KeywordCollection = Doc<"keyword_collections">;

export function useKeywordCollections(t: (key: string, options?: any) => string) {
    const [activeCollectionId, setActiveCollectionId] = useState<Id<"keyword_collections"> | "">('');
    const [newCollectionName, setNewCollectionName] = useState('');
    const [newKeyword, setNewKeyword] = useState('');
    const [creatingCol, setCreatingCol] = useState(false);
    const [addingKeyword, setAddingKeyword] = useState(false);

    const collectionsQuery = useQuery(api.keywordCollections.getKeywordCollections);
    
    // TS type fix & useMemo check: collectionsQuery ?? [] is fast, but we can keep it as is
    const collections = useMemo<KeywordCollection[]>(
        () => collectionsQuery ?? [],
        [collectionsQuery]
    );

    const createColMut = useMutation(api.keywordCollections.createKeywordCollection);
    const deleteColMut = useMutation(api.keywordCollections.deleteKeywordCollection);
    const addKeywordMut = useMutation(api.keywordCollections.addKeyword);
    const deleteKeywordMut = useMutation(api.keywordCollections.deleteKeyword);

    // Bug Fix: selection change effect
    useEffect(() => {
        if (!activeCollectionId && collections[0]) {
            setActiveCollectionId(collections[0]._id);
        }
    }, [collections, activeCollectionId]);

    const activeCollection = useMemo(() => {
        return collections.find((c) => c._id === activeCollectionId);
    }, [collections, activeCollectionId]);

    const handleCreateCollection = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = newCollectionName.trim();
        if (!name) return;
        setCreatingCol(true);
        try {
            const colId = await createColMut({ name });
            setNewCollectionName('');
            setActiveCollectionId(colId);
            toast.success(t('collection_created'));
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t('fetch_failed'));
        } finally {
            setCreatingCol(false);
        }
    };

    const handleDeleteCollection = async (colId: Id<"keyword_collections">) => {
        if (!confirm(t('confirm_delete_collection'))) return;
        try {
            await deleteColMut({ id: colId });
            setActiveCollectionId(collections.find((c) => c._id !== colId)?._id || '');
            toast.success(t('collection_deleted'));
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t('fetch_failed'));
        }
    };

    const handleAddKeyword = async (e: React.FormEvent) => {
        e.preventDefault();
        const kw = newKeyword.trim();
        if (!activeCollectionId || !kw) return;
        setAddingKeyword(true);
        try {
            await addKeywordMut({
                collectionId: activeCollectionId as Id<"keyword_collections">,
                keyword: kw
            });
            setNewKeyword('');
            toast.success(t('keyword_added'));
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t('fetch_failed'));
        } finally {
            setAddingKeyword(false);
        }
    };

    const handleDeleteKeyword = async (kw: string) => {
        if (!activeCollectionId) return;
        try {
            await deleteKeywordMut({
                collectionId: activeCollectionId as Id<"keyword_collections">,
                keyword: kw
            });
            toast.success(t('keyword_deleted'));
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t('fetch_failed'));
        }
    };

    return {
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
    };
}
