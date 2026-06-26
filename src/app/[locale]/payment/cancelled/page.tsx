/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { XCircle } from 'lucide-react';
import Container from '@/components/ui/Container';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";
    return {
        title: isAr ? "تم إلغاء الدفع | المستكشف" : "Payment Cancelled | ALMSTKSHF",
        description: isAr
            ? "تم إلغاء عملية الدفع الخاصة بك."
            : "Your payment has been cancelled.",
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/payment/cancelled`,
            languages: {
                'x-default': 'https://www.almstkshf.com/payment/cancelled',
                en: 'https://www.almstkshf.com/en/payment/cancelled',
                ar: 'https://www.almstkshf.com/ar/payment/cancelled',
            }
        },
        robots: {
            index: false,
            follow: false,
        }
    };
}

export default function PaymentCancelledPage() {
    return (
        <main className="min-h-screen bg-slate-950 py-20">
            <Container>
                <div className="max-w-2xl mx-auto">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
                        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-12 h-12 text-rose-400" />
                        </div>

                        <h1 className="text-4xl font-bold text-white mb-4">
                            Payment Cancelled
                        </h1>

                        <p className="text-xl text-slate-300 mb-8">
                            Your payment was cancelled. No charges have been made to your account.
                        </p>

                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-8">
                            <p className="text-slate-400">
                                If you experienced any issues during checkout, please don&apos;t hesitate to contact our support team.
                            </p>
                        </div>

                        <div className="flex gap-4 justify-center">
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
                </div>
            </Container>
        </main>
    );
}
