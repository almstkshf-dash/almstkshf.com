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
            "alternateName": ["المستكشف", "المستكشف للرصد الإعلامي", "Almstkshf Media Monitoring"],
            "description": "AI-powered media monitoring, public opinion sentiment analysis, and crisis management platform serving the UAE, Saudi Arabia, and the GCC.",
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
            "knowsAbout": [
                "Media Monitoring",
                "Public Opinion Sentiment Analysis",
                "TV Broadcast Monitoring",
                "Radio Broadcast Tracking",
                "Press & Online News Monitoring",
                "Media Crisis Management",
                "Reputation Protection",
                "OSINT Intelligence",
                "Legal ERP & KYC Compliance"
            ],
            "areaServed": [
                { "@type": "Country", "name": "United Arab Emirates" },
                { "@type": "Country", "name": "Saudi Arabia" },
                { "@type": "Place", "name": "GCC Region" }
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
            "alternateName": "المستكشف",
            "publisher": { "@id": "https://www.almstkshf.com/#organization" },
            "inLanguage": ["ar", "en"],
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
            "alternateName": "المستكشف دبي",
            "image": "https://www.almstkshf.com/logo.png",
            "@id": "https://www.almstkshf.com/dubai",
            "url": "https://www.almstkshf.com",
            "telephone": "+971-58-59-52-035",
            "priceRange": "$$$",
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
            },
            "openingHoursSpecification": [
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                    "opens": "08:00",
                    "closes": "18:00"
                }
            ]
        },
        {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Tamer Younes",
            "jobTitle": "Founder & CEO",
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
