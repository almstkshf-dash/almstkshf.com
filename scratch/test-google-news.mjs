import Parser from 'rss-parser';

async function test() {
  const query = "هوتباك";
  const hl = "ar-AE";
  const gl = "AE";
  const ceid = "AE:ar";
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${hl}&gl=${gl}&ceid=${ceid}`;
  
  console.log(`Searching Google News RSS for query: "${query}"...`);
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
    
    console.log(`\n--- Found ${feed.items.length} articles on Google News RSS ---`);
    feed.items.forEach((item, index) => {
      console.log(`${index + 1}. [${item.pubDate}] -> ${item.title}`);
      console.log(`   Link: ${item.link}`);
      console.log(`---`);
    });
    
    // Check if any mention of Al Madar is there
    const almadarItems = feed.items.filter(item => item.link.includes("almadarmagazine") || item.title.includes("المدار") || item.title.includes("Al Madar"));
    console.log(`\nMentions of Al Madar: ${almadarItems.length} items`);
    almadarItems.forEach(item => {
      console.log(`- ${item.title} (${item.link})`);
    });

  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
