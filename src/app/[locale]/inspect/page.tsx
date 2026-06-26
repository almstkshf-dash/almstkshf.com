/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import InspectClient from '@/components/InspectClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'AiInspector' });
    return {
        title: t('title'),
        description: t('subtitle'),
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/inspect`,
            languages: {
                'x-default': 'https://www.almstkshf.com/inspect',
                en: 'https://www.almstkshf.com/en/inspect',
                ar: 'https://www.almstkshf.com/ar/inspect',
            }
        },
    };
}

export default function AIInspectorPage() {
    return <InspectClient />;
}
