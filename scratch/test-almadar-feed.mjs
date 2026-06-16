import Parser from 'rss-parser';

async function test() {
  console.log("Fetching Al Madar Magazine feed live to see what articles are currently in the RSS XML...");
  const feedUrl = "https://www.almadarmagazine.ae/feed/";
  
  try {
    const res = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });
    
    if (!res.ok) {
      throw new Error(`Direct fetch failed with status: ${res.status}`);
    }
    
    const xml = await res.text();
    const data = { success: true, rawContent: xml };
    
    console.log("Successfully fetched feed XML! Parsing titles...");
    const parser = new Parser();
    const feed = await parser.parseString(data.rawContent);
    
    console.log(`\n--- Active Articles in RSS XML Feed (${feed.items.length} total) ---`);
    feed.items.forEach((item, index) => {
      console.log(`${index + 1}. [${item.pubDate || 'No Date'}] -> ${item.title}`);
    });
    
    // Check if the user's article title or "هوتباك" is present
    const searchTerm = "هوتباك";
    const found = feed.items.filter(item => item.title.includes(searchTerm) || (item.contentSnippet && item.contentSnippet.includes(searchTerm)));
    console.log(`\nSearch for '${searchTerm}': Found ${found.length} matches in current feed.`);
    
  } catch (err) {
    console.error("❌ Error running test:", err.message);
  }
}

test();
