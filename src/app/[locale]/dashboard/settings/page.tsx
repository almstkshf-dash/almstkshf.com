'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Save, Upload, Loader2, CreditCard, Link2, Settings, Key, Share2, MessageSquare, Shield, Zap, BarChart3, Globe } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import PhylloConnectButton from '@/components/PhylloConnect';
import clsx from 'clsx';
import Button from '@/components/ui/Button';

interface Payment {
    _id: string;
    createdAt: number;
    productName: string;
    amount: number;
    currency: string;
    status: string;
}

export default function SettingsPage() {
    const t = useTranslations('Settings');
    const { userId } = useAuth();
    const settings = useQuery(api.settings.getSettings);
    const updateSettings = useMutation(api.settings.updateSettings);
    const payments = useQuery(api.payments.getUserPayments, { userId: userId || '' });

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
    const [phylloClientId, setPhylloClientId] = useState('');
    const [phylloClientSecret, setPhylloClientSecret] = useState('');
    const [chatbaseId, setChatbaseId] = useState('');
    const [chatbaseHost, setChatbaseHost] = useState('');
    const [stripePublishableKey, setStripePublishableKey] = useState('');
    const [stripeSecretKey, setStripeSecretKey] = useState('');
    const [stripeWebhookSecret, setStripeWebhookSecret] = useState('');
    const [targetCountries, setTargetCountries] = useState('AE,SA');
    const [aveMultiplier, setAveMultiplier] = useState(0.005);
    const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'social' | 'integrations'>('general');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (settings) {
            setLogoUrl(settings.logoUrl || '');
            setGeminiKey(settings.apiKeys?.gemini || '');
            setInstagramKey(settings.apiKeys?.instagram || '');
            setTwitterKey(settings.apiKeys?.twitter || '');
            setTwitterBearer(settings.apiKeys?.twitterBearer || '');
            setTwitterConsumerKey(settings.apiKeys?.twitterConsumerKey || '');
            setTwitterConsumerSecret(settings.apiKeys?.twitterConsumerSecret || '');
            setNewsdataKey(settings.apiKeys?.newsdata || '');
            setNewsapiKey(settings.apiKeys?.newsapi || '');
            setGnewsKey(settings.apiKeys?.gnews || '');
            setWorldnewsKey(settings.apiKeys?.worldnews || '');
            setPhylloClientId(settings.apiKeys?.phylloClientId || '');
            setPhylloClientSecret(settings.apiKeys?.phylloClientSecret || '');
            setChatbaseId(settings.apiKeys?.chatbaseId || '');
            setChatbaseHost(settings.apiKeys?.chatbaseHost || '');
            setStripePublishableKey(settings.apiKeys?.stripePublishableKey || '');
            setStripeSecretKey(settings.apiKeys?.stripeSecretKey || '');
            setStripeWebhookSecret(settings.apiKeys?.stripeWebhookSecret || '');
            setTargetCountries(settings.defaults?.targetCountries?.join(',') || 'AE,SA');
            setAveMultiplier(settings.defaults?.aveMultiplier || 0.005);
        }
    }, [settings]);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
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
                    phylloClientId: phylloClientId,
                    phylloClientSecret: phylloClientSecret,
                    chatbaseId: chatbaseId,
                    chatbaseHost: chatbaseHost,
                    stripePublishableKey: stripePublishableKey,
                    stripeSecretKey: stripeSecretKey,
                    stripeWebhookSecret: stripeWebhookSecret,
                },
                defaults: {
                    targetCountries: targetCountries.split(',').map(c => c.trim().toUpperCase()),
                    aveMultiplier: Number(aveMultiplier),
                },
            });
            setMessage({ type: 'success', text: t('saved_success') });
        } catch (error) {
            console.error('Failed to save settings:', error);
            setMessage({ type: 'error', text: t('save_failed') });
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

            {message && (
                <div className={clsx(
                    "p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300",
                    message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/10 dark:border-emerald-900/30 dark:text-emerald-400' : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/10 dark:border-rose-900/30 dark:text-rose-400'
                )}>
                    <div className={clsx("w-2 h-2 rounded-full", message.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500')} />
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
                            onClick={() => setActiveTab(tab.id as any)}
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
                                    <div className="relative w-40 h-40 border-2 border-dashed border-border rounded-3xl flex items-center justify-center bg-muted/30 overflow-hidden group">
                                        {logoUrl ? (
                                            <Image src={logoUrl} alt="Company Logo" fill className="object-contain p-4 transition-transform group-hover:scale-105" />
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
                                    </div>
                                </div>
                            </section>

                            <section className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 font-poppins">
                                    <Settings className="h-5 w-5 text-blue-500" />
                                    {t('defaults')}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label htmlFor="target-countries" className="text-sm font-bold text-foreground/80">{t('target_countries')}</label>
                                        <input
                                            id="target-countries"
                                            name="target-countries"
                                            value={targetCountries}
                                            onChange={(e) => setTargetCountries(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-primary outline-none text-foreground"
                                            placeholder={t('placeholder_countries')}
                                        />
                                        <p className="text-xs text-muted-foreground">{t('iso_hint')}</p>
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
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-primary outline-none text-foreground"
                                        />
                                        <p className="text-xs text-muted-foreground">{t('default_value')}: 0.005</p>
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

                            <section className="bg-card p-8 rounded-2xl border border-border shadow-sm overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-10 -mt-10" />
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <Link2 className="h-5 w-5 text-primary" />
                                    {t('section_phyllo')}
                                </h2>
                                <p className="text-sm text-muted-foreground mb-8 max-w-lg">{t('phyllo_desc')}</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                    <div className="space-y-2">
                                        <label htmlFor="phyllo-client-id" className="text-sm font-bold text-primary/80">{t('phyllo_client_id')}</label>
                                        <input
                                            id="phyllo-client-id"
                                            name="phyllo-client-id"
                                            value={phylloClientId}
                                            onChange={(e) => setPhylloClientId(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-primary/5 focus:ring-2 focus:ring-primary outline-none text-foreground"
                                            placeholder={t('placeholder_id')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="phyllo-client-secret" className="text-sm font-bold text-primary/80">{t('phyllo_client_secret')}</label>
                                        <input
                                            id="phyllo-client-secret"
                                            name="phyllo-client-secret"
                                            type="password"
                                            value={phylloClientSecret}
                                            onChange={(e) => setPhylloClientSecret(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-primary/5 focus:ring-2 focus:ring-primary outline-none text-foreground"
                                            placeholder={t('placeholder_secret')}
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>

                                <div className="p-6 bg-gradient-to-r from-primary to-primary/70 rounded-2xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg">{t('phyllo_test')}</h3>
                                        <p className="text-white/80 text-sm">{t('phyllo_test_desc')}</p>
                                    </div>
                                    <PhylloConnectButton className="px-8 py-3 bg-white text-primary rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-lg active:scale-95" />
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
                                            placeholder={t('placeholder_api_key')}
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="stripe-secret" className="text-sm font-bold text-foreground/80">{t('stripe_secret')}</label>
                                            <input
                                                id="stripe-secret"
                                                name="stripe-secret"
                                                type="password"
                                                value={stripeSecretKey}
                                                onChange={(e) => setStripeSecretKey(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-violet-500 outline-none font-mono text-foreground"
                                                placeholder={t('placeholder_api_key')}
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
                                                placeholder={t('placeholder_api_key')}
                                                autoComplete="off"
                                            />
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

                            {/* Billing History Section */}
                            <section className="bg-card p-8 rounded-2xl border border-border shadow-sm" >
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
                                    <BarChart3 className="h-5 w-5 text-primary" />
                                    {t('billing')}
                                </h2>
                                <div className="overflow-x-auto -mx-8">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-muted/50 border-y border-border">
                                                <th className="py-4 px-8 text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('col_date')}</th>
                                                <th className="py-4 px-8 text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('col_product')}</th>
                                                <th className="py-4 px-8 text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('col_amount')}</th>
                                                <th className="py-4 px-8 text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('col_status')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {!payments || payments.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="py-12 text-center text-muted-foreground italic">
                                                        {t('no_payments')}
                                                    </td>
                                                </tr>
                                            ) : (
                                                payments.map((payment: Payment) => (
                                                    <tr key={payment._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                                        <td className="py-4 px-8 text-sm text-muted-foreground">
                                                            {new Date(payment.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="py-4 px-8 text-sm font-bold text-foreground">
                                                            {payment.productName}
                                                        </td>
                                                        <td className="py-4 px-8 text-sm text-muted-foreground">
                                                            {payment.amount} {payment.currency.toUpperCase()}
                                                        </td>
                                                        <td className="py-4 px-8 text-sm">
                                                            <span className={clsx(
                                                                "inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                                                payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                                            )}>
                                                                {payment.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section >
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
