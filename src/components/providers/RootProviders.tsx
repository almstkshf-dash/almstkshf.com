/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import { ReactNode, useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ConvexClientProvider } from "@/app/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";


interface RootProvidersProps {
    children: ReactNode;
    locale: string;
    messages: Record<string, unknown>;
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

    return (<ClerkProvider telemetry={false}><NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC"><ConvexClientProvider><ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>{children}</ThemeProvider></ConvexClientProvider></NextIntlClientProvider></ClerkProvider>
    );
}
