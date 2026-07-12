/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import * as React from "react";
import { useRouter } from "@/i18n/routing";
import { Command } from "cmdk";
import { useTranslations } from "next-intl";
import {
    LayoutDashboard,
    Search,
    Settings,
    Moon,
    Sun,
    Laptop,
    Home,
    ChevronRight,
    SearchSlash
} from "lucide-react";
import { useTheme } from "next-themes";
import { NAVIGATION_ITEMS } from "@/lib/navigation";
import { useCommandMenu } from "@/components/providers/KeyboardShortcutsProvider";

const ITEM_CLASS = "relative flex cursor-pointer select-none items-center rounded-xl px-3 py-3 text-sm outline-none aria-selected:bg-primary/10 aria-selected:text-primary hover:bg-muted transition-colors group";
const ICON_CONTAINER_CLASS = "me-3 flex h-8 w-8 items-center justify-center rounded-lg bg-muted group-aria-selected:bg-primary/20 transition-colors";

interface CommandMenuItemProps {
    value: string;
    onSelect: () => void;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    subLabel?: string;
}

function CommandMenuItem({
    value,
    onSelect,
    icon: Icon,
    label,
    subLabel
}: CommandMenuItemProps) {
    return (
        <Command.Item
            value={value}
            onSelect={onSelect}
            className={ITEM_CLASS}
        >
            <div className={ICON_CONTAINER_CLASS}>
                <Icon aria-hidden="true" className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
                <span className="font-medium">{label}</span>
                {subLabel && (
                    <span className="text-[10px] text-foreground/70 font-medium line-clamp-1">
                        {subLabel}
                    </span>
                )}
            </div>
            <ChevronRight aria-hidden="true" className="ms-auto h-4 w-4 opacity-0 group-aria-selected:opacity-100 transition-opacity rtl:rotate-180" />
        </Command.Item>
    );
}

function ThemeCommandItems({ runCommand, t }: { runCommand: (cmd: () => void) => void; t: ReturnType<typeof useTranslations<"Common">> }) {
    const { setTheme } = useTheme();
    return (
        <>
            <Command.Item
                value="light theme"
                onSelect={() => runCommand(() => setTheme("light"))}
                className={ITEM_CLASS}
            >
                <div className={ICON_CONTAINER_CLASS}>
                    <Sun aria-hidden="true" className="h-4 w-4" />
                </div>
                <span className="font-medium">{t("theme_light") || "Light Theme"}</span>
            </Command.Item>

            <Command.Item
                value="dark theme"
                onSelect={() => runCommand(() => setTheme("dark"))}
                className={ITEM_CLASS}
            >
                <div className={ICON_CONTAINER_CLASS}>
                    <Moon aria-hidden="true" className="h-4 w-4" />
                </div>
                <span className="font-medium">{t("theme_dark") || "Dark Theme"}</span>
            </Command.Item>

            <Command.Item
                value="system theme"
                onSelect={() => runCommand(() => setTheme("system"))}
                className={ITEM_CLASS}
            >
                <div className={ICON_CONTAINER_CLASS}>
                    <Laptop aria-hidden="true" className="h-4 w-4" />
                </div>
                <span className="font-medium">{t("theme_system") || "System Theme"}</span>
            </Command.Item>
        </>
    );
}

interface NavigationCommandItemsProps {
    runCommand: (cmd: () => void) => void;
    router: ReturnType<typeof useRouter>;
    tNav: ReturnType<typeof useTranslations<"Navigation">>;
}

function NavigationCommandItems({ runCommand, router, tNav }: NavigationCommandItemsProps) {
    return (
        <>
            {NAVIGATION_ITEMS.map((item) => {
                if (item.children) {
                    return item.children.map((child) => {
                        const label = tNav(child.label);
                        const parentLabel = tNav(item.label);
                        const searchVal = [
                            label,
                            child.href || "",
                            parentLabel
                        ].filter(Boolean).join(" ");

                        return (
                            <CommandMenuItem
                                key={child.href}
                                value={searchVal}
                                onSelect={() => {
                                    const path = child.href;
                                    if (path) {
                                        runCommand(() => router.push(path));
                                    }
                                }}
                                icon={child.icon || Search}
                                label={label}
                                subLabel={parentLabel}
                            />
                        );
                    });
                }

                if (!item.href || item.href === "/" || item.label === "landing_page") return null;

                const label = tNav(item.label);
                const searchVal = [
                    label,
                    item.href || ""
                ].filter(Boolean).join(" ");

                return (
                    <CommandMenuItem
                        key={item.href}
                        value={searchVal}
                        onSelect={() => {
                            const path = item.href;
                            if (path) {
                                runCommand(() => router.push(path));
                            }
                        }}
                        icon={item.icon || Home}
                        label={label}
                    />
                );
            })}
        </>
    );
}

