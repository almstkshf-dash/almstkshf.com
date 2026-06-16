/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import { Link } from '@/i18n/routing';
import { useState, useRef, useEffect, ComponentPropsWithoutRef } from 'react';

type HoverPrefetchLinkProps = ComponentPropsWithoutRef<typeof Link>;

export function HoverPrefetchLink({
    children,
    prefetch: prefetchProp,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onTouchStart,
    ...props
}: HoverPrefetchLinkProps) {
    const [shouldPrefetch, setShouldPrefetch] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!shouldPrefetch) {
            // 80ms delay to make sure the hover is intentional (reduces unnecessary fetching on sweep)
            timeoutRef.current = setTimeout(() => {
                setShouldPrefetch(true);
            }, 80);
        }
        onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        onMouseLeave?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLAnchorElement>) => {
        setShouldPrefetch(true);
        onFocus?.(e);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLAnchorElement>) => {
        setShouldPrefetch(true);
        onTouchStart?.(e);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <Link
            {...props}
            prefetch={shouldPrefetch ? (prefetchProp === undefined ? true : prefetchProp) : false}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onTouchStart={handleTouchStart}
        >
            {children}
        </Link>
    );
}
