/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

/**
 * LazyLayoutParts â€” Client Component wrapper.
 *
 * TBT FIX: `ssr: false` dynamic imports are only allowed inside Client Components.
 * We group all below-fold / on-demand layout parts here so they are excluded
 * from the initial JS bundle and parsed AFTER the main thread becomes interactive.
 *
 * Savings:
 *  - CommandMenu (cmdk)   ~35 KB parsed JS â€” only needed on âŒ˜K
 *  - Footer               ~18 KB parsed JS â€” entirely below the fold
 *  - Toaster (sonner)     ~20 KB parsed JS â€” only needed when a toast fires
 *  - ChatbaseWidget       external script   â€” lazyOnload anyway
 */
import { memo } from "react";
import dynamic from "next/dynamic";

const CommandMenu = dynamic(
    () => import("@/components/CommandMenu").then(m => ({ default: m.CommandMenu })),
    { ssr: false }
);

const Footer = dynamic(
    () => import("@/components/Footer"),
    { ssr: false }
);

const Toaster = dynamic(
    () => import("sonner").then(m => ({ default: m.Toaster })),
    { ssr: false }
);

const ChatbaseWidget = dynamic(
    () => import("@/components/ChatbaseWidget"),
    { ssr: false }
);

export default memo(function LazyLayoutParts() {
    return (
        <>
            <CommandMenu />
            <Toaster richColors position="top-center" />
            <Footer />
            <ChatbaseWidget />
        </>
    );
});
