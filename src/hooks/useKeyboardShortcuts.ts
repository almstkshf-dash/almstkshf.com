/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { useEffect } from "react";

export type KeyboardShortcut = {
    /** The key value (e.g. "k", "Escape", "/") */
    key: string;
    /** Require Ctrl or Meta (Cmd on Mac) */
    ctrlOrMeta?: boolean;
    /** Require Shift */
    shift?: boolean;
    /** Require Alt */
    alt?: boolean;
    /** Handler to invoke */
    handler: (e: KeyboardEvent) => void;
    /** Do not call preventDefault (default: false — preventDefault IS called) */
    noPreventDefault?: boolean;
};

/**
 * Registers global keydown listeners for the given shortcuts.
 * Listeners are attached to `document` and cleaned up on unmount.
 *
 * @example
 * useKeyboardShortcuts([
 *   { key: "k", ctrlOrMeta: true, handler: () => setOpen(true) },
 *   { key: "Escape", handler: () => setOpen(false) },
 * ]);
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
    useEffect(() => {
        if (shortcuts.length === 0) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Skip shortcuts when typing inside editable elements unless the shortcut uses a modifier
            const target = e.target as HTMLElement;
            const isEditable =
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable;

            for (const shortcut of shortcuts) {
                const keyMatch = e.key === shortcut.key || e.key.toLowerCase() === shortcut.key.toLowerCase();
                const ctrlMatch = !shortcut.ctrlOrMeta || e.ctrlKey || e.metaKey;
                const shiftMatch = !shortcut.shift || e.shiftKey;
                const altMatch = !shortcut.alt || e.altKey;

                if (!keyMatch || !ctrlMatch || !shiftMatch || !altMatch) continue;

                // Suppress shortcuts that have no modifier when focus is on editable elements
                if (isEditable && !shortcut.ctrlOrMeta && !shortcut.alt) continue;

                if (!shortcut.noPreventDefault) e.preventDefault();
                shortcut.handler(e);
                break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [shortcuts]);
}
