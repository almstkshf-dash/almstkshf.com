const cheerio = require('cheerio');

async function debugResolve(originalUrl) {
  const url = 'https://news.google.com/rss/articles/CBMingFBVV95cUxPV1p6WG9PRi1acmhDYTZQX3RVZF9SczVGVENYcFV5R0lQMlVXLXl5d0pVRjh0QTIxMjVPUS1DelcwWVh1WHpEdGZiMWVzU1VlWDA5dGd2c2pGSGlwWEh0anhLbV9JdXlKMnFZWVR4cXJtZ0RURklSTUtFVnNVRlFSTmdFS1pIak40MzRsRnpyZmdnN1B4aE1SYkJlZVBOd9IBpgFBVV95cUxOeE9mWTJWaXRNQ1BBTm5Xbng2eXVQYk40eXFFUGpwOTZEVC1pd1NLZHNPelNuS1pKbFE5OVNJQ2lvblc5elBwdFI5VE8zTjZNVUJLYUV5WnNTMTlOaEQ3eEZ3YjNPS01hVXAwOWhQSmJ5MEJpZlZDd3k4UlZTbTFMNGxZY0dPRGdSYV9Yemt2c3ZiX3RkRkZ2YVVOcFhDSGV3ZzdJMUhR?oc=5&hl=en-US&gl=US&ceid=US:en';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    const html = await res.text();
    console.log(`HTML fetched. Length: ${html.length}`);
    
    // Find all links containing khaleejtimes or khaleej
    const $ = cheerio.load(html);
    console.log('\n--- Searching for <a> tags ---');
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text();
      if (href && (href.includes('khaleej') || href.includes('http'))) {
        console.log(`Link: text="${text}", href="${href}"`);
      }
    });
    
    // Search raw text
    console.log('\n--- Checking matches in raw HTML ---');
    const index = html.indexOf('khaleejtimes.com');
    if (index !== -1) {
      console.log(`Found 'khaleejtimes.com' at index ${index}. Surrounding text:\n`);
      console.log(html.substring(Math.max(0, index - 200), Math.min(html.length, index + 200)));
    } else {
      console.log('khaleejtimes.com not found in raw HTML.');
    }
  } catch (err) {
    console.error(err);
  }
}

const googleNewsUrl = 'https://news.google.com/rss/articles/CBMingFBVV95cUxPV1p6WG9PRi1acmhDYTZQX3RVZF9SczVGVENYcFV5R0lQMlVXLXl5d0pVRjh0QTIxMjVPUS1DelcwWVh1WHpEdGZiMWVzU1VlWDA5dGd2c2pGSGlwWEh0anhLbV9JdXlKMnFZWVR4cXJtZ0RURklSTUtFVnNVRlFSTmdFS1pIak40MzRsRnpyZmdnN1B4aE1SYkJlZVBOd9IBpgFBVV95cUxOeE9mWTJWaXRNQ1BBTm5Xbng2eXVQYk40eXFFUGpwOTZEVC1pd1NLZHNPelNuS1pKbFE5OVNJQ2lvblc5elBwdFI5VE8zTjZNVUJLYUV5WnNTMTlOaEQ3eEZ3YjNPS01hVXAwOWhQSmJ5MEJpZlZDd3k4UlZTbTFMNGxZY0dPRGdSYV9Yemt2c3ZiX3RkRkZ2YVVOcFhDSGV3ZzdJMUhR?oc=5';
debugResolve(googleNewsUrl);
