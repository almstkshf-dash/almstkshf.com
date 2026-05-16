/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

export interface RSSCategory {
  id: string;
  name: string;
  url: string;
  country?: string;
}

export const AAWSAT_SOURCES: RSSCategory[] = [
  { id: 'news', name: 'News', url: 'https://aawsat.com/feed' },
  { id: 'world', name: 'Arab World', url: 'https://aawsat.com/feed/arab-world' },
  { id: 'gulf', name: 'Gulf', url: 'https://aawsat.com/feed/gulf' },
  { id: 'economy', name: 'Economy', url: 'https://aawsat.com/feed/economy' },
  { id: 'political', name: 'Political', url: 'https://aawsat.com/feed/political' },
  { id: 'sport', name: 'Sport', url: 'https://aawsat.com/feed/sport' },
];

/**
 * Curated list of premium media monitoring sources for the UAE and Middle East.
 */
export const PREMIUM_SOURCES: Record<string, RSSCategory[]> = {
  'WAM (UAE)': [
    { id: 'wam-ar', name: 'WAM Arabic', url: 'https://wam.ae/ar/rss', country: 'UAE' },
    { id: 'wam-en', name: 'WAM English', url: 'https://wam.ae/en/rss', country: 'UAE' },
  ],
  'Al Arabiya': [
    { id: 'alarabiya-latest', name: 'Latest News', url: 'https://www.alarabiya.net/.mrss/ar/last-24-hours.xml', country: 'SA' },
    { id: 'alarabiya-saudi', name: 'Saudi Arabia', url: 'https://www.alarabiya.net/.mrss/ar/saudi-arabia.xml', country: 'SA' },
  ],
  'Sky News Arabia': [
    { id: 'skynews-me', name: 'Middle East', url: 'https://www.skynewsarabia.com/feeds/rss/1.xml', country: 'UAE' },
    { id: 'skynews-world', name: 'World', url: 'https://www.skynewsarabia.com/feeds/rss/2.xml', country: 'UAE' },
    { id: 'skynews-uae', name: 'UAE', url: 'https://www.skynewsarabia.com/feeds/rss/12.xml', country: 'UAE' },
  ],
  'Asharq Al-Awsat': AAWSAT_SOURCES,
  'PR Newswire': [
    { id: 'prnewswire-me', name: 'Middle East News', url: 'https://www.prnewswire.com/rss/middle-east/news/middle-east-news.rss' }
  ],
  'BBC Arabic': [
    { id: 'bbc-ar-me', name: 'Middle East', url: 'https://feeds.bbci.co.uk/arabic/rss.xml' }
  ],
  'Al Jazeera': [
    { id: 'aljazeera-news', name: 'Latest', url: 'https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84dbbe43033/2013-8-4' }
  ],
  'Hashtag Dubai': [
    { id: 'hashtag-dubai', name: 'Latest News', url: 'https://hashtagdubai.org/index.php/feed/', country: 'UAE' }
  ],
  'My Dubai News': [
    { id: 'mydubai-news', name: 'Latest News', url: 'https://www.mydubainews.com/feed/', country: 'UAE' }
  ],
  'Dubai PR Network': [
    { id: 'dubai-pr', name: 'Latest PR', url: 'https://www.dubaiprnetwork.com/rss_feed.asp', country: 'UAE' }
  ],
  'Go Dubai': [
    { id: 'go-dubai', name: 'City Life', url: 'https://www.godubai.com/citylife/RSSFeedGenerator.asp', country: 'UAE' }
  ],
  'Al Badia Magazine': [
    { id: 'albadia-mag', name: 'Latest Articles', url: 'https://albadiamagazine.com/feed/', country: 'UAE' }
  ],
  'Al Madar Magazine': [
    { id: 'almadar-mag', name: 'Latest Articles', url: 'https://www.almadarmagazine.ae/feed/', country: 'UAE' }
  ],
  'First Avenue Magazine': [
    { id: 'firstavenue-mag', name: 'Latest Articles', url: 'https://firstavenuemagazine.com/feed/', country: 'UAE' }
  ],
  'Evision Worlds': [
    { id: 'evision-worlds', name: 'Latest News', url: 'https://evisionworlds.com/?feed=rss2', country: 'UAE' }
  ],
  'Pan Time Arabia': [
    { id: 'pantime-arabia', name: 'Latest Articles', url: 'https://pantimearabia.com/rss/', country: 'UAE' }
  ],
  'Emirates247': [
    { id: 'e247-flash', name: 'Flash News', url: 'https://www.emirates247.com/rss/mobile/v2/flash-news.rss', country: 'UAE' },
    { id: 'e247-uae', name: 'UAE News', url: 'https://www.emirates247.com/rss/mobile/v2/uae.rss', country: 'UAE' },
    { id: 'e247-world', name: 'World News', url: 'https://www.emirates247.com/rss/mobile/v2/world.rss', country: 'UAE' },
    { id: 'e247-business', name: 'Business', url: 'https://www.emirates247.com/rss/mobile/v2/business.rss', country: 'UAE' },
  ],
  'Provoke Media': [
    { id: 'provoke-latest', name: 'Latest News', url: 'https://www.provokemedia.com/newsfeed/provoke-media-latest', country: 'GB' },
  ],
  'The New Yorker': [
    { id: 'newyorker-lede', name: 'The Lede', url: 'https://www.newyorker.com/feed/the-lede/rss', country: 'US' },
  ],
  'Wired': [
    { id: 'wired-business', name: 'Business', url: 'https://www.wired.com/feed/category/business/latest/rss', country: 'US' },
    { id: 'wired-ai', name: 'Artificial Intelligence', url: 'https://www.wired.com/feed/tag/ai/latest/rss', country: 'US' },
  ],
  // ── MEED — Middle East Economic Digest ────────────────────────────────────
  'MEED': [
    // Content & Analysis
    { id: 'meed-analysis', name: 'Analysis', url: 'https://www.meed.com/classifications/analysis/feed', country: 'AE' },
    { id: 'meed-comment', name: 'Commentary', url: 'https://www.meed.com/category/news/commentary/feed/', country: 'AE' },
    { id: 'meed-special', name: 'Special Reports', url: 'https://www.meed.com/classifications/analysis/special-report/rss', country: 'AE' },
    { id: 'meed-tenders', name: 'Tenders', url: 'https://www.meed.com/tenders/feed/', country: 'AE' },
    { id: 'meed-events', name: 'Events', url: 'https://www.meed.com/events/rss', country: 'AE' },
    // Sector feeds
    { id: 'meed-construction', name: 'Construction', url: 'https://www.meed.com/sector/construction/rss', country: 'AE' },
    { id: 'meed-finance', name: 'Finance', url: 'https://www.meed.com/sector/banking-finance/rss', country: 'AE' },
    { id: 'meed-industry', name: 'Industry', url: 'https://www.meed.com/sector/industrial/rss', country: 'AE' },
    { id: 'meed-oilgas', name: 'Oil & Gas', url: 'https://www.meed.com/sector/oil-and-gas/rss', country: 'AE' },
    { id: 'meed-petrochem', name: 'Petrochemicals', url: 'https://www.meed.com/sector/petrochemicals/rss', country: 'AE' },
    { id: 'meed-power', name: 'Power & Water', url: 'https://www.meed.com/sector/power-and-water/power/rss', country: 'AE' },
    { id: 'meed-tourism', name: 'Tourism', url: 'https://www.meed.com/sector/economy/tourism/rss', country: 'AE' },
    { id: 'meed-transport', name: 'Transport', url: 'https://www.meed.com/sector/transport/rss', country: 'AE' },
    { id: 'meed-water', name: 'Water', url: 'https://www.meed.com/sector/water/rss', country: 'AE' },
    { id: 'meed-tech', name: 'Technology & IT', url: 'https://www.meed.com/sector/Technology/rss', country: 'AE' },
    // Country feeds
    { id: 'meed-algeria', name: 'Algeria', url: 'https://www.meed.com/countries/algeria/rss/feed', country: 'DZ' },
    { id: 'meed-bahrain', name: 'Bahrain', url: 'https://www.meed.com/countries/gcc/bahrain/rss/feed', country: 'BH' },
    { id: 'meed-egypt', name: 'Egypt', url: 'https://www.meed.com/countries/north-africa/egypt/rss/feed', country: 'EG' },
    { id: 'meed-iran', name: 'Iran', url: 'https://www.meed.com/countries/iran/rss/feed', country: 'IR' },
    { id: 'meed-iraq', name: 'Iraq', url: 'https://www.meed.com/countries/iraq/rss/feed', country: 'IQ' },
    { id: 'meed-jordan', name: 'Jordan', url: 'https://www.meed.com/countries/levant/jordan/rss/feed', country: 'JO' },
    { id: 'meed-kuwait', name: 'Kuwait', url: 'https://www.meed.com/countries/gcc/kuwait/rss/feed', country: 'KW' },
    { id: 'meed-lebanon', name: 'Lebanon', url: 'https://www.meed.com/countries/levant/lebanon/rss/feed', country: 'LB' },
    { id: 'meed-libya', name: 'Libya', url: 'https://www.meed.com/countries/north-africa/libya/rss/feed', country: 'LY' },
    { id: 'meed-morocco', name: 'Morocco', url: 'https://www.meed.com/countries/north-africa/morocco/rss/feed', country: 'MA' },
    { id: 'meed-oman', name: 'Oman', url: 'https://www.meed.com/countries/gcc/oman/rss/feed', country: 'OM' },
    { id: 'meed-qatar', name: 'Qatar', url: 'https://www.meed.com/countries/gcc/qatar/rss/feed', country: 'QA' },
    { id: 'meed-saudi', name: 'Saudi Arabia', url: 'https://www.meed.com/countries/gcc/saudi-arabia/rss/feed', country: 'SA' },
    { id: 'meed-syria', name: 'Syria', url: 'https://www.meed.com/countries/levant/syria/rss/feed', country: 'SY' },
    { id: 'meed-tunisia', name: 'Tunisia', url: 'https://www.meed.com/countries/north-africa/tunisia/rss/feed', country: 'TN' },
    { id: 'meed-uae', name: 'UAE', url: 'https://www.meed.com/countries/gcc/uae/rss/feed', country: 'AE' },
  ],
  'Road Safety UAE': [
    { id: 'roadsafety-posts', name: 'Posts', url: 'https://www.roadsafetyuae.com/feed/?post_type=post', country: 'UAE' },
    { id: 'roadsafety-stories', name: 'Stories', url: 'https://www.roadsafetyuae.com/feed/?post_type=stories', country: 'UAE' },
    { id: 'roadsafety-proposals', name: 'Proposals', url: 'https://www.roadsafetyuae.com/feed/?post_type=proposals', country: 'UAE' },
  ],
  'Gulf Today': [
    { id: 'gulftoday-latest', name: 'Latest News', url: 'https://www.gulftoday.ae/rss', country: 'UAE' },
    { id: 'gulftoday-main', name: 'Latest News (Feed)', url: 'https://www.gulftoday.ae/rssFeed/0/', country: 'UAE' },
    { id: 'gulftoday-opinion', name: 'Opinion', url: 'https://www.gulftoday.ae/rssFeed/10/', country: 'UAE' },
    { id: 'gulftoday-news', name: 'News', url: 'https://www.gulftoday.ae/rssFeed/55/', country: 'UAE' },
    { id: 'gulftoday-culture', name: 'Culture', url: 'https://www.gulftoday.ae/rssFeed/56/', country: 'UAE' },
    { id: 'gulftoday-lifestyle', name: 'Lifestyle', url: 'https://www.gulftoday.ae/rssFeed/57/', country: 'UAE' },
    { id: 'gulftoday-sport', name: 'Sport', url: 'https://www.gulftoday.ae/rssFeed/58/', country: 'UAE' },
    { id: 'gulftoday-business', name: 'Business', url: 'https://www.gulftoday.ae/rssFeed/52/', country: 'UAE' },
  ],
  'Zawya': [
    { id: 'zawya-en', name: 'Latest News', url: 'https://www.zawya.com/en/rss/all', country: 'UAE' }
  ],
  'AETOSWire': [
    { id: 'aetoswire-en', name: 'Latest PR', url: 'https://www.aetoswire.com/en/rss', country: 'UAE' }
  ],
  'Arab News': [
    { id: 'arabnews-en', name: 'Latest News', url: 'https://www.arabnews.com/rss.xml', country: 'SA' }
  ],
  'Gulf News': [
    { id: 'gulfnews-en', name: 'Latest News', url: 'https://gulfnews.com/rss', country: 'UAE' }
  ],
  'Khaleej Times': [
    { id: 'khaleejtimes-en', name: 'Latest News', url: 'https://www.khaleejtimes.com/rss', country: 'UAE' }
  ],
  'The National': [
    { id: 'thenational-en', name: 'Latest News', url: 'https://www.thenationalnews.com/rss', country: 'UAE' }
  ],
  'Middle East Eye': [
    { id: 'mee-en', name: 'Latest News', url: 'https://www.middleeasteye.net/rss', country: 'GB' }
  ],
  'Al Bawaba': [
    { id: 'albawaba-en', name: 'Latest News', url: 'https://www.albawaba.com/rss/all', country: 'JO' }
  ],
  'Mehr News': [
    { id: 'mehr-en', name: 'Latest News', url: 'https://en.mehrnews.com/rss', country: 'IR' }
  ],
  'Egyptian Streets': [
    { id: 'egyptianstreets-en', name: 'Latest News', url: 'https://egyptianstreets.com/feed/', country: 'EG' }
  ],
  'Newswire_com': [
    { id: 'newswire-en', name: 'Latest PR', url: 'https://www.newswire.com/newsroom/rss/all', country: 'US' }
  ],
  'UAE Interact': [
    { id: 'uaeinteract-news', name: 'Latest News', url: 'https://www.uaeinteract.com/rss/news', country: 'UAE' }
  ],
  'Food Safety News': [
    { id: 'foodsafetynews-latest', name: 'Latest News', url: 'https://www.foodsafetynews.com/rss/', country: 'US' }
  ],
  'Energy Intel': [
    { id: 'energyintel-latest', name: 'Latest News', url: 'https://www.energyintel.com/rss-feed.rss', country: 'US' }
  ],
  'Business Day': [
    { id: 'businessday-latest', name: 'Latest News', url: 'https://www.businessday.co.za/arc/outboundfeeds/rss/', country: 'ZA' }
  ],
  'India News Network': [
    { id: 'indianewsnetwork-latest', name: 'Latest News', url: 'https://www.indianewsnetwork.com/rss.xml', country: 'IN' }
  ],
  'Al Wahda News': [
    { id: 'alwahdanews-latest', name: 'Latest News', url: 'https://alwahdanews.ae/feed/', country: 'UAE' }
  ],
  'Nabd El Emirate': [
    { id: 'nbdelemirate-latest', name: 'Latest News', url: 'https://nbdelemirate.com/feed/', country: 'UAE' }
  ],
  // ── International News Sources ─────────────────────────────────────────────
  'NPR': [
    { id: 'npr-world', name: 'World News', url: 'http://www.npr.org/rss/rss.php?id=1004', country: 'US' },
    { id: 'npr-national', name: 'National News', url: 'http://www.npr.org/rss/rss.php?id=1003', country: 'US' },
  ],
  'Fox News': [
    { id: 'foxnews-latest', name: 'Latest News', url: 'http://feeds.foxnews.com/foxnews/latest', country: 'US' },
  ],
  'BBC News': [
    { id: 'bbc-us-canada', name: 'US & Canada', url: 'http://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml', country: 'GB' },
    { id: 'bbc-world', name: 'World', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', country: 'GB' },
    { id: 'bbc-uk', name: 'UK', url: 'http://feeds.bbci.co.uk/news/uk/rss.xml', country: 'GB' },
  ],
  'Politico': [
    { id: 'politico-picks', name: 'Politico Picks', url: 'http://www.politico.com/rss/politicopicks.xml', country: 'US' },
  ],
  'Yahoo News': [
    { id: 'yahoo-world', name: 'World News', url: 'http://rss.news.yahoo.com/rss/world', country: 'US' },
    { id: 'yahoo-us', name: 'US News', url: 'http://news.yahoo.com/rss/us', country: 'US' },
  ],
  'LA Times': [
    { id: 'latimes-world', name: 'World News', url: 'http://www.latimes.com/world/rss2.0.xml', country: 'US' },
    { id: 'latimes-national', name: 'National News', url: 'http://www.latimes.com/nation/rss2.0.xml', country: 'US' },
  ],
  'CS Monitor': [
    { id: 'csmonitor-usa', name: 'USA', url: 'http://rss.csmonitor.com/feeds/usa', country: 'US' },
  ],
  'NBC News': [
    { id: 'nbcnews-top', name: 'Top Stories', url: 'http://feeds.nbcnews.com/feeds/topstories', country: 'US' },
    { id: 'nbcnews-world', name: 'World News', url: 'http://feeds.nbcnews.com/feeds/worldnews', country: 'US' },
  ],
  'The Guardian': [
    { id: 'guardian-us', name: 'US News', url: 'http://www.theguardian.com/world/usa/rss', country: 'GB' },
    { id: 'guardian-uk', name: 'UK News', url: 'http://www.theguardian.com/uk/rss', country: 'GB' },
  ],
  'Newsweek': [
    { id: 'newsweek-latest', name: 'Latest News', url: 'http://www.newsweek.com/rss', country: 'US' },
  ],
  'ABC News': [
    { id: 'abcnews-us', name: 'US Headlines', url: 'http://feeds.abcnews.com/abcnews/usheadlines', country: 'US' },
  ],
  'Time': [
    { id: 'time-newsfeed', name: 'Newsfeed', url: 'http://time.com/newsfeed/feed/', country: 'US' },
  ],
  'Vice News': [
    { id: 'vice-news', name: 'Latest News', url: 'https://news.vice.com/rss', country: 'US' },
  ],
  'Wall Street Journal': [
    { id: 'wsj-latest', name: 'Latest News', url: 'http://online.wsj.com/xml/rss/3_7085.xml', country: 'US' },
  ],
  'Huffington Post': [
    { id: 'huffpost-world', name: 'World News', url: 'http://www.huffingtonpost.com/feeds/verticals/world/index.xml', country: 'US' },
  ],
  'US News': [
    { id: 'usnews-latest', name: 'Latest News', url: 'http://www.usnews.com/rss/news', country: 'US' },
  ],
  'Sky News UK': [
    { id: 'skynews-uk', name: 'UK News', url: 'http://news.sky.com/feeds/rss/uk.xml', country: 'GB' },
  ],
  'The Telegraph': [
    { id: 'telegraph-uk', name: 'UK News', url: 'http://www.telegraph.co.uk/news/uknews/rss', country: 'GB' },
  ],
};

export const ALL_SOURCES = Object.entries(PREMIUM_SOURCES).flatMap(([publisher, categories]) =>
  categories.map(cat => ({
    ...cat,
    publisher,
    label: `${publisher} - ${cat.name}`
  }))
);
