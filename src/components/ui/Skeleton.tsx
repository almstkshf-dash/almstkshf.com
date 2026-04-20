/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import clsx from "clsx";

interface SkeletonProps {
    className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={clsx(
                "animate-pulse rounded-md bg-muted",
                className
            )}
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="p-6 bg-card border border-border rounded-2xl space-y-4 transition-colors duration-300">
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
        <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl transition-colors duration-300">
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

/**
 * Specialized skeleton for charts to maintain consistent layout during lazy loading
 */
export function ChartSkeleton({ height = "300px" }: { height?: string }) {
    return (
        <div 
            style={{ height }} 
            className="w-full bg-muted/10 rounded-2xl animate-pulse flex items-center justify-center border border-border/50"
        >
            <div className="w-12 h-12 bg-primary/5 rounded-full" />
        </div>
    );
}
