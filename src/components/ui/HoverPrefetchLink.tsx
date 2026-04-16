/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

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
