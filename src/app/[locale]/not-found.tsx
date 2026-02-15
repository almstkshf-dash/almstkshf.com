import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function NotFound() {
    const t = useTranslations('NotFound');

    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
            <div className="max-w-lg space-y-6">
                <h1 className="text-9xl font-extrabold tracking-widest text-gray-200 dark:text-gray-800">
                    404
                </h1>

                <div className="relative -mt-16">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
                        {t('title')}
                    </h2>
                    <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                        {t('description')}
                    </p>
                </div>

                <div className="mt-8 flex justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-3 text-base font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    >
                        {t('home_button')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
