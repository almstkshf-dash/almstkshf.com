/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PricingClient from '@/components/PricingClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Pricing' });
    return {
        title: t('title'),
        description: t('description'),
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/pricing`,
            languages: {
                'x-default': 'https://www.almstkshf.com/pricing',
                en: 'https://www.almstkshf.com/en/pricing',
                ar: 'https://www.almstkshf.com/ar/pricing',
            }
        },
    };
}

export default function PricingPage() {
    return <PricingClient />;
}
