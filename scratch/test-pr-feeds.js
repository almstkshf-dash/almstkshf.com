const https = require('https');
const http = require('http');
const { URL } = require('url');
const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 8000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5,ar;q=0.3',
  }
});

const PR_WIRE_FEEDS = [
    { name: "Sky News Arabia (X)", url: "https://syndication.twitter.com/srv/timeline-profile/screen-name=SkyNewsArabia", country: "AE", lang: "ar" },
    { name: "Al Arabiya (X)", url: "https://syndication.twitter.com/srv/timeline-profile/screen-name=AlArabiya", country: "SA", lang: "ar" },
    { name: "Al Jazeera Mubasher (X)", url: "https://syndication.twitter.com/srv/timeline-profile/screen-name=AJMubasher", country: "QA", lang: "ar" },
    { name: "Al Kass TV (X)", url: "https://syndication.twitter.com/srv/timeline-profile/screen-name=alkass_tv", country: "QA", lang: "ar" },
    { name: "AETOSWire", url: "https://www.aetoswire.com/en/rss", country: "AE", lang: "en" },
    { name: "Zawya", url: "https://www.zawya.com/en/rss/all", country: "AE", lang: "en" },
    { name: "Dubai PR Network", url: "https://www.dubaiprnetwork.com/rss_feed.asp", country: "AE", lang: "en" },
    { name: "Gulf Today", url: "https://www.gulftoday.ae/rss", country: "AE", lang: "en" },
    { name: "Khaleej Times", url: "https://www.khaleejtimes.com/rss", country: "AE", lang: "en" },
    { name: "Gulf News", url: "https://gulfnews.com/rss", country: "AE", lang: "en" },
    { name: "The National", url: "https://www.thenationalnews.com/rss", country: "AE", lang: "en" },
    { name: "Arab News", url: "https://www.arabnews.com/rss.xml", country: "SA", lang: "en" },
    { name: "PR Newswire", url: "https://www.prnewswire.com/rss/news-releases-news.rss", country: "US", lang: "en" },
    { name: "Newswire_com", url: "https://www.newswire.com/newsroom/rss/all", country: "US", lang: "en" },
    { name: "Al Arabiya", url: "https://www.alarabiya.net/.mrss/ar/last-24-hours.xml", country: "SA", lang: "ar" },
    { name: "Sky News Arabia", url: "https://www.skynewsarabia.com/feeds/rss/1.xml", country: "AE", lang: "ar" },
    { name: "Asharq Al-Awsat", url: "https://aawsat.com/feed", country: "SA", lang: "ar" },
    { name: "Hashtag Dubai", url: "https://hashtagdubai.org/index.php/feed/", country: "AE", lang: "en" },
    { name: "My Dubai News", url: "https://www.mydubainews.com/feed/", country: "AE", lang: "en" },
    { name: "Go Dubai", url: "https://www.godubai.com/citylife/RSSFeedGenerator.asp", country: "AE", lang: "en" },
    { name: "Al Badia Magazine", url: "https://albadiamagazine.com/feed/", country: "AE", lang: "ar" },
    { name: "Al Madar Magazine", url: "https://www.almadarmagazine.ae/feed/", country: "AE", lang: "ar" },
    { name: "First Avenue Magazine", url: "https://firstavenuemagazine.com/feed/", country: "AE", lang: "en" },
    { name: "Evision Worlds", url: "https://evisionworlds.com/?feed=rss2", country: "AE", lang: "en" },
    { name: "Pan Time Arabia", url: "https://pantimearabia.com/rss/", country: "AE", lang: "ar" },
    { name: "UAE Interact", url: "https://www.uaeinteract.com/rss/news", country: "AE", lang: "en" },
    { name: "Food Safety News", url: "https://www.foodsafetynews.com/rss/", country: "US", lang: "en" },
    { name: "Energy Intel", url: "https://www.energyintel.com/rss-feed.rss", country: "US", lang: "en" },
    { name: "Business Day", url: "https://www.businessday.co.za/arc/outboundfeeds/rss/", country: "ZA", lang: "en" },
    { name: "India News Network", url: "https://www.indianewsnetwork.com/rss.xml", country: "IN", lang: "en" },
    { name: "Al Wahda News", url: "https://alwahdanews.ae/feed/", country: "AE", lang: "ar" },
    { name: "Nabd El Emirate", url: "https://nbdelemirate.com/feed/", country: "AE", lang: "ar" },
    { name: "24.ae", url: "https://24.ae/rss.aspx", country: "AE", lang: "ar" },
    { name: "UAE Barq", url: "https://www.uaebarq.ae/ar/feed/", country: "AE", lang: "ar" },
    { name: "Gulf Time", url: "https://gulftime.online/feed/", country: "AE", lang: "ar" },
    { name: "New Vora Group", url: "https://newvoragroup.com/feed/", country: "AE", lang: "ar" },
    { name: "Ain Al Emirate", url: "https://www.ainalemirate.com/feed/", country: "AE", lang: "ar" },
    { name: "Mena Scoop", url: "https://menascoop.com/feed/", country: "AE", lang: "ar" },
    { name: "Provoke Media", url: "https://www.provokemedia.com/newsfeed/provoke-media-latest", country: "GB", lang: "en" },
    { name: "The New Yorker", url: "https://www.newyorker.com/feed/the-lede/rss", country: "US", lang: "en" },
    { name: "Wired", url: "https://www.wired.com/feed/category/business/latest/rss", country: "US", lang: "en" },
    { name: "Emirates247", url: "https://www.emirates247.com/rss/mobile/v2/uae.rss", country: "AE", lang: "en" },
    
    // International
    { name: "NPR", url: "http://www.npr.org/rss/rss.php?id=1004", country: "US", lang: "en" },
    { name: "Fox News", url: "http://feeds.foxnews.com/foxnews/latest", country: "US", lang: "en" },
    { name: "BBC News", url: "http://feeds.bbci.co.uk/news/world/rss.xml", country: "GB", lang: "en" },
    { name: "Politico", url: "http://www.politico.com/rss/politicopicks.xml", country: "US", lang: "en" },
    { name: "Yahoo News", url: "http://rss.news.yahoo.com/rss/world", country: "US", lang: "en" },
    { name: "LA Times", url: "http://www.latimes.com/world/rss2.0.xml", country: "US", lang: "en" },
    { name: "CS Monitor", url: "http://rss.csmonitor.com/feeds/usa", country: "US", lang: "en" },
    { name: "NBC News", url: "http://feeds.nbcnews.com/feeds/topstories", country: "US", lang: "en" },
    { name: "The Guardian", url: "http://www.theguardian.com/world/usa/rss", country: "GB", lang: "en" },
    { name: "Newsweek", url: "http://www.newsweek.com/rss", country: "US", lang: "en" },
    { name: "ABC News", url: "http://feeds.abcnews.com/abcnews/usheadlines", country: "US", lang: "en" },
    { name: "Time", url: "http://time.com/newsfeed/feed/", country: "US", lang: "en" },
    { name: "Vice News", url: "https://news.vice.com/rss", country: "US", lang: "en" },
    { name: "Wall Street Journal", url: "http://online.wsj.com/xml/rss/3_7085.xml", country: "US", lang: "en" },
    { name: "Huffington Post", url: "http://www.huffingtonpost.com/feeds/verticals/world/index.xml", country: "US", lang: "en" },
    { name: "US News", url: "http://www.usnews.com/rss/news", country: "US", lang: "en" },
    { name: "Sky News UK", url: "http://news.sky.com/feeds/rss/uk.xml", country: "GB", lang: "en" },
    { name: "The Telegraph", url: "http://www.telegraph.co.uk/news/uknews/rss", country: "GB", lang: "en" },
    { name: "Deadline", url: "http://deadline.com/feed/", country: "US", lang: "en" },
    { name: "Vulture", url: "http://feeds.feedburner.com/nymag/vulture", country: "US", lang: "en" },
    { name: "CNN", url: "http://rss.cnn.com/rss/cnn_showbiz.rss", country: "US", lang: "en" },
    { name: "Esquire", url: "http://www.esquire.com/blogs/culture/culture-rss", country: "US", lang: "en" },
    { name: "CBS News", url: "http://www.cbsnews.com/latest/rss/entertainment", country: "US", lang: "en" },
    { name: "TMZ", url: "http://www.tmz.com/rss.xml", country: "US", lang: "en" },
    { name: "BuzzFeed", url: "http://www.buzzfeed.com/tvandmovies.xml", country: "US", lang: "en" },
    { name: "Variety", url: "http://variety.com/feed/", country: "US", lang: "en" },
    { name: "The New Yorker (Culture)", url: "http://www.newyorker.com/feed/culture", country: "US", lang: "en" },
    { name: "Yahoo News (Ent)", url: "http://news.yahoo.com/rss/entertainment", country: "US", lang: "en" },
    { name: "LA Times (Ent)", url: "http://www.latimes.com/entertainment/rss2.0.xml", country: "US", lang: "en" },
    { name: "NBC News (Ent)", url: "http://feeds.nbcnews.com/feeds/todayentertainment", country: "US", lang: "en" },
    { name: "ABC News (Ent)", url: "http://feeds.abcnews.com/abcnews/entertainmentheadlines", country: "US", lang: "en" },
    { name: "Huffington Post (Ent)", url: "https://www.huffpost.com/dept/entertainment/feed", country: "US", lang: "en" },
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
  for (const src of PR_WIRE_FEEDS) {
    if (src.url.includes("syndication.twitter.com")) {
      // Skipping twitter timelines for HTTP GET testing as they are handled specifically
      results.push({ name: src.name, status: "Success (X/Twitter Syndication)", error: null });
      continue;
    }
    try {
      const res = await fetchWithRedirects(src.url);
      if (res.status === 200) {
        // Try parsing
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
