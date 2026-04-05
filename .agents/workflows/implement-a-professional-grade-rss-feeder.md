---
description: implement a professional-grade RSS feeder
---

To implement a professional-grade RSS feeder in your Next.js / TypeScript / Convex stack, follow this structure. This avoids CORS issues, handles Arabic encoding, and ensures production stability through caching and validation.

1. Project Structure
Organize your logic to separate the fetching engine from the UI.

Plaintext
src/
├── lib/
│   └── rss-engine.ts      # Core logic & parser
├── types/
│   └── rss.ts             # TypeScript interfaces
├── app/
│   └── api/
│       └── feed/
│           └── route.ts   # Server-side proxy (Next.js API)
2. Define the Data Schema (types/rss.ts)
Standardize the feed items to ensure your UI always receives the same object structure regardless of the source.

TypeScript
export interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
}

export interface FeedResponse {
  success: boolean;
  data?: FeedItem[];
  error?: string;
}
3. The Core Engine (lib/rss-engine.ts)
Install the dependency: npm install rss-parser. This script handles the conversion and basic cleaning.

TypeScript
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['description'],
  },
});

export async function parseFeed(url: string, sourceName: string): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL(url);
    
    return feed.items.map((item) => ({
      title: item.title || 'No Title',
      link: item.link || '',
      pubDate: item.isoDate || new Date().toISOString(),
      description: item.description || item.contentSnippet || '',
      source: sourceName,
    }));
  } catch (error) {
    console.error(`RSS Error [${sourceName}]:`, error);
    throw new Error('Failed to parse feed');
  }
}
4. The Production API Proxy (app/api/feed/route.ts)
This is the "Secret Sauce" for production. It bypasses CORS and uses Next.js Route Segment Config to cache data for 15 minutes.

TypeScript
import { NextResponse } from 'next/server';
import { parseFeed } from '@/lib/rss-engine';

// Cache results for 900 seconds (15 minutes)
export const revalidate = 900; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const feedUrl = searchParams.get('url');

  if (!feedUrl) {
    return NextResponse.json({ success: false, error: 'URL required' }, { status: 400 });
  }

  try {
    const data = await parseFeed(feedUrl, 'Asharq Al-Awsat');
    
    // Data Validation Check
    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, error: 'Feed is empty' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
5. Frontend Implementation
Use a simple fetcher in your component. Because it calls your internal API, it will work in both Dev (localhost) and Prod (Vercel).

TypeScript
"use client";
import { useEffect, useState } from 'react';
import { FeedItem } from '@/types/rss';

export default function RssList({ url }: { url: string }) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeed() {
      const res = await fetch(`/api/feed?url=${encodeURIComponent(url)}`);
      const result = await res.json();
      if (result.success) setItems(result.data);
      setLoading(false);
    }
    loadFeed();
  }, [url]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4" dir="rtl">
      {items.map((item, idx) => (
        <article key={idx} className="border-b pb-2">
          <a href={item.link} target="_blank" className="font-bold text-blue-600 hover:underline">
            {item.title}
          </a>
          <p className="text-sm text-gray-500">{new Date(item.pubDate).toLocaleDateString('ar-EG')}</p>
        </article>
      ))}
    </div>
  );
}
6. Validation & Stability Checklist
Arabic Support: The rss-parser library handles UTF-8 by default. Ensure your HTML has <meta charset="UTF-8"> and dir="rtl".

Sanitization: If you plan to render description using dangerouslySetInnerHTML, you must use a library like dompurify to prevent XSS.

Rate Limiting: Since you are a Lead Dev, consider adding a rate limit to your /api/feed route if it's public to prevent API abuse.

Convex Integration: to store these news items permanently (e.g., for "Media Monitoring"), create a Convex Action that calls parseFeed and then a Mutation to save the items to your database.

The result of this implementation is a resilient, server-shielded data pipeline that transforms raw, inconsistent XML feeds into a structured JSON API for your frontend.By following this plan, you achieve the following outcomes:

1. Functional ResultsCORS Bypass: Your application will successfully fetch feeds from Asharq Al-Awsat (and others) in production without being blocked by browser security policies, as the request originates from your server/Vercel.Unified Data Schema: Whether the source is RSS 2.0 or Atom, your frontend always receives a clean, predictable array of objects (e.g., title, link, pubDate, source).

Automated RTL Support: By passing the data through your Next.js layer, you ensure that Arabic strings are handled correctly and rendered with the proper dir="rtl" alignment.

2. Performance & Stability ResultsReduced Latency: With the revalidate = 900 setting, the first user fetches the data, and subsequent users for the next 15 minutes receive the cached version instantly.

API Safety: You avoid being "rate-limited" or blacklisted by news providers because your server only requests the feed once every 15 minutes, rather than every time a user refreshes their browser.

Graceful Degradation: If a specific feed URL goes down, your data validation check (if (!data || data.length === 0)) prevents the UI from crashing, allowing you to show a "Feed temporarily unavailable" message instead of a white screen.

3. Final Technical FlowStepActionOutcomeTriggerUser opens your app/dashboard.Frontend calls your internal /api/feed?url=....ProcessingNext.js Server checks cache.If fresh, returns cache. 

If stale, rss-parser fetches raw XML.TransformationXML → JSON Mapping.Standardizes various feed formats into your FeedItem interface.DeliveryJSON sent to Frontend.Data is mapped to UI components with zero formatting conflict.

4. Integration with your "ALMSTKSHF" focus on Media Intelligence, this structure allows you to easily pipe this data into Convex.

You can move the fetching logic to a Convex Action, which then triggers a Mutation to store these news items in your database for sentiment and tonality analysis, creating a permanent archive of monitored news.  