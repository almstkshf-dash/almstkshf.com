import Navbar from '@/components/Navbar';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
    const t = useTranslations();

    return (
        <main className="min-h-screen">
            <Navbar />
            <section className="relative h-[80vh] flex items-center justify-center bg-gradient-radial from-slate-900 to-slate-950 text-white overflow-hidden">
                {/* Abstract Background Element */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                <div className="z-10 text-center max-w-4xl px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-6xl md:text-8xl font-bold mb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500"
                    >
                        {t('Common.app_name')}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-lg md:text-xl font-medium text-blue-400 mb-6 uppercase tracking-[0.2em]"
                    >
                        {t('Common.slogan')}
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="text-lg md:text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed"
                    >
                        {t('Common.description')}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <Link
                            href="https://chatgpt.com/g/g-68297975a3548191a8530cb64b22aaa3-almstkshf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25 flex items-center gap-2"
                        >
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                            {t('Common.try_ai')}
                        </Link>

                        <button className="px-8 py-4 border border-slate-700 hover:border-slate-500 hover:bg-slate-800/50 text-slate-300 rounded-xl font-semibold transition-all">
                            {t('Common.view_details')}
                        </button>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
