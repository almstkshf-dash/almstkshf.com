/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import React from 'react';

export default function CompanySchema() {
    const schema = [
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://www.almstkshf.com/#organization",
            "name": "ALMSTKSHF",
            "url": "https://www.almstkshf.com",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.almstkshf.com/logo.png",
                "width": 1200,
                "height": 630
            },
            "sameAs": [
                "https://twitter.com/almstkshf",
                "https://linkedin.com/company/almstkshf",
                "https://facebook.com/almstkshf"
            ],
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+971-58-59-52-035",
                "contactType": "customer service",
                "areaServed": ["AE", "SA"],
                "availableLanguage": ["Arabic", "English"]
            }
        },
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": "https://www.almstkshf.com/#website",
            "url": "https://www.almstkshf.com",
            "name": "ALMSTKSHF",
            "publisher": { "@id": "https://www.almstkshf.com/#organization" },
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.almstkshf.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
            }
        },
        {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "ALMSTKSHF Dubai",
            "image": "https://www.almstkshf.com/logo.png",
            "@id": "https://www.almstkshf.com/dubai",
            "url": "https://www.almstkshf.com",
            "telephone": "+971-58-59-52-035",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "One Central 9th Floor - Trade Center",
                "addressLocality": "Dubai",
                "addressCountry": "AE"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 25.2267,
                "longitude": 55.2831
            }
        },
        {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Tamer Younes",
            "jobTitle": "Founder",
            "affiliation": { "@id": "https://www.almstkshf.com/#organization" },
            "sameAs": [
                "https://linkedin.com/in/tameryounes"
            ]
        }
    ];

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(schema)
            }}
        />
    );
}
