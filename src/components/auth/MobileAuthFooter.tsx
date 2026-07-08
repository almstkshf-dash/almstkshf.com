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

export default MobileAuthFooter;
