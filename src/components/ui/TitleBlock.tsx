/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

/**
 * TitleBlock — 3-slice horizontal banner component.
 *
 * Assembles three assets in a flex-row:
 *   TitleBlock_start.png   — fixed-width left/start cap
 *   TitleBlock_middle.png  — horizontally-repeating centre fill (repeat-x, contain)
 *   TitleBlock_end.png     — fixed-width right/end cap
 *
 * The middle tile grows to fit the title text length automatically.
 * In RTL mode the flex-row direction reverses via `[dir=rtl]` so the
 * start/end caps remain visually correct without any JS intervention.
 *
 * Asset paths (place files under /public/blocks/ui/):
 *   TitleBlock_start.png
 *   TitleBlock_middle.png
 *   TitleBlock_end.png
 *
 * Usage:
 *   <TitleBlock>Campaign Reports</TitleBlock>
 *   <TitleBlock as="h3" className="text-lg">Character Sheets</TitleBlock>
 */

import { ReactNode, CSSProperties } from "react";
import clsx from "clsx";

interface TitleBlockProps {
    children: ReactNode;
    /** Rendered heading element — defaults to h2 */
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
    className?: string;
    /** Height of the block in px — controls all three slice heights */
    height?: number;
    /** Fixed pixel width of the start and end cap images */
    capWidth?: number;
}

const CAP_H = 40;   // default block height (px)
const CAP_W = 32;   // default cap width (px)

export default function TitleBlock({
    children,
    as: tag = "h2",
    className,
    height = CAP_H,
    capWidth = CAP_W,
}: TitleBlockProps) {
    const Tag = tag as "h2"; // narrow to allow JSX usage with style + className props

    const capStyle: CSSProperties = {
        width: capWidth,
        height,
        flexShrink: 0,
    };

    const middleStyle: CSSProperties = {
        height,
        backgroundImage: "url('/blocks/ui/TitleBlock_middle.png')",
        /*
         * repeat-x + contain: the tile repeats horizontally while
         * preserving its intrinsic aspect ratio in the vertical axis.
         * This means the fill pattern scales to exactly `height` px tall
         * and tiles seamlessly as the text content grows wider.
         */
        backgroundRepeat: "repeat-x",
        backgroundSize: "auto 100%",
        flexGrow: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingInlineStart: "0.75rem",
        paddingInlineEnd: "0.75rem",
    };

    return (
        <div
            className={clsx(
                "title-block flex flex-row items-stretch overflow-hidden",
                className
            )}
        >
            {/* Start cap */}
            <div
                style={{ ...capStyle, backgroundImage: "url('/blocks/ui/TitleBlock_start.png')", backgroundSize: "100% 100%" }}
                aria-hidden="true"
            />

            {/* Middle fill — grows to fit text */}
            <Tag style={middleStyle} className="font-semibold text-foreground truncate">
                {children}
            </Tag>

            {/* End cap */}
            <div
                style={{ ...capStyle, backgroundImage: "url('/blocks/ui/TitleBlock_end.png')", backgroundSize: "100% 100%" }}
                aria-hidden="true"
            />
        </div>
    );
}
