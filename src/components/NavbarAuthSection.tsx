/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";
import { memo } from "react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Settings } from "lucide-react";
import { HoverPrefetchLink } from "@/components/ui/HoverPrefetchLink";

interface NavbarAuthSectionProps {
    loginLabel: string;
    dashboardLabel: string;
    settingsLabel: string;
    getStartedLabel: string;
    /** Pass the icon size class e.g. "w-4 h-4" */
    iconSm: string;
    onGetStartedClick?: () => void;
}

/**
 * Thin wrapper around Clerk auth UI components.
 * Dynamically imported in Navbar with { ssr: false } so the Clerk chunk
 * is excluded from the initial page bundle and only loaded after hydration.
 */
const NavbarAuthSection = memo(function NavbarAuthSection({
    loginLabel,
    dashboardLabel,
    settingsLabel,
    getStartedLabel,
    iconSm,
}: NavbarAuthSectionProps) {
    return (
        <>
            {/* â”€â”€â”€ Desktop auth â”€â”€â”€ */}
            <div className="hidden lg:flex items-center gap-2">
                <Show when="signed-out">
                    <SignInButton mode="modal">
                        <button className="px-4 py-2 text-sm font-medium text-foreground/85 hover:text-foreground transition-colors">
                            {loginLabel}
                        </button>
                    </SignInButton>
                    <HoverPrefetchLink
                        href="/contact"
                        className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all whitespace-nowrap"
                    >
                        {getStartedLabel}
                    </HoverPrefetchLink>
                </Show>

                <Show when="signed-in">
                    <HoverPrefetchLink
                        href="/dashboard"
                        className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-foreground bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                    >
                        <LayoutDashboard className={`${iconSm} shrink-0`} aria-hidden="true" />
                        <span className="whitespace-nowrap">{dashboardLabel}</span>
                    </HoverPrefetchLink>
                    <HoverPrefetchLink
                        href="/dashboard/settings"
                        className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border"
                        dir="ltr"
                    >
                        <Settings className={`${iconSm} shrink-0`} aria-hidden="true" />
                        <span className="whitespace-nowrap">{settingsLabel}</span>
                    </HoverPrefetchLink>
                    <UserButton
                        appearance={{
                            elements: {
                                userButtonAvatarBox: "w-9 h-9 border-2 border-border hover:border-primary transition-colors",
                                userButtonTrigger: "focus:shadow-none focus:outline-none"
                            }
                        }} />
                </Show>
            </div>
            {/* â”€â”€â”€ Mobile auth â”€â”€â”€ */}
            <div className="lg:hidden flex items-center gap-2">
                <Show when="signed-in">
                    <HoverPrefetchLink
                        href="/dashboard"
                        className="w-9 h-9 rounded-full border border-border bg-background hover:bg-muted transition-colors flex items-center justify-center text-primary"
                        aria-label={dashboardLabel}
                    >
                        <LayoutDashboard className={iconSm} aria-hidden="true" />
                    </HoverPrefetchLink>
                    <UserButton
                        appearance={{
                            elements: {
                                userButtonAvatarBox: "w-9 h-9 border border-border",
                                userButtonTrigger: "focus:shadow-none focus:outline-none"
                            }
                        }} />
                </Show>
            </div>
        </>
    );
});

export default NavbarAuthSection;

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Mobile menu footer auth â€” used by the mobile drawer
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
interface MobileAuthFooterProps {
    getStartedLabel: string;
    dashboardLabel: string;
    settingsLabel: string;
    iconSm: string;
    onClose: () => void;
}

export const MobileAuthFooter = memo(function MobileAuthFooter({
    getStartedLabel,
    dashboardLabel,
    settingsLabel,
    iconSm,
    onClose,
}: MobileAuthFooterProps) {
    return (
        <>
            <Show when="signed-out">
                <SignInButton mode="modal">
                    <button className="w-full py-3 text-base font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        {getStartedLabel}
                    </button>
                </SignInButton>
            </Show>
            <Show when="signed-in">
                <div className="flex flex-col gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-3">
                            <UserButton />
                            <span className="font-medium text-foreground text-sm">Account</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <HoverPrefetchLink
                            href="/dashboard"
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors border border-primary/20"
                        >
                            <LayoutDashboard className={iconSm} aria-hidden="true" />
                            <span>{dashboardLabel}</span>
                        </HoverPrefetchLink>
                        <HoverPrefetchLink
                            href="/dashboard/settings"
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors border border-border"
                        >
                            <Settings className={iconSm} aria-hidden="true" />
                            <span>{settingsLabel}</span>
                        </HoverPrefetchLink>
                    </div>
                </div>
            </Show>
        </>
    );
});
