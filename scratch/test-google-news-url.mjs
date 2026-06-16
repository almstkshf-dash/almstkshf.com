import Parser from 'rss-parser';

async function test() {
  const query = `site:almadarmagazine.ae/2026/05/01/تزامناً-مع-اليوم-العالمي-للعمال-هوتباك/`;
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ar-AE&gl=AE&ceid=AE:ar`;
  
  try {
    const res = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });
    const xml = await res.text();
    const parser = new Parser();
    const feed = await parser.parseString(xml);
    
    console.log(`\n--- URL Index Check ---`);
    console.log(`Found: ${feed.items.length} items`);
    feed.items.forEach(item => {
      console.log(`Title: ${item.title}`);
    });
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
