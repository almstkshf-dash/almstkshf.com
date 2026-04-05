"use client";

import { ReactNode, useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ConvexClientProvider } from "@/app/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";


interface RootProvidersProps {
    children: ReactNode;
    locale: string;
    messages: any;
}

/**
 * RootProviders consolidates all client-side providers to ensure consistent
 * hydration and prevent state mismatches. By wrapping providers in a single 
 * client component, we align global attributes and synchronization logic.
 */
export function RootProviders({ children, locale, messages }: RootProvidersProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <ClerkProvider><NextIntlClientProvider locale={locale} messages={messages}><ConvexClientProvider><ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>{children}</ThemeProvider></ConvexClientProvider></NextIntlClientProvider></ClerkProvider>
    );
}
