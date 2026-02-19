'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Save, Upload, Loader2, CreditCard } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import PhylloConnectButton from '@/components/PhylloConnect';
import { Link2 } from 'lucide-react';

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
    const [targetCountries, setTargetCountries] = useState('AE,SA');
    const [aveMultiplier, setAveMultiplier] = useState(0.005);
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
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                    {t('save')}
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Logo Section */}
                <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 md:col-span-2">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">{t('logo_upload')}</h2>
                    <div className="flex items-start gap-6">
                        <div className="flex-shrink-0 w-32 h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
                            {logoUrl ? (
                                <Image src={logoUrl} alt="Company Logo" fill className="object-contain p-2" />
                            ) : (
                                <Upload className="h-8 w-8 text-slate-400" />
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <label htmlFor="logo-upload" className="text-sm text-slate-600 dark:text-slate-400">{t('logo_desc')}</label>
                            <input
                                id="logo-upload"
                                name="logo-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
                            />
                        </div>
                    </div>
                </section>

                {/* API Keys Section */}
                <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">{t('api_keys')}</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="gemini-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('gemini_key')}</label>
                            <input
                                id="gemini-key"
                                name="gemini_key"
                                type="password"
                                value={geminiKey}
                                onChange={(e) => setGeminiKey(e.target.value)}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-white"
                                placeholder="AIzaSy..."
                            />
                        </div>
                        <div>
                            <label htmlFor="instagram-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('instagram_key')}</label>
                            <input
                                id="instagram-key"
                                name="instagram_key"
                                type="password"
                                value={instagramKey}
                                onChange={(e) => setInstagramKey(e.target.value)}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="twitter-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('twitter_key')}</label>
                            <input
                                id="twitter-key"
                                name="twitter_key"
                                type="password"
                                value={twitterKey}
                                onChange={(e) => setTwitterKey(e.target.value)}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="twitter-bearer" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('twitter_bearer')}</label>
                            <input
                                id="twitter-bearer"
                                name="twitter_bearer"
                                type="password"
                                value={twitterBearer}
                                onChange={(e) => setTwitterBearer(e.target.value)}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="twitter-consumer-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('twitter_consumer_key')}</label>
                            <input
                                id="twitter-consumer-key"
                                name="twitter_consumer_key"
                                type="password"
                                value={twitterConsumerKey}
                                onChange={(e) => setTwitterConsumerKey(e.target.value)}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="twitter-consumer-secret" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('twitter_consumer_secret')}</label>
                            <input
                                id="twitter-consumer-secret"
                                name="twitter_consumer_secret"
                                type="password"
                                value={twitterConsumerSecret}
                                onChange={(e) => setTwitterConsumerSecret(e.target.value)}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="newsdata-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('newsdata_key')}</label>
                            <input
                                id="newsdata-key"
                                name="newsdata_key"
                                type="password"
                                value={newsdataKey}
                                onChange={(e) => setNewsdataKey(e.target.value)}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="newsapi-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('newsapi_key')}</label>
                            <input
                                id="newsapi-key"
                                name="newsapi_key"
                                type="password"
                                value={newsapiKey}
                                onChange={(e) => setNewsapiKey(e.target.value)}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="gnews-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('gnews_key')}</label>
                            <input
                                id="gnews-key"
                                name="gnews_key"
                                type="password"
                                value={gnewsKey}
                                onChange={(e) => setGnewsKey(e.target.value)}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="worldnews-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('worldnews_key')}</label>
                            <input
                                id="worldnews-key"
                                name="worldnews_key"
                                type="password"
                                value={worldnewsKey}
                                onChange={(e) => setWorldnewsKey(e.target.value)}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="phyllo-client-id" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('phyllo_client_id')}</label>
                            <input
                                id="phyllo-client-id"
                                name="phyllo_client_id"
                                type="text"
                                value={phylloClientId}
                                onChange={(e) => setPhylloClientId(e.target.value)}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="phyllo-client-secret" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('phyllo_client_secret')}</label>
                            <input
                                id="phyllo-client-secret"
                                name="phyllo_client_secret"
                                type="password"
                                value={phylloClientSecret}
                                onChange={(e) => setPhylloClientSecret(e.target.value)}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-white"
                            />
                        </div>
                    </div>
                </section>

                {/* Defaults Section */}
                <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">{t('defaults')}</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="target-countries" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('target_countries')}</label>
                            <input
                                id="target-countries"
                                name="target_countries"
                                type="text"
                                value={targetCountries}
                                onChange={(e) => setTargetCountries(e.target.value)}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-white"
                                placeholder="AE, SA, EG"
                            />
                            <p className="text-xs text-slate-500 mt-1">{t('iso_hint')}</p>
                        </div>
                        <div>
                            <label htmlFor="ave-multiplier" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('ave_multiplier')}</label>
                            <input
                                id="ave-multiplier"
                                name="ave_multiplier"
                                type="number"
                                step="0.001"
                                value={aveMultiplier}
                                onChange={(e) => setAveMultiplier(parseFloat(e.target.value))}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-white"
                            />
                            <p className="text-xs text-slate-500 mt-1">{t('default_value')}: 0.005</p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Social Integrations Section */}
            <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-6">
                    <Link2 className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Social Integrations</h2>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                    <div>
                        <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-1">Creator Account Connection</h3>
                        <p className="text-sm text-indigo-700/70 dark:text-indigo-300/60 max-w-md">
                            Connect your social accounts via Phyllo to track engagement, audience insights, and performance metrics directly in your dashboard.
                        </p>
                    </div>
                    <PhylloConnectButton className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none whitespace-nowrap" />
                </div>
            </section>

            {/* Billing History Section */}
            < section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700" >
                <div className="flex items-center gap-2 mb-6">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{t('billing')}</h2>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t('billing_desc')}</p>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">{t('col_date')}</th>
                                <th className="py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">{t('col_product')}</th>
                                <th className="py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">{t('col_amount')}</th>
                                <th className="py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">{t('col_status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!payments || payments.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-slate-400 dark:text-slate-500 italic">
                                        {t('no_payments')}
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment._id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                        <td className="py-4 px-4 text-sm text-slate-700 dark:text-slate-300">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-4 text-sm font-medium text-slate-800 dark:text-slate-200">
                                            {payment.productName}
                                        </td>
                                        <td className="py-4 px-4 text-sm text-slate-700 dark:text-slate-300">
                                            {payment.amount} {payment.currency.toUpperCase()}
                                        </td>
                                        <td className="py-4 px-4 text-sm">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${payment.status === 'paid'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
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
        </div >
    );
}
