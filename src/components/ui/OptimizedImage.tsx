/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 Tamer Younes / Almstkshf Media Monitoring. All rights reserved.
 */

"use client";

import Image, { ImageProps } from "next/image";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { ImageOff } from "lucide-react";
import Skeleton from "./Skeleton";

// Fix #3 – extend full ImageProps (not Omit<…, "onLoad">) so callers can forward
// onLoad, onError, priority, sizes, and all other native props.
interface OptimizedImageProps extends ImageProps {
    containerClassName?: string;
}

export default function OptimizedImage({
    src,
    alt,
    className,
    containerClassName,
    width,
    height,
    fill,
    ...props
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const t = useTranslations("Common");

    // Fix #8 – safer srcKey that handles strings, static imports, and unusual objects
    const srcKey =
        typeof src === "string"
            ? src
            : (src as { src?: string })?.src ?? "";

    // Fix #1 & #7 – reset loading/error state via effect instead of relying on
    // key={srcKey} on a non-sibling div, which does not reliably remount the component.
    useEffect(() => {
        setIsLoading(true);
        setError(false);
    }, [srcKey]);

    // Fix #5 – auto-supply a sensible default sizes when fill is used
    const resolvedSizes = props.sizes ?? (fill ? "(max-width: 768px) 100vw, 50vw" : undefined);

    // Fix #2 – let callers and next.config.js control optimisation;
    // never force-disable it just because the URL is external.
    const shouldBeUnoptimized = props.unoptimized ?? false;

    // Compute container dimensions to avoid layout shifting (CLS) when not using fill
    const containerStyle: React.CSSProperties = {};
    if (!fill) {
        if (width !== undefined) {
            containerStyle.width = typeof width === "number" ? `${width}px` : width;
        }
        if (height !== undefined) {
            containerStyle.height = typeof height === "number" ? `${height}px` : height;
        }
    }

    return (
        <div
            className={clsx("relative overflow-hidden", containerClassName)}
            style={containerStyle}
        >
            {/* Fix #10 – skeleton respects prefers-reduced-motion via motion-safe utility */}
            {isLoading && !error && (
                <Skeleton className="absolute inset-0 z-10 motion-safe:animate-pulse" />
            )}

            {!error ? (
                <Image
                    // Fix #3 – spread caller props FIRST so our explicit handlers below
                    // are never overwritten by a caller-supplied onError / onLoad.
                    {...props}
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    fill={fill}
                    sizes={resolvedSizes}
                    className={clsx(
                        "transition-all duration-500",
                        isLoading ? "scale-110 blur-lg" : "scale-100 blur-0",
                        className
                    )}
                    // Fix #4 – use onLoad (onLoadingComplete is deprecated in Next.js 14+)
                    onLoad={() => {
                        setIsLoading(false);
                    }}
                    // Fix #3 – forward caller's onError after our own state update
                    onError={(event) => {
                        setError(true);
                        setIsLoading(false);
                        props.onError?.(event);
                    }}
                    unoptimized={shouldBeUnoptimized}
                />
            ) : (
                // Fix #9 – expose failure state to assistive technologies
                <div
                    role="img"
                    aria-label={t("image_unavailable")}
                    className="absolute inset-0 bg-muted flex flex-col items-center justify-center p-4 text-center border border-border/10 rounded-lg"
                >
                    <div className="w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center mb-2 border border-border/50 shadow-sm animate-fade-in duration-300">
                        <ImageOff className="w-5 h-5 text-foreground/60" aria-hidden="true" />
                    </div>
                    <p className="text-[10px] text-foreground/70 uppercase tracking-widest font-bold px-1 line-clamp-2 leading-normal">
                        {t("image_unavailable")}
                    </p>
                </div>
            )}
        </div>
    );
}
