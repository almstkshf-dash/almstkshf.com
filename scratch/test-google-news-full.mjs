import Parser from 'rss-parser';

async function test() {
  const query = `"هوتباك" site:almadarmagazine.ae`;
  const hl = "ar-AE";
  const gl = "AE";
  const ceid = "AE:ar";
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${hl}&gl=${gl}&ceid=${ceid}`;
  
  try {
    const res = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });
    const xml = await res.text();
    const parser = new Parser();
    const feed = await parser.parseString(xml);
    
    console.log(`\n--- ALL ${feed.items.length} ARTICLES FROM GOOGLE NEWS ---`);
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
