import React from 'react';

interface ServiceSchemaProps {
    name: string;
    description: string;
    serviceType: string;
    url: string;
    locale: string;
    features?: string[];
}

export default function ServiceSchema({
    name,
    description,
    serviceType,
    url,
    locale,
    features = [],
}: ServiceSchemaProps) {
    const isAr = locale === 'ar';
    const baseUrl = 'https://www.almstkshf.com';

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': `${url}/#service`,
        'name': name,
        'description': description,
        'provider': {
            '@type': 'Organization',
            '@id': `${baseUrl}/#organization`,
            'name': 'ALMSTKSHF',
        },
        'areaServed': [
            {
                '@type': 'Country',
                'name': isAr ? 'الإمارات العربية المتحدة' : 'United Arab Emirates',
            },
            {
                '@type': 'Country',
                'name': isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia',
            },
            {
                '@type': 'Place',
                'name': isAr ? 'دول مجلس التعاون الخليجي' : 'GCC Countries',
            },
        ],
        'availableLanguage': ['Arabic', 'English'],
        'url': url,
        'serviceType': serviceType,
        ...(features.length > 0 && {
            'hasOfferCatalog': {
                '@type': 'OfferCatalog',
                'name': name,
                'itemListElement': features.map((feature, index) => ({
                    '@type': 'Offer',
                    'itemOffered': {
                        '@type': 'Service',
                        'name': feature,
                    },
                    'position': index + 1,
                })),
            },
        }),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
