import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Container from '@/components/ui/Container';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Legal.Terms' });
    return {
        title: t('title'),
        description: t('intro'),
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/terms`,
        },
    };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Legal.Terms' });

    return (
        <main className="bg-background min-h-screen py-20 text-foreground">
            <Container>
                <div className="max-w-3xl mx-auto space-y-12">
                    {/* Header */}
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                            {t('title')}
                        </h1>
                        <p className="text-lg leading-relaxed text-muted-foreground">
                            {t('intro')}
                        </p>
                    </div>

                    {/* Sections */}
                    <div className="space-y-8">
                        <Section title={t('sections.acceptance.title')} content={t('sections.acceptance.content')} />
                        <Section title={t('sections.services.title')} content={t('sections.services.content')} />
                        <Section title={t('sections.accounts.title')} content={t('sections.accounts.content')} />
                        <Section title={t('sections.intellectual_property.title')} content={t('sections.intellectual_property.content')} />
                        <Section title={t('sections.termination.title')} content={t('sections.termination.content')} />
                    </div>
                </div>
            </Container>
        </main>
    );
}

function Section({ title, content }: { title: string; content: string }) {
    return (
        <section className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
            <h2 className="text-xl font-semibold text-foreground mb-4">{title}</h2>
            <p className="leading-relaxed text-muted-foreground">{content}</p>
        </section>
    );
}
