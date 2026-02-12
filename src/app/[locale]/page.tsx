import Navbar from '@/components/Navbar';
import { useTranslations } from 'next-intl';

export default function Home() {
    const t = useTranslations('Navigation');

    return (
        <main className="min-h-screen">
            <Navbar />
            <section className="relative h-[80vh] flex items-center justify-center bg-gradient-radial from-slate-900 to-slate-950 text-white overflow-hidden">
                {/* Abstract Background Element */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                <div className="z-10 text-center max-w-4xl px-4 animate-fade-in-up">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                        ALMSTKSHF
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto">
                        Empowering decisions with AI-driven media monitoring and legal intelligence.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-transform hover:scale-105">
                            {t('common.view_details', { fallback: 'Explore Solutions' })}
                        </button>
                        <button className="px-8 py-3 border border-slate-600 hover:border-blue-400 text-slate-200 rounded-lg font-medium transition-colors">
                            Contact Us
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}
