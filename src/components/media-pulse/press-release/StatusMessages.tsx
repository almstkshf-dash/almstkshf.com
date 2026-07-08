/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { XCircle, AlertTriangle } from 'lucide-react';

type StatusMessagesProps = {
    t: (key: string, options?: any) => string;
    error: string;
    syncStateError?: string;
    retryCountdown: number | null;
};

export default function StatusMessages({
    t,
    error,
    syncStateError,
    retryCountdown,
}: StatusMessagesProps) {
    const activeError = error || syncStateError;

    return (
        <div className="space-y-3">
            {/* Sync Quota Countdown warning */}
            {retryCountdown !== null && retryCountdown > 0 && (
                <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-500" aria-hidden="true" />
                    <span>{t('ai_busy_wait', { seconds: retryCountdown })}</span>
                </div>
            )}

            {/* Error Message */}
            {activeError && (
                <div className="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-300 bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-3">
                    <XCircle className="w-4 h-4 flex-shrink-0 text-rose-500" aria-hidden="true" />
                    <span>{activeError}</span>
                </div>
            )}
        </div>
    );
}
