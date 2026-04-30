/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Save, Upload, Loader2, CreditCard, Settings, Key, Share2, MessageSquare, Shield, Zap, Globe } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import clsx from 'clsx';
import Button from '@/components/ui/Button';
import { Link } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/routing';
import { ALL_COUNTRIES } from '@/lib/countries';
import { MultiSelectDropdown } from '@/components/ui/MultiSelectDropdown';



export default function SettingsPage() {
    const t = useTranslations('Settings');
    const { userId } = useAuth();
    const settings = useQuery(api.settings.getSettings);
    const updateSettings = useMutation(api.settings.updateSettings);


    const [isLoading, setIsLoading] = useState(false);
    const [logoUrl, setLogoUrl] = useState('');
    const [geminiKey, setGeminiKey] = useState('');
    const [instagramKey, setInstagramKey] = useState('');
    const [twitterKey, setTwitterKey] = useState('');
    const [twitterBearer, setTwitterBearer] = useState('');
    const [twitterConsumerKey, setTwitterConsumerKey] = useState('');
    const [twitterConsumerSecret, setTwitterConsumerSecret] = useState('');
    const [newsdataKey, setNewsdataKey] = useState('');
    const [newsapiKey, setNewsapiKey] = useState('');
    const [gnewsKey, setGnewsKey] = useState('');
    const [worldnewsKey, setWorldnewsKey] = useState('');
    const [chatbaseId, setChatbaseId] = useState('');
    const [chatbaseHost, setChatbaseHost] = useState('');
    const [stripePublishableKey, setStripePublishableKey] = useState('');
    const [stripeSecretKey, setStripeSecretKey] = useState('');
    const [stripeWebhookSecret, setStripeWebhookSecret] = useState('');
    const [diffbotKey, setDiffbotKey] = useState('');
    const [zenrowsKey, setZenrowsKey] = useState('');
    const locale = useLocale();
    const isAr = locale === 'ar';
    const [targetCountries, setTargetCountries] = useState<string[]>(['AE', 'SA']);
    const countryItems = ALL_COUNTRIES.map((c) => ({
        id: c.code,
        label: isAr ? c.ar : c.en,
        searchStr: `${c.en} ${c.ar} ${c.code}`,
    }));

    const [aveMultiplier, setAveMultiplier] = useState(0.005);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'social' | 'integrations'>(
        (searchParams.get('tab') as 'general' | 'ai' | 'social' | 'integrations') || 'general'
    );
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Sync state with URL search parameters
    useEffect(() => {
        const tab = searchParams.get('tab') as 'general' | 'ai' | 'social' | 'integrations' | null;
        if (tab && ['general', 'ai', 'social', 'integrations'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (newTab: 'general' | 'ai' | 'social' | 'integrations') => {
        setActiveTab(newTab);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', newTab);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (settings) {
            const apiKeys = (settings as Record<string, unknown>).apiKeys as Record<string, string> | undefined;
            setLogoUrl(settings.logoUrl || '');
            setGeminiKey(apiKeys?.gemini || '');
            setInstagramKey(apiKeys?.instagram || '');
            setTwitterKey(apiKeys?.twitter || '');
            setTwitterBearer(apiKeys?.twitterBearer || '');
            setTwitterConsumerKey(apiKeys?.twitterConsumerKey || '');
            setTwitterConsumerSecret(apiKeys?.twitterConsumerSecret || '');
            setNewsdataKey(apiKeys?.newsdata || '');
            setNewsapiKey(apiKeys?.newsapi || '');
            setGnewsKey(apiKeys?.gnews || '');
            setWorldnewsKey(apiKeys?.worldnews || '');
            setChatbaseId(apiKeys?.chatbaseId || '');
            setChatbaseHost(apiKeys?.chatbaseHost || '');
            setStripePublishableKey(apiKeys?.stripePublishableKey || '');
            setStripeSecretKey(apiKeys?.stripeSecretKey || '');
            setStripeWebhookSecret(apiKeys?.stripeWebhookSecret || '');
            setDiffbotKey(apiKeys?.diffbot || '');
            setZenrowsKey(apiKeys?.zenrows || '');
            setTargetCountries(settings.defaults?.targetCountries || ['AE', 'SA']);
            setAveMultiplier(settings.defaults?.aveMultiplier || 0.005);
        }
    }, [settings]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        
        if (!targetCountries || targetCountries.length === 0) {
            newErrors.targetCountries = t('error_required');
        }

        if (isNaN(Number(aveMultiplier)) || Number(aveMultiplier) <= 0) {
            newErrors.aveMultiplier = t('error_required');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 700 * 1024) {
                setErrors({
                    logo: `Logo file is too large (${Math.round(file.size / 1024)}KB). Please use an image under 700KB.`
                });
                return;
            }
            setErrors(prev => {
                const n = { ...prev };
                delete n.logo;
                return n;
            });
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!validate()) {
            setMessage({ type: 'error', text: t('save_failed') });
            return;
        }

        setIsLoading(true);
        setMessage(null);
        try {
            await updateSettings({
                logoUrl,
                apiKeys: {
                    gemini: geminiKey,
                    instagram: instagramKey,
                    twitter: twitterKey,
                    twitterBearer: twitterBearer,
                    twitterConsumerKey: twitterConsumerKey,
                    twitterConsumerSecret: twitterConsumerSecret,
                    newsdata: newsdataKey,
                    newsapi: newsapiKey,
                    gnews: gnewsKey,
                    worldnews: worldnewsKey,
                    chatbaseId: chatbaseId,
                    chatbaseHost: chatbaseHost,
                    stripePublishableKey: stripePublishableKey,
                    stripeSecretKey: stripeSecretKey,
                    stripeWebhookSecret: stripeWebhookSecret,
                    diffbot: diffbotKey,
                    zenrows: zenrowsKey,
                },
                defaults: {
                    targetCountries: targetCountries,
                    aveMultiplier: Number(aveMultiplier),
                },
            });
            setMessage({ type: 'success', text: t('saved_success') });
        } catch (error: unknown) {
            console.error('Failed to save settings:', error);
            const msg = error instanceof Error ? error.message : '';
            const isAuthError = msg.toLowerCase().includes('not authorized') || msg.toLowerCase().includes('admin');
            setMessage({
                type: 'error',
                text: isAuthError
                    ? 'Admin access required. Only administrators can update global settings.'
                    : t('save_failed')
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (settings === undefined) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    <p className="text-sm font-medium text-slate-500 animate-pulse">{t('loading')}</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'general', label: t('general'), icon: Settings },
        { id: 'ai', label: t('ai_data'), icon: Key },
        { id: 'social', label: t('social'), icon: Share2 },
        { id: 'integrations', label: t('integrations'), icon: Shield },
    ];

    const getCountryByCode = (code: string) => ALL_COUNTRIES.find((c) => c.code === code);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('subtitle')}
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    isLoading={isLoading}
                    variant="primary"
                    className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-200 dark:hover:shadow-none h-auto"
                    leftIcon={!isLoading && <Save className="h-5 w-5" />}
                >
                    {t('save')}
                </Button>
            </div>

            {message?.type === 'success' && (
                <div className={clsx(
                    "p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300",
                    "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/10 dark:border-emerald-900/30 dark:text-emerald-400"
                )}>
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    {message.text}
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Sidebar Navigation */}
                <nav className="lg:w-64 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-none">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.id}
                            variant={activeTab === tab.id ? "primary" : "ghost"}
                            onClick={() => handleTabChange(tab.id as 'general' | 'ai' | 'social' | 'integrations')}
                            className={clsx(
                                "flex items-center justify-start gap-3 px-4 py-3.5 rounded-xl font-medium transition-all whitespace-nowrap shadow-none",
                                activeTab === tab.id
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/10 dark:shadow-none"
                                    : "text-muted-foreground hover:bg-muted"
                            )}
                            leftIcon={<tab.icon className="h-5 w-5" />}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </nav>

                {/* Main Content Area */}
                <div className="flex-1 space-y-8 animate-in fade-in duration-500">
                    {activeTab === 'general' && (
                        <div className="space-y-8">
                            <section className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Upload className="h-5 w-5 text-blue-500" />
                                    {t('logo_upload')}
                                </h2>
                                <div className="flex flex-col sm:flex-row items-center gap-8">
                                    <div className={clsx(
                                        "relative w-40 h-40 border-2 border-dashed rounded-3xl flex items-center justify-center bg-muted/30 overflow-hidden group transition-colors",
                                        errors.logo ? "border-rose-500 shadow-[0_0_0_1px_rgba(244,63,94,0.1)]" : "border-border"
                                    )}>
                                        {logoUrl ? (
                                            <Image src={logoUrl} alt={t('logo_alt')} fill className="object-contain p-4 transition-transform group-hover:scale-105" />
                                        ) : (
                                            <Upload className="h-10 w-10 text-muted-foreground/30" />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Upload className="text-white w-6 h-6" />
                                        </div>
                                        <label htmlFor="logo-upload" className="sr-only">{t('logo_upload')}</label>
                                        <input
                                            id="logo-upload"
                                            name="logo-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <p className="font-medium text-foreground">{t('logo_desc')}</p>
                                        <p className="text-sm text-muted-foreground">{t('logo_size_hint')}</p>
                                        {errors.logo && <p className="text-xs font-bold text-rose-500 animate-in fade-in slide-in-from-left-2">{errors.logo}</p>}
                                    </div>
                                </div>
                            </section>

                            <section className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-blue-500" />
                                    {t('defaults')}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <span id="target-countries-label" className="block text-sm font-bold text-foreground/80">{t('target_countries')}</span>
                                        <MultiSelectDropdown
                                            id="target-countries-select"
                                            aria-labelledby="target-countries-label"
                                            items={countryItems}
                                            selected={targetCountries}
                                            onChange={(v) => setTargetCountries(v)}
                                            placeholder={t('placeholder_countries')}
                                            searchPlaceholder={t('search_countries') || 'Search countries...'}
                                            selectedText={t('selected') || 'selected'}
                                            clearAllText={t('clear_all') || 'Clear all'}
                                            icon={<Globe className="w-4 h-4" />}
                                            error={errors.targetCountries}
                                            renderItem={(item) => (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{getCountryByCode(item.id)?.flag}</span>
                                                    <span>{item.label}</span>
                                                </div>
                                            )}
                                            renderTag={(id) => (
                                                <div className="flex items-center gap-1.5">
                                                    <span>{getCountryByCode(id)?.flag}</span>
                                                    <span>{id}</span>
                                                </div>
                                            )}
                                        />
                                        <div className="min-h-[1.25rem]">
                                        {!errors.targetCountries && (
                                            <p className="text-xs text-muted-foreground">{t('iso_hint')}</p>
                                        )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="ave-multiplier" className="text-sm font-bold text-foreground/80">{t('ave_multiplier')}</label>
                                        <input
                                            id="ave-multiplier"
                                            name="ave-multiplier"
                                            type="number"
                                            step="0.001"
                                            value={aveMultiplier}
                                            onChange={(e) => setAveMultiplier(parseFloat(e.target.value))}
                                            className={clsx(
                                                "w-full px-4 py-3 rounded-xl border bg-muted/20 focus:ring-2 outline-none text-foreground transition-all",
                                                errors.aveMultiplier ? "border-rose-500 focus:ring-rose-200" : "border-border focus:ring-primary"
                                            )}
                                        />
                                        <div className="min-h-[1.25rem]">
                                        {errors.aveMultiplier ? (
                                            <p className="text-xs font-bold text-rose-500 animate-in fade-in slide-in-from-top-1">{errors.aveMultiplier}</p>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">{t('default_value')}: 0.005</p>
                                        )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-border flex justify-end">
                                    <Button
                                        onClick={handleSave}
                                        isLoading={isLoading}
                                        variant="primary"
                                        className="gap-2"
                                        leftIcon={<Save className="h-4 w-4" />}
                                    >
                                        {t('save')}
                                    </Button>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'ai' && (
                        <div className="space-y-8">
                            <section className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-amber-500" />
                                    {t('section_ai')}
                                </h2>

                                <div className="mb-8 p-6 bg-primary/5 rounded-2xl border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4 text-center md:text-left">
                                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-primary/5">
                                            <Key className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-extrabold text-foreground">{t('api_keys_title')}</p>
                                            <p className="text-sm text-muted-foreground">{t('api_keys_subtitle')}</p>
                                        </div>
                                    </div>
                                    <Link href="/dashboard/settings/api-keys">
                                        <Button variant="outline" className="font-bold border-primary text-primary hover:bg-primary hover:text-white transition-all px-8 rounded-xl h-auto">
                                            {t('manage')}
                                        </Button>
                                    </Link>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label htmlFor="gemini-key" className="text-sm font-bold text-foreground/80">{t('gemini_key')}</label>
                                        <input
                                            id="gemini-key"
                                            name="gemini-key"
                                            type="password"
                                            value={geminiKey}
                                            onChange={(e) => setGeminiKey(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-primary outline-none font-mono text-foreground"
                                            placeholder={t('placeholder_api_key')}
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-blue-500" />
                                    {t('section_news')}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { id: 'newsdata', label: t('newsdata_key'), value: newsdataKey, set: setNewsdataKey },
                                        { id: 'newsapi', label: t('newsapi_key'), value: newsapiKey, set: setNewsapiKey },
                                        { id: 'gnews', label: t('gnews_key'), value: gnewsKey, set: setGnewsKey },
                                        { id: 'worldnews', label: t('worldnews_key'), value: worldnewsKey, set: setWorldnewsKey },
                                        { id: 'diffbot', label: t('diffbot_key'), value: diffbotKey, set: setDiffbotKey },
                                        { id: 'zenrows', label: t('zenrows_key'), value: zenrowsKey, set: setZenrowsKey },
                                    ].map((field) => (
                                        <div key={field.id} className="space-y-2">
                                            <label htmlFor={field.id} className="text-sm font-bold text-foreground/80">{field.label}</label>
                                            <input
                                                id={field.id}
                                                name={field.id}
                                                type="password"
                                                value={field.value}
                                                onChange={(e) => field.set(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-primary outline-none font-mono text-foreground"
                                                placeholder={t('placeholder_api_key')}
                                                autoComplete="off"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 pt-6 border-t border-border flex justify-end">
                                    <Button
                                        onClick={handleSave}
                                        isLoading={isLoading}
                                        variant="primary"
                                        className="gap-2"
                                        leftIcon={<Save className="h-4 w-4" />}
                                    >
                                        {t('save')}
                                    </Button>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'social' && (
                        <div className="space-y-8">
                            <section className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Share2 className="h-5 w-5 text-pink-500" />
                                        {t('section_social')}
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="instagram-key" className="text-sm font-bold text-foreground/80">{t('instagram_key')}</label>
                                        <input
                                            id="instagram-key"
                                            name="instagram-key"
                                            type="password"
                                            value={instagramKey}
                                            onChange={(e) => setInstagramKey(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-primary outline-none text-foreground"
                                            placeholder={t('placeholder_api_key')}
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="twitter-bearer" className="text-sm font-bold text-foreground/80">{t('twitter_bearer')}</label>
                                        <input
                                            id="twitter-bearer"
                                            name="twitter-bearer"
                                            type="password"
                                            value={twitterBearer}
                                            onChange={(e) => setTwitterBearer(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-primary outline-none text-foreground"
                                            placeholder={t('placeholder_token')}
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-border flex justify-end">
                                    <Button
                                        onClick={handleSave}
                                        isLoading={isLoading}
                                        variant="primary"
                                        className="gap-2"
                                        leftIcon={<Save className="h-4 w-4" />}
                                    >
                                        {t('save')}
                                    </Button>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'integrations' && (
                        <div className="space-y-8">
                            {/* Chatbase Integration */}
                            <section className="bg-card p-8 rounded-2xl border border-border shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl -mr-6 -mt-6" />
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-emerald-500" />
                                    {t('section_chatbase')}
                                </h2>
                                <p className="text-sm text-muted-foreground mb-8">{t('chatbase_desc')}</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="chatbase-id" className="text-sm font-bold text-foreground/80">{t('chatbase_id')}</label>
                                        <input
                                            id="chatbase-id"
                                            name="chatbase-id"
                                            value={chatbaseId}
                                            onChange={(e) => setChatbaseId(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-foreground"
                                            placeholder={t('placeholder_id')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="chatbase-host" className="text-sm font-bold text-foreground/80">{t('chatbase_host')}</label>
                                        <input
                                            id="chatbase-host"
                                            name="chatbase-host"
                                            value={chatbaseHost}
                                            onChange={(e) => setChatbaseHost(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-emerald-500 outline-none text-foreground"
                                            placeholder={t('placeholder_url')}
                                        />
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-border flex justify-end">
                                    <Button
                                        onClick={handleSave}
                                        isLoading={isLoading}
                                        variant="primary"
                                        className="gap-2"
                                        leftIcon={<Save className="h-4 w-4" />}
                                    >
                                        {t('save')}
                                    </Button>
                                </div>
                            </section>

                            {/* Stripe Integration */}
                            <section className="bg-card p-8 rounded-2xl border border-border shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 blur-2xl -mr-6 -mt-6" />
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-violet-500" />
                                    {t('section_stripe')}
                                </h2>
                                <p className="text-sm text-muted-foreground mb-8">{t('stripe_desc')}</p>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label htmlFor="stripe-publishable" className="text-sm font-bold text-foreground/80">{t('stripe_publishable')}</label>
                                        <input
                                            id="stripe-publishable"
                                            name="stripe-publishable"
                                            type="password"
                                            value={stripePublishableKey}
                                            onChange={(e) => setStripePublishableKey(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-violet-500 outline-none font-mono text-foreground"
                                            placeholder="pk_test_..."
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="stripe-secret" className="text-sm font-bold text-foreground/80">{t('stripe_secret')}</label>
                                        <input
                                            id="stripe-secret"
                                            name="stripe-secret"
                                            type="password"
                                            value={stripeSecretKey}
                                            onChange={(e) => setStripeSecretKey(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-violet-500 outline-none font-mono text-foreground"
                                            placeholder="sk_test_..."
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="stripe-webhook" className="text-sm font-bold text-foreground/80">{t('stripe_webhook')}</label>
                                        <input
                                            id="stripe-webhook"
                                            name="stripe-webhook"
                                            type="password"
                                            value={stripeWebhookSecret}
                                            onChange={(e) => setStripeWebhookSecret(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-violet-500 outline-none font-mono text-foreground"
                                            placeholder="whsec_..."
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-border flex justify-end">
                                    <Button
                                        onClick={handleSave}
                                        isLoading={isLoading}
                                        variant="primary"
                                        className="gap-2"
                                        leftIcon={<Save className="h-4 w-4" />}
                                    >
                                        {t('save')}
                                    </Button>
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
