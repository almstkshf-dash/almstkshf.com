/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import type { HTMLAttributes, CSSProperties } from "react";
import { cn } from "@/utils/cn";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export default function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                "motion-safe:animate-pulse rounded-md bg-muted",
                className
            )}
            {...props}
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="p-6 bg-card border border-border rounded-2xl space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-3/4" />
            <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
            </div>
            <div className="pt-4 flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
        </div>
    );
}

export function SkeletonReportRow() {
    return (
        <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl">
            <div className="flex items-center gap-4 flex-1">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                </div>
            </div>
            <div className="flex items-center gap-6">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
        </div>
    );
}

export interface ChartSkeletonProps extends HTMLAttributes<HTMLDivElement> {
    height?: CSSProperties["height"];
}

/**
 * Specialized skeleton for charts to maintain consistent layout during lazy loading
 */
export function ChartSkeleton({
    height = "300px",
    className,
    ...props
}: ChartSkeletonProps) {
    const hasHeightClass = className?.split(" ").some(
        (c) => c.startsWith("h-") || c.startsWith("max-h-") || c.startsWith("min-h-")
    );

    return (
        <div
            aria-hidden="true"
            style={hasHeightClass ? undefined : { height }}
            className={cn(
                "w-full bg-muted/10 rounded-2xl motion-safe:animate-pulse flex items-center justify-center border border-border/50 p-6",
                className
            )}
            {...props}
        >
            <div className="flex items-end gap-2 w-full max-w-[200px] h-24 px-2 border-b border-border/30">
                <div className="w-full h-[40%] bg-muted/40 rounded-t-sm" />
                <div className="w-full h-[75%] bg-muted/40 rounded-t-sm" />
                <div className="w-full h-[50%] bg-muted/40 rounded-t-sm" />
                <div className="w-full h-[90%] bg-muted/40 rounded-t-sm" />
                <div className="w-full h-[35%] bg-muted/40 rounded-t-sm" />
                <div className="w-full h-[60%] bg-muted/40 rounded-t-sm" />
                <div className="w-full h-[45%] bg-muted/40 rounded-t-sm" />
            </div>
        </div>
    );
}
