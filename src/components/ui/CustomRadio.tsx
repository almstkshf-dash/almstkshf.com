/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

/**
 * CustomRadio — Asset-driven radio button with accessible state management.
 *
 * The native <input type="radio"> is visually hidden (sr-only) but remains
 * in the DOM so keyboard navigation, form submission, and screen-reader
 * announcements work correctly.
 *
 * Visual state is communicated via two asset images:
 *   Radial-unchecked.png  — default/unselected appearance
 *   Radial-checked.png    — selected appearance
 *
 * Asset paths (place files under /public/blocks/ui/):
 *   Radial-unchecked.png
 *   Radial-checked.png
 *
 * Usage:
 *   <CustomRadio name="plan" value="pro" checked={plan === 'pro'} onChange={...}>
 *     Pro Plan
 *   </CustomRadio>
 */

import { InputHTMLAttributes, ReactNode, forwardRef, useId } from "react";
import clsx from "clsx";
import Image from "next/image";

interface CustomRadioProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    children?: ReactNode;
    /** Override auto-generated id */
    id?: string;
    /** Size of the radio sprite in px (width = height) */
    size?: number;
}

const SPRITE_SIZE = 20;

const CustomRadio = forwardRef<HTMLInputElement, CustomRadioProps>(
    function CustomRadio(
        { children, id: providedId, size = SPRITE_SIZE, className, checked, defaultChecked, ...props },
        ref
    ) {
        const autoId = useId();
        const id = providedId ?? autoId;

        const isChecked = checked ?? defaultChecked ?? false;

        return (
            <label
                htmlFor={id}
                className={clsx(
                    "inline-flex items-center gap-2 cursor-pointer select-none",
                    className
                )}
            >
                {/* Hidden native input */}
                <input
                    ref={ref}
                    id={id}
                    type="radio"
                    checked={checked}
                    defaultChecked={defaultChecked}
                    className="sr-only"
                    {...props}
                />

                {/*
                 * Visual sprite — swaps between unchecked/checked asset.
                 * aria-hidden because the native input carries the accessible state.
                 */}
                <span
                    aria-hidden="true"
                    className="inline-flex flex-shrink-0"
                    style={{ width: size, height: size }}
                >
                    <Image
                        src={isChecked
                            ? "/blocks/ui/Radial-checked.png"
                            : "/blocks/ui/Radial-unchecked.png"
                        }
                        alt=""
                        width={size}
                        height={size}
                        className="object-contain"
                    />
                </span>

                {children && (
                    <span className="text-sm text-foreground">{children}</span>
                )}
            </label>
        );
    }
);

export default CustomRadio;
