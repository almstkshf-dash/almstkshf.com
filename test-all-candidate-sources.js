const https = require('https');
const http = require('http');
const { URL } = require('url');
const Parser = require('rss-parser');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  }
});

const sourcesToTest = [
  { name: 'Emarat Al Youm Local', url: 'https://www.emaratalyoum.com/1.533091?ot=ot.AjaxPageLayout' },
  { name: 'MC Doualiya Decryptage', url: 'https://www.mc-doualiya.com/chronicles/decryptage-mcd/podcast' },
  { name: '24.ae Standard', url: 'https://24.ae/rss.aspx' },
  { name: '24.ae WWW', url: 'https://www.24.ae/rss.aspx' },
  { name: 'UAE Barq', url: 'https://www.uaebarq.ae/ar/feed/' },
  { name: 'UAE Barq Alt', url: 'https://www.uaebarq.ae/feed/' },
  { name: 'ADNOC Press Releases', url: 'https://adnoc.ae/ar/news-and-media/press-releases' },
  { name: 'Pan Time Arabia', url: 'https://pantimearabia.com/feed/' },
  { name: 'The News Mirror', url: 'https://thenewsmirror.in/feed/' },
  { name: 'Nabd El Emirate', url: 'https://nbdelemirate.com/feed/' },
  { name: 'Gulf Time', url: 'https://gulftime.online/feed/' },
  { name: 'New Vora Group', url: 'https://newvoragroup.com/feed/' },
  { name: 'Ya Watan', url: 'https://www.ya-watan.com/feed/' },
  { name: 'Ain Al Emirate', url: 'https://www.ainalemirate.com/feed/' },
  { name: 'Mena Scoop', url: 'https://menascoop.com/feed/' }
];

function fetchWithRedirects(targetUrl, headers = {}, depth = 0) {
  if (depth > 5) {
    return Promise.reject(new Error('Too many redirects'));
  }
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(targetUrl);
      const client = parsedUrl.protocol === 'https:' ? https : http;
      
      const req = client.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, text/html, */*',
          'Accept-Language': 'ar,en;q=0.9',
          ...headers
        },
        timeout: 10000
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
  for (const src of sourcesToTest) {
    console.log(`\n=========================================\nTesting: ${src.name} (${src.url})`);
    try {
      const res = await fetchWithRedirects(src.url);
      console.log(`Status: ${res.status}`);
      console.log(`Final URL: ${res.finalUrl}`);
      console.log(`Content-Type: ${res.headers['content-type']}`);
      console.log(`Body Length: ${res.body.length}`);
      
      if (res.status === 200) {
        // Try parsing
        try {
          const feed = await parser.parseString(res.body);
          console.log(`  SUCCESS! Parsed feed: "${feed.title}"`);
          console.log(`  Items Count: ${feed.items.length}`);
          if (feed.items.length > 0) {
            console.log(`  First item: "${feed.items[0].title}" -> ${feed.items[0].link}`);
          }
        } catch (parseErr) {
          console.log(`  FAIL to parse as RSS: ${parseErr.message}`);
          console.log(`  Body preview: ${res.body.substring(0, 300).replace(/\s+/g, ' ')}`);
        }
      }
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
    }
  }
}

testAll();