export function CommandMenu() {
    const { open, setOpen } = useCommandMenu();
    const router = useRouter();
    const t = useTranslations("Common");
    const tNav = useTranslations("Navigation");

    const previousFocus = React.useRef<HTMLElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Handle focus preservation and auto focus input
    React.useEffect(() => {
        if (open) {
            previousFocus.current = document.activeElement as HTMLElement;
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
            return () => clearTimeout(timer);
        } else {
            previousFocus.current?.focus();
        }
    }, [open]);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, [setOpen]);

    if (!open) return null;

    return (
        /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
        <div
            className="fixed inset-0 z-[999] bg-background/80 backdrop-blur-sm flex items-start justify-center p-4 sm:p-6 md:p-20 animate-fade-in duration-200"
            onClick={() => setOpen(false)}
        >
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="command-search-title"
                aria-describedby="command-search-description"
                className="w-full max-w-2xl shadow-2xl rounded-2xl overflow-hidden border border-border bg-popover animate-slide-in-from-top duration-300 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* WAI-ARIA Screen Reader Title & Description */}
                <h2 id="command-search-title" className="sr-only">
                    {t('search_placeholder') || "Command Menu"}
                </h2>
                <span id="command-search-description" className="sr-only">
                    Search pages, tools, themes, and settings.
                </span>
                
                <Command
                    className="flex h-full w-full flex-col overflow-hidden rounded-2xl"
                    label="Command Menu"
                >
                    <div className="flex items-center border-b border-border px-4 py-3" cmdk-input-wrapper="">
                        <Search aria-hidden="true" className="me-3 h-5 w-5 shrink-0 opacity-50" />
                        <label htmlFor="command-search-input" className="sr-only">
                            {t('search_placeholder') || "Search for pages, tools, or settings..."}
                        </label>
                        <Command.Input
                            ref={inputRef}
                            id="command-search-input"
                            aria-label={t('search_placeholder') || "Search for pages, tools, or settings..."}
                            name="search"
                            placeholder={t('search_placeholder') || "Search for pages, tools, or settings..."}
                            autoComplete="off"
                            className="flex h-10 w-full rounded-md bg-transparent py-3 text-base outline-none placeholder:text-foreground/50 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <div className="hidden sm:flex items-center gap-1 ms-auto">
                            <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-bold text-foreground/70">ESC</kbd>
                        </div>
                    </div>

                    <Command.List className="max-h-[70vh] overflow-y-auto overflow-x-hidden p-2 scrollbar-thin">
                        <Command.Empty className="py-12 flex flex-col items-center justify-center gap-3 text-foreground/60">
                            <SearchSlash aria-hidden="true" className="h-10 w-10 opacity-20" />
                            <p className="text-sm">{t('no_results') || "No matches found for your search."}</p>
                        </Command.Empty>

                        <Command.Group
                            heading={tNav('dashboard') || "Personal"}
                            className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest mb-2 px-3 pt-2"
                        >
                            <CommandMenuItem
                                value="dashboard"
                                onSelect={() => runCommand(() => router.push("/dashboard"))}
                                icon={LayoutDashboard}
                                label={tNav('dashboard')}
                            />
                        </Command.Group>

                        <Command.Group
                            heading={tNav('media_monitoring') || "Media & Intelligence"}
                            className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest mb-2 mt-4 px-3 pt-2"
                        >
                            <NavigationCommandItems
                                runCommand={runCommand}
                                router={router}
                                tNav={tNav}
                            />
                        </Command.Group>

                        <Command.Group
                            heading={tNav('settings') || "System & Settings"}
                            className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest mb-2 mt-4 px-3 pt-2"
                        >
                            <CommandMenuItem
                                value="settings"
                                onSelect={() => runCommand(() => router.push("/dashboard/settings"))}
                                icon={Settings}
                                label={tNav('settings')}
                            />

                            <ThemeCommandItems runCommand={runCommand} t={t} />
                        </Command.Group>
                    </Command.List>
                </Command>
            </div>
        </div>
    );
}
