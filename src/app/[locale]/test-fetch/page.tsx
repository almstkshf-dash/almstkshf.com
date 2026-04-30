
'use client';

import { useState } from 'react';
import RssFeeder from '@/components/dashboard/RssFeeder';

export default function TestFetch() {
    const [result, setResult] = useState<unknown>(null);
    const [error, setError] = useState<string | null>(null);

    const runTest = async (url: string) => {
        setResult(null);
        setError(null);
        try {
            const res = await fetch(`/api/proxy-rss?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            if (data.success) {
                setResult(data);
            } else {
                setError(data.error || 'Unknown error');
            }
        } catch (err: unknown) {
            setError(err.message);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl mb-4">API Proxy Test</h1>
            <div className="flex gap-4 mb-4">
                <button 
                    onClick={() => runTest('https://feeds.bbci.co.uk/news/world/rss.xml')}
                    className="bg-primary text-white px-4 py-2 rounded"
                >
                    Test BBC
                </button>
                <button 
                    onClick={() => runTest('https://aawsat.com/feed')}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Test Asharq Al-Awsat
                </button>
            </div>
            {error && <p className="text-red-500 mt-4">Error: {error}</p>}
            {result && <pre className="mt-4 p-4 bg-muted overflow-auto max-h-96">{JSON.stringify(result, null, 2)}</pre>}
            
            <div className="mt-12">
                <h2 className="text-xl mb-4 font-bold text-primary">RssFeeder Component Test</h2>
                <div className="max-w-md border p-4 rounded-xl shadow-lg bg-card">
                    <RssFeeder 
                        initialFeedUrl="https://aawsat.com/feed"
                        initialSourceName="asharq_al_awsat"
                    />
                </div>
            </div>
        </div>
    );
}
