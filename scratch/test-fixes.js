const https = require('https');
const http = require('http');
const { URL } = require('url');
const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 8000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, text/html, */*',
    'Accept-Language': 'en-US,en;q=0.9',
  }
});

const candidates = [
  { name: "Sky News Arabia", url: "https://www.skynewsarabia.com/rss.xml" },
  { name: "The National (with param)", url: "https://www.thenationalnews.com/arc/outboundfeeds/rss/?outputType=xml" },
  { name: "The National (without param)", url: "https://www.thenationalnews.com/arc/outboundfeeds/rss/" },
  { name: "Gulf Today (rssFeed/0/)", url: "https://www.gulftoday.ae/rssFeed/0/" },
  { name: "Newsweek", url: "https://www.newsweek.com/rss" },
];

function fetchWithRedirects(targetUrl, headers = {}, depth = 0) {
  if (depth > 5) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(targetUrl);
      const client = parsedUrl.protocol === 'https:' ? https : http;
      
      const req = client.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, text/html, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          ...headers
        },
        timeout: 8000
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const loc = new URL(res.headers.location, targetUrl).toString();
          return resolve(fetchWithRedirects(loc, headers, depth + 1));
        }

        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data, finalUrl: targetUrl }));
      });

      req.on('error', err => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function testAll() {
  const results = [];
  for (const src of candidates) {
    try {
      const res = await fetchWithRedirects(src.url);
      if (res.status === 200) {
        try {
          const feed = await parser.parseString(res.body);
          results.push({ name: src.name, status: "Success", itemsCount: feed.items.length, error: null });
        } catch (parseErr) {
          results.push({ name: src.name, status: "Parse Failed", error: parseErr.message });
        }
      } else {
        results.push({ name: src.name, status: `HTTP ${res.status}`, error: `HTTP status code ${res.status}` });
      }
    } catch (err) {
      results.push({ name: src.name, status: "Fetch Failed", error: err.message });
    }
  }
  console.log(JSON.stringify(results, null, 2));
}

testAll();
