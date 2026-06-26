/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Metadata } from 'next';
import PaymentSuccessClient from '@/components/PaymentSuccessClient';
import Container from '@/components/ui/Container';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";
    return {
        title: isAr ? "نجاح الدفع | المستكشف" : "Payment Successful | ALMSTKSHF",
        description: isAr
            ? "تمت معالجة الدفع الخاص بك بنجاح."
            : "Your payment has been processed successfully.",
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/payment/success`,
            languages: {
                'x-default': 'https://www.almstkshf.com/payment/success',
                en: 'https://www.almstkshf.com/en/payment/success',
                ar: 'https://www.almstkshf.com/ar/payment/success',
            }
        },
        robots: {
            index: false,
            follow: false,
        }
    };
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
                    <PaymentSuccessClient />
                </Suspense>
            </Container>
        </main>
    );
}
