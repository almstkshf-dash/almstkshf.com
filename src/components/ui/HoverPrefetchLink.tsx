'use client';

import Link, { LinkProps } from 'next/link';
import { useState } from 'react';
import { ComponentPropsWithoutRef } from 'react';

type HoverPrefetchLinkProps = LinkProps & ComponentPropsWithoutRef<'a'> & {
    children: React.ReactNode;
};

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
            onMouseEnter={(e) => {
                setShouldPrefetch(true);
                onMouseEnter?.(e);
            }}
        >
            {children}
        </Link>
    );
}
