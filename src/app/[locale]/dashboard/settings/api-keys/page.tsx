/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ApiKeysClient from '@/components/dashboard/settings/ApiKeysClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Navigation' });
    return {
        title: `${t('api_key')} | Almstkshf`,
        robots: {
            index: false,
            follow: false,
            googleBot: {
                index: false,
                follow: false,
            },
        },
    };
}

export default async function ApiKeysPage({ params }: { params: Promise<{ locale: string }> }) {
    const { userId } = await auth();
    const { locale } = await params;

    if (!userId) {
        redirect(`/${locale}/sign-in`);
    }

    return <ApiKeysClient />;
}
