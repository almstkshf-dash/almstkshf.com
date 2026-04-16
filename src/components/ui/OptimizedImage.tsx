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
import Skeleton from "./Skeleton";

interface OptimizedImageProps extends Omit<ImageProps, "onLoad"> {
    containerClassName?: string;
}

export default function OptimizedImage({
    src,
    alt,
    className,
    containerClassName,
    ...props
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    return (
        <div className={clsx("relative overflow-hidden", containerClassName)}>
            {isLoading && !error && (
                <Skeleton className="absolute inset-0 z-10" />
            )}

            {!error ? (
                <Image
                    src={src}
                    alt={alt}
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
                    {...props}
                />
            ) : (
                <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mb-2">
                        <span className="text-foreground/70 text-xs font-bold">AI</span>
                    </div>
                    <p className="text-[10px] text-foreground/70 uppercase tracking-widest font-bold">Image Unavailable</p>
                </div>
            )}
        </div>
    );
}
