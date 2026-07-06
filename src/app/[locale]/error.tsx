/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { Link } from '@/i18n/routing';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const t = useTranslations('Error');
    const [isRetrying, setIsRetrying] = useState(false);

    useEffect(() => {
        console.error(error);
    }, [error]);

    const handleRetry = () => {
        setIsRetrying(true);
        reset();
        // Reset loading state after 2 seconds in case retry fails and no unmount occurs
        setTimeout(() => {
            setIsRetrying(false);
        }, 2000);
    };

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            <div className="max-w-md space-y-6">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                    <svg
                        className="h-10 w-10 text-destructive"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                    {t('title')}
                </h2>

                <p className="text-foreground/60 text-sm sm:text-base">
                    {t('description')}
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button
                        onClick={handleRetry}
                        isLoading={isRetrying}
                        variant="primary"
                        size="lg"
                        className="shadow-sm transition-all hover:shadow-md h-auto"
                    >
                        {t('retry')}
                    </Button>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border px-8 py-3.5 text-base shadow-sm hover:shadow-md active:scale-95"
                    >
                        {t('go_home')}
                    </Link>
                </div>

                {process.env.NODE_ENV === 'production' && error.digest && (
                    <p className="text-xs text-foreground/40 italic mt-8">
                        {t('digest', { digest: error.digest })}
                    </p>
                )}
            </div>
        </div>
    );
}
