/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

export interface RSSFeed {
  id: string;
  category: string;
  url: string;
}

export interface MediaSource {
  id: string;
  name: string;
  domain: string;
  country: string;
  languages: string[];
  type: 'newspaper' | 'agency' | 'blog' | 'government' | 'social';
  credibilityScore: number;
  tier: 'premium' | 'standard';
  feeds: RSSFeed[];
  isActive?: boolean;
}

export const MEDIA_SOURCES: MediaSource[] = [
  {
    "id": "asharq-al-awsat",
    "name": "Asharq Al-Awsat",
    "domain": "aawsat.com",
    "country": "AE",
    "languages": [
      "ar"
    ],
    "type": "newspaper",
    "credibilityScore": 95,
    "tier": "premium",
    "feeds": [
      {
        "id": "news",
        "category": "News",
        "url": "https://aawsat.com/feed"
      },
      {
        "id": "world",
        "category": "Arab World",
        "url": "https://aawsat.com/feed/arab-world"
      },
      {
        "id": "gulf",
        "category": "Gulf",
        "url": "https://aawsat.com/feed/gulf"
      },
      {
        "id": "economy",
        "category": "Economy",
        "url": "https://aawsat.com/feed/economy"
      },
      {
        "id": "political",
        "category": "Political",
        "url": "https://aawsat.com/feed/political"
      },
      {
        "id": "sport",
        "category": "Sport",
        "url": "https://aawsat.com/feed/sport"
      }
    ]
  },
  {
    "id": "bbc-arabic",
    "name": "BBC Arabic",
    "domain": "feeds.bbci.co.uk",
    "country": "GB",
    "languages": [
      "ar"
    ],
    "type": "newspaper",
    "credibilityScore": 95,
    "tier": "premium",
    "feeds": [
      {
        "id": "bbc-ar-me",
        "category": "Middle East",
        "url": "https://feeds.bbci.co.uk/arabic/rss.xml"
      }
    ]
  },
  {
    "id": "al-jazeera",
    "name": "Al Jazeera",
    "domain": "aljazeera.net",
    "country": "AE",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 95,
    "tier": "premium",
    "feeds": [
      {
        "id": "aljazeera-news",
        "category": "Latest",
        "url": "https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84dbbe43033/2013-8-4"
      }
    ]
  },
  {
    "id": "hashtag-dubai",
    "name": "Hashtag Dubai",
    "domain": "hashtagdubai.org",
    "country": "AE",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "hashtag-dubai",
        "category": "Latest News",
        "url": "https://hashtagdubai.org/index.php/feed/"
      }
    ]
  },
  {
    "id": "dubai-pr-network",
    "name": "Dubai PR Network",
    "domain": "dubaiprnetwork.com",
    "country": "AE",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "dubai-pr",
        "category": "Latest PR",
        "url": "https://www.dubaiprnetwork.com/rss_feed.asp"
      }
    ]
  },
  {
    "id": "pan-time-arabia",
    "name": "Pan Time Arabia",
    "domain": "pantimearabia.com",
    "country": "AE",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "pantime-arabia",
        "category": "Latest Articles",
        "url": "https://pantimearabia.com/rss/"
      }
    ]
  },
  {
    "id": "24ae",
    "name": "24.ae",
    "domain": "24.ae",
    "country": "AE",
    "languages": [
      "ar"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "24ae-latest",
        "category": "Latest News",
        "url": "https://24.ae/rss.aspx"
      }
    ]
  },
  {
    "id": "uae-barq",
    "name": "UAE Barq",
    "domain": "uaebarq.ae",
    "country": "AE",
    "languages": [
      "ar"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "uaebarq-latest",
        "category": "Latest News",
        "url": "https://www.uaebarq.ae/ar/feed/"
      }
    ]
  },
  {
    "id": "gulf-time",
    "name": "Gulf Time",
    "domain": "gulftime.online",
    "country": "AE",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "gulftime-latest",
        "category": "Latest News",
        "url": "https://gulftime.online/feed/"
      }
    ]
  },
  {
    "id": "new-vora-group",
    "name": "New Vora Group",
    "domain": "newvoragroup.com",
    "country": "AE",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "newvora-latest",
        "category": "Latest News",
        "url": "https://newvoragroup.com/feed/"
      }
    ]
  },
  {
    "id": "ain-al-emirate",
    "name": "Ain Al Emirate",
    "domain": "ainalemirate.com",
    "country": "AE",
    "languages": [
      "ar"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "ainalemirate-latest",
        "category": "Latest News",
        "url": "https://www.ainalemirate.com/feed/"
      }
    ]
  },
  {
    "id": "mena-scoop",
    "name": "Mena Scoop",
    "domain": "menascoop.com",
    "country": "AE",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "menascoop-latest",
        "category": "Latest News",
        "url": "https://menascoop.com/feed/"
      }
    ]
  },
  {
    "id": "emirates247",
    "name": "Emirates247",
    "domain": "emirates247.com",
    "country": "AE",
    "languages": [
      "ar"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "e247-flash",
        "category": "Flash News",
        "url": "https://www.emirates247.com/rss/mobile/v2/flash-news.rss"
      },
      {
        "id": "e247-uae",
        "category": "UAE News",
        "url": "https://www.emirates247.com/rss/mobile/v2/uae.rss"
      },
      {
        "id": "e247-world",
        "category": "World News",
        "url": "https://www.emirates247.com/rss/mobile/v2/world.rss"
      },
      {
        "id": "e247-business",
        "category": "Business",
        "url": "https://www.emirates247.com/rss/mobile/v2/business.rss"
      }
    ]
  },
  {
    "id": "provoke-media",
    "name": "Provoke Media",
    "domain": "provokemedia.com",
    "country": "GB",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "provoke-latest",
        "category": "Latest News",
        "url": "https://www.provokemedia.com/newsfeed/provoke-media-latest"
      }
    ]
  },
  {
    "id": "the-new-yorker",
    "name": "The New Yorker",
    "domain": "newyorker.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 95,
    "tier": "premium",
    "feeds": [
      {
        "id": "newyorker-lede",
        "category": "The Lede",
        "url": "https://www.newyorker.com/feed/the-lede/rss"
      },
      {
        "id": "newyorker-culture",
        "category": "Culture",
        "url": "http://www.newyorker.com/feed/culture"
      }
    ]
  },
  {
    "id": "wired",
    "name": "Wired",
    "domain": "wired.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "wired-business",
        "category": "Business",
        "url": "https://www.wired.com/feed/category/business/latest/rss"
      },
      {
        "id": "wired-ai",
        "category": "Artificial Intelligence",
        "url": "https://www.wired.com/feed/tag/ai/latest/rss"
      }
    ]
  },
  {
    "id": "meed",
    "name": "MEED",
    "domain": "meed.com",
    "country": "AE",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "meed-analysis",
        "category": "Analysis",
        "url": "https://www.meed.com/classifications/analysis/feed"
      },
      {
        "id": "meed-comment",
        "category": "Commentary",
        "url": "https://www.meed.com/category/news/commentary/feed/"
      },
      {
        "id": "meed-special",
        "category": "Special Reports",
        "url": "https://www.meed.com/classifications/analysis/special-report/rss"
      },
      {
        "id": "meed-tenders",
        "category": "Tenders",
        "url": "https://www.meed.com/tenders/feed/"
      },
      {
        "id": "meed-events",
        "category": "Events",
        "url": "https://www.meed.com/events/rss"
      },
      {
        "id": "meed-construction",
        "category": "Construction",
        "url": "https://www.meed.com/sector/construction/rss"
      },
      {
        "id": "meed-finance",
        "category": "Finance",
        "url": "https://www.meed.com/sector/banking-finance/rss"
      },
      {
        "id": "meed-industry",
        "category": "Industry",
        "url": "https://www.meed.com/sector/industrial/rss"
      },
      {
        "id": "meed-oilgas",
        "category": "Oil & Gas",
        "url": "https://www.meed.com/sector/oil-and-gas/rss"
      },
      {
        "id": "meed-petrochem",
        "category": "Petrochemicals",
        "url": "https://www.meed.com/sector/petrochemicals/rss"
      },
      {
        "id": "meed-power",
        "category": "Power & Water",
        "url": "https://www.meed.com/sector/power-and-water/power/rss"
      },
      {
        "id": "meed-tourism",
        "category": "Tourism",
        "url": "https://www.meed.com/sector/economy/tourism/rss"
      },
      {
        "id": "meed-transport",
        "category": "Transport",
        "url": "https://www.meed.com/sector/transport/rss"
      },
      {
        "id": "meed-water",
        "category": "Water",
        "url": "https://www.meed.com/sector/water/rss"
      },
      {
        "id": "meed-tech",
        "category": "Technology & IT",
        "url": "https://www.meed.com/sector/Technology/rss"
      },
      {
        "id": "meed-algeria",
        "category": "Algeria",
        "url": "https://www.meed.com/countries/algeria/rss/feed"
      },
      {
        "id": "meed-bahrain",
        "category": "Bahrain",
        "url": "https://www.meed.com/countries/gcc/bahrain/rss/feed"
      },
      {
        "id": "meed-egypt",
        "category": "Egypt",
        "url": "https://www.meed.com/countries/north-africa/egypt/rss/feed"
      },
      {
        "id": "meed-iran",
        "category": "Iran",
        "url": "https://www.meed.com/countries/iran/rss/feed"
      },
      {
        "id": "meed-iraq",
        "category": "Iraq",
        "url": "https://www.meed.com/countries/iraq/rss/feed"
      },
      {
        "id": "meed-jordan",
        "category": "Jordan",
        "url": "https://www.meed.com/countries/levant/jordan/rss/feed"
      },
      {
        "id": "meed-kuwait",
        "category": "Kuwait",
        "url": "https://www.meed.com/countries/gcc/kuwait/rss/feed"
      },
      {
        "id": "meed-lebanon",
        "category": "Lebanon",
        "url": "https://www.meed.com/countries/levant/lebanon/rss/feed"
      },
      {
        "id": "meed-libya",
        "category": "Libya",
        "url": "https://www.meed.com/countries/north-africa/libya/rss/feed"
      },
      {
        "id": "meed-morocco",
        "category": "Morocco",
        "url": "https://www.meed.com/countries/north-africa/morocco/rss/feed"
      },
      {
        "id": "meed-oman",
        "category": "Oman",
        "url": "https://www.meed.com/countries/gcc/oman/rss/feed"
      },
      {
        "id": "meed-qatar",
        "category": "Qatar",
        "url": "https://www.meed.com/countries/gcc/qatar/rss/feed"
      },
      {
        "id": "meed-saudi",
        "category": "Saudi Arabia",
        "url": "https://www.meed.com/countries/gcc/saudi-arabia/rss/feed"
      },
      {
        "id": "meed-syria",
        "category": "Syria",
        "url": "https://www.meed.com/countries/levant/syria/rss/feed"
      },
      {
        "id": "meed-tunisia",
        "category": "Tunisia",
        "url": "https://www.meed.com/countries/north-africa/tunisia/rss/feed"
      },
      {
        "id": "meed-uae",
        "category": "UAE",
        "url": "https://www.meed.com/countries/gcc/uae/rss/feed"
      }
    ]
  },
  {
    "id": "road-safety-uae",
    "name": "Road Safety UAE",
    "domain": "roadsafetyuae.com",
    "country": "AE",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "roadsafety-posts",
        "category": "Posts",
        "url": "https://www.roadsafetyuae.com/feed/?post_type=post"
      },
      {
        "id": "roadsafety-stories",
        "category": "Stories",
        "url": "https://www.roadsafetyuae.com/feed/?post_type=stories"
      },
      {
        "id": "roadsafety-proposals",
        "category": "Proposals",
        "url": "https://www.roadsafetyuae.com/feed/?post_type=proposals"
      }
    ]
  },
  {
    "id": "arab-news",
    "name": "Arab News",
    "domain": "arabnews.com",
    "country": "SA",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "arabnews-en",
        "category": "Latest News",
        "url": "https://www.arabnews.com/rss.xml"
      }
    ]
  },
  {
    "id": "gulf-news",
    "name": "Gulf News",
    "domain": "gulfnews.com",
    "country": "AE",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "gulfnews-en",
        "category": "Latest News",
        "url": "https://gulfnews.com/feed"
      }
    ]
  },
  {
    "id": "khaleej-times",
    "name": "Khaleej Times",
    "domain": "news.google.com",
    "country": "AE",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "khaleejtimes-en",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:khaleejtimes.com&hl=en-AE&gl=AE&ceid=AE:en"
      }
    ]
  },
  {
    "id": "the-national",
    "name": "The National",
    "domain": "news.google.com",
    "country": "AE",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "thenational-en",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:thenationalnews.com&hl=en-AE&gl=AE&ceid=AE:en"
      }
    ]
  },
  {
    "id": "middle-east-eye",
    "name": "Middle East Eye",
    "domain": "middleeasteye.net",
    "country": "GB",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "mee-en",
        "category": "Latest News",
        "url": "https://www.middleeasteye.net/rss"
      }
    ]
  },
  {
    "id": "al-bawaba",
    "name": "Al Bawaba",
    "domain": "albawaba.com",
    "country": "JO",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "albawaba-en",
        "category": "Latest News",
        "url": "https://www.albawaba.com/rss/all"
      }
    ]
  },
  {
    "id": "mehr-news",
    "name": "Mehr News",
    "domain": "en.mehrnews.com",
    "country": "IR",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "mehr-en",
        "category": "Latest News",
        "url": "https://en.mehrnews.com/rss"
      }
    ]
  },
  {
    "id": "egyptian-streets",
    "name": "Egyptian Streets",
    "domain": "egyptianstreets.com",
    "country": "EG",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "egyptianstreets-en",
        "category": "Latest News",
        "url": "https://egyptianstreets.com/feed/"
      }
    ]
  },
  {
    "id": "newswirecom",
    "name": "Newswire_com",
    "domain": "newswire.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "agency",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "newswire-en",
        "category": "Latest PR",
        "url": "https://www.newswire.com/newsroom/rss/all"
      }
    ]
  },
  {
    "id": "food-safety-news",
    "name": "Food Safety News",
    "domain": "foodsafetynews.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "foodsafetynews-latest",
        "category": "Latest News",
        "url": "https://www.foodsafetynews.com/rss/"
      }
    ]
  },
  {
    "id": "energy-intel",
    "name": "Energy Intel",
    "domain": "energyintel.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "energyintel-latest",
        "category": "Latest News",
        "url": "https://www.energyintel.com/rss-feed.rss"
      }
    ]
  },
  {
    "id": "business-day",
    "name": "Business Day",
    "domain": "businessday.co.za",
    "country": "ZA",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "businessday-latest",
        "category": "Latest News",
        "url": "https://www.businessday.co.za/arc/outboundfeeds/rss/"
      }
    ]
  },
  {
    "id": "india-news-network",
    "name": "India News Network",
    "domain": "indianewsnetwork.com",
    "country": "IN",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "indianewsnetwork-latest",
        "category": "Latest News",
        "url": "https://www.indianewsnetwork.com/rss.xml"
      }
    ]
  },
  {
    "id": "al-wahda-news",
    "name": "Al Wahda News",
    "domain": "alwahdanews.ae",
    "country": "AE",
    "languages": [
      "ar"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alwahdanews-latest",
        "category": "Latest News",
        "url": "https://alwahdanews.ae/feed/"
      }
    ]
  },
  {
    "id": "nabd-el-emirate",
    "name": "Nabd El Emirate",
    "domain": "nbdelemirate.com",
    "country": "AE",
    "languages": [
      "ar"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "nbdelemirate-latest",
        "category": "Latest News",
        "url": "https://nbdelemirate.com/feed/"
      }
    ]
  },
  {
    "id": "npr",
    "name": "NPR",
    "domain": "npr.org",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "npr-world",
        "category": "World News",
        "url": "http://www.npr.org/rss/rss.php?id=1004"
      },
      {
        "id": "npr-national",
        "category": "National News",
        "url": "http://www.npr.org/rss/rss.php?id=1003"
      }
    ]
  },
  {
    "id": "fox-news",
    "name": "Fox News",
    "domain": "feeds.foxnews.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "foxnews-latest",
        "category": "Latest News",
        "url": "http://feeds.foxnews.com/foxnews/latest"
      }
    ]
  },
  {
    "id": "bbc-news",
    "name": "BBC News",
    "domain": "feeds.bbci.co.uk",
    "country": "GB",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 95,
    "tier": "premium",
    "feeds": [
      {
        "id": "bbc-us-canada",
        "category": "US & Canada",
        "url": "http://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml"
      },
      {
        "id": "bbc-world",
        "category": "World",
        "url": "http://feeds.bbci.co.uk/news/world/rss.xml"
      },
      {
        "id": "bbc-uk",
        "category": "UK",
        "url": "http://feeds.bbci.co.uk/news/uk/rss.xml"
      },
      {
        "id": "bbc-uk-tech",
        "category": "Technology (UK)",
        "url": "http://newsrss.bbc.co.uk/rss/newsonline_uk_edition/technology/rss.xml"
      },
      {
        "id": "bbc-uk-business",
        "category": "Business (UK)",
        "url": "http://newsrss.bbc.co.uk/rss/newsonline_uk_edition/business/rss.xml"
      },
      {
        "id": "bbc-uk-politics",
        "category": "Politics (UK)",
        "url": "http://newsrss.bbc.co.uk/rss/newsonline_uk_edition/uk_politics/rss.xml"
      },
      {
        "id": "bbc-uk-entertainment",
        "category": "Entertainment (UK)",
        "url": "http://newsrss.bbc.co.uk/rss/newsonline_uk_edition/entertainment/rss.xml"
      }
    ]
  },
  {
    "id": "yahoo-news",
    "name": "Yahoo News",
    "domain": "rss.news.yahoo.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "yahoo-world",
        "category": "World News",
        "url": "http://rss.news.yahoo.com/rss/world"
      },
      {
        "id": "yahoo-us",
        "category": "US News",
        "url": "http://news.yahoo.com/rss/us"
      },
      {
        "id": "yahoo-entertainment",
        "category": "Entertainment",
        "url": "http://news.yahoo.com/rss/entertainment"
      }
    ]
  },
  {
    "id": "la-times",
    "name": "LA Times",
    "domain": "latimes.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "latimes-world",
        "category": "World News",
        "url": "http://www.latimes.com/world/rss2.0.xml"
      },
      {
        "id": "latimes-national",
        "category": "National News",
        "url": "http://www.latimes.com/nation/rss2.0.xml"
      },
      {
        "id": "latimes-entertainment",
        "category": "Entertainment",
        "url": "http://www.latimes.com/entertainment/rss2.0.xml"
      }
    ]
  },
  {
    "id": "cs-monitor",
    "name": "CS Monitor",
    "domain": "rss.csmonitor.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "csmonitor-usa",
        "category": "USA",
        "url": "http://rss.csmonitor.com/feeds/usa"
      }
    ]
  },
  {
    "id": "nbc-news",
    "name": "NBC News",
    "domain": "feeds.nbcnews.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "nbcnews-top",
        "category": "Top Stories",
        "url": "http://feeds.nbcnews.com/feeds/topstories"
      },
      {
        "id": "nbcnews-world",
        "category": "World News",
        "url": "http://feeds.nbcnews.com/feeds/worldnews"
      },
      {
        "id": "nbcnews-entertainment",
        "category": "Entertainment",
        "url": "http://feeds.nbcnews.com/feeds/todayentertainment"
      }
    ]
  },
  {
    "id": "the-guardian",
    "name": "The Guardian",
    "domain": "theguardian.com",
    "country": "GB",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "guardian-us",
        "category": "US News",
        "url": "http://www.theguardian.com/world/usa/rss"
      },
      {
        "id": "guardian-uk",
        "category": "UK News",
        "url": "http://www.theguardian.com/uk/rss"
      }
    ]
  },
  {
    "id": "abc-news",
    "name": "ABC News",
    "domain": "feeds.abcnews.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "abcnews-us",
        "category": "US Headlines",
        "url": "http://feeds.abcnews.com/abcnews/usheadlines"
      },
      {
        "id": "abcnews-entertainment",
        "category": "Entertainment",
        "url": "http://feeds.abcnews.com/abcnews/entertainmentheadlines"
      }
    ]
  },
  {
    "id": "time",
    "name": "Time",
    "domain": "time.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "time-newsfeed",
        "category": "Newsfeed",
        "url": "http://time.com/newsfeed/feed/"
      }
    ]
  },
  {
    "id": "wall-street-journal",
    "name": "Wall Street Journal",
    "domain": "news.google.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "wsj-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:wsj.com&hl=en-US&gl=US&ceid=US:en"
      }
    ]
  },
  {
    "id": "huffington-post",
    "name": "Huffington Post",
    "domain": "huffingtonpost.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "huffpost-world",
        "category": "World News",
        "url": "http://www.huffingtonpost.com/feeds/verticals/world/index.xml"
      },
      {
        "id": "huffpost-entertainment",
        "category": "Entertainment",
        "url": "https://www.huffpost.com/dept/entertainment/feed"
      }
    ]
  },
  {
    "id": "us-news",
    "name": "US News",
    "domain": "news.google.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "usnews-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:usnews.com/news&hl=en-US&gl=US&ceid=US:en"
      }
    ]
  },
  {
    "id": "sky-news-uk",
    "name": "Sky News UK",
    "domain": "news.google.com",
    "country": "GB",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "skynews-uk",
        "category": "UK News",
        "url": "https://news.google.com/rss/search?q=site:news.sky.com/uk&hl=en-GB&gl=GB&ceid=GB:en"
      }
    ]
  },
  {
    "id": "the-telegraph",
    "name": "The Telegraph",
    "domain": "news.google.com",
    "country": "GB",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "telegraph-uk",
        "category": "UK News",
        "url": "https://news.google.com/rss/search?q=site:telegraph.co.uk/news&hl=en-GB&gl=GB&ceid=GB:en"
      }
    ]
  },
  {
    "id": "deadline",
    "name": "Deadline",
    "domain": "deadline.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "deadline-entertainment",
        "category": "Entertainment",
        "url": "http://deadline.com/feed/"
      }
    ]
  },
  {
    "id": "vulture",
    "name": "Vulture",
    "domain": "feeds.feedburner.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "vulture-entertainment",
        "category": "Entertainment",
        "url": "http://feeds.feedburner.com/nymag/vulture"
      }
    ]
  },
  {
    "id": "cnn",
    "name": "CNN",
    "domain": "rss.cnn.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 95,
    "tier": "premium",
    "feeds": [
      {
        "id": "cnn-entertainment",
        "category": "Entertainment News",
        "url": "http://rss.cnn.com/rss/cnn_showbiz.rss"
      }
    ]
  },
  {
    "id": "esquire",
    "name": "Esquire",
    "domain": "esquire.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "esquire-culture",
        "category": "Culture",
        "url": "http://www.esquire.com/blogs/culture/culture-rss"
      }
    ]
  },
  {
    "id": "cbs-news",
    "name": "CBS News",
    "domain": "cbsnews.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "cbsnews-entertainment",
        "category": "Entertainment",
        "url": "http://www.cbsnews.com/latest/rss/entertainment"
      }
    ]
  },
  {
    "id": "tmz",
    "name": "TMZ",
    "domain": "tmz.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "tmz-entertainment",
        "category": "Entertainment",
        "url": "http://www.tmz.com/rss.xml"
      }
    ]
  },
  {
    "id": "buzzfeed",
    "name": "BuzzFeed",
    "domain": "buzzfeed.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "buzzfeed-entertainment",
        "category": "TV and Movies",
        "url": "http://www.buzzfeed.com/tvandmovies.xml"
      }
    ]
  },
  {
    "id": "variety",
    "name": "Variety",
    "domain": "variety.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "variety-entertainment",
        "category": "Entertainment",
        "url": "http://variety.com/feed/"
      }
    ]
  },
  {
    "id": "x-twitter",
    "name": "X (Twitter)",
    "domain": "syndication.twitter.com",
    "country": "AE",
    "languages": [
      "en"
    ],
    "type": "social",
    "credibilityScore": 65,
    "tier": "standard",
    "feeds": [
      {
        "id": "x-twitter-sky-news-arabia",
        "category": "Sky News Arabia (X)",
        "url": "https://syndication.twitter.com/srv/timeline-profile/screen-name=SkyNewsArabia"
      },
      {
        "id": "x-twitter-alarabiya",
        "category": "Al Arabiya (X)",
        "url": "https://syndication.twitter.com/srv/timeline-profile/screen-name=AlArabiya"
      },
      {
        "id": "x-twitter-ajmubasher",
        "category": "Al Jazeera Mubasher (X)",
        "url": "https://syndication.twitter.com/srv/timeline-profile/screen-name=AJMubasher"
      },
      {
        "id": "x-twitter-alkass-tv",
        "category": "Al Kass TV (X)",
        "url": "https://syndication.twitter.com/srv/timeline-profile/screen-name=alkass_tv"
      }
    ]
  },
  {
    "id": "arabian-post",
    "name": "Arabian Post",
    "domain": "news.google.com",
    "country": "AE",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "arabianpost-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:thearabianpost.com&hl=en-AE&gl=AE&ceid=AE:en"
      }
    ]
  },
  {
    "id": "dubai-chronicle",
    "name": "Dubai Chronicle",
    "domain": "dubaichronicle.com",
    "country": "AE",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "dubaichronicle-latest",
        "category": "Latest News",
        "url": "http://dubaichronicle.com/feed"
      }
    ]
  },
  {
    "id": "dubay-blog",
    "name": "Dubay Blog",
    "domain": "dubayblog.com",
    "country": "AE",
    "languages": [
      "en"
    ],
    "type": "blog",
    "credibilityScore": 65,
    "tier": "standard",
    "feeds": [
      {
        "id": "dubayblog-latest",
        "category": "Latest News",
        "url": "http://dubayblog.com/feed"
      }
    ]
  },
  {
    "id": "saudi-gazette",
    "name": "Saudi Gazette",
    "domain": "news.google.com",
    "country": "SA",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "saudigazette-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:saudigazette.com.sa&hl=en-SA&gl=SA&ceid=SA:en"
      }
    ]
  },
  {
    "id": "al-arabiya-english",
    "name": "Al Arabiya English",
    "domain": "news.google.com",
    "country": "SA",
    "languages": [
      "ar"
    ],
    "type": "newspaper",
    "credibilityScore": 95,
    "tier": "premium",
    "feeds": [
      {
        "id": "alarabiya-en",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:english.alarabiya.net&hl=en-SA&gl=SA&ceid=SA:en"
      }
    ]
  },
  {
    "id": "asharq-al-awsat-english",
    "name": "Asharq Al-Awsat English",
    "domain": "news.google.com",
    "country": "SA",
    "languages": [
      "ar"
    ],
    "type": "newspaper",
    "credibilityScore": 95,
    "tier": "premium",
    "feeds": [
      {
        "id": "aawsat-en-news",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:english.aawsat.com&hl=en-SA&gl=SA&ceid=SA:en"
      }
    ]
  },
  {
    "id": "al-jazeera-english",
    "name": "Al Jazeera English",
    "domain": "aljazeera.com",
    "country": "QA",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 95,
    "tier": "premium",
    "feeds": [
      {
        "id": "aljazeera-en",
        "category": "Latest News",
        "url": "https://aljazeera.com/xml/rss/all.xml"
      }
    ]
  },
  {
    "id": "gulf-times",
    "name": "Gulf Times",
    "domain": "gulf-times.com",
    "country": "QA",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "gulftimes-local",
        "category": "Local News",
        "url": "http://www.gulf-times.com/rssFeed/8"
      },
      {
        "id": "gulftimes-intl",
        "category": "International",
        "url": "http://www.gulf-times.com/rssFeed/9"
      }
    ]
  },
  {
    "id": "doha-news",
    "name": "Doha News",
    "domain": "news.google.com",
    "country": "QA",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "dohanews-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:dohanews.co&hl=en-QA&gl=QA&ceid=QA:en"
      }
    ]
  },
  {
    "id": "al-sharq-newspaper",
    "name": "Al-Sharq Newspaper",
    "domain": "news.google.com",
    "country": "QA",
    "languages": [
      "ar"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alsharq-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:al-sharq.com&hl=ar&gl=QA&ceid=QA:ar"
      }
    ]
  },
  {
    "id": "the-peninsula-qatar",
    "name": "The Peninsula Qatar",
    "domain": "news.google.com",
    "country": "QA",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "peninsulaqatar-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:thepeninsulaqatar.com&hl=en-QA&gl=QA&ceid=QA:en"
      }
    ]
  },
  {
    "id": "al-raya",
    "name": "Al Raya",
    "domain": "pressdisplay.com",
    "country": "QA",
    "languages": [
      "ar"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alraya-latest",
        "category": "Latest News",
        "url": "http://www.pressdisplay.com/pressdisplay/services/rss.ashx?cid=9ig9"
      }
    ]
  },
  {
    "id": "al-watan-qatar",
    "name": "Al-Watan (Qatar)",
    "domain": "pressdisplay.com",
    "country": "QA",
    "languages": [
      "ar"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alwatan-qatar",
        "category": "Latest News",
        "url": "http://www.pressdisplay.com/pressdisplay/services/rss.ashx?cid=9xvm"
      }
    ]
  },
  {
    "id": "bahrain-news-agency",
    "name": "Bahrain News Agency",
    "domain": "news.google.com",
    "country": "BH",
    "languages": [
      "en"
    ],
    "type": "agency",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "bna-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:bna.bh&hl=en-BH&gl=BH&ceid=BH:en"
      }
    ]
  },
  {
    "id": "biz-bahrain",
    "name": "Biz Bahrain",
    "domain": "news.google.com",
    "country": "BH",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "bizbahrain-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:bizbahrain.com&hl=en-BH&gl=BH&ceid=BH:en"
      }
    ]
  },
  {
    "id": "voice-of-bahrain",
    "name": "Voice of Bahrain",
    "domain": "vob.org",
    "country": "BH",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "vob-latest",
        "category": "Latest News",
        "url": "http://vob.org/?feed=rss2"
      }
    ]
  },
  {
    "id": "al-bilad-newspaper",
    "name": "Al-Bilad Newspaper",
    "domain": "news.google.com",
    "country": "BH",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "albiladpress-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:albiladpress.com&hl=ar&gl=BH&ceid=BH:ar"
      }
    ]
  },
  {
    "id": "bahrain-mirror",
    "name": "Bahrain Mirror",
    "domain": "bahrainmirror.com",
    "country": "BH",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "bahrainmirror-latest",
        "category": "Latest News",
        "url": "http://bahrainmirror.com/rss.xml"
      }
    ]
  },
  {
    "id": "24x7-news-bahrain",
    "name": "24x7 News Bahrain",
    "domain": "twentyfoursevennews.com",
    "country": "BH",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "twentyfoursevennews-latest",
        "category": "Latest News",
        "url": "http://twentyfoursevennews.com/feed"
      }
    ]
  },
  {
    "id": "bahrain-this-week",
    "name": "Bahrain This Week",
    "domain": "news.google.com",
    "country": "BH",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "bahrainthisweek-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:bahrainthisweek.com&hl=en-BH&gl=BH&ceid=BH:en"
      }
    ]
  },
  {
    "id": "al-ayam",
    "name": "Al Ayam",
    "domain": "news.google.com",
    "country": "BH",
    "languages": [
      "ar"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alayam-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:alayam.com&hl=ar&gl=BH&ceid=BH:ar"
      }
    ]
  },
  {
    "id": "kuwait-news-agency",
    "name": "Kuwait News Agency",
    "domain": "news.google.com",
    "country": "KW",
    "languages": [
      "en"
    ],
    "type": "agency",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "kuna-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:kuna.net.kw&hl=en-KW&gl=KW&ceid=KW:en"
      }
    ]
  },
  {
    "id": "times-kuwait",
    "name": "Times Kuwait",
    "domain": "timeskuwait.com",
    "country": "KW",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "timeskuwait-latest",
        "category": "Latest News",
        "url": "http://timeskuwait.com/feed"
      }
    ]
  },
  {
    "id": "kuwait-news",
    "name": "Kuwait News",
    "domain": "kuwaitnews.com",
    "country": "KW",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "kuwaitnews-latest",
        "category": "Latest News",
        "url": "http://kuwaitnews.com/feed"
      }
    ]
  },
  {
    "id": "al-messila",
    "name": "Al Messila",
    "domain": "news.google.com",
    "country": "KW",
    "languages": [
      "ar"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "almessila-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:masilanews.com&hl=ar&gl=KW&ceid=KW:ar"
      }
    ]
  },
  {
    "id": "sabr-online",
    "name": "SABR Online",
    "domain": "news.google.com",
    "country": "KW",
    "languages": [
      "ar"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "sabr-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:sabr.cc&hl=ar&gl=KW&ceid=KW:ar"
      }
    ]
  },
  {
    "id": "kuwait-times",
    "name": "Kuwait Times",
    "domain": "news.google.com",
    "country": "KW",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "kuwaittimes-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:kuwaittimes.com&hl=en-KW&gl=KW&ceid=KW:en"
      }
    ]
  },
  {
    "id": "al-jarida",
    "name": "Al Jarida",
    "domain": "news.google.com",
    "country": "KW",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "aljarida-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:aljarida.com&hl=ar&gl=KW&ceid=KW:ar"
      }
    ]
  },
  {
    "id": "al-wasat-kuwait",
    "name": "Al-Wasat Kuwait",
    "domain": "news.google.com",
    "country": "KW",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alwasat-kuwait-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:alwasat.com.kw&hl=ar&gl=KW&ceid=KW:ar"
      }
    ]
  },
  {
    "id": "al-anbaa",
    "name": "Al-Anbaa",
    "domain": "news.google.com",
    "country": "KW",
    "languages": [
      "ar"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alanbaa-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:alanba.com.kw&hl=ar&gl=KW&ceid=KW:ar"
      }
    ]
  },
  {
    "id": "arab-times-kuwait",
    "name": "Arab Times Kuwait",
    "domain": "news.google.com",
    "country": "KW",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "arabtimesonline-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:arabtimesonline.com&hl=en-KW&gl=KW&ceid=KW:en"
      }
    ]
  },
  {
    "id": "the-times-of-india",
    "name": "The Times of India",
    "domain": "timesofindia.indiatimes.com",
    "country": "IN",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "timesofindia-latest",
        "category": "Latest News",
        "url": "https://timesofindia.indiatimes.com/rssfeedstopstories.cms"
      }
    ]
  },
  {
    "id": "indian-express",
    "name": "Indian Express",
    "domain": "indianexpress.com",
    "country": "IN",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "indianexpress-latest",
        "category": "Latest News",
        "url": "https://indianexpress.com/feed"
      }
    ]
  },
  {
    "id": "hindustan-times",
    "name": "Hindustan Times",
    "domain": "news.google.com",
    "country": "IN",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "hindustantimes-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:hindustantimes.com&hl=en-IN&gl=IN&ceid=IN:en"
      }
    ]
  },
  {
    "id": "the-hindu",
    "name": "The Hindu",
    "domain": "news.google.com",
    "country": "IN",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "thehindu-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:thehindu.com&hl=en-IN&gl=IN&ceid=IN:en"
      }
    ]
  },
  {
    "id": "deccan-herald",
    "name": "Deccan Herald",
    "domain": "news.google.com",
    "country": "IN",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "deccanherald-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:deccanherald.com&hl=en-IN&gl=IN&ceid=IN:en"
      }
    ]
  },
  {
    "id": "the-telegraph-india",
    "name": "The Telegraph India",
    "domain": "news.google.com",
    "country": "IN",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "telegraphindia-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:telegraphindia.com&hl=en-IN&gl=IN&ceid=IN:en"
      }
    ]
  },
  {
    "id": "the-economic-times",
    "name": "The Economic Times",
    "domain": "economictimes.indiatimes.com",
    "country": "IN",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "economictimes-latest",
        "category": "Latest News",
        "url": "https://economictimes.indiatimes.com/rssfeedstopstories.cms"
      }
    ]
  },
  {
    "id": "business-standard",
    "name": "Business Standard",
    "domain": "news.google.com",
    "country": "IN",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "businessstandard-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:business-standard.com&hl=en-IN&gl=IN&ceid=IN:en"
      }
    ]
  },
  {
    "id": "financial-express",
    "name": "Financial Express",
    "domain": "news.google.com",
    "country": "IN",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "financialexpress-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:financialexpress.com&hl=en-IN&gl=IN&ceid=IN:en"
      }
    ]
  },
  {
    "id": "mint",
    "name": "Mint",
    "domain": "news.google.com",
    "country": "IN",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "mint-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:livemint.com&hl=en-IN&gl=IN&ceid=IN:en"
      }
    ]
  },
  {
    "id": "dna-india",
    "name": "DNA India",
    "domain": "news.google.com",
    "country": "IN",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "dnaindia-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:dnaindia.com&hl=en-IN&gl=IN&ceid=IN:en"
      }
    ]
  },
  {
    "id": "the-tribune",
    "name": "The Tribune",
    "domain": "news.google.com",
    "country": "IN",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "tribuneindia-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:tribuneindia.com&hl=en-IN&gl=IN&ceid=IN:en"
      }
    ]
  },
  {
    "id": "the-new-indian-express",
    "name": "The New Indian Express",
    "domain": "news.google.com",
    "country": "IN",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "newindianexpress-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:newindianexpress.com&hl=en-IN&gl=IN&ceid=IN:en"
      }
    ]
  },
  {
    "id": "ndtv-news",
    "name": "NDTV News",
    "domain": "news.google.com",
    "country": "IN",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "ndtv-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:ndtv.com&hl=en-IN&gl=IN&ceid=IN:en"
      }
    ]
  },
  {
    "id": "scrollin",
    "name": "Scroll_in",
    "domain": "feeds.feedburner.com",
    "country": "IN",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "scrollin-latest",
        "category": "Latest News",
        "url": "http://feeds.feedburner.com/Scrollin"
      }
    ]
  },
  {
    "id": "the-wire",
    "name": "The Wire",
    "domain": "news.google.com",
    "country": "IN",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "thewire-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:thewire.in&hl=en-IN&gl=IN&ceid=IN:en"
      }
    ]
  },
  {
    "id": "dawn-news",
    "name": "Dawn News",
    "domain": "news.google.com",
    "country": "PK",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "dawn-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:dawn.com&hl=en-PK&gl=PK&ceid=PK:en"
      }
    ]
  },
  {
    "id": "the-news-international",
    "name": "The News International",
    "domain": "news.google.com",
    "country": "PK",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "thenews-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:thenews.com.pk&hl=en-PK&gl=PK&ceid=PK:en"
      }
    ]
  },
  {
    "id": "express-tribune",
    "name": "Express Tribune",
    "domain": "news.google.com",
    "country": "PK",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "expresstribune-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:tribune.com.pk&hl=en-PK&gl=PK&ceid=PK:en"
      }
    ]
  },
  {
    "id": "business-recorder",
    "name": "Business Recorder",
    "domain": "news.google.com",
    "country": "PK",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "businessrecorder-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:brecorder.com&hl=en-PK&gl=PK&ceid=PK:en"
      }
    ]
  },
  {
    "id": "the-nation-pakistan",
    "name": "The Nation Pakistan",
    "domain": "nation.com.pk",
    "country": "PK",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "nationpakistan-latest",
        "category": "Latest News",
        "url": "https://nation.com.pk/rss/newspaper"
      }
    ]
  },
  {
    "id": "pakistan-today",
    "name": "Pakistan Today",
    "domain": "news.google.com",
    "country": "PK",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "pakistantoday-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:pakistantoday.com.pk&hl=en-PK&gl=PK&ceid=PK:en"
      }
    ]
  },
  {
    "id": "daily-jang",
    "name": "Daily Jang",
    "domain": "news.google.com",
    "country": "PK",
    "languages": [
      "ar"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "dailyjang-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:jang.com.pk&hl=ur&gl=PK&ceid=PK:ur"
      }
    ]
  },
  {
    "id": "geo-news-urdu",
    "name": "Geo News Urdu",
    "domain": "news.google.com",
    "country": "PK",
    "languages": [
      "ar"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "geonews-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:urdu.geo.tv&hl=ur&gl=PK&ceid=PK:ur"
      }
    ]
  },
  {
    "id": "ary-news",
    "name": "ARY News",
    "domain": "arynews.tv",
    "country": "PK",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "arynews-latest",
        "category": "Latest News",
        "url": "https://arynews.tv/feed"
      }
    ]
  },
  {
    "id": "al-ahram-english",
    "name": "Al-Ahram English",
    "domain": "news.google.com",
    "country": "EG",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alahram-latest",
        "category": "Latest News",
        "url": "https://news.google.com/rss/search?q=site:english.ahram.org.eg&hl=en-EG&gl=EG&ceid=EG:en"
      }
    ]
  },
  {
    "id": "al-masry-al-youm",
    "name": "Al-Masry Al-Youm",
    "domain": "egyptindependent.com",
    "country": "EG",
    "languages": [
      "ar"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "almasry-latest",
        "category": "Latest News",
        "url": "http://egyptindependent.com/rss"
      }
    ]
  },
  {
    "id": "sana-news",
    "name": "SANA News",
    "domain": "sana.sy",
    "country": "SY",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "sana-latest",
        "category": "Latest News",
        "url": "http://sana.sy/en/?feed=rss2"
      }
    ]
  },
  {
    "id": "syria-news",
    "name": "Syria News",
    "domain": "syria.news",
    "country": "SY",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "syrianews-latest",
        "category": "Latest News",
        "url": "http://syria.news/rss.php"
      }
    ]
  },
  {
    "id": "the-syrian-observer",
    "name": "The Syrian Observer",
    "domain": "syrianobserver.com",
    "country": "SY",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "syrianobserver-latest",
        "category": "Latest News",
        "url": "http://syrianobserver.com/feed"
      }
    ]
  },
  {
    "id": "al-watan-syria",
    "name": "Al-Watan Syria",
    "domain": "alwatan.sy",
    "country": "SY",
    "languages": [
      "ar"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alwatan-syria-latest",
        "category": "Latest News",
        "url": "http://alwatan.sy/feed"
      }
    ]
  },
  {
    "id": "campus-technology",
    "name": "Campus Technology",
    "domain": "campustechnology.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "campustech-all",
        "category": "All Articles",
        "url": "https://campustechnology.com/rss-feeds/all-articles.aspx"
      },
      {
        "id": "campustech-news",
        "category": "News",
        "url": "https://campustechnology.com/rss-feeds/news.aspx"
      }
    ]
  },
  {
    "id": "techcrunch",
    "name": "TechCrunch",
    "domain": "techcrunch.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "techcrunch-latest",
        "category": "Latest News",
        "url": "https://techcrunch.com/feed/"
      }
    ]
  },
  {
    "id": "the-verge",
    "name": "The Verge",
    "domain": "theverge.com",
    "country": "US",
    "languages": [
      "en"
    ],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "theverge-latest",
        "category": "Latest News",
        "url": "https://www.theverge.com/rss/index.xml"
      }
    ]
  }
];

export const SOURCES_BY_COUNTRY = MEDIA_SOURCES.reduce((acc, source) => {
  if (!acc[source.country]) acc[source.country] = [];
  acc[source.country].push(source);
  return acc;
}, {} as Record<string, MediaSource[]>);

export const SOURCES_BY_TYPE = MEDIA_SOURCES.reduce((acc, source) => {
  if (!acc[source.type]) acc[source.type] = [];
  acc[source.type].push(source);
  return acc;
}, {} as Record<string, MediaSource[]>);

export function getSources(filters?: { country?: string; type?: string; tier?: 'premium' | 'standard' }) {
  return MEDIA_SOURCES.filter(source => {
    if (filters?.country && source.country !== filters.country) return false;
    if (filters?.type && source.type !== filters.type) return false;
    if (filters?.tier && source.tier !== filters.tier) return false;
    return true;
  });
}
