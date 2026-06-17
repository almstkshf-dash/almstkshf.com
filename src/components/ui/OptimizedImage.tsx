/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { ImageOff } from "lucide-react";
import Skeleton from "./Skeleton";

interface OptimizedImageProps extends Omit<ImageProps, "onLoad"> {
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

    // Compute key based on src to force remount and reset states on src change
    const srcKey = typeof src === "object" && src !== null && "src" in src ? src.src : (src as string);

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

    // Determine if the URL is external
    const isExternal = typeof src === "string" && (src.startsWith("http://") || src.startsWith("https://"));
    const shouldBeUnoptimized = props.unoptimized ?? isExternal;

    return (
        <div 
            key={srcKey} 
            className={clsx("relative overflow-hidden", containerClassName)}
            style={containerStyle}
        >
            {isLoading && !error && (
                <Skeleton className="absolute inset-0 z-10" />
            )}

            {!error ? (
                <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    fill={fill}
                    className={clsx(
                        "transition-all duration-500",
                        isLoading ? "scale-110 blur-lg" : "scale-100 blur-0",
                        className
                    )}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setError(true);
                        setIsLoading(false);
                    }}
                    unoptimized={shouldBeUnoptimized}
                    {...props}
                />
            ) : (
                <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center p-4 text-center border border-border/10 rounded-lg">
                    <div className="w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center mb-2 border border-border/50 shadow-sm animate-in fade-in duration-300">
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
