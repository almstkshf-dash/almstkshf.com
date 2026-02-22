'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation, useAction, useQuery, useConvexAuth } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { X, Loader2, Plus, Wand2 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ManualEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ManualEntryModal({ isOpen, onClose }: ManualEntryModalProps) {
    const t = useTranslations('ManualEntry');

    const saveArticle = useMutation(api.monitoring.saveArticle);
    const extractArticle = useAction(api.monitoringAction.extractArticle);
    const settings = useQuery(api.settings.getSettings);
    const { isAuthenticated } = useConvexAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);

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
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) { alert(t('not_authenticated')); return; }
        setIsLoading(true);

        try {
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

            await saveArticle({
                keyword: 'Manual',
                url: formData.url || 'http://manual-entry.local',
                resolvedUrl: formData.url || 'http://manual-entry.local',
                publishedDate: formattedDate,
                title: formData.title,
                content: formData.content,
                language: isArabic ? 'AR' : 'EN',
                sentiment: formData.sentiment as 'Positive' | 'Neutral' | 'Negative',
                sourceType: formData.sourceType,
                sourceCountry: formData.sourceCountry,
                source: formData.source || 'Manual Source',
                reach: reachValue,
                ave: ave,
                imageUrl: formData.imageUrl || undefined,
                isManual: true,
            });

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
            });

            onClose();
        } catch (error) {
            console.error("Failed to save:", error);
            alert(t('save_failed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleExtract = async () => {
        if (!formData.url || !isAuthenticated) return;
        setIsExtracting(true);

        try {
            const result = await extractArticle({ url: formData.url, analyze: true });
            if (result.success && result.data) {
                const data = result.data;
                const d = data.publish_date ? new Date(data.publish_date) : new Date();

                setFormData(prev => ({
                    ...prev,
                    title: data.title || prev.title,
                    content: data.text || prev.content,
                    date: d.toISOString().split('T')[0],
                    imageUrl: data.image || prev.imageUrl,
                    sentiment: data.sentiment || prev.sentiment,
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
                setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border flex flex-col transition-all">
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/50 transition-colors">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2 transition-colors">
                        <Plus className="w-5 h-5 text-primary" aria-hidden="true" />
                        {t('title')}
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={t('cancel')}
                    >
                        <X className="h-6 w-6" aria-hidden="true" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="article_title" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 transition-colors">{t('article_title')}</label>
                            <input
                                id="article_title"
                                name="article_title"
                                required
                                type="text"
                                placeholder={t('title_placeholder')}
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                autoComplete="on"
                                className="w-full p-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground"
                            />
                        </div>
                        <div>
                            <label htmlFor="source_name" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 transition-colors">{t('source_name')}</label>
                            <input
                                id="source_name"
                                name="source_name"
                                required
                                type="text"
                                placeholder={t('source_placeholder')}
                                value={formData.source}
                                onChange={e => setFormData({ ...formData, source: e.target.value })}
                                autoComplete="organization"
                                className="w-full p-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="pub_date" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 transition-colors">{t('date')}</label>
                            <input
                                id="pub_date"
                                name="pub_date"
                                required
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full p-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground [color-scheme:light] dark:[color-scheme:dark]"
                            />
                        </div>
                        <div>
                            <label htmlFor="article_url" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 transition-colors">{t('url_optional')}</label>
                            <div className="flex gap-2">
                                <input
                                    id="article_url"
                                    name="article_url"
                                    type="url"
                                    placeholder="https://..."
                                    value={formData.url}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                    autoComplete="url"
                                    className="flex-1 p-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground"
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleExtract}
                                    isLoading={isExtracting}
                                    disabled={!formData.url}
                                    className="px-4 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm font-bold shrink-0 h-auto shadow-none"
                                    title={t('fetch_article')}
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
                            <label htmlFor="source_type" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 transition-colors">{t('type')}</label>
                            <select
                                id="source_type"
                                name="source_type"
                                value={formData.sourceType}
                                onChange={e => setFormData({ ...formData, sourceType: e.target.value })}
                                className="w-full p-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground text-sm"
                            >
                                <option value="Print">{t('types.print')}</option>
                                <option value="Online News">{t('types.online_news')}</option>
                                <option value="Social Media">{t('types.social_media')}</option>
                                <option value="Blog">{t('types.blog')}</option>
                                <option value="Press Release">{t('types.press_release')}</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="sentiment" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 transition-colors">{t('sentiment')}</label>
                            <select
                                id="sentiment"
                                name="sentiment"
                                value={formData.sentiment}
                                onChange={e => setFormData({ ...formData, sentiment: e.target.value })}
                                className="w-full p-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground text-sm"
                            >
                                <option value="Positive">{t('sentiments.positive')}</option>
                                <option value="Neutral">{t('sentiments.neutral')}</option>
                                <option value="Negative">{t('sentiments.negative')}</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="reach" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 transition-colors">{t('reach')}</label>
                            <input
                                id="reach"
                                name="reach"
                                type="number"
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
                                className="w-full p-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground"
                            />
                        </div>
                        <div>
                            <label htmlFor="source_country" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 transition-colors">{t('country')}</label>
                            <input
                                id="source_country"
                                name="source_country"
                                type="text"
                                placeholder="AE"
                                maxLength={2}
                                value={formData.sourceCountry}
                                onChange={e => setFormData({ ...formData, sourceCountry: e.target.value.toUpperCase() })}
                                autoComplete="country"
                                className="w-full p-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="content" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 transition-colors">{t('content')}</label>
                        <textarea
                            id="content"
                            name="content"
                            required
                            rows={3}
                            placeholder={t('content_placeholder')}
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            autoComplete="on"
                            className="w-full p-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground"
                        />
                    </div>

                    <div>
                        <label htmlFor="evidence_image" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 transition-colors">{t('evidence_image')}</label>
                        <div className="flex items-center gap-4 p-4 border-2 border-dashed border-border rounded-xl bg-muted/50 transition-colors">
                            <input
                                id="evidence_image"
                                name="evidence_image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="block w-full text-sm text-muted-foreground transition-colors
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-xs file:font-bold file:uppercase file:tracking-wider
                    file:bg-primary/10 file:text-primary
                    hover:file:bg-primary/20 dark:file:bg-primary/10 dark:file:text-primary-foreground"
                            />
                            {formData.imageUrl && (
                                <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-border shadow-sm">
                                    <img src={formData.imageUrl} alt="" className="h-full w-full object-cover" aria-hidden="true" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border transition-colors">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl text-muted-foreground hover:text-foreground font-medium transition-colors h-auto shadow-none"
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] h-auto"
                        >
                            {t('save')}
                        </Button>
                    </div>
                </form>
            </div >
        </div >
    );
}
