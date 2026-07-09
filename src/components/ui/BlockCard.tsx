/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

/**
 * BlockCard — 9-slice container component.
 *
 * Maps one of five panel variants to its corresponding asset sheet.
 * Each variant uses `main_Card_bg.png` as the full-canvas backing layer,
 * and overlays the variant-specific sheet image on top.
 *
 * Asset paths (place files under /public/blocks/cards/):
 *   main_Card_bg.png                  — full canvas background for all variants
 *   image_block_campaignsheets.png    — Campaign asset sheet
 *   image_block_charactersheets.png   — Character control sheet
 *   image_block_gamemastersheets.png  — Game master panel
 *   image_block_generatorsheets.png   — Generator output block
 *
 * Usage:
 *   <BlockCard variant="campaign">...</BlockCard>
 *   <BlockCard variant="character" className="col-span-2">...</BlockCard>
 */

import { ReactNode } from "react";
import Image from "next/image";
import clsx from "clsx";

export type BlockCardVariant =
    | "default"
    | "campaign"
    | "character"
    | "gamemaster"
    | "generator";

const VARIANT_SHEET: Record<BlockCardVariant, string | null> = {
    default: null,
    campaign: "/blocks/cards/image_block_campaignsheets.png",
    character: "/blocks/cards/image_block_charactersheets.png",
    gamemaster: "/blocks/cards/image_block_gamemastersheets.png",
    generator: "/blocks/cards/image_block_generatorsheets.png",
};

const VARIANT_LABEL: Record<BlockCardVariant, string> = {
    default: "Card panel",
    campaign: "Campaign sheet panel",
    character: "Character sheet panel",
    gamemaster: "Game master panel",
    generator: "Generator output panel",
};

interface BlockCardProps {
    variant?: BlockCardVariant;
    children?: ReactNode;
    className?: string;
    /** Additional CSS to apply to the content layer */
    contentClassName?: string;
}

export default function BlockCard({
    variant = "default",
    children,
    className,
    contentClassName,
}: BlockCardProps) {
    const sheet = VARIANT_SHEET[variant];

    return (
        <div className={clsx("relative overflow-hidden", className)}>
            {/*
             * Layer 1 — Full-canvas backing (main_Card_bg.png).
             * Positioned absolute, fills the container, renders below everything.
             */}
            <Image
                src="/blocks/cards/main_Card_bg.png"
                alt=""
                aria-hidden="true"
                fill
                className="object-cover pointer-events-none select-none"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={false}
            />

            {/*
             * Layer 2 — Variant sheet (top-right corner decoration / overlay).
             * Rendered at the inset-inline-end (reading-end edge) of the card,
             * using logical positioning so it flips correctly in RTL mode.
             * Only rendered when a variant sheet exists.
             */}
            {sheet && (
                <Image
                    src={sheet}
                    alt={VARIANT_LABEL[variant]}
                    aria-hidden="true"
                    fill
                    className="object-cover object-right-top pointer-events-none select-none opacity-80"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={false}
                />
            )}

            {/*
             * Layer 3 — Content slot.
             * z-10 lifts children above both image layers.
             * Padding uses logical properties (p-inline-start/end) so the
             * inner content never collides with card border decorations.
             */}
            <div className={clsx("relative z-10", contentClassName)}>
                {children}
            </div>
        </div>
    );
}
