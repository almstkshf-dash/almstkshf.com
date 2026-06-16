import * as cheerio from 'cheerio';

async function extractWithDirectScraper(url) {
  try {
    console.log(`Simulating extractWithDirectScraper for: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract title
    let title = $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('title').text() ||
        $('h1').first().text();

    title = title ? title.trim() : '';

    // Extract description/text
    let text = $('meta[property="og:description"]').attr('content') ||
        $('meta[name="twitter:description"]').attr('content') ||
        $('meta[name="description"]').attr('content');

    const paragraphs = [];
    $('article p, .entry-content p, .post-content p, p').each((_, el) => {
        const pText = $(el).text().trim();
        if (pText.length > 20) {
            paragraphs.push(pText);
        }
    });

    if (paragraphs.length > 0) {
        text = paragraphs.join('\n\n');
    } else {
        text = text ? text.trim() : '';
    }

    const image = $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content');

    console.log("\n--- Extracted Successfully! ---");
    console.log("Title:", title);
    console.log("Image:", image);
    console.log("Content snippet (first 300 chars):", text.substring(0, 300));
    
  } catch (err) {
    console.error("Extraction failed:", err.message);
  }
}

const targetUrl = "https://www.almadarmagazine.ae/2026/05/01/%D8%AA%D8%B2%D8%A7%D9%85%D9%86%D8%A7%D9%8B-%D9%85%D8%B9-%D8%A7%D9%84%D9%8A%D9%88%D9%85-%D8%A7%D9%84%D8%B9%D8%A7%D9%84%D9%85%D9%8A-%D9%84%D9%84%D8%B9%D9%85%D8%A7%D9%84-%D9%87%D9%88%D8%AA%D8%A8/";
extractWithDirectScraper(targetUrl);
