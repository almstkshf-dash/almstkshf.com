"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useTranslations } from "next-intl";
import {
    LayoutDashboard,
    Search,
    Settings,
    User,
    CreditCard,
    LogOut,
    Moon,
    Sun,
    Laptop
} from "lucide-react";
import { useTheme } from "next-themes";
import { clsx } from "clsx";

export function CommandMenu() {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();
    const t = useTranslations("Common"); // Assuming common translations exist
    const { setTheme } = useTheme();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[999] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg shadow-2xl rounded-xl overflow-hidden border border-border animate-in slide-in-from-top-2 duration-300">
                <Command className="bg-popover text-popover-foreground w-full">
                    <div className="flex items-center border-b border-border px-3" cmdk-input-wrapper="">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Command.Input
                            placeholder={t('search_placeholder') || "Search..."}
                            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                        <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                            {t('no_results') || "No results found."}
                        </Command.Empty>

                        <Command.Group heading="Navigation" className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-2">
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/dashboard"))}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            >
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span>Dashboard</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/media-monitoring/central-media-repository"))}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            >
                                <Search className="mr-2 h-4 w-4" />
                                <span>Media Repository</span>
                            </Command.Item>
                        </Command.Group>

                        <Command.Group heading="Settings" className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 mt-4 px-2">
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/settings"))}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            >
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/settings"))}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            >
                                <CreditCard className="mr-2 h-4 w-4" />
                                <span>Billing</span>
                            </Command.Item>
                        </Command.Group>

                        <Command.Group heading="Theme" className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 mt-4 px-2">
                            <Command.Item
                                onSelect={() => runCommand(() => setTheme("light"))}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            >
                                <Sun className="mr-2 h-4 w-4" />
                                <span>Light</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => setTheme("dark"))}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            >
                                <Moon className="mr-2 h-4 w-4" />
                                <span>Dark</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => setTheme("system"))}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            >
                                <Laptop className="mr-2 h-4 w-4" />
                                <span>System</span>
                            </Command.Item>
                        </Command.Group>
                    </Command.List>
                </Command>
            </div>
        </div>
    );
}
