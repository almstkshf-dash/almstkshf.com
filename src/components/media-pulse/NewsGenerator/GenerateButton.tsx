/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import * as React from 'react';
import Button from '../../ui/Button';

interface GenerateButtonProps {
    onClick: () => void;
    loading: boolean;
    authLoading: boolean;
    isAuthenticated: boolean;
    retryCountdown: number | null;
    t: any;
}

export const GenerateButton: React.FC<GenerateButtonProps> = React.memo(({
    onClick,
    loading,
    authLoading,
    isAuthenticated,
    retryCountdown,
    t,
}) => {
    // Better loading UX: do not disable the button permanently if not authenticated.
    // Allow users to click so authentication errors can be surfaced to the UI (Point 11).
    const isDisabled = loading || authLoading || retryCountdown !== null;

    return (
        <Button
            onClick={onClick}
            isLoading={loading || authLoading || retryCountdown !== null}
            disabled={isDisabled}
            className="w-full md:w-auto font-bold px-10 py-3.5 shadow-xl shadow-primary/20 text-sm whitespace-nowrap"
        >
            {loading ? (
                t('analyzing')
            ) : retryCountdown !== null ? (
                <span className="flex items-center gap-2">
                    <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                    {retryCountdown}s
                </span>
            ) : (
                <>{t('generate_report')}</>
            )}
        </Button>
    );
});

GenerateButton.displayName = 'GenerateButton';
