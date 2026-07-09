/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

/**
 * KeyboardShortcutsProvider
 *
 * Registers global keyboard shortcuts for the entire application.
 * This component is mounted eagerly (not via dynamic import) so the
 * shortcuts are available immediately — the Ctrl+K / Cmd+K shortcut
 * to open the Command Menu works even before the cmdk bundle loads.
 *
 * Shortcuts registered here:
 *  - Ctrl+K / Cmd+K  → open Command Menu (dispatches a custom event)
 *  - /               → focus Command Menu search (same event, from non-editable context)
 */

import { useEffect, useCallback, createContext, useContext, useState } from "react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface CommandMenuContextValue {
    open: boolean;
    setOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

const CommandMenuContext = createContext<CommandMenuContextValue>({
    open: false,
    setOpen: () => {},
});

export function useCommandMenu() {
    return useContext(CommandMenuContext);
}

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
    const [commandMenuOpen, setCommandMenuOpen] = useState(false);

    const openCommandMenu = useCallback(() => {
        setCommandMenuOpen((prev) => !prev);
    }, []);

    const closeCommandMenu = useCallback(() => {
        setCommandMenuOpen(false);
    }, []);

    useKeyboardShortcuts([
        // Ctrl+K / Cmd+K — toggle Command Menu
        {
            key: "k",
            ctrlOrMeta: true,
            handler: openCommandMenu,
        },
        // Escape — close Command Menu when open
        {
            key: "Escape",
            noPreventDefault: true,
            handler: closeCommandMenu,
        },
        // "/" key — open Command Menu from non-editable context (like GitHub's / shortcut)
        {
            key: "/",
            noPreventDefault: false,
            handler: openCommandMenu,
        },
    ]);

    return (
        <CommandMenuContext.Provider value={{ open: commandMenuOpen, setOpen: setCommandMenuOpen }}>
            {children}
        </CommandMenuContext.Provider>
    );
}
