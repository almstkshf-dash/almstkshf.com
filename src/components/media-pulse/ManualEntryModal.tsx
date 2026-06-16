/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { useTranslations } from 'next-intl';
import { useMutation, useAction, useQuery, useConvexAuth } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { X, Plus, Wand2 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ManualEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    articleToEdit?: any;
}

const sanitizeUrl = (inputUrl: string): string => {
    if (!inputUrl) return '';
    let cleaned = inputUrl.trim();

    // Split by whitespace or newlines or commas and pick the first one
    const urls = cleaned.split(/[\s,\n]+/);
    if (urls.length > 0) {
        cleaned = urls[0].trim();
    }

    if (!cleaned) return '';

    // If it doesn't have http:// or https:// but contains a dot, prepend https://
    if (!/^https?:\/\//i.test(cleaned)) {
        if (cleaned.includes('.')) {
            cleaned = 'https://' + cleaned;
        }
    }

    return cleaned;
};

const detectSocialMedia = (url: string) => {
    const lowercaseUrl = url.toLowerCase();
    if (lowercaseUrl.includes('tiktok.com') || lowercaseUrl.includes('vt.tiktok.com')) {
        return { sourceType: 'Social Media', source: 'TikTok' };
    }
    if (lowercaseUrl.includes('instagram.com')) {
        return { sourceType: 'Social Media', source: 'Instagram' };
    }
    if (lowercaseUrl.includes('facebook.com') || lowercaseUrl.includes('fb.watch') || lowercaseUrl.includes('fb.com')) {
        return { sourceType: 'Social Media', source: 'Facebook' };
    }
    if (lowercaseUrl.includes('twitter.com') || lowercaseUrl.includes('x.com')) {
        return { sourceType: 'Social Media', source: 'Twitter/X' };
    }
    if (lowercaseUrl.includes('youtube.com') || lowercaseUrl.includes('youtu.be')) {
        return { sourceType: 'Social Media', source: 'YouTube' };
    }
    if (lowercaseUrl.includes('linkedin.com')) {
        return { sourceType: 'Social Media', source: 'LinkedIn' };
    }
    if (lowercaseUrl.includes('pinterest.com') || lowercaseUrl.includes('pintrest.com') || lowercaseUrl.includes('pin.it')) {
        return { sourceType: 'Social Media', source: 'Pinterest' };
    }
    if (lowercaseUrl.includes('snapchat.com') || lowercaseUrl.includes('snap.com')) {
        return { sourceType: 'Social Media', source: 'Snapchat' };
    }
    if (lowercaseUrl.includes('reddit.com') || lowercaseUrl.includes('redd.it')) {
        return { sourceType: 'Social Media', source: 'Reddit' };
    }
    if (lowercaseUrl.includes('threads.net')) {
        return { sourceType: 'Social Media', source: 'Threads' };
    }
    if (lowercaseUrl.includes('telegram.org') || lowercaseUrl.includes('t.me')) {
        return { sourceType: 'Social Media', source: 'Telegram' };
    }
    if (lowercaseUrl.includes('whatsapp.com') || lowercaseUrl.includes('wa.me')) {
        return { sourceType: 'Social Media', source: 'WhatsApp' };
    }
    if (lowercaseUrl.includes('twitch.tv')) {
        return { sourceType: 'Social Media', source: 'Twitch' };
    }
    if (lowercaseUrl.includes('radiant') || lowercaseUrl.includes('radiant.social')) {
        return { sourceType: 'Social Media', source: 'Radiant' };
    }
    return null;
};

