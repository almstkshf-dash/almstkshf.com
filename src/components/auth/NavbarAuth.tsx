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

interface NavbarAuthProps {
    loginLabel: string;
    dashboardLabel: string;
    settingsLabel: string;
    getStartedLabel: string;
    iconSm: string;
}

export const NavbarAuth = memo(function NavbarAuth({
    loginLabel,
    dashboardLabel,
    settingsLabel,
    getStartedLabel,
    iconSm,
}: NavbarAuthProps) {
    return (
        <>
            {/* ——— Desktop auth ——— */}
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
            {/* ——— Mobile auth ——— */}
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

export default NavbarAuth;
