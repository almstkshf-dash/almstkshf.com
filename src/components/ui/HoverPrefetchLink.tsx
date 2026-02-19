'use client';

import { Link } from '@/i18n/routing';
import { useState } from 'react';
import { ComponentPropsWithoutRef } from 'react';

type HoverPrefetchLinkProps = ComponentPropsWithoutRef<typeof Link>;

export function HoverPrefetchLink({
    children,
    prefetch: prefetchProp,
    onMouseEnter,
    ...props
}: HoverPrefetchLinkProps) {
    const [shouldPrefetch, setShouldPrefetch] = useState(false);

    return (
        <Link
            {...props}
            prefetch={shouldPrefetch ? (prefetchProp === undefined ? true : prefetchProp) : false}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                setShouldPrefetch(true);
                onMouseEnter?.(e);
            }}
        >
            {children}
        </Link>
    );
}
