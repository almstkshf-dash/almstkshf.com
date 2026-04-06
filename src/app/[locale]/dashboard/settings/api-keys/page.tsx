'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { useAuth } from '@clerk/nextjs';
import { Key, Save, Shield, Zap, AlertTriangle, CheckCircle2, Info, ArrowUpCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import clsx from 'clsx';

export default function ApiKeysPage() {
    const t = useTranslations('Settings');
    const { userId } = useAuth();
    const userSettings = useQuery(api.userSettings.get, { userId: userId || '' });
    
    const [keys, setKeys] = useState({
        gemini: '',
        newsdata: '',
        newsapi: '',
        gnews: '',
        worldnews: '',
        bing: '',
        mediastack: '',
        serper: '',
        twitterBearer: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const updateApiKeys = useMutation(api.userSettings.updateApiKeys);

    useEffect(() => {
        if (userSettings?.apiKeys) {
            setKeys(prev => ({
                ...prev,
                ...userSettings.apiKeys
            }));
        } else if (userSettings?.geminiApiKey) {
            // Backward compatibility for top-level gemini key
            setKeys(prev => ({ ...prev, gemini: userSettings.geminiApiKey! }));
        }
    }, [userSettings]);

    const handleSave = async (specificKeys?: Partial<typeof keys>) => {
        setIsSaving(true);
        setMessage(null);
        try {
            await updateApiKeys({ keys: (specificKeys || keys) as any });
            setMessage({ type: 'success', text: t('saved_success') });
        } catch (error) {
            console.error('Failed to save API keys:', error);
            setMessage({ type: 'error', text: t('save_failed') });
        } finally {
            setIsSaving(false);
        }
    };

    const updateKeyField = (field: keyof typeof keys, value: string) => {
        setKeys(prev => ({ ...prev, [field]: value }));
    };

    if (userSettings === undefined) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const isTrialActive = userSettings?.isTrialActive && (userSettings?.trialEndsAt || 0) > Date.now();
    const isSubscribed = userSettings?.isSubscribed;
    const hasAccess = isTrialActive || isSubscribed;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                    <Key className="h-8 w-8 text-primary" />
                    {t('api_keys_title')}
                </h1>
                <p className="text-muted-foreground">
                    {t('api_keys_subtitle')}
                </p>
            </div>

            {message && (
                <div className={clsx(
                    "p-4 rounded-xl border flex items-center gap-3",
                    message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/10 dark:border-emerald-900/30 dark:text-emerald-400' : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/10 dark:border-rose-900/30 dark:text-rose-400'
                )}>
                    {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Status Cards */}
                <div className="md:col-span-1 space-y-4">
                    <section className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                                {t('subscription_status')}
                            </h3>
                            {isSubscribed ? (
                                <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                    {t('active')}
                                </span>
                            ) : (
                                <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-[10px] font-bold">
                                    -
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={clsx(
                                "p-3 rounded-xl",
                                isSubscribed ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            )}>
                                <Shield className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-bold text-lg">{isSubscribed ? t('status_premium') : t('status_free')}</p>
                                {!isSubscribed && (
                                    <button className="text-xs text-primary font-bold hover:underline flex items-center gap-1 mt-1">
                                        {t('upgrade_now')} <ArrowUpCircle className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                                {t('trial_status')}
                            </h3>
                            {isTrialActive ? (
                                <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                    {t('active')}
                                </span>
                            ) : (
                                <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                    {t('expired')}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={clsx(
                                "p-3 rounded-xl",
                                isTrialActive ? "bg-amber-100/50 text-amber-600" : "bg-muted text-muted-foreground"
                            )}>
                                <Zap className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-bold text-lg">{t('trial_name')}</p>
                                {userSettings?.trialEndsAt && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {t('trial_ends_at', { date: new Date(userSettings.trialEndsAt).toLocaleDateString() })}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Main Config */}
                <div className="md:col-span-2 space-y-6">
                    {/* Gemini Section */}
                    <section className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-amber-500" />
                                <h2 className="text-xl font-bold">{t('section_ai')}</h2>
                            </div>
                            <Button 
                                onClick={() => handleSave({ gemini: keys.gemini })}
                                isLoading={isSaving}
                                size="sm"
                                variant="outline"
                                className="h-8 py-0 px-3"
                            >
                                <Save className="h-3.5 w-3.5 mr-1.5" /> {t('save')}
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl flex gap-3">
                                <Info className="h-5 w-5 text-blue-500 shrink-0" />
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                    {hasAccess ? t('system_key_desc') : t('no_key_warning')}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="gemini-key" className="text-sm font-bold text-foreground/80">
                                    {t('gemini_key')} (BYOK)
                                </label>
                                <input
                                    id="gemini-key"
                                    type="password"
                                    value={keys.gemini}
                                    onChange={(e) => updateKeyField('gemini', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-primary outline-none font-mono text-foreground"
                                    placeholder={t('placeholder_gemini')}
                                />
                            </div>
                        </div>
                    </section>

                    {/* News Services Section */}
                    <section className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-primary" />
                                <h2 className="text-xl font-bold">{t('section_news')}</h2>
                            </div>
                            <Button 
                                onClick={() => handleSave()}
                                isLoading={isSaving}
                                size="sm"
                                variant="outline"
                            >
                                <Save className="h-4 w-4 mr-2" /> {t('save')}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { id: 'newsdata', label: t('newsdata_key') },
                                { id: 'newsapi', label: t('newsapi_key') },
                                { id: 'gnews', label: t('gnews_key') },
                                { id: 'worldnews', label: t('worldnews_key') },
                                { id: 'bing', label: t('bing_key') },
                                { id: 'mediastack', label: t('mediastack_key') },
                                { id: 'serper', label: t('serper_key') },
                            ].map((field) => (
                                <div key={field.id} className="space-y-2">
                                    <label htmlFor={field.id} className="text-xs font-bold text-foreground/70 flex items-center justify-between uppercase tracking-tight">
                                        {field.label}
                                        {keys[field.id as keyof typeof keys] && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                                    </label>
                                    <input
                                        id={field.id}
                                        type="password"
                                        value={keys[field.id as keyof typeof keys]}
                                        onChange={(e) => updateKeyField(field.id as keyof typeof keys, e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted/10 focus:ring-1 focus:ring-primary transition-all font-mono outline-none"
                                        placeholder={t('placeholder_api_key')}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Social Media Section */}
                    <section className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-indigo-500" />
                                <h2 className="text-xl font-bold">{t('section_social')}</h2>
                            </div>
                            <Button 
                                onClick={() => handleSave({ twitterBearer: keys.twitterBearer })}
                                isLoading={isSaving}
                                size="sm"
                                variant="outline"
                            >
                                <Save className="h-4 w-4 mr-2" /> {t('save')}
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="twitter-bearer" className="text-sm font-bold text-foreground/80">
                                    {t('twitter_bearer')}
                                </label>
                                <input
                                    id="twitter-bearer"
                                    type="password"
                                    value={keys.twitterBearer}
                                    onChange={(e) => updateKeyField('twitterBearer', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary outline-none font-mono text-foreground"
                                    placeholder={t('placeholder_token')}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Info className="h-5 w-5 text-primary" />
                            {t('how_it_works')}
                        </h2>
                        <div className="space-y-4 text-sm text-muted-foreground">
                            <p>{t('tier_desc')}</p>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    </div>
                                    <span><strong>{t('subscription_status')} / {t('trial_status')}:</strong> {t('system_key_desc')}</span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    </div>
                                    <span><strong>BYOK:</strong> {t('byok_desc')}</span>
                                </li>
                            </ul>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
