
import Parser from 'rss-parser';

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function testFeed(name, url) {
    console.log(`\nTesting ${name}: ${url}`);
    const parser = new Parser({ timeout: 10000 });
    
    // Test 1: Standard parseURL (what convex/monitoringAction.ts does)
    try {
        console.log(`  [Test 1] Standard parseURL...`);
        const feed = await parser.parseURL(url);
        console.log(`  ✅ Success! Got ${feed.items?.length} items.`);
    } catch (e) {
        console.log(`  ❌ Failed: ${e.message}`);
    }

    // Test 2: Fetch with Browser UA + parseString (what src/lib/rss-engine.ts does)
    try {
        console.log(`  [Test 2] Fetch with Browser UA + parseString...`);
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
            console.log(`  ✅ Success! Got ${feed.items?.length} items.`);
        }
    } catch (e) {
        console.log(`  ❌ Failed: ${e.message}`);
    }
}

const FEEDS = [
    { name: "WAM (Economy AR)", url: "https://www.wam.ae/ar/rss/feed/g50ndvocjz?slug=rss-economy&vsCode=avs-001-1jc74qmetxqw&type=rss" },
    { name: "AETOSWire (AR)", url: "https://aetoswire.com/rss?lang=ar" },
    { name: "Middle East Eye", url: "https://www.middleeasteye.net/rss" }
];

async function run() {
    for (const f of FEEDS) {
        await testFeed(f.name, f.url);
    }
}

run();
