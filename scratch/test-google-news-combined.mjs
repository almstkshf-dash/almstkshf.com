import Parser from 'rss-parser';

async function test() {
  const keyword = "هوتباك";
  
  // List of domains from our UAE / regional news agencies in PR_WIRE_FEEDS
  const domains = [
    "dubaiprnetwork.com",
    "arabnews.com",
    "aawsat.com",
    "hashtagdubai.org",
    "mydubainews.com",
    "albadiamagazine.com",
    "almadarmagazine.ae",
    "firstavenuemagazine.com",
    "evisionworlds.com",
    "pantimearabia.com",
    "alwahdanews.ae",
    "nbdelemirate.com",
    "24.ae",
    "uaebarq.ae",
    "gulftime.online",
    "newvoragroup.com",
    "ainalemirate.com",
    "menascoop.com",
    "emirates247.com"
  ];
  
  const siteRestrictions = domains.map(d => `site:${d}`).join(" OR ");
  const query = `"${keyword}" (${siteRestrictions})`;
  
  const hl = "ar-AE";
  const gl = "AE";
  const ceid = "AE:ar";
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${hl}&gl=${gl}&ceid=${ceid}`;
  
  console.log(`Searching Google News RSS with site restrictions for keyword "${keyword}"...`);
  console.log(`Query: ${query.substring(0, 100)}...`);
  
  try {
    const res = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });
    
    if (!res.ok) {
      throw new Error(`Google News RSS failed with status: ${res.status}`);
    }
    
    const xml = await res.text();
    const parser = new Parser();
    const feed = await parser.parseString(xml);
    
    console.log(`\n--- Found ${feed.items.length} articles matching restricted domains ---`);
    feed.items.forEach((item, index) => {
      console.log(`${index + 1}. [${item.pubDate}] -> ${item.title}`);
      console.log(`   Link: ${item.link}`);
      console.log(`---`);
    });
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
