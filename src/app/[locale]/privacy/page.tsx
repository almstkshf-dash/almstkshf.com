import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Container from '@/components/ui/Container';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Legal.Privacy' });
    return {
        title: t('title'),
        description: t('intro')
    };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Legal.Privacy' });

    return (
        <main className="bg-background min-h-screen py-20 text-foreground">
            <Container>
                <div className="max-w-3xl mx-auto space-y-12">
                    {/* Header */}
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-white bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                            {t('title')}
                        </h1>
                        <p className="text-lg leading-relaxed text-muted-foreground">
                            {t('intro')}
                        </p>
                    </div>

                    {/* Sections */}
                    <div className="space-y-8">
                        <Section title={t('sections.collection.title')} content={t('sections.collection.content')} />
                        <Section title={t('sections.use.title')} content={t('sections.use.content')} />
                        <Section title={t('sections.sharing.title')} content={t('sections.sharing.content')} />
                        <Section title={t('sections.security.title')} content={t('sections.security.content')} />
                        <Section title={t('sections.contact.title')} content={t('sections.contact.content')} />
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
