/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html lang="en" dir="ltr">
            <body className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <div className="rounded-xl bg-white p-8 shadow-xl">
                    <h2 className="mb-4 text-2xl font-bold text-gray-900">Something went wrong!</h2>
                    <p className="mb-6 text-gray-600">A critical error occurred. Please try refreshing.</p>
                    <Button
                        onClick={() => reset()}
                        variant="primary"
                        className="h-auto"
                    >
                        Try again
                    </Button>
                </div>
            </body>
        </html>
    );
}
