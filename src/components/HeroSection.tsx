import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

/**
 * HeroSection — Server Component.
 *
 * LCP + Speed Index Strategy:
 * - `<h1>` renders as plain static HTML with no JS dependency.
 * - The section has an explicit `min-height` so the browser reserves layout
 *   space immediately — no reflow when fonts/images load.
 * - Background color is controlled purely by CSS variables (set via inline
 *   style in layout's <head> blocking script) so it paints correctly on
 *   the very first frame without waiting for the stylesheet.
 * - Noise texture uses a tiny SVG (353 bytes) — not a network-blocking resource.
 * - No `backdrop-blur` on above-fold content (GPU compositing layer cost).
 */
export default async function HeroSection() {
    const t = await getTranslations();

    return (
        <section
            className="relative flex items-center justify-center text-foreground overflow-hidden"
            style={{ minHeight: '90svh' }}
        >
            {/* Noise texture — tiny SVG, purely decorative */}
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.15] brightness-100 contrast-150 pointer-events-none mix-blend-overlay"
            />

            <div className="z-10 text-center max-w-4xl px-4">
                {/*
                  LCP ELEMENT — plain <h1>, no animation, no opacity:0 start.

                  Speed Index note: we keep `bg-clip-text text-transparent` but
                  browsers paint gradient text immediately without JS. The color
                  vars (--primary, --foreground, --accent) are already set by the
                  inline blocking script in layout <head>, so the gradient renders
                  correctly on the very first frame.
                */}
                <h1
                    className="text-6xl md:text-9xl font-bold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-foreground to-accent inline-block"
                >
                    {t("Common.app_name")}
                </h1>

                <h2 className="text-lg md:text-2xl font-medium text-primary mb-8 uppercase tracking-[0.3em]">
                    {t("Common.slogan")}
                </h2>

                <p
                    id="hero-description"
                    className="text-lg md:text-xl text-foreground/85 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
                    style={{ opacity: 1 }} // LCP FIX: Explicitly set to 1 in SSR to override any global hydration-based opacity:0 rules
                >
                    {t("Common.description")}
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <Link
                        href="https://chatgpt.com/g/g-68297975a3548191a8530cb64b22aaa3-almstkshf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-10 py-5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/30 flex items-center gap-3"
                    >
                        {/* Pulse dot — pure CSS animation, zero JS */}
                        <span className="relative flex h-3 w-3" aria-hidden="true">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-foreground" />
                        </span>
                        {t("Common.try_ai")}
                    </Link>

                    <a
                        href="#features"
                        className="px-10 py-5 bg-card border border-border hover:border-primary text-foreground/85 rounded-2xl font-semibold transition-all hover:text-foreground"
                    >
                        {t("Common.view_details")}
                    </a>
                </div>
            </div>

            {/* Decorative gradient — CSS only, zero JS */}
            <div
                aria-hidden="true"
                className="absolute bottom-0 left-0 right-0 h-[300px] border-t border-primary/20 bg-gradient-to-t from-primary/5 to-transparent opacity-10"
            />
        </section>
    );
}
