import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Container from '@/components/ui/Container';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Legal.Terms' });
    return {
        title: t('title'),
        description: t('intro')
    };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Legal.Terms' });

    return (
        <main className="bg-slate-950 min-h-screen py-20 text-slate-300">
            <Container>
                <div className="max-w-3xl mx-auto space-y-12">
                    {/* Header */}
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-white bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                            {t('title')}
                        </h1>
                        <p className="text-lg leading-relaxed text-slate-400">
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
        <section className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors">
            <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
            <p className="leading-relaxed text-slate-400">{content}</p>
        </section>
    );
}
