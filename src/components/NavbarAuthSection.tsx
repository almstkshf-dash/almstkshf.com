"use client";
import { memo } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
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
            {/* ─── Desktop auth ─── */}
            <div className="hidden lg:flex items-center gap-2">
                <SignedOut>
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
                </SignedOut>

                <SignedIn>
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
                        afterSignOutUrl="/"
                        appearance={{
                            elements: {
                                userButtonAvatarBox: "w-9 h-9 border-2 border-border hover:border-primary transition-colors",
                                userButtonTrigger: "focus:shadow-none focus:outline-none"
                            }
                        }}
                    />
                </SignedIn>
            </div>

            {/* ─── Mobile auth ─── */}
            <div className="lg:hidden flex items-center gap-2">
                <SignedIn>
                    <HoverPrefetchLink
                        href="/dashboard"
                        className="w-9 h-9 rounded-full border border-border bg-background hover:bg-muted transition-colors flex items-center justify-center text-primary"
                        aria-label={dashboardLabel}
                    >
                        <LayoutDashboard className={iconSm} aria-hidden="true" />
                    </HoverPrefetchLink>
                    <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                            elements: {
                                userButtonAvatarBox: "w-9 h-9 border border-border",
                                userButtonTrigger: "focus:shadow-none focus:outline-none"
                            }
                        }}
                    />
                </SignedIn>
            </div>
        </>
    );
});

export default NavbarAuthSection;

/* ─────────────────────────────────────────────────────────────
   Mobile menu footer auth — used by the mobile drawer
───────────────────────────────────────────────────────────── */
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
            <SignedOut>
                <SignInButton mode="modal">
                    <button className="w-full py-3 text-base font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        {getStartedLabel}
                    </button>
                </SignInButton>
            </SignedOut>

            <SignedIn>
                <div className="flex flex-col gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-3">
                            <UserButton afterSignOutUrl="/" />
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
            </SignedIn>
        </>
    );
});
