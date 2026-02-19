"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Container from '@/components/ui/Container';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        if (sessionId) {
            fetch(`/api/stripe/session?session_id=${sessionId}`)
                .then(res => res.json())
                .then(data => {
                    setSession(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching session:', err);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [sessionId]);

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
                {loading ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                        <p className="text-slate-400">Verifying payment...</p>
                    </div>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                        </div>

                        <h1 className="text-4xl font-bold text-white mb-4">
                            Payment Successful!
                        </h1>

                        <p className="text-xl text-slate-300 mb-8">
                            Thank you for your purchase. Your payment has been processed successfully.
                        </p>

                        {sessionId && (
                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-8">
                                <p className="text-sm text-slate-500 mb-2">Transaction ID</p>
                                <p className="text-slate-300 font-mono text-sm break-all">{sessionId}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <p className="text-slate-400">
                                A confirmation email has been sent to your email address.
                            </p>

                            <div className="flex gap-4 justify-center pt-4">
                                <Link
                                    href="/"
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors"
                                >
                                    Return to Home
                                </Link>
                                <Link
                                    href="/contact"
                                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
                                >
                                    Contact Support
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <main className="min-h-screen bg-slate-950 py-20">
            <Container>
                <Suspense fallback={
                    <div className="flex flex-col items-center gap-4 py-20">
                        <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                        <p className="text-slate-400 text-center">Loading payment details...</p>
                    </div>
                }>
                    <PaymentSuccessContent />
                </Suspense>
            </Container>
        </main>
    );
}

