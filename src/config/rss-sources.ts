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
  'Asharq Al-Awsat': AAWSAT_SOURCES,
  // 'PR Newswire': [
  //   { id: 'prnewswire-me', name: 'Middle East News', url: 'https://www.prnewswire.com/rss/middle-east/news/middle-east-news.rss' }
  // ],
  'BBC Arabic': [
    { id: 'bbc-ar-me', name: 'Middle East', url: 'https://feeds.bbci.co.uk/arabic/rss.xml' }
  ],
  'Al Jazeera': [
    { id: 'aljazeera-news', name: 'Latest', url: 'https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84dbbe43033/2013-8-4' }
  ],
  'Hashtag Dubai': [
    { id: 'hashtag-dubai', name: 'Latest News', url: 'https://hashtagdubai.org/index.php/feed/', country: 'UAE' }
  ],
  // 'My Dubai News': [
  //   { id: 'mydubai-news', name: 'Latest News', url: 'https://www.mydubainews.com/feed/', country: 'UAE' }
  // ],
  'Dubai PR Network': [
    { id: 'dubai-pr', name: 'Latest PR', url: 'https://www.dubaiprnetwork.com/rss_feed.asp', country: 'UAE' }
  ],
  // 'Go Dubai': [
  //   { id: 'go-dubai', name: 'City Life', url: 'https://www.godubai.com/citylife/RSSFeedGenerator.asp', country: 'UAE' }
  // ],
  // 'Al Badia Magazine': [
  //   { id: 'albadia-mag', name: 'Latest Articles', url: 'https://albadiamagazine.com/feed/', country: 'UAE' }
  // ],
  // 'Al Madar Magazine': [
  //   { id: 'almadar-mag', name: 'Latest Articles', url: 'https://www.almadarmagazine.ae/feed/', country: 'UAE' }
  // ],
  // 'First Avenue Magazine': [
  //   { id: 'firstavenue-mag', name: 'Latest Articles', url: 'https://firstavenuemagazine.com/feed/', country: 'UAE' }
  // ],
  // 'Evision Worlds': [
  //   { id: 'evision-worlds', name: 'Latest News', url: 'https://evisionworlds.com/?feed=rss2', country: 'UAE' }
  // ],
  'Pan Time Arabia': [
    { id: 'pantime-arabia', name: 'Latest Articles', url: 'https://pantimearabia.com/rss/', country: 'UAE' }
  ],
  '24.ae': [
    { id: '24ae-latest', name: 'Latest News', url: 'https://24.ae/rss.aspx', country: 'UAE' }
  ],
  'UAE Barq': [
    { id: 'uaebarq-latest', name: 'Latest News', url: 'https://www.uaebarq.ae/ar/feed/', country: 'UAE' }
  ],
  'Gulf Time': [
    { id: 'gulftime-latest', name: 'Latest News', url: 'https://gulftime.online/feed/', country: 'UAE' }
  ],
  'New Vora Group': [
    { id: 'newvora-latest', name: 'Latest News', url: 'https://newvoragroup.com/feed/', country: 'UAE' }
  ],
  'Ain Al Emirate': [
    { id: 'ainalemirate-latest', name: 'Latest News', url: 'https://www.ainalemirate.com/feed/', country: 'UAE' }
  ],
  'Mena Scoop': [
    { id: 'menascoop-latest', name: 'Latest News', url: 'https://menascoop.com/feed/', country: 'UAE' }
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
    { id: 'newyorker-culture', name: 'Culture', url: 'http://www.newyorker.com/feed/culture', country: 'US' },
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
  'Arab News': [
    { id: 'arabnews-en', name: 'Latest News', url: 'https://www.arabnews.com/rss.xml', country: 'SA' }
  ],
  'Gulf News': [
    { id: 'gulfnews-en', name: 'Latest News', url: 'https://gulfnews.com/feed', country: 'UAE' }
  ],
  'Khaleej Times': [
    { id: 'khaleejtimes-en', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:khaleejtimes.com&hl=en-AE&gl=AE&ceid=AE:en', country: 'UAE' }
  ],
  'The National': [
    { id: 'thenational-en', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:thenationalnews.com&hl=en-AE&gl=AE&ceid=AE:en', country: 'UAE' }
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
  // 'UAE Interact': [
  //   { id: 'uaeinteract-news', name: 'Latest News', url: 'https://www.uaeinteract.com/rss/news', country: 'UAE' }
  // ],
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
    { id: 'bbc-uk-tech', name: 'Technology (UK)', url: 'http://newsrss.bbc.co.uk/rss/newsonline_uk_edition/technology/rss.xml', country: 'GB' },
    { id: 'bbc-uk-business', name: 'Business (UK)', url: 'http://newsrss.bbc.co.uk/rss/newsonline_uk_edition/business/rss.xml', country: 'GB' },
    { id: 'bbc-uk-politics', name: 'Politics (UK)', url: 'http://newsrss.bbc.co.uk/rss/newsonline_uk_edition/uk_politics/rss.xml', country: 'GB' },
    { id: 'bbc-uk-entertainment', name: 'Entertainment (UK)', url: 'http://newsrss.bbc.co.uk/rss/newsonline_uk_edition/entertainment/rss.xml', country: 'GB' },
  ],
  // 'Politico': [
  //   { id: 'politico-picks', name: 'Politico Picks', url: 'http://www.politico.com/rss/politicopicks.xml', country: 'US' },
  // ],
  'Yahoo News': [
    { id: 'yahoo-world', name: 'World News', url: 'http://rss.news.yahoo.com/rss/world', country: 'US' },
    { id: 'yahoo-us', name: 'US News', url: 'http://news.yahoo.com/rss/us', country: 'US' },
    { id: 'yahoo-entertainment', name: 'Entertainment', url: 'http://news.yahoo.com/rss/entertainment', country: 'US' },
  ],
  'LA Times': [
    { id: 'latimes-world', name: 'World News', url: 'http://www.latimes.com/world/rss2.0.xml', country: 'US' },
    { id: 'latimes-national', name: 'National News', url: 'http://www.latimes.com/nation/rss2.0.xml', country: 'US' },
    { id: 'latimes-entertainment', name: 'Entertainment', url: 'http://www.latimes.com/entertainment/rss2.0.xml', country: 'US' },
  ],
  'CS Monitor': [
    { id: 'csmonitor-usa', name: 'USA', url: 'http://rss.csmonitor.com/feeds/usa', country: 'US' },
  ],
  'NBC News': [
    { id: 'nbcnews-top', name: 'Top Stories', url: 'http://feeds.nbcnews.com/feeds/topstories', country: 'US' },
    { id: 'nbcnews-world', name: 'World News', url: 'http://feeds.nbcnews.com/feeds/worldnews', country: 'US' },
    { id: 'nbcnews-entertainment', name: 'Entertainment', url: 'http://feeds.nbcnews.com/feeds/todayentertainment', country: 'US' },
  ],
  'The Guardian': [
    { id: 'guardian-us', name: 'US News', url: 'http://www.theguardian.com/world/usa/rss', country: 'GB' },
    { id: 'guardian-uk', name: 'UK News', url: 'http://www.theguardian.com/uk/rss', country: 'GB' },
  ],
  // 'Newsweek': [
  //   { id: 'newsweek-latest', name: 'Latest News', url: 'http://www.newsweek.com/rss', country: 'US' },
  // ],
  'ABC News': [
    { id: 'abcnews-us', name: 'US Headlines', url: 'http://feeds.abcnews.com/abcnews/usheadlines', country: 'US' },
    { id: 'abcnews-entertainment', name: 'Entertainment', url: 'http://feeds.abcnews.com/abcnews/entertainmentheadlines', country: 'US' },
  ],
  'Time': [
    { id: 'time-newsfeed', name: 'Newsfeed', url: 'http://time.com/newsfeed/feed/', country: 'US' },
  ],
  // 'Vice News': [
  //   { id: 'vice-news', name: 'Latest News', url: 'https://news.vice.com/rss', country: 'US' },
  // ],
  'Wall Street Journal': [
    { id: 'wsj-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:wsj.com&hl=en-US&gl=US&ceid=US:en', country: 'US' },
  ],
  'Huffington Post': [
    { id: 'huffpost-world', name: 'World News', url: 'http://www.huffingtonpost.com/feeds/verticals/world/index.xml', country: 'US' },
    { id: 'huffpost-entertainment', name: 'Entertainment', url: 'https://www.huffpost.com/dept/entertainment/feed', country: 'US' },
  ],
  'US News': [
    { id: 'usnews-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:usnews.com/news&hl=en-US&gl=US&ceid=US:en', country: 'US' },
  ],
  'Sky News UK': [
    { id: 'skynews-uk', name: 'UK News', url: 'https://news.google.com/rss/search?q=site:news.sky.com/uk&hl=en-GB&gl=GB&ceid=GB:en', country: 'GB' },
  ],
  'The Telegraph': [
    { id: 'telegraph-uk', name: 'UK News', url: 'https://news.google.com/rss/search?q=site:telegraph.co.uk/news&hl=en-GB&gl=GB&ceid=GB:en', country: 'GB' },
  ],
  'Deadline': [
    { id: 'deadline-entertainment', name: 'Entertainment', url: 'http://deadline.com/feed/', country: 'US' },
  ],
  'Vulture': [
    { id: 'vulture-entertainment', name: 'Entertainment', url: 'http://feeds.feedburner.com/nymag/vulture', country: 'US' },
  ],
  'CNN': [
    { id: 'cnn-entertainment', name: 'Entertainment News', url: 'http://rss.cnn.com/rss/cnn_showbiz.rss', country: 'US' },
  ],
  'Esquire': [
    { id: 'esquire-culture', name: 'Culture', url: 'http://www.esquire.com/blogs/culture/culture-rss', country: 'US' },
  ],
  'CBS News': [
    { id: 'cbsnews-entertainment', name: 'Entertainment', url: 'http://www.cbsnews.com/latest/rss/entertainment', country: 'US' },
  ],
  'TMZ': [
    { id: 'tmz-entertainment', name: 'Entertainment', url: 'http://www.tmz.com/rss.xml', country: 'US' },
  ],
  'BuzzFeed': [
    { id: 'buzzfeed-entertainment', name: 'TV and Movies', url: 'http://www.buzzfeed.com/tvandmovies.xml', country: 'US' },
  ],
  'Variety': [
    { id: 'variety-entertainment', name: 'Entertainment', url: 'http://variety.com/feed/', country: 'US' },
  ],
  'X (Twitter)': [
    { id: 'x-twitter-sky-news-arabia', name: 'Sky News Arabia (X)', url: 'https://syndication.twitter.com/srv/timeline-profile/screen-name=SkyNewsArabia', country: 'UAE' },
    { id: 'x-twitter-alarabiya', name: 'Al Arabiya (X)', url: 'https://syndication.twitter.com/srv/timeline-profile/screen-name=AlArabiya', country: 'SA' },
    { id: 'x-twitter-ajmubasher', name: 'Al Jazeera Mubasher (X)', url: 'https://syndication.twitter.com/srv/timeline-profile/screen-name=AJMubasher', country: 'QA' },
    { id: 'x-twitter-alkass-tv', name: 'Al Kass TV (X)', url: 'https://syndication.twitter.com/srv/timeline-profile/screen-name=alkass_tv', country: 'QA' },
  ],
  // --- UAE NEW FEEDS ---
  'Arabian Post': [
    { id: 'arabianpost-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:thearabianpost.com&hl=en-AE&gl=AE&ceid=AE:en', country: 'UAE' }
  ],
  'Dubai Chronicle': [
    { id: 'dubaichronicle-latest', name: 'Latest News', url: 'http://dubaichronicle.com/feed', country: 'UAE' }
  ],
  'Dubay Blog': [
    { id: 'dubayblog-latest', name: 'Latest News', url: 'http://dubayblog.com/feed', country: 'UAE' }
  ],
  // --- KSA NEW FEEDS ---
  'Saudi Gazette': [
    { id: 'saudigazette-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:saudigazette.com.sa&hl=en-SA&gl=SA&ceid=SA:en', country: 'KSA' }
  ],
  'Al Arabiya English': [
    { id: 'alarabiya-en', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:english.alarabiya.net&hl=en-SA&gl=SA&ceid=SA:en', country: 'KSA' }
  ],
  'Asharq Al-Awsat English': [
    { id: 'aawsat-en-news', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:english.aawsat.com&hl=en-SA&gl=SA&ceid=SA:en', country: 'KSA' }
  ],
  // --- QATAR NEW FEEDS ---
  'Al Jazeera English': [
    { id: 'aljazeera-en', name: 'Latest News', url: 'https://aljazeera.com/xml/rss/all.xml', country: 'Qatar' }
  ],
  'Gulf Times': [
    { id: 'gulftimes-local', name: 'Local News', url: 'http://www.gulf-times.com/rssFeed/8', country: 'Qatar' },
    { id: 'gulftimes-intl', name: 'International', url: 'http://www.gulf-times.com/rssFeed/9', country: 'Qatar' }
  ],
  'Doha News': [
    { id: 'dohanews-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:dohanews.co&hl=en-QA&gl=QA&ceid=QA:en', country: 'Qatar' }
  ],
  'Al-Sharq Newspaper': [
    { id: 'alsharq-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:al-sharq.com&hl=ar&gl=QA&ceid=QA:ar', country: 'Qatar' }
  ],
  'The Peninsula Qatar': [
    { id: 'peninsulaqatar-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:thepeninsulaqatar.com&hl=en-QA&gl=QA&ceid=QA:en', country: 'Qatar' }
  ],
  'Al Raya': [
    { id: 'alraya-latest', name: 'Latest News', url: 'http://www.pressdisplay.com/pressdisplay/services/rss.ashx?cid=9ig9', country: 'Qatar' }
  ],
  'Al-Watan (Qatar)': [
    { id: 'alwatan-qatar', name: 'Latest News', url: 'http://www.pressdisplay.com/pressdisplay/services/rss.ashx?cid=9xvm', country: 'Qatar' }
  ],
  // --- BAHRAIN NEW FEEDS ---
  'Bahrain News Agency': [
    { id: 'bna-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:bna.bh&hl=en-BH&gl=BH&ceid=BH:en', country: 'Bahrain' }
  ],
  'Biz Bahrain': [
    { id: 'bizbahrain-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:bizbahrain.com&hl=en-BH&gl=BH&ceid=BH:en', country: 'Bahrain' }
  ],
  'Voice of Bahrain': [
    { id: 'vob-latest', name: 'Latest News', url: 'http://vob.org/?feed=rss2', country: 'Bahrain' }
  ],
  'Al-Bilad Newspaper': [
    { id: 'albiladpress-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:albiladpress.com&hl=ar&gl=BH&ceid=BH:ar', country: 'Bahrain' }
  ],
  'Bahrain Mirror': [
    { id: 'bahrainmirror-latest', name: 'Latest News', url: 'http://bahrainmirror.com/rss.xml', country: 'Bahrain' }
  ],
  '24x7 News Bahrain': [
    { id: 'twentyfoursevennews-latest', name: 'Latest News', url: 'http://twentyfoursevennews.com/feed', country: 'Bahrain' }
  ],
  'Bahrain This Week': [
    { id: 'bahrainthisweek-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:bahrainthisweek.com&hl=en-BH&gl=BH&ceid=BH:en', country: 'Bahrain' }
  ],
  'Al Ayam': [
    { id: 'alayam-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:alayam.com&hl=ar&gl=BH&ceid=BH:ar', country: 'Bahrain' }
  ],
  // --- KUWAIT NEW FEEDS ---
  'Kuwait News Agency': [
    { id: 'kuna-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:kuna.net.kw&hl=en-KW&gl=KW&ceid=KW:en', country: 'Kuwait' }
  ],
  'Times Kuwait': [
    { id: 'timeskuwait-latest', name: 'Latest News', url: 'http://timeskuwait.com/feed', country: 'Kuwait' }
  ],
  'Kuwait News': [
    { id: 'kuwaitnews-latest', name: 'Latest News', url: 'http://kuwaitnews.com/feed', country: 'Kuwait' }
  ],
  'Al Messila': [
    { id: 'almessila-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:masilanews.com&hl=ar&gl=KW&ceid=KW:ar', country: 'Kuwait' }
  ],
  'SABR Online': [
    { id: 'sabr-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:sabr.cc&hl=ar&gl=KW&ceid=KW:ar', country: 'Kuwait' }
  ],
  'Kuwait Times': [
    { id: 'kuwaittimes-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:kuwaittimes.com&hl=en-KW&gl=KW&ceid=KW:en', country: 'Kuwait' }
  ],
  'Al Jarida': [
    { id: 'aljarida-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:aljarida.com&hl=ar&gl=KW&ceid=KW:ar', country: 'Kuwait' }
  ],
  'Al-Wasat Kuwait': [
    { id: 'alwasat-kuwait-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:alwasat.com.kw&hl=ar&gl=KW&ceid=KW:ar', country: 'Kuwait' }
  ],
  'Al-Anbaa': [
    { id: 'alanbaa-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:alanba.com.kw&hl=ar&gl=KW&ceid=KW:ar', country: 'Kuwait' }
  ],
  'Arab Times Kuwait': [
    { id: 'arabtimesonline-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:arabtimesonline.com&hl=en-KW&gl=KW&ceid=KW:en', country: 'Kuwait' }
  ],
  // --- INDIA NEW FEEDS ---
  'The Times of India': [
    { id: 'timesofindia-latest', name: 'Latest News', url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', country: 'India' }
  ],
  'Indian Express': [
    { id: 'indianexpress-latest', name: 'Latest News', url: 'https://indianexpress.com/feed', country: 'India' }
  ],
  'Hindustan Times': [
    { id: 'hindustantimes-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:hindustantimes.com&hl=en-IN&gl=IN&ceid=IN:en', country: 'India' }
  ],
  'The Hindu': [
    { id: 'thehindu-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:thehindu.com&hl=en-IN&gl=IN&ceid=IN:en', country: 'India' }
  ],
  'Deccan Herald': [
    { id: 'deccanherald-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:deccanherald.com&hl=en-IN&gl=IN&ceid=IN:en', country: 'India' }
  ],
  'The Telegraph India': [
    { id: 'telegraphindia-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:telegraphindia.com&hl=en-IN&gl=IN&ceid=IN:en', country: 'India' }
  ],
  'The Economic Times': [
    { id: 'economictimes-latest', name: 'Latest News', url: 'https://economictimes.indiatimes.com/rssfeedstopstories.cms', country: 'India' }
  ],
  'Business Standard': [
    { id: 'businessstandard-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:business-standard.com&hl=en-IN&gl=IN&ceid=IN:en', country: 'India' }
  ],
  'Financial Express': [
    { id: 'financialexpress-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:financialexpress.com&hl=en-IN&gl=IN&ceid=IN:en', country: 'India' }
  ],
  'Mint': [
    { id: 'mint-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:livemint.com&hl=en-IN&gl=IN&ceid=IN:en', country: 'India' }
  ],
  'DNA India': [
    { id: 'dnaindia-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:dnaindia.com&hl=en-IN&gl=IN&ceid=IN:en', country: 'India' }
  ],
  'The Tribune': [
    { id: 'tribuneindia-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:tribuneindia.com&hl=en-IN&gl=IN&ceid=IN:en', country: 'India' }
  ],
  'The New Indian Express': [
    { id: 'newindianexpress-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:newindianexpress.com&hl=en-IN&gl=IN&ceid=IN:en', country: 'India' }
  ],
  'NDTV News': [
    { id: 'ndtv-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:ndtv.com&hl=en-IN&gl=IN&ceid=IN:en', country: 'India' }
  ],
  'Scroll_in': [
    { id: 'scrollin-latest', name: 'Latest News', url: 'http://feeds.feedburner.com/Scrollin', country: 'India' }
  ],
  'The Wire': [
    { id: 'thewire-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:thewire.in&hl=en-IN&gl=IN&ceid=IN:en', country: 'India' }
  ],
  // --- PAKISTAN NEW FEEDS ---
  'Dawn News': [
    { id: 'dawn-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:dawn.com&hl=en-PK&gl=PK&ceid=PK:en', country: 'Pakistan' }
  ],
  'The News International': [
    { id: 'thenews-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:thenews.com.pk&hl=en-PK&gl=PK&ceid=PK:en', country: 'Pakistan' }
  ],
  'Express Tribune': [
    { id: 'expresstribune-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:tribune.com.pk&hl=en-PK&gl=PK&ceid=PK:en', country: 'Pakistan' }
  ],
  'Business Recorder': [
    { id: 'businessrecorder-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:brecorder.com&hl=en-PK&gl=PK&ceid=PK:en', country: 'Pakistan' }
  ],
  'The Nation Pakistan': [
    { id: 'nationpakistan-latest', name: 'Latest News', url: 'https://nation.com.pk/rss/newspaper', country: 'Pakistan' }
  ],
  'Pakistan Today': [
    { id: 'pakistantoday-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:pakistantoday.com.pk&hl=en-PK&gl=PK&ceid=PK:en', country: 'Pakistan' }
  ],
  'Daily Jang': [
    { id: 'dailyjang-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:jang.com.pk&hl=ur&gl=PK&ceid=PK:ur', country: 'Pakistan' }
  ],
  'Geo News Urdu': [
    { id: 'geonews-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:urdu.geo.tv&hl=ur&gl=PK&ceid=PK:ur', country: 'Pakistan' }
  ],
  'ARY News': [
    { id: 'arynews-latest', name: 'Latest News', url: 'https://arynews.tv/feed', country: 'Pakistan' }
  ],
  // --- EGYPT NEW FEEDS ---
  'Al-Ahram English': [
    { id: 'alahram-latest', name: 'Latest News', url: 'https://news.google.com/rss/search?q=site:english.ahram.org.eg&hl=en-EG&gl=EG&ceid=EG:en', country: 'Egypt' }
  ],
  'Al-Masry Al-Youm': [
    { id: 'almasry-latest', name: 'Latest News', url: 'http://egyptindependent.com/rss', country: 'Egypt' }
  ],
  // --- SYRIA NEW FEEDS ---
  'SANA News': [
    { id: 'sana-latest', name: 'Latest News', url: 'http://sana.sy/en/?feed=rss2', country: 'Syria' }
  ],
  'Syria News': [
    { id: 'syrianews-latest', name: 'Latest News', url: 'http://syria.news/rss.php', country: 'Syria' }
  ],
  'The Syrian Observer': [
    { id: 'syrianobserver-latest', name: 'Latest News', url: 'http://syrianobserver.com/feed', country: 'Syria' }
  ],
  'Al-Watan Syria': [
    { id: 'alwatan-syria-latest', name: 'Latest News', url: 'http://alwatan.sy/feed', country: 'Syria' }
  ],
  'Campus Technology': [
    { id: 'campustech-all', name: 'All Articles', url: 'https://campustechnology.com/rss-feeds/all-articles.aspx', country: 'US' },
    { id: 'campustech-news', name: 'News', url: 'https://campustechnology.com/rss-feeds/news.aspx', country: 'US' }
  ],
  'TechCrunch': [
    { id: 'techcrunch-latest', name: 'Latest News', url: 'https://techcrunch.com/feed/', country: 'US' }
  ],
  'The Verge': [
    { id: 'theverge-latest', name: 'Latest News', url: 'https://www.theverge.com/rss/index.xml', country: 'US' }
  ],
};

export const ALL_SOURCES = Object.entries(PREMIUM_SOURCES).flatMap(([publisher, categories]) =>
  categories.map(cat => ({
    ...cat,
    publisher,
    label: `${publisher} - ${cat.name}`
  }))
);
