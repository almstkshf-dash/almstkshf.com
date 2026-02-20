import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function NotFound() {
    const t = useTranslations('NotFound');

    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
            <div className="max-w-lg space-y-6">
                <h1 className="text-9xl font-extrabold tracking-widest text-foreground/10">
                    404
                </h1>

                <div className="relative -mt-16">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {t('title')}
                    </h2>
                    <p className="mt-4 text-lg text-foreground/60">
                        {t('description')}
                    </p>
                </div>

                <div className="mt-8 flex justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-base font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                    >
                        {t('home_button')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
