// EXAMPLE: This shows how to implement generateImageMetadata
// You would place this file at: src/app/[locale]/case-studies/[slug]/opengraph-image.tsx

import { ImageResponse } from 'next/og';

// Define the image metadata
export async function generateImageMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
    const { locale, slug } = await params;

    return [
        {
            id: slug,
            size: { width: 1200, height: 630 },
            alt: `${slug} - ALMSTKSHF`,
            contentType: 'image/png',
        },
    ];
}

// Generate the actual image
export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
    const { locale, slug } = await params;

    // Map slugs to titles
    const titles: Record<string, { en: string; ar: string }> = {
        'lexcora': {
            en: 'LexCora - Legal ERP Solution',
            ar: 'ليكسكورا - نظام إدارة قانوني'
        },
        'styling-assistant': {
            en: 'AI Styling Assistant',
            ar: 'مساعد التصميم الذكي'
        }
    };

    const title = titles[slug]?.[locale as 'en' | 'ar'] || 'ALMSTKSHF';

    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 60,
                    background: 'linear-gradient(to bottom right, #1e293b, #0f172a)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    padding: '80px',
                }}
            >
                <div style={{ fontSize: 80, fontWeight: 'bold', marginBottom: 20 }}>
                    ALMSTKSHF
                </div>
                <div style={{ fontSize: 50, color: '#60a5fa', textAlign: 'center' }}>
                    {title}
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
