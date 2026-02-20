'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const t = useTranslations('Error');

    useEffect(() => {
        console.error(error);
    }, [error]);

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

                <p className="text-foreground/60">
                    {t('description')}
                </p>

                <div className="flex justify-center gap-4">
                    <Button
                        onClick={() => reset()}
                        variant="primary"
                        size="lg"
                        className="shadow-sm transition-all hover:shadow-md h-auto"
                    >
                        {t('retry')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
