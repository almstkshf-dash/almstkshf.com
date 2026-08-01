import React from 'react';
import Container from '@/components/ui/Container';
import { Link } from '@/i18n/routing';
import { ShieldCheck, Zap, BarChart3, Radio, FileText, Activity, Database, Key, ArrowUpRight } from 'lucide-react';

interface MetricItem {
    label: string;
    value: string;
}

interface FeatureItem {
    title: string;
    desc: string;
}

interface InternalLinkItem {
    label: string;
    href: string;
    badge?: string;
}

interface ServiceSeoHeaderProps {
    badge: string;
    title: string;
    titleHighlight: string;
    description: string;
    metrics?: MetricItem[];
    features?: FeatureItem[];
    relatedLinks?: InternalLinkItem[];
    iconType?: 'tv-radio' | 'press' | 'crisis' | 'pulse' | 'repository' | 'kyc' | 'integration';
}

const ICON_MAP = {
    'tv-radio': Radio,
    'press': FileText,
    'crisis': ShieldCheck,
    'pulse': Activity,
    'repository': Database,
    'kyc': Key,
    'integration': Zap,
};

export default function ServiceSeoHeader({
    badge,
    title,
    titleHighlight,
    description,
    metrics = [],
    features = [],
    relatedLinks = [],
    iconType = 'tv-radio',
}: ServiceSeoHeaderProps) {
    const IconComponent = ICON_MAP[iconType] || BarChart3;

    return (
        <section className="relative pt-28 pb-12 overflow-hidden bg-background border-b border-border/50">
            {/* Ambient Background Glows */}
            <div
                aria-hidden="true"
                className="absolute top-0 start-1/4 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"
            />
            <div
                aria-hidden="true"
                className="absolute top-1/3 end-1/4 translate-x-1/2 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none"
            />

            <Container>
                <div className="relative z-10 max-w-5xl mx-auto text-start">
                    {/* Category Badge */}
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-bold uppercase tracking-wider mb-6 backdrop-blur-sm">
                        <IconComponent className="w-4 h-4 text-primary animate-pulse" />
                        <span>{badge}</span>
                    </div>

                    {/* H1 Heading with Gradient Highlight */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.15] mb-6">
                        {title}{' '}
                        <span className="bg-gradient-to-r from-primary via-indigo-500 to-accent bg-clip-text text-transparent inline-block">
                            {titleHighlight}
                        </span>
                    </h1>

                    {/* Rich Keyword Description */}
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed font-normal max-w-3xl mb-8">
                        {description}
                    </p>

                    {/* Call to Action Buttons with Internal Links */}
                    <div className="flex flex-wrap gap-4 items-center mb-10">
                        <Link
                            href="/contact"
                            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-sm transition-all shadow-md shadow-primary/20 flex items-center gap-2 group"
                        >
                            <span>Request Demo / Contact</span>
                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                        <Link
                            href="/pricing"
                            className="px-6 py-3 bg-card hover:bg-card/80 border border-border text-foreground font-semibold rounded-xl text-sm transition-colors flex items-center gap-2"
                        >
                            <span>View Packages & Pricing</span>
                        </Link>
                    </div>

                    {/* Key Metrics / Highlights Strip */}
                    {metrics.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                            {metrics.map((metric, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-md hover:border-primary/30 transition-colors shadow-sm"
                                >
                                    <div className="text-2xl sm:text-3xl font-black text-primary mb-1">
                                        {metric.value}
                                    </div>
                                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                                        {metric.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Features Grid */}
                    {features.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                            {features.map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="p-5 rounded-2xl bg-card/40 border border-border/60 backdrop-blur-sm hover:bg-card/80 hover:border-primary/40 transition-all duration-300 group"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                    </div>
                                    <h3 className="text-base font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Internal Cross-Linking Navigation Strip */}
                    {relatedLinks.length > 0 && (
                        <div className="pt-6 border-t border-border/60">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                                Explore Related Media Solutions & Services
                            </p>
                            <nav aria-label="Related Services" className="flex flex-wrap gap-2.5">
                                {relatedLinks.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.href}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-card/80 hover:bg-primary/10 border border-border/80 hover:border-primary/30 text-xs font-semibold text-foreground/80 hover:text-primary transition-all group"
                                    >
                                        <span>{link.label}</span>
                                        {link.badge && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/20 text-primary font-bold">
                                                {link.badge}
                                            </span>
                                        )}
                                        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    )}
                </div>
            </Container>
        </section>
    );
}
