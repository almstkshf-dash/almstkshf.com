'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { X, Loader2, Plus } from 'lucide-react';

interface ManualEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ManualEntryModal({ isOpen, onClose }: ManualEntryModalProps) {
    const t = useTranslations('ManualEntry');

    const saveArticle = useMutation(api.monitoring.saveArticle);
    const [isLoading, setIsLoading] = useState(false);

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
        setIsLoading(true);

        try {
            // Format date to DD/MM/YYYY
            const [year, month, day] = formData.date.split('-');
            const formattedDate = `${day}/${month}/${year}`;

            // Calculate AVE: Reach × 0.02 × $5
            const reach = formData.reach || 50000;
            const ave = Math.round(reach * 0.02 * 5);

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
                reach: reach,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 flex flex-col">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Plus className="w-5 h-5 text-blue-600" />
                        {t('title')}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="article_title" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('article_title')}</label>
                            <input
                                id="article_title"
                                name="article_title"
                                required
                                type="text"
                                placeholder={t('title_placeholder')}
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="source_name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('source_name')}</label>
                            <input
                                id="source_name"
                                name="source_name"
                                required
                                type="text"
                                placeholder={t('source_placeholder')}
                                value={formData.source}
                                onChange={e => setFormData({ ...formData, source: e.target.value })}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="pub_date" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('date')}</label>
                            <input
                                id="pub_date"
                                name="pub_date"
                                required
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="article_url" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('url_optional')}</label>
                            <input
                                id="article_url"
                                name="article_url"
                                type="url"
                                placeholder="https://..."
                                value={formData.url}
                                onChange={e => setFormData({ ...formData, url: e.target.value })}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label htmlFor="source_type" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('type')}</label>
                            <select
                                id="source_type"
                                name="source_type"
                                value={formData.sourceType}
                                onChange={e => setFormData({ ...formData, sourceType: e.target.value })}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all dark:text-white text-sm"
                            >
                                <option value="Print">{t('types.print')}</option>
                                <option value="Online News">{t('types.online_news')}</option>
                                <option value="Social Media">{t('types.social_media')}</option>
                                <option value="Blog">{t('types.blog')}</option>
                                <option value="Press Release">{t('types.press_release')}</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="sentiment" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('sentiment')}</label>
                            <select
                                id="sentiment"
                                name="sentiment"
                                value={formData.sentiment}
                                onChange={e => setFormData({ ...formData, sentiment: e.target.value })}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all dark:text-white text-sm"
                            >
                                <option value="Positive">{t('sentiments.positive')}</option>
                                <option value="Neutral">{t('sentiments.neutral')}</option>
                                <option value="Negative">{t('sentiments.negative')}</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="reach" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('reach')}</label>
                            <input
                                id="reach"
                                name="reach"
                                type="number"
                                placeholder={t('reach_placeholder')}
                                value={formData.reach}
                                onChange={e => setFormData({ ...formData, reach: Number(e.target.value) })}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="source_country" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('country')}</label>
                            <input
                                id="source_country"
                                name="source_country"
                                type="text"
                                placeholder="AE"
                                maxLength={2}
                                value={formData.sourceCountry}
                                onChange={e => setFormData({ ...formData, sourceCountry: e.target.value.toUpperCase() })}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="content" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('content')}</label>
                        <textarea
                            id="content"
                            name="content"
                            required
                            rows={3}
                            placeholder={t('content_placeholder')}
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                        />
                    </div>

                    <div>
                        <label htmlFor="evidence_image" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('evidence_image')}</label>
                        <div className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <input
                                id="evidence_image"
                                name="evidence_image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-xs file:font-bold file:uppercase file:tracking-wider
                    file:bg-blue-100 file:text-blue-700
                    hover:file:bg-blue-200 dark:file:bg-blue-900/30 dark:file:text-blue-200"
                            />
                            {formData.imageUrl && (
                                <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                    <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
                        >
                            {isLoading && <Loader2 className="animate-spin h-4 w-4" />}
                            {t('save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
