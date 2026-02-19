'use client';

import { useQuery, useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function DeepStatusPanel() {
    const t = useTranslations('DeepSources');
    const runs = useQuery(api.deepSources.getDeepRuns, { limit: 10 }) as any;
    const fetchDeep = useAction(api.deepSources.fetchDeepSources);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFetch = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const res = await fetchDeep({ languages: 'en,ar', countries: 'ae,sa,eg', limit: 20 }) as any;
            if (res?.success) {
                setSuccess(t('fetch_success') || 'Fetch completed');
            } else {
                setError(res?.error || t('fetch_failed'));
            }
        } catch (e: any) {
            setError(e?.message || t('fetch_failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-lg font-bold">Deep Sources</h3>
                </div>
                <button
                    onClick={handleFetch}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted text-sm font-bold"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {t('fetch_now') || 'Fetch Now'}
                </button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}
            <div className="space-y-2">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('recent_runs') || 'Recent runs'}</div>
                {runs === undefined && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                {runs && runs.length === 0 && <p className="text-sm text-muted-foreground">{t('no_runs') || 'No runs yet'}</p>}
                <div className="space-y-2">
                    {runs?.map((run: any) => (
                        <div key={run._id} className="flex items-center justify-between bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm">
                            <span className="font-semibold">{new Date(run.startedAt).toLocaleString()}</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-widest ${run.status === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-500'}`}>
                                {run.status}
                            </span>
                            <span className="text-muted-foreground text-xs">{run.itemCount} items</span>
                            {run.error && <span className="text-[11px] text-destructive">{run.error}</span>}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

