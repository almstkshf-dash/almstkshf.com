import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

/**
 * HeroSection — Server Component.
 *
 * LCP Strategy:
 * - The `<h1>` (LCP candidate) is rendered as plain static HTML — no JS, no
 *   framer-motion, no `opacity:0` initial state. The browser can paint it the
 *   moment the first HTML byte arrives (~0 ms after TTFB).
 * - The noise background and decorative gradient are rendered with CSS only
 *   (no JS hydration needed).
 * - CTA buttons are plain `<a>` / `<button>` elements so they also render
 *   before any client bundle is loaded.
 *
 * The animated `motion.*` wrappers that were here previously delayed the
 * browser from "painting" the LCP element because the element started at
 * opacity:0 and the browser doesn't count invisible text as "painted".
 */
export default async function HeroSection() {
    const t = await getTranslations();

    return (
        <section
            className="relative h-[90vh] flex items-center justify-center text-foreground overflow-hidden"
        >
            {/* Noise texture — CSS only, no JS */}
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.15] brightness-100 contrast-150 pointer-events-none mix-blend-overlay"
            />

            <div className="z-10 text-center max-w-4xl px-4">
                {/*
                  LCP ELEMENT — plain <h1>, no animation wrapper, no opacity:0.
                  Paints immediately on first render, browser picks it as LCP target.
                */}
                <h1
                    className="text-6xl md:text-9xl font-bold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-foreground to-accent inline-block"
                >
                    {t("Common.app_name")}
                </h1>

                <h2 className="text-lg md:text-2xl font-medium text-primary mb-8 uppercase tracking-[0.3em]">
                    {t("Common.slogan")}
                </h2>

                <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-light">
                    {t("Common.description")}
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <Link
                        href="https://chatgpt.com/g/g-68297975a3548191a8530cb64b22aaa3-almstkshf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-10 py-5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/30 flex items-center gap-3 group"
                    >
                        {/* Pulse dot — pure CSS animation, zero JS */}
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-foreground" />
                        </span>
                        {t("Common.try_ai")}
                    </Link>

                    <a
                        href="#features"
                        className="px-10 py-5 bg-card border border-border backdrop-blur-xl hover:border-primary text-muted-foreground rounded-2xl font-semibold transition-all hover:text-foreground"
                    >
                        {t("Common.view_details")}
                    </a>
                </div>
            </div>

            {/* Decorative gradient — CSS only */}
            <div className="absolute bottom-0 left-0 right-0 h-[300px] border-t border-primary/20 bg-gradient-to-t from-primary/5 to-transparent opacity-10" />
        </section>
    );
}
