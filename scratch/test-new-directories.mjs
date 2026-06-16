import Parser from 'rss-parser';

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function testFeed(name, url) {
    console.log(`\nTesting ${name}: ${url}`);
    const parser = new Parser({ timeout: 10000 });
    
    try {
        console.log(`  [Test] Standard parseURL...`);
        const feed = await parser.parseURL(url);
        console.log(`  ✅ Success! Got ${feed.items?.length} items.`);
        if (feed.items?.length > 0) {
            console.log(`  First item: "${feed.items[0].title}"`);
        }
    } catch (e) {
        console.log(`  ❌ Failed standard parse: ${e.message}`);
        
        try {
            console.log(`  [Test Fallback] Fetch with Browser UA + parseString...`);
            const res = await fetch(url, {
                headers: {
                    'User-Agent': BROWSER_UA,
                    'Accept': 'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7'
                }
            });
            if (!res.ok) {
                console.log(`  ❌ Fetch failed with HTTP ${res.status}`);
            } else {
                const xml = await res.text();
                const feed = await parser.parseString(xml);
                console.log(`  ✅ Success fallback! Got ${feed.items?.length} items.`);
            }
        } catch (err) {
            console.log(`  ❌ Fallback also failed: ${err.message}`);
        }
    }
}

const NEW_FEEDS = [
    { name: "Campus Technology - All Articles", url: "https://campustechnology.com/rss-feeds/all-articles.aspx" },
    { name: "Campus Technology - News", url: "https://campustechnology.com/rss-feeds/news.aspx" },
    { name: "TechCrunch - Latest", url: "https://techcrunch.com/feed/" },
    { name: "The Verge - Latest", url: "https://www.theverge.com/rss/index.xml" },
    { name: "BBC Technology (UK)", url: "http://newsrss.bbc.co.uk/rss/newsonline_uk_edition/technology/rss.xml" },
    { name: "BBC Business (UK)", url: "http://newsrss.bbc.co.uk/rss/newsonline_uk_edition/business/rss.xml" }
];

async function run() {
    for (const f of NEW_FEEDS) {
        await testFeed(f.name, f.url);
    }
}

run();
