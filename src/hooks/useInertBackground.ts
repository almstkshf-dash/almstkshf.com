/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { useEffect, RefObject } from 'react';

/**
 * Applies `inert` to all direct children of `<body>` except the element
 * that contains `containerRef`, while also locking background scroll.
 *
 * This replaces the fragile `aria-hidden="true"` pattern that causes
 * focus-trap violations (e.g. Clerk UserButton focused inside a hidden header).
 *
 * @param isOpen  Whether the overlay / dialog is currently open.
 * @param containerRef  Ref to an element inside the overlay portal so
 *                      we know which body-child to keep interactive.
 */
export function useInertBackground(
    isOpen: boolean,
    containerRef: RefObject<HTMLElement | null>
) {
    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const inertedElements: HTMLElement[] = [];
        const bodyChildren = document.body.children;

        for (let i = 0; i < bodyChildren.length; i++) {
            const el = bodyChildren[i] as HTMLElement;

            if (
                !(el instanceof HTMLElement) ||
                el.hasAttribute('inert') ||
                el.tagName === 'SCRIPT' ||
                el.tagName === 'STYLE'
            ) continue;

            // Don't inert the element that contains our dialog/modal
            if (containerRef.current && el.contains(containerRef.current)) continue;

            el.setAttribute('inert', '');
            inertedElements.push(el);
        }

        return () => {
            document.body.style.overflow = originalOverflow;
            for (const el of inertedElements) {
                el.removeAttribute('inert');
            }
        };
    }, [isOpen, containerRef]);
}