export default function ManualEntryModal({ isOpen, onClose, articleToEdit }: ManualEntryModalProps) {
    const t = useTranslations('ManualEntry');

    const saveArticle = useMutation(api.monitoring.saveArticle);
    const updateArticle = useMutation(api.monitoring.updateArticle);
    const extractArticle = useAction(api.monitoringAction.extractArticle);
    const settings = useQuery(api.settings.getSettings);
    const { isAuthenticated } = useConvexAuth();

    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const isSubmitting = isLoading;

    useEffect(() => {
        setMounted(true);
    }, []);

    // Keyboard: close on Escape
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isLoading) onClose();
    }, [onClose, isLoading]);

    useEffect(() => {
        if (!isOpen) return;
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleKeyDown]);

    const [formData, setFormData] = useState({
        title: '',
        sourceType: 'Print',
        source: '',
        date: new Date().toISOString().split('T')[0],
        url: '',
        sentiment: 'Neutral',
        reach: 0,
        content: '',
        imageUrl: '',
        sourceCountry: 'AE',
        likes: 0,
        retweets: 0,
        replies: 0,
        publisherUsername: '',
    });

    useEffect(() => {
        if (articleToEdit) {
            let dateVal = new Date().toISOString().split('T')[0];
            if (articleToEdit.publishedDate) {
                const parts = articleToEdit.publishedDate.split('/');
                if (parts.length === 3) {
                    const day = parts[0].padStart(2, '0');
                    const month = parts[1].padStart(2, '0');
                    const year = parts[2];
                    dateVal = `${year}-${month}-${day}`;
                }
            }

            setFormData({
                title: articleToEdit.title || '',
                sourceType: articleToEdit.sourceType || 'Print',
                source: articleToEdit.source || '',
                date: dateVal,
                url: articleToEdit.url === 'http://manual-entry.local' ? '' : (articleToEdit.url || ''),
                sentiment: articleToEdit.sentiment || 'Neutral',
                reach: articleToEdit.reach || 0,
                content: articleToEdit.content || '',
                imageUrl: articleToEdit.imageUrl || '',
                sourceCountry: articleToEdit.sourceCountry || 'AE',
                likes: articleToEdit.likes || 0,
                retweets: articleToEdit.retweets || 0,
                replies: articleToEdit.replies || 0,
                publisherUsername: articleToEdit.publisherUsername || '',
            });
        } else {
            setFormData({
                title: '',
                sourceType: 'Print',
                source: '',
                date: new Date().toISOString().split('T')[0],
                url: '',
                sentiment: 'Neutral',
                reach: 0,
                content: '',
                imageUrl: '',
                sourceCountry: 'AE',
                likes: 0,
                retweets: 0,
                replies: 0,
                publisherUsername: '',
            });
        }
    }, [articleToEdit, isOpen]);

    if (!mounted || !isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) { alert(t('not_authenticated')); return; }
        setIsLoading(true);

        try {
            const sanitizedUrl = sanitizeUrl(formData.url);

            // Format date to DD/MM/YYYY
            const [year, month, day] = formData.date.split('-');
            const formattedDate = `${day}/${month}/${year}`;

            const aveMultiplier = settings?.defaults?.aveMultiplier ?? 0.005;
            const reachValue = (formData.reach === null || formData.reach === undefined || Number.isNaN(formData.reach))
                ? 50000
                : formData.reach;
            const ave = Math.round(reachValue * aveMultiplier * 5);

            // Detect language
            const isArabic = /[\u0600-\u06FF]/.test(formData.title + formData.content);

            if (articleToEdit) {
                await updateArticle({
                    id: articleToEdit._id,
                    url: sanitizedUrl || 'http://manual-entry.local',
                    resolvedUrl: sanitizedUrl || 'http://manual-entry.local',
                    publishedDate: formattedDate,
                    title: formData.title,
                    content: formData.content,
                    sentiment: formData.sentiment as 'Positive' | 'Neutral' | 'Negative',
                    sourceType: formData.sourceType as "Online News" | "Social Media" | "Blog" | "Print" | "Press Release",
                    sourceCountry: formData.sourceCountry,
                    source: formData.source || 'Manual Source',
                    reach: reachValue,
                    ave: ave,
                    imageUrl: formData.imageUrl || undefined,
                    likes: formData.likes || 0,
                    retweets: formData.retweets || 0,
                    replies: formData.replies || 0,
                    publisherUsername: formData.sourceType === 'Social Media' ? (formData.publisherUsername || undefined) : undefined,
                });
            } else {
                await saveArticle({
                    keyword: 'Manual',
                    url: sanitizedUrl || 'http://manual-entry.local',
                    resolvedUrl: sanitizedUrl || 'http://manual-entry.local',
                    publishedDate: formattedDate,
                    title: formData.title,
                    content: formData.content,
                    language: isArabic ? 'AR' : 'EN',
                    sentiment: formData.sentiment as 'Positive' | 'Neutral' | 'Negative',
                    sourceType: formData.sourceType as "Online News" | "Social Media" | "Blog" | "Print" | "Press Release",
                    sourceCountry: formData.sourceCountry,
                    source: formData.source || 'Manual Source',
                    reach: reachValue,
                    ave: ave,
                    imageUrl: formData.imageUrl || undefined,
                    likes: formData.likes || 0,
                    retweets: formData.retweets || 0,
                    replies: formData.replies || 0,
                    isManual: true,
                    publisherUsername: formData.sourceType === 'Social Media' ? (formData.publisherUsername || undefined) : undefined,
                });
            }

            // Reset form
            setFormData({
                title: '',
                sourceType: 'Print',
                source: '',
                date: new Date().toISOString().split('T')[0],
                url: '',
                sentiment: 'Neutral',
                reach: 0,
                content: '',
                imageUrl: '',
                sourceCountry: 'AE',
                likes: 0,
                retweets: 0,
                replies: 0,
                publisherUsername: '',
            });

            onClose();
        } catch (error: any) {
            const dataMsg = typeof error.data === 'string' ? error.data : '';
            const errorMessage = error instanceof Error ? error.message : String(error);

            console.error("Mutation failed:", error);

            if (errorMessage.includes("DuplicateArticle") || dataMsg.includes("DuplicateArticle")) {
                alert(t('duplicate_article_error'));
            } else if (errorMessage.includes("Type mismatch") || errorMessage.includes("Validator") || errorMessage.includes("Invalid")) {
                alert(`Data Validation Error: Please check your inputs. Details: ${errorMessage}`);
            } else {
                alert(`${t('save_failed')} (${errorMessage})`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleUrlBlur = () => {
        const sanitized = sanitizeUrl(formData.url);
        if (sanitized !== formData.url) {
            setFormData(prev => ({ ...prev, url: sanitized }));
        }

        if (sanitized) {
            const detected = detectSocialMedia(sanitized);
            if (detected) {
                setFormData(prev => ({
                    ...prev,
                    url: sanitized,
                    sourceType: detected.sourceType,
                    source: prev.source || detected.source
                }));
            }
        }
    };

    const handleExtract = async () => {
        const sanitized = sanitizeUrl(formData.url);
        if (!sanitized || !isAuthenticated) return;

        // Auto-sanitize URL in form
        setFormData(prev => ({ ...prev, url: sanitized }));

        // Intercept social media
        const detected = detectSocialMedia(sanitized);
        if (detected) {
            setFormData(prev => ({
                ...prev,
                url: sanitized,
                sourceType: detected.sourceType,
                source: prev.source || detected.source
            }));
            alert(t('social_extract_warning'));
            return;
        }

        setIsExtracting(true);

        try {
            const result = await extractArticle({ url: sanitized, analyze: true });
            if (result.success && result.data) {
                const data = result.data;
                const d = data.publish_date ? new Date(data.publish_date) : new Date();

                let parsedSentiment = formData.sentiment;
                if (typeof data.sentiment === "number") {
                    parsedSentiment = data.sentiment > 0.1 ? "Positive" : (data.sentiment < -0.1 ? "Negative" : "Neutral");
                } else if (typeof data.sentiment === "string") {
                    const s = data.sentiment.toLowerCase();
                    if (s.includes("positive")) parsedSentiment = "Positive";
                    else if (s.includes("negative")) parsedSentiment = "Negative";
                    else if (s.includes("neutral")) parsedSentiment = "Neutral";
                }

                setFormData(prev => ({
                    ...prev,
                    title: data.title || prev.title,
                    content: data.text || prev.content,
                    date: !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : prev.date,
                    imageUrl: data.image || prev.imageUrl,
                    sentiment: parsedSentiment,
                }));
            } else {
                alert(t('extract_failed'));
            }
        } catch (error) {
            console.error("Extraction error:", error);
            alert(t('extract_failed'));
        } finally {
            setIsExtracting(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new window.Image();
                img.onload = () => {
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");

                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
                        setFormData(prev => ({ ...prev, imageUrl: compressedBase64 }));
                    } else {
                        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
                    }
                };
                img.src = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        /* Overlay â€” no ARIA role, purely visual */
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            {/* Dialog panel â€” role/aria-modal/aria-labelledby belong here (WAI-ARIA APG) */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="manual-entry-title"
                className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border flex flex-col"
            >
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/50 transition-colors">
                    <h2 id="manual-entry-title" className="text-xl font-bold text-foreground flex items-center gap-2 transition-colors">
                        <Plus className="w-5 h-5 text-primary" aria-hidden="true" />
                        {articleToEdit ? t('edit_title') : t('title')}
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-foreground/80 hover:text-foreground transition-colors"
                        aria-label={t('cancel')}
                    >
                        <X className="h-6 w-6" aria-hidden="true" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="article_title" className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2 transition-colors">{t('article_title')}</label>
                            <input
                                id="article_title"
                                name="article_title"
                                required
                                type="text"
                                disabled={isSubmitting}
                                placeholder={t('title_placeholder')}
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                autoComplete="on"
                                className="w-full p-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label htmlFor="source_name" className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2 transition-colors">{t('source_name')}</label>
                            <input
                                id="source_name"
                                name="source_name"
                                required
                                type="text"
                                disabled={isSubmitting}
                                placeholder={t('source_placeholder')}
                                value={formData.source}
                                onChange={e => setFormData({ ...formData, source: e.target.value })}
                                autoComplete="organization"
                                className="w-full p-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {formData.sourceType === 'Social Media' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label htmlFor="publisher_username" className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2 transition-colors">
                                {t('publisher_username')}
                            </label>
                            <input
                                id="publisher_username"
                                name="publisher_username"
                                type="text"
                                disabled={isSubmitting}
                                placeholder={t('publisher_username_placeholder')}
                                value={formData.publisherUsername}
                                onChange={e => setFormData({ ...formData, publisherUsername: e.target.value })}
                                className="w-full p-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="pub_date" className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2 transition-colors">{t('date')}</label>
                            <input
                                id="pub_date"
                                name="pub_date"
                                required
                                type="date"
                                disabled={isSubmitting}
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full p-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground [color-scheme:light] dark:[color-scheme:dark] disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label htmlFor="article_url" className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2 transition-colors">{t('url_optional')}</label>
                            <div className="flex gap-2">
                                <input
                                    id="article_url"
                                    name="article_url"
                                    type="text"
                                    disabled={isSubmitting}
                                    placeholder="https://..."
                                    value={formData.url}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                    onBlur={handleUrlBlur}
                                    autoComplete="url"
                                    className="flex-1 p-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleExtract}
                                    isLoading={isExtracting}
                                    disabled={!formData.url || isSubmitting || isExtracting}
                                    className="px-4 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm font-bold shrink-0 h-auto shadow-none"
                                    title={t('fetch_article')}
                                    aria-label={t('fetch_article')}
                                >
                                    {!isExtracting && <Wand2 className="w-4 h-4" aria-hidden="true" />}
                                    <span className="hidden sm:inline">
                                        {isExtracting ? t('extracting') : t('fetch_article')}
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label htmlFor="source_type" className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2 transition-colors">{t('type')}</label>
                            <select
                                id="source_type"
                                name="source_type"
                                aria-label={t('type')}
                                disabled={isSubmitting}
                                value={formData.sourceType}
                                onChange={e => setFormData({ ...formData, sourceType: e.target.value })}
                                className="w-full p-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="Print">{t('types.print')}</option>
                                <option value="Online News">{t('types.online_news')}</option>
                                <option value="Social Media">{t('types.social_media')}</option>
                                <option value="Blog">{t('types.blog')}</option>
                                <option value="Press Release">{t('types.press_release')}</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="sentiment" className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2 transition-colors">{t('sentiment')}</label>
                            <select
                                id="sentiment"
                                name="sentiment"
                                aria-label={t('sentiment')}
                                disabled={isSubmitting}
                                value={formData.sentiment}
                                onChange={e => setFormData({ ...formData, sentiment: e.target.value })}
                                className="w-full p-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="Positive">{t('sentiments.positive')}</option>
                                <option value="Neutral">{t('sentiments.neutral')}</option>
                                <option value="Negative">{t('sentiments.negative')}</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="reach" className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2 transition-colors">{t('reach')}</label>
                            <input
                                id="reach"
                                name="reach"
                                type="number"
                                disabled={isSubmitting}
                                placeholder={t('reach_placeholder')}
                                value={formData.reach}
                                onChange={e => {
                                    const raw = e.target.value;
                                    if (raw === '') {
                                        setFormData({ ...formData, reach: NaN as any });
                                    } else {
                                        setFormData({ ...formData, reach: Number(raw) });
                                    }
                                }}
                                autoComplete="on"
                                className="w-full p-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label htmlFor="source_country" className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2 transition-colors">{t('country')}</label>
                            <input
                                id="source_country"
                                name="source_country"
                                type="text"
                                disabled={isSubmitting}
                                placeholder="AE"
                                maxLength={2}
                                value={formData.sourceCountry}
                                onChange={e => setFormData({ ...formData, sourceCountry: e.target.value.toUpperCase() })}
                                autoComplete="country"
                                className="w-full p-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="likes" className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2 transition-colors">{t('likes')}</label>
                            <input
                                id="likes"
                                name="likes"
                                type="number"
                                disabled={isSubmitting}
                                placeholder="0"
                                value={formData.likes}
                                onChange={e => setFormData({ ...formData, likes: Number(e.target.value) })}
                                className="w-full p-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label htmlFor="retweets" className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2 transition-colors">{t('retweets')}</label>
                            <input
                                id="retweets"
                                name="retweets"
                                type="number"
                                disabled={isSubmitting}
                                placeholder="0"
                                value={formData.retweets}
                                onChange={e => setFormData({ ...formData, retweets: Number(e.target.value) })}
                                className="w-full p-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label htmlFor="replies" className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2 transition-colors">{t('replies')}</label>
                            <input
                                id="replies"
                                name="replies"
                                type="number"
                                disabled={isSubmitting}
                                placeholder="0"
                                value={formData.replies}
                                onChange={e => setFormData({ ...formData, replies: Number(e.target.value) })}
                                className="w-full p-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="content" className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2 transition-colors">{t('content')}</label>
                        <textarea
                            id="content"
                            name="content"
                            required
                            rows={3}
                            disabled={isSubmitting}
                            placeholder={t('content_placeholder')}
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            autoComplete="on"
                            className="w-full p-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label htmlFor="evidence_image" className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2 transition-colors">{t('evidence_image')}</label>
                        <div className="flex items-center gap-4 p-4 border-2 border-dashed border-border rounded-xl bg-muted/50 transition-colors">
                            <input
                                id="evidence_image"
                                name="evidence_image"
                                type="file"
                                accept="image/*"
                                disabled={isSubmitting}
                                onChange={handleImageUpload}
                                className="block w-full text-sm text-foreground/60 transition-colors
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-xs file:font-bold file:uppercase file:tracking-wider
                    file:bg-primary/10 file:text-primary
                    hover:file:bg-primary/20 dark:file:bg-primary/10 dark:file:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            {formData.imageUrl && (
                                <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-border shadow-sm">
                                    <OptimizedImage src={formData.imageUrl} alt="" fill unoptimized className="object-cover" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border transition-colors">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-6 py-3 rounded-xl text-foreground/80 hover:text-foreground font-medium transition-colors h-auto shadow-none"
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] h-auto"
                        >
                            {t('save')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
