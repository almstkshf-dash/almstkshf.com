/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const [mounted, setMounted] = React.useState(false);
    const { theme, setTheme } = useTheme();

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-9 h-9 rounded-full border border-border bg-background animate-pulse" />;
    }

    return (
        <button
            onClick={() => {
                React.startTransition(() => {
                    setTheme(theme === "light" ? "dark" : "light");
                });
            }}
            className="w-9 h-9 rounded-full border border-border bg-background hover:bg-muted transition-colors flex items-center justify-center relative"
        >
            <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0 text-foreground" aria-hidden="true" />
            <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100 text-foreground" aria-hidden="true" />
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}
