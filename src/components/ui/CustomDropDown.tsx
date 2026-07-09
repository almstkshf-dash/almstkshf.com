/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

/**
 * CustomDropDown — 3-slice styled <select> wrapper.
 *
 * Replaces the native browser select border with three asset slices:
 *   DropDown-start.png  — fixed-width leading cap
 *   DropDown-mid.png    — horizontally-repeating centre fill
 *   DropDown-end.png    — fixed-width trailing cap with arrow area
 *
 * The native <select> arrow is hidden; DropDown-arrow.png is injected as
 * an absolutely-positioned pseudo-element via the `.custom-dropdown-arrow`
 * class (defined in globals.css).
 *
 * The component is RTL-aware: in [dir=rtl] the start/end caps visually swap
 * because the flex-row direction is reversed by the browser's bidirectional
 * layout engine — no JS locale check needed.
 *
 * Asset paths (place files under /public/blocks/ui/):
 *   DropDown-start.png
 *   DropDown-mid.png
 *   DropDown-end.png
 *   DropDown-arrow.png
 *
 * Usage:
 *   <CustomDropDown id="locale" value={locale} onChange={handleChange}>
 *     <option value="en">English</option>
 *     <option value="ar">العربية</option>
 *   </CustomDropDown>
 */

import { SelectHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface CustomDropDownProps extends SelectHTMLAttributes<HTMLSelectElement> {
    /** Label used by assistive technology */
    label?: string;
    /** Height of the control in px — all three slices share this height */
    height?: number;
    /** Fixed pixel width of the start and end caps */
    capWidth?: number;
}

const CAP_H = 40;
const CAP_W = 16;

const CustomDropDown = forwardRef<HTMLSelectElement, CustomDropDownProps>(
    function CustomDropDown(
        { label, height = CAP_H, capWidth = CAP_W, className, children, ...props },
        ref
    ) {
        const capStyle: React.CSSProperties = {
            width: capWidth,
            height,
            flexShrink: 0,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
        };

        const midStyle: React.CSSProperties = {
            height,
            backgroundImage: "url('/blocks/ui/DropDown-mid.png')",
            backgroundRepeat: "repeat-x",
            backgroundSize: "auto 100%",
            flexGrow: 1,
            position: "relative",
        };

        return (
            <div
                className={clsx("custom-dropdown flex flex-row items-stretch overflow-hidden", className)}
                role="presentation"
            >
                {/* Start cap */}
                <div
                    style={{
                        ...capStyle,
                        backgroundImage: "url('/blocks/ui/DropDown-start.png')",
                    }}
                    aria-hidden="true"
                />

                {/* Middle fill — contains the native <select> element */}
                <div style={midStyle}>
                    {/*
                     * Native <select>: appearance-none removes the browser chrome so
                     * the custom asset frame shows through. The arrow is injected via
                     * .custom-dropdown-arrow in globals.css using DropDown-arrow.png.
                     */}
                    <select
                        ref={ref}
                        aria-label={label}
                        className={clsx(
                            "custom-dropdown-arrow",
                            "w-full h-full bg-transparent",
                            "appearance-none outline-none border-none",
                            "text-foreground cursor-pointer",
                            "ps-2 pe-8",           // logical padding — arrow occupies end side
                            "text-sm font-medium",
                        )}
                        {...props}
                    >
                        {children}
                    </select>
                </div>

                {/* End cap (arrow visual area) */}
                <div
                    style={{
                        ...capStyle,
                        backgroundImage: "url('/blocks/ui/DropDown-end.png')",
                    }}
                    aria-hidden="true"
                />
            </div>
        );
    }
);

export default CustomDropDown;
