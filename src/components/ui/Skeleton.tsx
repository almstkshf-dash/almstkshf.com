import clsx from "clsx";

interface SkeletonProps {
    className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={clsx(
                "animate-pulse rounded-md bg-slate-800/50",
                className
            )}
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
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
        <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
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
