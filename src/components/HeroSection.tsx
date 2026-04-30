/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Image from "next/image";

/**
 * HeroSection — Server Component.
 *
 * LCP + Speed Index Strategy:
 * - <h1> renders as plain static HTML with no JS dependency.
 * - The section has an explicit min-height so the browser reserves layout
 *   space immediately — no reflow when fonts/images load.
 * - Background color is controlled purely by CSS variables (set via inline
 *   style in layout's <head> blocking script) so it paints correctly on
 *   the very first frame without waiting for the stylesheet.
 * - Noise texture uses a tiny SVG (353 bytes) — not a network-blocking resource.
 * - No backdrop-blur on above-fold content (GPU compositing layer cost).
 */
export default async function HeroSection() {
    const t = await getTranslations();

    return (
        <section
            className="relative flex items-center justify-center text-foreground overflow-hidden py-20 lg:py-0"
            style={{ minHeight: '90svh' }}
        >
            {/* Noise texture */}
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.15] brightness-100 contrast-150 pointer-events-none mix-blend-overlay"
            />

            <div className="container relative z-10 mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Content Side */}
                <div className="text-start order-2 lg:order-1 flex flex-col items-start">
                    <h1
                        className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight text-foreground inline-block leading-none"
                    >
                        {t("Common.app_name")}
                    </h1>

                    <h2 className="text-sm md:text-lg font-bold text-primary mb-6 uppercase tracking-[0.4em] opacity-90">
                        {t("Common.slogan")}
                    </h2>

                    <div className="w-20 h-1 bg-gradient-to-r from-primary to-transparent mb-8" />

                    <p
                        id="hero-description"
                        className="text-base md:text-lg text-foreground/80 mb-10 max-w-xl leading-relaxed font-normal"
                        style={{ opacity: 1 }}
                    >
                        {t("Common.description")}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                        <Link
                            href="https://chatgpt.com/g/g-68297975a3548191a8530cb64b22aaa3-almstkshf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center gap-3"
                        >
                            <span className="relative flex h-2 w-2" aria-hidden="true">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-foreground" />
                            </span>
                            {t("Common.try_ai")}
                        </Link>

                        <a
                            href="#features"
                            className="px-8 py-4 bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-white/10 text-foreground/80 rounded-xl font-semibold transition-all hover:text-foreground backdrop-blur-sm"
                        >
                            {t("Common.view_details")}
                        </a>
                    </div>
                </div>

                {/* Image Side */}
                <div className="relative order-1 lg:order-2 flex justify-center items-center">
                    <div className="relative w-full aspect-video max-w-[500px] lg:max-w-none">
                        <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-white/10">
                            <Image
                                src="/proud-of-uae.jpg"
                                alt={t("Common.logo_alt")}
                                fill
                                priority
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                            {/* Overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative background elements */}
            <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

            <div
                aria-hidden="true"
                className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-background to-transparent pointer-events-none"
            />
        </section>
    );
}
