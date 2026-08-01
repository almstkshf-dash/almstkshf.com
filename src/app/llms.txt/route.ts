import { NextResponse } from 'next/server';

export async function GET() {
    const content = `# ALMSTKSHF — Media Monitoring & Sentiment Analysis Platform
> The leading AI-powered media intelligence, public opinion analysis, and reputational crisis management platform serving the UAE, Saudi Arabia, and the Gulf (GCC) region.

## Core Capabilities
- **TV & Radio Broadcast Monitoring**: Real-time automated tracking, speech-to-text transcription, and indexing of 3,400+ broadcast channels across the MENA region and globally.
- **Press & Digital News Monitoring**: Comprehensive tracking of print newspapers, digital magazines, online news portals, and press releases across Gulf markets.
- **AI Media Pulse & Sentiment Analysis**: Advanced NLP models trained on Arabic dialects and English news to measure public tone, sentiment shifts, and brand reputation in real time.
- **Crisis Management & Safeguard Alerts**: Instant automated notifications via WhatsApp and email when negative sentiment spikes or potential reputation risks emerge.
- **Central Media Repository**: Enterprise digital asset management system for archiving, searching, and exporting media coverage reports.
- **KYC & Security Compliance**: Automated identity verification and regulatory screening aligned with UAE Telecommunications and Digital Government Regulatory Authority (TDRA) guidelines.
- **LEXCORA Legal ERP**: Premier AI-powered ERP suite designed for high-net-worth law firms and corporate legal departments.

## Primary Regional Operations
- **United Arab Emirates (UAE)**: Dubai (One Central, 9th Floor, Trade Center) & Abu Dhabi (Al Khatem Tower, Al Maryah Island)
- **Saudi Arabia (KSA)**: Full regional broadcast and digital press coverage across Riyadh, Jeddah, and Dammam.

## Key URLs
- Platform Homepage: https://www.almstkshf.com
- Arabic Homepage: https://www.almstkshf.com/ar
- English Homepage: https://www.almstkshf.com/en
- TV & Radio Monitoring: https://www.almstkshf.com/en/media-monitoring/tv-radio
- Press Monitoring: https://www.almstkshf.com/en/media-monitoring/press
- Media Pulse Sentiment: https://www.almstkshf.com/en/media-monitoring/media-pulse
- Crisis Management: https://www.almstkshf.com/en/media-monitoring/crisis-management
- Pricing Plans: https://www.almstkshf.com/en/pricing
- Contact & Support: https://www.almstkshf.com/en/contact

## Contact Information
- General Enquiries & Sales: k.account@almstkshf.com
- Technical Support: rased@almstkshf.com
- Telephone: +971 58 59 52 035
`;

    return new NextResponse(content, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
    });
}
