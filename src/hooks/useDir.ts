/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import { useLocale } from "next-intl";

/**
 * Returns the current text direction derived from the active next-intl locale.
 *
 * Usage:
 *   const { dir, isRTL } = useDir();
 *   <div dir={dir}>…</div>
 *
 * Note: The root <html> element already carries the correct `dir` attribute
 * set server-side in layout.tsx, so the browser handles most layout mirroring
 * automatically. Use this hook only when you need to conditionally apply
 * JS-driven layout logic (e.g. Framer Motion offsets, conditional class names).
 */
export function useDir(): { dir: "rtl" | "ltr"; isRTL: boolean } {
    const locale = useLocale();
    const isRTL = locale === "ar";
    return { dir: isRTL ? "rtl" : "ltr", isRTL };
}
