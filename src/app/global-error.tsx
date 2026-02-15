'use client';

import { useEffect } from 'react';

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
        <html>
            <body className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <div className="rounded-xl bg-white p-8 shadow-xl">
                    <h2 className="mb-4 text-2xl font-bold text-gray-900">Something went wrong!</h2>
                    <p className="mb-6 text-gray-600">A critical error occurred. Please try refreshing.</p>
                    <button
                        onClick={() => reset()}
                        className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
