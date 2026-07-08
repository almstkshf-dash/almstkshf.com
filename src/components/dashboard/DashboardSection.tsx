import { useState, useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface DashboardSectionProps {
    id: string;
    title: string;
    icon: LucideIcon;
    children: ReactNode;
    /** Optional extra element placed to the right of the heading (e.g. a badge) */
    headerSlot?: ReactNode;
    /** Hide the divider line — useful when the section is the first visual element */
    noDivider?: boolean;
    /** Defer mounting of children until section enters viewport */
    lazy?: boolean;
}

/**
 * DashboardSection
 * ─────────────────
 * A named, wrapper for dashboard content sections. Support lazy rendering to defer
 * mounting heavy queries, components, and hooks until the section is scrolled into view.
 */
export function DashboardSection({
    id,
    title,
    icon: Icon,
    children,
    headerSlot,
    noDivider = false,
    lazy = true,
}: DashboardSectionProps) {
    const [hasBeenVisible, setHasBeenVisible] = useState(!lazy);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!lazy) return;

        if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
            setHasBeenVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setHasBeenVisible(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '200px 0px',
            }
        );

        const currentElement = elementRef.current;
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            observer.disconnect();
        };
    }, [lazy]);

    return (
        <section 
            id={id} 
            aria-labelledby={`section-heading-${id}`} 
            className="scroll-mt-24"
            ref={elementRef}
        >
            {/* Section heading row */}
            <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                        <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
                    </div>
                    <h2
                        id={`section-heading-${id}`}
                        className="text-sm font-black text-foreground tracking-widest uppercase"
                    >
                        {title}
                    </h2>
                </div>

                {!noDivider && (
                    <div className="flex-1 h-px bg-gradient-to-r from-primary/20 via-border/30 to-transparent" />
                )}

                {headerSlot && (
                    <div className="shrink-0">{headerSlot}</div>
                )}
            </div>

            {hasBeenVisible ? (
                children
            ) : (
                <div className="w-full h-48 border border-border/40 rounded-[2rem] bg-muted/5 animate-pulse flex items-center justify-center text-muted-foreground/30 text-xs" />
            )}
        </section>
    );
}
