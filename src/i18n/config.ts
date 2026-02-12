export const routing = {
    locales: ['en', 'ar'],
    defaultLocale: 'en'
};

export type Locale = (typeof routing.locales)[number];
