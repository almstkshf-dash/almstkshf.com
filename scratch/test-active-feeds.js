const Parser = require('rss-parser');

const parser = new Parser({
    timeout: 10000,
    customFields: {
        item: [['media:content', 'mediaContent'], ['content:encoded', 'contentEncoded']]
    },
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
});

const PR_WIRE_FEEDS = [
    { name: "Sky News Arabia (X)", url: "https://syndication.twitter.com/srv/timeline-profile/screen-name=SkyNewsArabia", country: "AE", lang: "ar" },
    { name: "Al Arabiya (X)", url: "https://syndication.twitter.com/srv/timeline-profile/screen-name=AlArabiya", country: "SA", lang: "ar" },
    { name: "Al Jazeera Mubasher (X)", url: "https://syndication.twitter.com/srv/timeline-profile/screen-name=AJMubasher", country: "QA", lang: "ar" },
    { name: "Al Kass TV (X)", url: "https://syndication.twitter.com/srv/timeline-profile/screen-name=alkass_tv", country: "QA", lang: "ar" },
    { name: "Dubai PR Network", url: "https://www.dubaiprnetwork.com/rss_feed.asp", country: "AE", lang: "en" },
    { name: "Gulf Today", url: "https://www.gulftoday.ae/rssFeed/0/", country: "AE", lang: "en" },
    { name: "The National", url: "https://www.thenationalnews.com/arc/outboundfeeds/rss/?outputType=xml", country: "AE", lang: "en" },
    { name: "Arab News", url: "https://www.arabnews.com/rss.xml", country: "SA", lang: "en" },
    { name: "Newswire_com", url: "https://www.newswire.com/newsroom/rss/all", country: "US", lang: "en" },
    { name: "Sky News Arabia", url: "https://www.skynewsarabia.com/rss.xml", country: "AE", lang: "ar" },
    { name: "Asharq Al-Awsat", url: "https://aawsat.com/feed", country: "SA", lang: "ar" },
    { name: "Hashtag Dubai", url: "https://hashtagdubai.org/index.php/feed/", country: "AE", lang: "en" },
    { name: "My Dubai News", url: "https://www.mydubainews.com/feed/", country: "AE", lang: "en" },
    { name: "Al Badia Magazine", url: "https://albadiamagazine.com/feed/", country: "AE", lang: "ar" },
    { name: "Al Madar Magazine", url: "https://www.almadarmagazine.ae/feed/", country: "AE", lang: "ar" },
    { name: "First Avenue Magazine", url: "https://firstavenuemagazine.com/feed/", country: "AE", lang: "en" },
    { name: "Evision Worlds", url: "https://evisionworlds.com/?feed=rss2", country: "AE", lang: "en" },
    { name: "Pan Time Arabia", url: "https://pantimearabia.com/rss/", country: "AE", lang: "ar" },
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
    { name: "NPR", url: "http://www.npr.org/rss/rss.php?id=1004", country: "US", lang: "en" },
    { name: "Fox News", url: "http://feeds.foxnews.com/foxnews/latest", country: "US", lang: "en" },
    { name: "BBC News", url: "http://feeds.bbci.co.uk/news/world/rss.xml", country: "GB", lang: "en" },
    { name: "Yahoo News", url: "http://rss.news.yahoo.com/rss/world", country: "US", lang: "en" },
    { name: "LA Times", url: "http://www.latimes.com/world/rss2.0.xml", country: "US", lang: "en" },
    { name: "CS Monitor", url: "http://rss.csmonitor.com/feeds/usa", country: "US", lang: "en" },
    { name: "NBC News", url: "http://feeds.nbcnews.com/feeds/topstories", country: "US", lang: "en" },
    { name: "The Guardian", url: "http://www.theguardian.com/world/usa/rss", country: "GB", lang: "en" },
    { name: "Newsweek", url: "https://www.newsweek.com/rss", country: "US", lang: "en" },
    { name: "ABC News", url: "http://feeds.abcnews.com/abcnews/usheadlines", country: "US", lang: "en" },
    { name: "Deadline", url: "http://deadline.com/feed/", country: "US", lang: "en" },
    { name: "Vulture", url: "http://feeds.feedburner.com/nymag/vulture", country: "US", lang: "en" },
    { name: "CNN", url: "http://rss.cnn.com/rss/cnn_showbiz.rss", country: "US", lang: "en" },
    { name: "Esquire", url: "http://www.esquire.com/blogs/culture/culture-rss", country: "US", lang: "en" },
    { name: "CBS News", url: "http://www.cbsnews.com/latest/rss/entertainment", country: "US", lang: "en" },
    { name: "TMZ", url: "http://www.tmz.com/rss.xml", country: "US", lang: "en" },
    { name: "BuzzFeed", url: "http://www.buzzfeed.com/tvandmovies.xml", country: "US", lang: "en" },
    { name: "Variety", url: "http://variety.com/feed/", country: "US", lang: "en" },
    { name: "The New Yorker 2", url: "http://www.newyorker.com/feed/culture", country: "US", lang: "en" },
    { name: "Yahoo News 2", url: "http://news.yahoo.com/rss/entertainment", country: "US", lang: "en" },
    { name: "LA Times 2", url: "http://www.latimes.com/entertainment/rss2.0.xml", country: "US", lang: "en" },
    { name: "NBC News 2", url: "http://feeds.nbcnews.com/feeds/todayentertainment", country: "US", lang: "en" },
    { name: "ABC News 2", url: "http://feeds.abcnews.com/abcnews/entertainmentheadlines", country: "US", lang: "en" },
    { name: "Huffington Post", url: "https://www.huffpost.com/dept/entertainment/feed", country: "US", lang: "en" },
];

async function fetchRobustRss(url) {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5,ar;q=0.3',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        },
        redirect: 'follow',
    });

    if (!response.ok) {
        throw new Error(`HTTP_${response.status}`);
    }

    let xml = await response.text();
    xml = xml.replace(/[^\x09\x0A\x0D\x20-\xFF\x85\xA0-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]/g, "");
    return xml;
}

async function runTests() {
    for (const feed of PR_WIRE_FEEDS) {
        try {
            if (feed.url.includes("twitter.com") || feed.url.includes("x.com")) {
                console.log(`🐦 [${feed.name}] Twitter syndication feed: ${feed.url} - (Needs Bearer Token or Twitter Syndication parser)`);
                continue;
            }
            const xml = await fetchRobustRss(feed.url);
            const feedData = await parser.parseString(xml);
            console.log(`✅ [${feed.name}] SUCCESS! Parsed ${feedData.items.length} items`);
        } catch (err) {
            console.log(`❌ [${feed.name}] FAILED: ${err.message}`);
        }
    }
}

runTests();
