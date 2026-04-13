"use client";

import * as React from "react";
import { useRouter } from "@/i18n/routing";
import { Command } from "cmdk";
import { useTranslations } from "next-intl";
import {
    LayoutDashboard,
    Search,
    Settings,
    User,
    CreditCard,
    Moon,
    Sun,
    Laptop,
    Home,
    Activity,
    ShieldAlert,
    Users,
    ChevronRight,
    SearchSlash
} from "lucide-react";
import { useTheme } from "next-themes";
import { NAVIGATION_ITEMS } from "@/lib/navigation";

function ThemeCommandItems({ runCommand }: { runCommand: (cmd: () => void) => void }) {
    const { setTheme } = useTheme();
    return (
        <>
            <Command.Item
                value="light theme"
                onSelect={() => runCommand(() => setTheme("light"))}
                className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-3 text-sm outline-none aria-selected:bg-primary/10 aria-selected:text-primary hover:bg-muted transition-colors group"
            >
                <div className="me-3 flex h-8 w-8 items-center justify-center rounded-lg bg-muted group-aria-selected:bg-primary/20 transition-colors">
                    <Sun className="h-4 w-4" />
                </div>
                <span className="font-medium">Light Theme</span>
            </Command.Item>

            <Command.Item
                value="dark theme"
                onSelect={() => runCommand(() => setTheme("dark"))}
                className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-3 text-sm outline-none aria-selected:bg-primary/10 aria-selected:text-primary hover:bg-muted transition-colors group"
            >
                <div className="me-3 flex h-8 w-8 items-center justify-center rounded-lg bg-muted group-aria-selected:bg-primary/20 transition-colors">
                    <Moon className="h-4 w-4" />
                </div>
                <span className="font-medium">Dark Theme</span>
            </Command.Item>
        </>
    );
}

export function CommandMenu() {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();
    const t = useTranslations("Common");
    const tNav = useTranslations("Navigation");

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
            if (e.key === "Escape" && open) {
                setOpen(false);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [open]);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[999] bg-background/80 backdrop-blur-sm flex items-start justify-center p-4 sm:p-6 md:p-20 animate-in fade-in duration-200"
            onClick={() => setOpen(false)}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="command-search-title"
                className="w-full max-w-2xl shadow-2xl rounded-2xl overflow-hidden border border-border bg-popover animate-in slide-in-from-top-4 duration-300 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* WAI-ARIA Screen Reader Title */}
                <h2 id="command-search-title" className="sr-only">
                    {t('search_placeholder') || "Command Menu"}
                </h2>
                <Command
                    className="flex h-full w-full flex-col overflow-hidden rounded-2xl"
                    label="Command Menu"
                >
                    <div className="flex items-center border-b border-border px-4 py-3" cmdk-input-wrapper="">
                        <Search className="me-3 h-5 w-5 shrink-0 opacity-50" />
                        <label htmlFor="command-search-input" className="sr-only">
                            {t('search_placeholder') || "Search for pages, tools, or settings..."}
                        </label>
                        <Command.Input
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
                            <SearchSlash className="h-10 w-10 opacity-20" />
                            <p className="text-sm">{t('no_results') || "No matches found for your search."}</p>
                        </Command.Empty>

                        <Command.Group
                            heading={tNav('dashboard') || "Personal"}
                            className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest mb-2 px-3 pt-2"
                        >
                            <Command.Item
                                value="dashboard"
                                onSelect={() => runCommand(() => router.push("/dashboard"))}
                                className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-3 text-sm outline-none aria-selected:bg-primary/10 aria-selected:text-primary hover:bg-muted transition-colors group"
                            >
                                <div className="me-3 flex h-8 w-8 items-center justify-center rounded-lg bg-muted group-aria-selected:bg-primary/20 transition-colors">
                                    <LayoutDashboard className="h-4 w-4" />
                                </div>
                                <span className="font-medium">{tNav('dashboard')}</span>
                                <ChevronRight className="ms-auto h-4 w-4 opacity-0 group-aria-selected:opacity-100 transition-opacity" />
                            </Command.Item>
                        </Command.Group>

                        <Command.Group
                            heading={tNav('media_monitoring') || "Media & Intelligence"}
                            className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest mb-2 mt-4 px-3 pt-2"
                        >
                            {NAVIGATION_ITEMS.map((item) => {
                                if (item.children) {
                                    return item.children.map((child) => (
                                        <Command.Item
                                            key={child.href}
                                            value={tNav(child.label)}
                                            onSelect={() => runCommand(() => router.push(child.href as any))}
                                            className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-3 text-sm outline-none aria-selected:bg-primary/10 aria-selected:text-primary hover:bg-muted transition-colors group"
                                        >
                                            <div className="me-3 flex h-8 w-8 items-center justify-center rounded-lg bg-muted group-aria-selected:bg-primary/20 transition-colors">
                                                {child.icon ? <child.icon className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{tNav(child.label)}</span>
                                                <span className="text-[10px] text-foreground/70 font-medium line-clamp-1">{tNav(item.label)}</span>
                                            </div>
                                            <ChevronRight className="ms-auto h-4 w-4 opacity-0 group-aria-selected:opacity-100 transition-opacity" />
                                        </Command.Item>
                                    ));
                                }

                                if (!item.href || item.href === "/" || item.label === "landing_page") return null;

                                return (
                                    <Command.Item
                                        key={item.href}
                                        value={tNav(item.label)}
                                        onSelect={() => runCommand(() => router.push(item.href as any))}
                                        className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-3 text-sm outline-none aria-selected:bg-primary/10 aria-selected:text-primary hover:bg-muted transition-colors group"
                                    >
                                        <div className="me-3 flex h-8 w-8 items-center justify-center rounded-lg bg-muted group-aria-selected:bg-primary/20 transition-colors">
                                            {item.icon ? <item.icon className="h-4 w-4" /> : <Home className="h-4 w-4" />}
                                        </div>
                                        <span className="font-medium">{tNav(item.label)}</span>
                                        <ChevronRight className="ms-auto h-4 w-4 opacity-0 group-aria-selected:opacity-100 transition-opacity" />
                                    </Command.Item>
                                );
                            })}
                        </Command.Group>

                        <Command.Group
                            heading={tNav('settings') || "System & Settings"}
                            className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest mb-2 mt-4 px-3 pt-2"
                        >
                            <Command.Item
                                value="settings"
                                onSelect={() => runCommand(() => router.push("/dashboard/settings"))}
                                className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-3 text-sm outline-none aria-selected:bg-primary/10 aria-selected:text-primary hover:bg-muted transition-colors group"
                            >
                                <div className="me-3 flex h-8 w-8 items-center justify-center rounded-lg bg-muted group-aria-selected:bg-primary/20 transition-colors">
                                    <Settings className="h-4 w-4" />
                                </div>
                                <span className="font-medium">{tNav('settings')}</span>
                                <ChevronRight className="ms-auto h-4 w-4 opacity-0 group-aria-selected:opacity-100 transition-opacity" />
                            </Command.Item>

                            <ThemeCommandItems runCommand={runCommand} />
                        </Command.Group>
                    </Command.List>
                </Command>
            </div>
        </div>
    );
}

