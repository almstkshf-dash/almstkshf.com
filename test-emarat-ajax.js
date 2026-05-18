const https = require('https');
const Parser = require('rss-parser');

const parser = new Parser();
const testUrl = 'https://www.emaratalyoum.com/1.533091?ot=ot.AjaxPageLayout';

function fetchUrl(targetUrl) {
  return new Promise((resolve, reject) => {
    https.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7',
        'Accept-Language': 'ar,en;q=0.9',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function run() {
  try {
    const res = await fetchUrl(testUrl);
    console.log(`Status: ${res.status}`);
    console.log(`Body Length: ${res.body.length}`);
    console.log(`Body starts with: ${res.body.substring(0, 500)}`);
    
    const feed = await parser.parseString(res.body);
    console.log(`Feed Title: ${feed.title}`);
    console.log(`Feed Items Count: ${feed.items.length}`);
    if (feed.items.length > 0) {
      console.log(`First Item Title: ${feed.items[0].title}`);
      console.log(`First Item Link: ${feed.items[0].link}`);
    }
  } catch (err) {
    console.error('Error parsing feed:', err);
  }
}

run();
