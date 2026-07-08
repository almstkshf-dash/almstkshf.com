/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import { Link, useRouter } from '@/i18n/routing';
import React, { useRef, useEffect, ComponentPropsWithoutRef } from 'react';

type HoverPrefetchLinkProps = ComponentPropsWithoutRef<typeof Link>;

// Helper to resolve string or object based href properties to a string
const resolveHrefToString = (href: HoverPrefetchLinkProps['href']): string => {
    if (typeof href === 'string') {
        return href;
    }
    if (href && typeof href === 'object') {
        let path = href.pathname || '';
        const query = href.query;
        if (query) {
            const params = new URLSearchParams();
            Object.entries(query).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        value.forEach(v => params.append(key, String(v)));
                    } else {
                        params.append(key, String(value));
                    }
                }
            });
            const search = params.toString();
            if (search) {
                path += `?${search}`;
            }
        }
        if (href.hash) {
            path += href.hash.startsWith('#') ? href.hash : `#${href.hash}`;
        }
        return path;
    }
    return '';
};

export function HoverPrefetchLink({
    children,
    prefetch,
    onPointerEnter,
    onPointerLeave,
    onMouseEnter,
    onMouseLeave,
    onTouchStart,
    onFocus,
    ...props
}: HoverPrefetchLinkProps) {
    const router = useRouter();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handlePointerEnter = (e: React.PointerEvent<HTMLAnchorElement>) => {
        if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
            const pathStr = resolveHrefToString(props.href);
            if (pathStr && !timeoutRef.current) {
                timeoutRef.current = setTimeout(() => {
                    router.prefetch(pathStr);
                }, 80);
            }
        }
        onPointerEnter?.(e);
        if (onMouseEnter) {
            onMouseEnter(e as unknown as React.MouseEvent<HTMLAnchorElement>);
        }
    };

    const handlePointerLeave = (e: React.PointerEvent<HTMLAnchorElement>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        onPointerLeave?.(e);
        if (onMouseLeave) {
            onMouseLeave(e as unknown as React.MouseEvent<HTMLAnchorElement>);
        }
    };

    const handleFocus = (e: React.FocusEvent<HTMLAnchorElement>) => {
        const pathStr = resolveHrefToString(props.href);
        if (pathStr) {
            router.prefetch(pathStr);
        }
        onFocus?.(e);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLAnchorElement>) => {
        const pathStr = resolveHrefToString(props.href);
        if (pathStr) {
            router.prefetch(pathStr);
        }
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
            prefetch={false}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onFocus={handleFocus}
            onTouchStart={handleTouchStart}
        >
            {children}
        </Link>
    );
}
