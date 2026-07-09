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
  ,
  {
    "id": "mairgroup-en-news-and-media-news",
    "name": "Mairgroup En News And Media News",
    "domain": "mairgroup.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "mairgroup-en-news-and-media-news-latest",
        "category": "Latest News",
        "url": "https://www.mairgroup.com/en/news-and-media/news/"
      }
    ]
  },
  {
    "id": "evisionworlds",
    "name": "Evisionworlds",
    "domain": "evisionworlds.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "evisionworlds-latest",
        "category": "Latest News",
        "url": "https://evisionworlds.com"
      }
    ]
  },
  {
    "id": "thenewsmirror-news",
    "name": "Thenewsmirror News",
    "domain": "thenewsmirror.in",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "thenewsmirror-news-latest",
        "category": "Latest News",
        "url": "https://thenewsmirror.in/news/"
      }
    ]
  },
  {
    "id": "101news",
    "name": "101news",
    "domain": "101news.ae",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "101news-latest",
        "category": "Latest News",
        "url": "https://www.101news.ae/"
      }
    ]
  },
  {
    "id": "algeriagazette",
    "name": "Algeriagazette",
    "domain": "algeriagazette.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "algeriagazette-latest",
        "category": "Latest News",
        "url": "https://algeriagazette.com/"
      }
    ]
  },
  {
    "id": "algerianewsweb",
    "name": "Algerianewsweb",
    "domain": "algerianewsweb.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "algerianewsweb-latest",
        "category": "Latest News",
        "url": "https://algerianewsweb.com/"
      }
    ]
  },
  {
    "id": "algiersdaily",
    "name": "Algiersdaily",
    "domain": "algiersdaily.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "algiersdaily-latest",
        "category": "Latest News",
        "url": "https://algiersdaily.com/"
      }
    ]
  },
  {
    "id": "alpetraweb",
    "name": "Alpetraweb",
    "domain": "alpetraweb.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alpetraweb-latest",
        "category": "Latest News",
        "url": "https://alpetraweb.com/"
      }
    ]
  },
  {
    "id": "ammantimes",
    "name": "Ammantimes",
    "domain": "ammantimes.co",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "ammantimes-latest",
        "category": "Latest News",
        "url": "https://ammantimes.co/"
      }
    ]
  },
  {
    "id": "arabbulletin",
    "name": "Arabbulletin",
    "domain": "arabbulletin.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "arabbulletin-latest",
        "category": "Latest News",
        "url": "https://arabbulletin.com/"
      }
    ]
  },
  {
    "id": "arabianmarketer",
    "name": "Arabianmarketer",
    "domain": "arabianmarketer.ae",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "arabianmarketer-latest",
        "category": "Latest News",
        "url": "https://arabianmarketer.ae/"
      }
    ]
  },
  {
    "id": "arabian-daily",
    "name": "Arabian Daily",
    "domain": "arabian-daily.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "arabian-daily-latest",
        "category": "Latest News",
        "url": "https://arabian-daily.com/"
      }
    ]
  },
  {
    "id": "arabviewpoint",
    "name": "Arabviewpoint",
    "domain": "arabviewpoint.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "arabviewpoint-latest",
        "category": "Latest News",
        "url": "https://arabviewpoint.com/"
      }
    ]
  },
  {
    "id": "baghdaddiary",
    "name": "Baghdaddiary",
    "domain": "baghdaddiary.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "baghdaddiary-latest",
        "category": "Latest News",
        "url": "https://baghdaddiary.com/"
      }
    ]
  },
  {
    "id": "bahraincourant",
    "name": "Bahraincourant",
    "domain": "bahraincourant.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "bahraincourant-latest",
        "category": "Latest News",
        "url": "https://bahraincourant.com/"
      }
    ]
  },
  {
    "id": "bahrainherald",
    "name": "Bahrainherald",
    "domain": "bahrainherald.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "bahrainherald-latest",
        "category": "Latest News",
        "url": "https://bahrainherald.com/"
      }
    ]
  },
  {
    "id": "beirutnewstalk",
    "name": "Beirutnewstalk",
    "domain": "beirutnewstalk.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "beirutnewstalk-latest",
        "category": "Latest News",
        "url": "https://beirutnewstalk.com/"
      }
    ]
  },
  {
    "id": "beyroutnews",
    "name": "Beyroutnews",
    "domain": "beyroutnews.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "beyroutnews-latest",
        "category": "Latest News",
        "url": "https://beyroutnews.com/"
      }
    ]
  },
  {
    "id": "bizpreneurme",
    "name": "Bizpreneurme",
    "domain": "bizpreneurme.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "bizpreneurme-latest",
        "category": "Latest News",
        "url": "https://www.bizpreneurme.com/"
      }
    ]
  },
  {
    "id": "blogarama-business-blogs",
    "name": "Blogarama Business Blogs",
    "domain": "blogarama.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "blogarama-business-blogs-latest",
        "category": "Latest News",
        "url": "https://www.blogarama.com/business-blogs/"
      }
    ]
  },
  {
    "id": "cairo24x7",
    "name": "Cairo24x7",
    "domain": "cairo24x7.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "cairo24x7-latest",
        "category": "Latest News",
        "url": "https://cairo24x7.com/"
      }
    ]
  },
  {
    "id": "cairosun",
    "name": "Cairosun",
    "domain": "cairosun.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "cairosun-latest",
        "category": "Latest News",
        "url": "https://cairosun.com/"
      }
    ]
  },
  {
    "id": "channelpostmea",
    "name": "Channelpostmea",
    "domain": "channelpostmea.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "channelpostmea-latest",
        "category": "Latest News",
        "url": "https://channelpostmea.com/"
      }
    ]
  },
  {
    "id": "consyriser",
    "name": "Consyriser",
    "domain": "consyriser.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "consyriser-latest",
        "category": "Latest News",
        "url": "https://consyriser.com/"
      }
    ]
  },
  {
    "id": "dgngate",
    "name": "Dgngate",
    "domain": "dgngate.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "dgngate-latest",
        "category": "Latest News",
        "url": "https://www.dgngate.com/"
      }
    ]
  },
  {
    "id": "dohamirror",
    "name": "Dohamirror",
    "domain": "dohamirror.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "dohamirror-latest",
        "category": "Latest News",
        "url": "https://dohamirror.com/"
      }
    ]
  },
  {
    "id": "dohaobserver",
    "name": "Dohaobserver",
    "domain": "dohaobserver.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "dohaobserver-latest",
        "category": "Latest News",
        "url": "https://dohaobserver.com/"
      }
    ]
  },
  {
    "id": "dohastandard",
    "name": "Dohastandard",
    "domain": "dohastandard.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "dohastandard-latest",
        "category": "Latest News",
        "url": "https://dohastandard.com/"
      }
    ]
  },
  {
    "id": "dubaiglobalnews",
    "name": "Dubaiglobalnews",
    "domain": "dubaiglobalnews.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "dubaiglobalnews-latest",
        "category": "Latest News",
        "url": "https://www.dubaiglobalnews.com/"
      }
    ]
  },
  {
    "id": "dubaihospitalitynews",
    "name": "Dubaihospitalitynews",
    "domain": "dubaihospitalitynews.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "dubaihospitalitynews-latest",
        "category": "Latest News",
        "url": "https://www.dubaihospitalitynews.com/"
      }
    ]
  },
  {
    "id": "dubaiiconiclady",
    "name": "Dubaiiconiclady",
    "domain": "dubaiiconiclady.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "dubaiiconiclady-latest",
        "category": "Latest News",
        "url": "https://www.dubaiiconiclady.com/"
      }
    ]
  },
  {
    "id": "dubainewstyle",
    "name": "Dubainewstyle",
    "domain": "dubainewstyle.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "dubainewstyle-latest",
        "category": "Latest News",
        "url": "https://www.dubainewstyle.com/"
      }
    ]
  },
  {
    "id": "dxbemag",
    "name": "Dxbemag",
    "domain": "dxbemag.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "dxbemag-latest",
        "category": "Latest News",
        "url": "https://dxbemag.com/"
      }
    ]
  },
  {
    "id": "egyptchronicle",
    "name": "Egyptchronicle",
    "domain": "egyptchronicle.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "egyptchronicle-latest",
        "category": "Latest News",
        "url": "https://egyptchronicle.com/"
      }
    ]
  },
  {
    "id": "egyptdispatch",
    "name": "Egyptdispatch",
    "domain": "egyptdispatch.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "egyptdispatch-latest",
        "category": "Latest News",
        "url": "https://egyptdispatch.com/"
      }
    ]
  },
  {
    "id": "emiratecho",
    "name": "Emiratecho",
    "domain": "emiratecho.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "emiratecho-latest",
        "category": "Latest News",
        "url": "https://emiratecho.com/"
      }
    ]
  },
  {
    "id": "emiratesreport",
    "name": "Emiratesreport",
    "domain": "emiratesreport.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "emiratesreport-latest",
        "category": "Latest News",
        "url": "https://emiratesreport.com/"
      }
    ]
  },
  {
    "id": "eyeofdubai-news",
    "name": "Eyeofdubai News",
    "domain": "eyeofdubai.ae",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "eyeofdubai-news-latest",
        "category": "Latest News",
        "url": "https://www.eyeofdubai.ae/news/"
      }
    ]
  },
  {
    "id": "eyeofriyadh-news",
    "name": "Eyeofriyadh News",
    "domain": "eyeofriyadh.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "eyeofriyadh-news-latest",
        "category": "Latest News",
        "url": "https://www.eyeofriyadh.com/news/"
      }
    ]
  },
  {
    "id": "gazaecho",
    "name": "Gazaecho",
    "domain": "gazaecho.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "gazaecho-latest",
        "category": "Latest News",
        "url": "https://gazaecho.com/"
      }
    ]
  },
  {
    "id": "gccanalyst",
    "name": "Gccanalyst",
    "domain": "gccanalyst.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "gccanalyst-latest",
        "category": "Latest News",
        "url": "https://gccanalyst.com/"
      }
    ]
  },
  {
    "id": "gccdigest",
    "name": "Gccdigest",
    "domain": "gccdigest.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "gccdigest-latest",
        "category": "Latest News",
        "url": "https://gccdigest.com/"
      }
    ]
  },
  {
    "id": "gcceyes",
    "name": "Gcceyes",
    "domain": "gcceyes.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "gcceyes-latest",
        "category": "Latest News",
        "url": "https://gcceyes.com/"
      }
    ]
  },
  {
    "id": "gulfnews-business-corporate-news",
    "name": "Gulfnews Business Corporate News",
    "domain": "gulfnews.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "gulfnews-business-corporate-news-latest",
        "category": "Latest News",
        "url": "https://gulfnews.com/business/corporate-news/"
      }
    ]
  },
  {
    "id": "gulfdailyreport",
    "name": "Gulfdailyreport",
    "domain": "gulfdailyreport.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "gulfdailyreport-latest",
        "category": "Latest News",
        "url": "https://gulfdailyreport.com/"
      }
    ]
  },
  {
    "id": "gulfexaminer",
    "name": "Gulfexaminer",
    "domain": "gulfexaminer.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "gulfexaminer-latest",
        "category": "Latest News",
        "url": "https://gulfexaminer.com/"
      }
    ]
  },
  {
    "id": "gulfoutlook",
    "name": "Gulfoutlook",
    "domain": "gulfoutlook.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "gulfoutlook-latest",
        "category": "Latest News",
        "url": "https://gulfoutlook.com/"
      }
    ]
  },
  {
    "id": "gulfpeninsula",
    "name": "Gulfpeninsula",
    "domain": "gulfpeninsula.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "gulfpeninsula-latest",
        "category": "Latest News",
        "url": "https://gulfpeninsula.com/"
      }
    ]
  },
  {
    "id": "gulfpress-business",
    "name": "Gulfpress Business",
    "domain": "gulfpress.net",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "gulfpress-business-latest",
        "category": "Latest News",
        "url": "https://gulfpress.net/business/"
      }
    ]
  },
  {
    "id": "haifagazette",
    "name": "Haifagazette",
    "domain": "haifagazette.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "haifagazette-latest",
        "category": "Latest News",
        "url": "https://haifagazette.com/"
      }
    ]
  },
  {
    "id": "haifaherald",
    "name": "Haifaherald",
    "domain": "haifaherald.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "haifaherald-latest",
        "category": "Latest News",
        "url": "https://haifaherald.com/"
      }
    ]
  },
  {
    "id": "iranezine",
    "name": "Iranezine",
    "domain": "iranezine.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "iranezine-latest",
        "category": "Latest News",
        "url": "https://iranezine.com/"
      }
    ]
  },
  {
    "id": "iranistar",
    "name": "Iranistar",
    "domain": "iranistar.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "iranistar-latest",
        "category": "Latest News",
        "url": "https://iranistar.com/"
      }
    ]
  },
  {
    "id": "iraqiobserver",
    "name": "Iraqiobserver",
    "domain": "iraqiobserver.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "iraqiobserver-latest",
        "category": "Latest News",
        "url": "https://iraqiobserver.com/"
      }
    ]
  },
  {
    "id": "iraqnewsflash",
    "name": "Iraqnewsflash",
    "domain": "iraqnewsflash.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "iraqnewsflash-latest",
        "category": "Latest News",
        "url": "https://iraqnewsflash.com/"
      }
    ]
  },
  {
    "id": "irbiddaily",
    "name": "Irbiddaily",
    "domain": "irbiddaily.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "irbiddaily-latest",
        "category": "Latest News",
        "url": "https://irbiddaily.com/"
      }
    ]
  },
  {
    "id": "jaziranow",
    "name": "Jaziranow",
    "domain": "jaziranow.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "jaziranow-latest",
        "category": "Latest News",
        "url": "https://jaziranow.com/"
      }
    ]
  },
  {
    "id": "jordandialog",
    "name": "Jordandialog",
    "domain": "jordandialog.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "jordandialog-latest",
        "category": "Latest News",
        "url": "https://jordandialog.com/"
      }
    ]
  },
  {
    "id": "jordaninquirer",
    "name": "Jordaninquirer",
    "domain": "jordaninquirer.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "jordaninquirer-latest",
        "category": "Latest News",
        "url": "https://jordaninquirer.com/"
      }
    ]
  },
  {
    "id": "jordanmirror",
    "name": "Jordanmirror",
    "domain": "jordanmirror.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "jordanmirror-latest",
        "category": "Latest News",
        "url": "https://jordanmirror.com/"
      }
    ]
  },
  {
    "id": "jordannewsflash",
    "name": "Jordannewsflash",
    "domain": "jordannewsflash.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "jordannewsflash-latest",
        "category": "Latest News",
        "url": "https://jordannewsflash.com/"
      }
    ]
  },
  {
    "id": "jordanreview",
    "name": "Jordanreview",
    "domain": "jordanreview.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "jordanreview-latest",
        "category": "Latest News",
        "url": "https://jordanreview.com/"
      }
    ]
  },
  {
    "id": "kesdaily",
    "name": "Kesdaily",
    "domain": "kesdaily.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "kesdaily-latest",
        "category": "Latest News",
        "url": "https://kesdaily.com/"
      }
    ]
  },
  {
    "id": "khaleejtimes",
    "name": "Khaleejtimes",
    "domain": "khaleejtimes.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "khaleejtimes-latest",
        "category": "Latest News",
        "url": "https://www.khaleejtimes.com/"
      }
    ]
  },
  {
    "id": "khaleej365",
    "name": "Khaleej365",
    "domain": "khaleej365.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "khaleej365-latest",
        "category": "Latest News",
        "url": "https://khaleej365.com/"
      }
    ]
  },
  {
    "id": "khaleejtribune",
    "name": "Khaleejtribune",
    "domain": "khaleejtribune.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "khaleejtribune-latest",
        "category": "Latest News",
        "url": "https://khaleejtribune.com/"
      }
    ]
  },
  {
    "id": "khartoumdaily",
    "name": "Khartoumdaily",
    "domain": "khartoumdaily.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "khartoumdaily-latest",
        "category": "Latest News",
        "url": "https://khartoumdaily.com/"
      }
    ]
  },
  {
    "id": "khartoumreport",
    "name": "Khartoumreport",
    "domain": "khartoumreport.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "khartoumreport-latest",
        "category": "Latest News",
        "url": "https://khartoumreport.com/"
      }
    ]
  },
  {
    "id": "ksanewsline",
    "name": "Ksanewsline",
    "domain": "ksanewsline.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "ksanewsline-latest",
        "category": "Latest News",
        "url": "https://ksanewsline.com/"
      }
    ]
  },
  {
    "id": "ksapioneer",
    "name": "Ksapioneer",
    "domain": "ksapioneer.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "ksapioneer-latest",
        "category": "Latest News",
        "url": "https://ksapioneer.com/"
      }
    ]
  },
  {
    "id": "kuwaitdaily",
    "name": "Kuwaitdaily",
    "domain": "kuwaitdaily.co",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "kuwaitdaily-latest",
        "category": "Latest News",
        "url": "https://kuwaitdaily.co/"
      }
    ]
  },
  {
    "id": "kuwaitdispatch",
    "name": "Kuwaitdispatch",
    "domain": "kuwaitdispatch.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "kuwaitdispatch-latest",
        "category": "Latest News",
        "url": "https://kuwaitdispatch.com/"
      }
    ]
  },
  {
    "id": "kuwaitinvestor",
    "name": "Kuwaitinvestor",
    "domain": "kuwaitinvestor.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "kuwaitinvestor-latest",
        "category": "Latest News",
        "url": "https://kuwaitinvestor.com/"
      }
    ]
  },
  {
    "id": "kuwaitnewshub",
    "name": "Kuwaitnewshub",
    "domain": "kuwaitnewshub.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "kuwaitnewshub-latest",
        "category": "Latest News",
        "url": "https://kuwaitnewshub.com/"
      }
    ]
  },
  {
    "id": "kuwaittribune",
    "name": "Kuwaittribune",
    "domain": "kuwaittribune.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "kuwaittribune-latest",
        "category": "Latest News",
        "url": "https://kuwaittribune.com/"
      }
    ]
  },
  {
    "id": "lebanondailystar",
    "name": "Lebanondailystar",
    "domain": "lebanondailystar.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "lebanondailystar-latest",
        "category": "Latest News",
        "url": "https://lebanondailystar.com/"
      }
    ]
  },
  {
    "id": "levant-daily",
    "name": "Levant Daily",
    "domain": "levant-daily.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "levant-daily-latest",
        "category": "Latest News",
        "url": "https://levant-daily.com/"
      }
    ]
  },
  {
    "id": "levantbulletin",
    "name": "Levantbulletin",
    "domain": "levantbulletin.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "levantbulletin-latest",
        "category": "Latest News",
        "url": "https://levantbulletin.com/"
      }
    ]
  },
  {
    "id": "libyaexaminer",
    "name": "Libyaexaminer",
    "domain": "libyaexaminer.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "libyaexaminer-latest",
        "category": "Latest News",
        "url": "https://libyaexaminer.com/"
      }
    ]
  },
  {
    "id": "libyainsider",
    "name": "Libyainsider",
    "domain": "libyainsider.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "libyainsider-latest",
        "category": "Latest News",
        "url": "https://libyainsider.com/"
      }
    ]
  },
  {
    "id": "libyareports",
    "name": "Libyareports",
    "domain": "libyareports.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "libyareports-latest",
        "category": "Latest News",
        "url": "https://libyareports.com/"
      }
    ]
  },
  {
    "id": "maghrebreport",
    "name": "Maghrebreport",
    "domain": "maghrebreport.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "maghrebreport-latest",
        "category": "Latest News",
        "url": "https://maghrebreport.com/"
      }
    ]
  },
  {
    "id": "maghrebreporter",
    "name": "Maghrebreporter",
    "domain": "maghrebreporter.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "maghrebreporter-latest",
        "category": "Latest News",
        "url": "https://maghrebreporter.com/"
      }
    ]
  },
  {
    "id": "maroccourier",
    "name": "Maroccourier",
    "domain": "maroccourier.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "maroccourier-latest",
        "category": "Latest News",
        "url": "https://maroccourier.com/"
      }
    ]
  },
  {
    "id": "maroctribune",
    "name": "Maroctribune",
    "domain": "maroctribune.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "maroctribune-latest",
        "category": "Latest News",
        "url": "https://maroctribune.com/"
      }
    ]
  },
  {
    "id": "meabuzz",
    "name": "Meabuzz",
    "domain": "meabuzz.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "meabuzz-latest",
        "category": "Latest News",
        "url": "https://meabuzz.com/"
      }
    ]
  },
  {
    "id": "meheadlines",
    "name": "Meheadlines",
    "domain": "meheadlines.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "meheadlines-latest",
        "category": "Latest News",
        "url": "https://meheadlines.com/"
      }
    ]
  },
  {
    "id": "menafn",
    "name": "Menafn",
    "domain": "menafn.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "menafn-latest",
        "category": "Latest News",
        "url": "https://menafn.com/"
      }
    ]
  },
  {
    "id": "menanewswire",
    "name": "Menanewswire",
    "domain": "menanewswire.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "menanewswire-latest",
        "category": "Latest News",
        "url": "https://menanewswire.com/"
      }
    ]
  },
  {
    "id": "mogadishulive",
    "name": "Mogadishulive",
    "domain": "mogadishulive.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "mogadishulive-latest",
        "category": "Latest News",
        "url": "https://mogadishulive.com/"
      }
    ]
  },
  {
    "id": "moroccopioneer",
    "name": "Moroccopioneer",
    "domain": "moroccopioneer.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "moroccopioneer-latest",
        "category": "Latest News",
        "url": "https://moroccopioneer.com/"
      }
    ]
  },
  {
    "id": "msn",
    "name": "Msn",
    "domain": "msn.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "msn-latest",
        "category": "Latest News",
        "url": "https://www.msn.com/"
      }
    ]
  },
  {
    "id": "newsofzion",
    "name": "Newsofzion",
    "domain": "newsofzion.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "newsofzion-latest",
        "category": "Latest News",
        "url": "https://newsofzion.com/"
      }
    ]
  },
  {
    "id": "newszy",
    "name": "Newszy",
    "domain": "newszy.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "newszy-latest",
        "category": "Latest News",
        "url": "https://newszy.com/"
      }
    ]
  },
  {
    "id": "omanbeacon",
    "name": "Omanbeacon",
    "domain": "omanbeacon.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "omanbeacon-latest",
        "category": "Latest News",
        "url": "https://omanbeacon.com/"
      }
    ]
  },
  {
    "id": "omandailynews",
    "name": "Omandailynews",
    "domain": "omandailynews.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "omandailynews-latest",
        "category": "Latest News",
        "url": "https://omandailynews.com/"
      }
    ]
  },
  {
    "id": "omannewshub",
    "name": "Omannewshub",
    "domain": "omannewshub.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "omannewshub-latest",
        "category": "Latest News",
        "url": "https://omannewshub.com/"
      }
    ]
  },
  {
    "id": "omanoutlook",
    "name": "Omanoutlook",
    "domain": "omanoutlook.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "omanoutlook-latest",
        "category": "Latest News",
        "url": "https://omanoutlook.com/"
      }
    ]
  },
  {
    "id": "omanpatriot",
    "name": "Omanpatriot",
    "domain": "omanpatriot.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "omanpatriot-latest",
        "category": "Latest News",
        "url": "https://omanpatriot.com/"
      }
    ]
  },
  {
    "id": "palestinepioneer",
    "name": "Palestinepioneer",
    "domain": "palestinepioneer.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "palestinepioneer-latest",
        "category": "Latest News",
        "url": "https://palestinepioneer.com/"
      }
    ]
  },
  {
    "id": "palestinianstar",
    "name": "Palestinianstar",
    "domain": "palestinianstar.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "palestinianstar-latest",
        "category": "Latest News",
        "url": "https://palestinianstar.com/"
      }
    ]
  },
  {
    "id": "qataristar",
    "name": "Qataristar",
    "domain": "qataristar.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "qataristar-latest",
        "category": "Latest News",
        "url": "https://qataristar.com/"
      }
    ]
  },
  {
    "id": "rabatbuzz",
    "name": "Rabatbuzz",
    "domain": "rabatbuzz.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "rabatbuzz-latest",
        "category": "Latest News",
        "url": "https://rabatbuzz.com/"
      }
    ]
  },
  {
    "id": "rabatherald",
    "name": "Rabatherald",
    "domain": "rabatherald.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "rabatherald-latest",
        "category": "Latest News",
        "url": "https://rabatherald.com/"
      }
    ]
  },
  {
    "id": "republicoflibya",
    "name": "Republicoflibya",
    "domain": "republicoflibya.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "republicoflibya-latest",
        "category": "Latest News",
        "url": "https://republicoflibya.com/"
      }
    ]
  },
  {
    "id": "riyadhezine",
    "name": "Riyadhezine",
    "domain": "riyadhezine.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "riyadhezine-latest",
        "category": "Latest News",
        "url": "https://riyadhezine.com/"
      }
    ]
  },
  {
    "id": "salalahtimes",
    "name": "Salalahtimes",
    "domain": "salalahtimes.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "salalahtimes-latest",
        "category": "Latest News",
        "url": "https://salalahtimes.com/"
      }
    ]
  },
  {
    "id": "sanaadaily",
    "name": "Sanaadaily",
    "domain": "sanaadaily.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "sanaadaily-latest",
        "category": "Latest News",
        "url": "https://sanaadaily.com/"
      }
    ]
  },
  {
    "id": "sanaamail",
    "name": "Sanaamail",
    "domain": "sanaamail.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "sanaamail-latest",
        "category": "Latest News",
        "url": "https://sanaamail.com/"
      }
    ]
  },
  {
    "id": "sanaatimes",
    "name": "Sanaatimes",
    "domain": "sanaatimes.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "sanaatimes-latest",
        "category": "Latest News",
        "url": "https://sanaatimes.com/"
      }
    ]
  },
  {
    "id": "saudi60minutes",
    "name": "Saudi60minutes",
    "domain": "saudi60minutes.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "saudi60minutes-latest",
        "category": "Latest News",
        "url": "https://saudi60minutes.com/"
      }
    ]
  },
  {
    "id": "saudidailynews",
    "name": "Saudidailynews",
    "domain": "saudidailynews.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "saudidailynews-latest",
        "category": "Latest News",
        "url": "https://saudidailynews.com/"
      }
    ]
  },
  {
    "id": "saudiinquirer",
    "name": "Saudiinquirer",
    "domain": "saudiinquirer.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "saudiinquirer-latest",
        "category": "Latest News",
        "url": "https://saudiinquirer.com/"
      }
    ]
  },
  {
    "id": "saudisentinel",
    "name": "Saudisentinel",
    "domain": "saudisentinel.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "saudisentinel-latest",
        "category": "Latest News",
        "url": "https://saudisentinel.com/"
      }
    ]
  },
  {
    "id": "saudisnapshot",
    "name": "Saudisnapshot",
    "domain": "saudisnapshot.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "saudisnapshot-latest",
        "category": "Latest News",
        "url": "https://saudisnapshot.com/"
      }
    ]
  },
  {
    "id": "shiraztimes",
    "name": "Shiraztimes",
    "domain": "shiraztimes.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "shiraztimes-latest",
        "category": "Latest News",
        "url": "https://shiraztimes.com/"
      }
    ]
  },
  {
    "id": "sinaeagle",
    "name": "Sinaeagle",
    "domain": "sinaeagle.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "sinaeagle-latest",
        "category": "Latest News",
        "url": "https://sinaeagle.com/"
      }
    ]
  },
  {
    "id": "sinatoday",
    "name": "Sinatoday",
    "domain": "sinatoday.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "sinatoday-latest",
        "category": "Latest News",
        "url": "https://sinatoday.com/"
      }
    ]
  },
  {
    "id": "sudannewscenter",
    "name": "Sudannewscenter",
    "domain": "sudannewscenter.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "sudannewscenter-latest",
        "category": "Latest News",
        "url": "https://sudannewscenter.com/"
      }
    ]
  },
  {
    "id": "sudanobserver",
    "name": "Sudanobserver",
    "domain": "sudanobserver.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "sudanobserver-latest",
        "category": "Latest News",
        "url": "https://sudanobserver.com/"
      }
    ]
  },
  {
    "id": "sudanreporter",
    "name": "Sudanreporter",
    "domain": "sudanreporter.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "sudanreporter-latest",
        "category": "Latest News",
        "url": "https://sudanreporter.com/"
      }
    ]
  },
  {
    "id": "sudanweekly",
    "name": "Sudanweekly",
    "domain": "sudanweekly.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "sudanweekly-latest",
        "category": "Latest News",
        "url": "https://sudanweekly.com/"
      }
    ]
  },
  {
    "id": "sultanatedaily",
    "name": "Sultanatedaily",
    "domain": "sultanatedaily.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "sultanatedaily-latest",
        "category": "Latest News",
        "url": "https://sultanatedaily.com/"
      }
    ]
  },
  {
    "id": "sultanatetimes",
    "name": "Sultanatetimes",
    "domain": "sultanatetimes.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "sultanatetimes-latest",
        "category": "Latest News",
        "url": "https://sultanatetimes.com/"
      }
    ]
  },
  {
    "id": "syriaanalyst",
    "name": "Syriaanalyst",
    "domain": "syriaanalyst.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "syriaanalyst-latest",
        "category": "Latest News",
        "url": "https://syriaanalyst.com/"
      }
    ]
  },
  {
    "id": "tangierpress",
    "name": "Tangierpress",
    "domain": "tangierpress.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "tangierpress-latest",
        "category": "Latest News",
        "url": "https://tangierpress.com/"
      }
    ]
  },
  {
    "id": "techafricanews",
    "name": "Techafricanews",
    "domain": "techafricanews.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "techafricanews-latest",
        "category": "Latest News",
        "url": "https://techafricanews.com/"
      }
    ]
  },
  {
    "id": "telavivreporter",
    "name": "Telavivreporter",
    "domain": "telavivreporter.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "telavivreporter-latest",
        "category": "Latest News",
        "url": "https://telavivreporter.com/"
      }
    ]
  },
  {
    "id": "thearabstar",
    "name": "Thearabstar",
    "domain": "thearabstar.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "thearabstar-latest",
        "category": "Latest News",
        "url": "https://thearabstar.com/"
      }
    ]
  }
  ,
  {
    "id": "thegulfdaily",
    "name": "Thegulfdaily",
    "domain": "thegulfdaily.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "thegulfdaily-latest",
        "category": "Latest News",
        "url": "https://thegulfdaily.com/"
      }
    ]
  },
  {
    "id": "tunisdispatch",
    "name": "Tunisdispatch",
    "domain": "tunisdispatch.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "tunisdispatch-latest",
        "category": "Latest News",
        "url": "https://tunisdispatch.com/"
      }
    ]
  },
  {
    "id": "tunisianpost",
    "name": "Tunisianpost",
    "domain": "tunisianpost.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "tunisianpost-latest",
        "category": "Latest News",
        "url": "https://tunisianpost.com/"
      }
    ]
  },
  {
    "id": "tunisreview",
    "name": "Tunisreview",
    "domain": "tunisreview.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "tunisreview-latest",
        "category": "Latest News",
        "url": "https://tunisreview.com"
      }
    ]
  },
  {
    "id": "uae-photoz-en",
    "name": "Uae Photoz En",
    "domain": "uae-photoz.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "uae-photoz-en-latest",
        "category": "Latest News",
        "url": "https://uae-photoz.com/en/"
      }
    ]
  },
  {
    "id": "uaebeacon",
    "name": "Uaebeacon",
    "domain": "uaebeacon.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "uaebeacon-latest",
        "category": "Latest News",
        "url": "https://uaebeacon.com/"
      }
    ]
  },
  {
    "id": "uaeherald",
    "name": "Uaeherald",
    "domain": "uaeherald.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "uaeherald-latest",
        "category": "Latest News",
        "url": "https://uaeherald.com/"
      }
    ]
  },
  {
    "id": "uaetribune",
    "name": "Uaetribune",
    "domain": "uaetribune.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "uaetribune-latest",
        "category": "Latest News",
        "url": "https://uaetribune.com/"
      }
    ]
  },
  {
    "id": "uaeviews-ntt-data-business-solutions-expands-presence-in-uae-with-stronger",
    "name": "Uaeviews Ntt Data Business Solutions Expands Presence In Uae With Stronger",
    "domain": "uaeviews.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "uaeviews-ntt-data-business-solutions-expands-presence-in-uae-with-stronger-latest",
        "category": "Latest News",
        "url": "https://uaeviews.com/ntt-data-business-solutions-expands-presence-in-uae-with-stronger"
      }
    ]
  },
  {
    "id": "news-uppersetup",
    "name": "News Uppersetup",
    "domain": "news.uppersetup.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "news-uppersetup-latest",
        "category": "Latest News",
        "url": "https://news.uppersetup.com/"
      }
    ]
  },
  {
    "id": "urbanabudhabi",
    "name": "Urbanabudhabi",
    "domain": "urbanabudhabi.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "urbanabudhabi-latest",
        "category": "Latest News",
        "url": "https://urbanabudhabi.com/"
      }
    ]
  },
  {
    "id": "whatsupgulf",
    "name": "Whatsupgulf",
    "domain": "whatsupgulf.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "whatsupgulf-latest",
        "category": "Latest News",
        "url": "https://whatsupgulf.com/"
      }
    ]
  },
  {
    "id": "article-wn",
    "name": "Article Wn",
    "domain": "article.wn.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "article-wn-latest",
        "category": "Latest News",
        "url": "https://article.wn.com/"
      }
    ]
  },
  {
    "id": "zawya-en",
    "name": "Zawya En",
    "domain": "zawya.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "zawya-en-latest",
        "category": "Latest News",
        "url": "https://www.zawya.com/en/"
      }
    ]
  }
  ,
  {
    "id": "adalatalkalima",
    "name": "Adalatalkalima",
    "domain": "adalatalkalima.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "adalatalkalima-latest",
        "category": "Latest News",
        "url": "https://adalatalkalima.com/"
      }
    ]
  },
  {
    "id": "adwabahrania",
    "name": "Adwabahrania",
    "domain": "adwabahrania.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "adwabahrania-latest",
        "category": "Latest News",
        "url": "https://adwabahrania.com/"
      }
    ]
  },
  {
    "id": "adwaelarab",
    "name": "Adwaelarab",
    "domain": "adwaelarab.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "adwaelarab-latest",
        "category": "Latest News",
        "url": "https://adwaelarab.com/"
      }
    ]
  },
  {
    "id": "afaqalmarifa",
    "name": "Afaqalmarifa",
    "domain": "afaqalmarifa.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "afaqalmarifa-latest",
        "category": "Latest News",
        "url": "https://afaqalmarifa.com/"
      }
    ]
  },
  {
    "id": "ajeiba",
    "name": "Ajeiba",
    "domain": "ajeiba.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "ajeiba-latest",
        "category": "Latest News",
        "url": "https://ajeiba.com/"
      }
    ]
  },
  {
    "id": "ajrasarabiya",
    "name": "Ajrasarabiya",
    "domain": "ajrasarabiya.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "ajrasarabiya-latest",
        "category": "Latest News",
        "url": "https://ajrasarabiya.com/"
      }
    ]
  },
  {
    "id": "akhbaralkhalij",
    "name": "Akhbaralkhalij",
    "domain": "akhbaralkhalij.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "akhbaralkhalij-latest",
        "category": "Latest News",
        "url": "https://akhbaralkhalij.com/"
      }
    ]
  },
  {
    "id": "akhbaralkhartoum",
    "name": "Akhbaralkhartoum",
    "domain": "akhbaralkhartoum.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "akhbaralkhartoum-latest",
        "category": "Latest News",
        "url": "https://akhbaralkhartoum.com/"
      }
    ]
  },
  {
    "id": "akhbarashawarie",
    "name": "Akhbarashawarie",
    "domain": "akhbarashawarie.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "akhbarashawarie-latest",
        "category": "Latest News",
        "url": "https://akhbarashawarie.com/"
      }
    ]
  },
  {
    "id": "akhbaremirati",
    "name": "Akhbaremirati",
    "domain": "akhbaremirati.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "akhbaremirati-latest",
        "category": "Latest News",
        "url": "https://akhbaremirati.com/"
      }
    ]
  },
  {
    "id": "alahdalyom",
    "name": "Alahdalyom",
    "domain": "alahdalyom.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alahdalyom-latest",
        "category": "Latest News",
        "url": "https://alahdalyom.com/"
      }
    ]
  },
  {
    "id": "alahramalarabi",
    "name": "Alahramalarabi",
    "domain": "alahramalarabi.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alahramalarabi-latest",
        "category": "Latest News",
        "url": "https://alahramalarabi.com/"
      }
    ]
  },
  {
    "id": "alahramaliktisadi",
    "name": "Alahramaliktisadi",
    "domain": "alahramaliktisadi.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alahramaliktisadi-latest",
        "category": "Latest News",
        "url": "https://alahramaliktisadi.com/"
      }
    ]
  },
  {
    "id": "alahramaliktisadiyah",
    "name": "Alahramaliktisadiyah",
    "domain": "alahramaliktisadiyah.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alahramaliktisadiyah-latest",
        "category": "Latest News",
        "url": "https://alahramaliktisadiyah.com/"
      }
    ]
  },
  {
    "id": "alahramalmasal",
    "name": "Alahramalmasal",
    "domain": "alahramalmasal.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alahramalmasal-latest",
        "category": "Latest News",
        "url": "https://alahramalmasal.com/"
      }
    ]
  },
  {
    "id": "alahramalshaabiyah",
    "name": "Alahramalshaabiyah",
    "domain": "alahramalshaabiyah.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alahramalshaabiyah-latest",
        "category": "Latest News",
        "url": "https://alahramalshaabiyah.com/"
      }
    ]
  },
  {
    "id": "alahramdaily",
    "name": "Alahramdaily",
    "domain": "alahramdaily.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alahramdaily-latest",
        "category": "Latest News",
        "url": "https://alahramdaily.com/"
      }
    ]
  },
  {
    "id": "alamalkhabar",
    "name": "Alamalkhabar",
    "domain": "alamalkhabar.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alamalkhabar-latest",
        "category": "Latest News",
        "url": "https://alamalkhabar.com/"
      }
    ]
  },
  {
    "id": "albayannews",
    "name": "Albayannews",
    "domain": "albayannews.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "albayannews-latest",
        "category": "Latest News",
        "url": "https://albayannews.com/"
      }
    ]
  },
  {
    "id": "alfajralmasri",
    "name": "Alfajralmasri",
    "domain": "alfajralmasri.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alfajralmasri-latest",
        "category": "Latest News",
        "url": "https://alfajralmasri.com/"
      }
    ]
  },
  {
    "id": "alfatehalaraby",
    "name": "Alfatehalaraby",
    "domain": "alfatehalaraby.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alfatehalaraby-latest",
        "category": "Latest News",
        "url": "https://alfatehalaraby.com/"
      }
    ]
  },
  {
    "id": "alhaqiqalmutlaqa",
    "name": "Alhaqiqalmutlaqa",
    "domain": "alhaqiqalmutlaqa.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alhaqiqalmutlaqa-latest",
        "category": "Latest News",
        "url": "https://alhaqiqalmutlaqa.com/"
      }
    ]
  }
  ,
  {
    "id": "alhayateljadida",
    "name": "Alhayateljadida",
    "domain": "alhayateljadida.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alhayateljadida-latest",
        "category": "Latest News",
        "url": "https://alhayateljadida.com/"
      }
    ]
  },
  {
    "id": "alhilalalmasri",
    "name": "Alhilalalmasri",
    "domain": "alhilalalmasri.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alhilalalmasri-latest",
        "category": "Latest News",
        "url": "https://alhilalalmasri.com/"
      }
    ]
  },
  {
    "id": "alkhalijalyaum",
    "name": "Alkhalijalyaum",
    "domain": "alkhalijalyaum.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alkhalijalyaum-latest",
        "category": "Latest News",
        "url": "https://alkhalijalyaum.com/"
      }
    ]
  },
  {
    "id": "alkoweitiya",
    "name": "Alkoweitiya",
    "domain": "alkoweitiya.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alkoweitiya-latest",
        "category": "Latest News",
        "url": "https://alkoweitiya.com/"
      }
    ]
  },
  {
    "id": "almouhtwalekhbari",
    "name": "Almouhtwalekhbari",
    "domain": "almouhtwalekhbari.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "almouhtwalekhbari-latest",
        "category": "Latest News",
        "url": "https://almouhtwalekhbari.com/"
      }
    ]
  },
  {
    "id": "almuqattam",
    "name": "Almuqattam",
    "domain": "almuqattam.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "almuqattam-latest",
        "category": "Latest News",
        "url": "https://almuqattam.com/"
      }
    ]
  },
  {
    "id": "almustaqila",
    "name": "Almustaqila",
    "domain": "almustaqila.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "almustaqila-latest",
        "category": "Latest News",
        "url": "https://almustaqila.com/"
      }
    ]
  },
  {
    "id": "alnilalazraq",
    "name": "Alnilalazraq",
    "domain": "alnilalazraq.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alnilalazraq-latest",
        "category": "Latest News",
        "url": "https://alnilalazraq.com/"
      }
    ]
  },
  {
    "id": "aiqiblaa",
    "name": "Aiqiblaa",
    "domain": "aiqiblaa.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "aiqiblaa-latest",
        "category": "Latest News",
        "url": "https://aiqiblaa.com/"
      }
    ]
  },
  {
    "id": "alraaye",
    "name": "Alraaye",
    "domain": "alraaye.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alraaye-latest",
        "category": "Latest News",
        "url": "https://alraaye.com/"
      }
    ]
  },
  {
    "id": "alrajulalasry",
    "name": "Alrajulalasry",
    "domain": "alrajulalasry.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alrajulalasry-latest",
        "category": "Latest News",
        "url": "https://alrajulalasry.com/"
      }
    ]
  },
  {
    "id": "alsadaalmuhtarmun",
    "name": "Alsadaalmuhtarmun",
    "domain": "alsadaalmuhtarmun.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alsadaalmuhtarmun-latest",
        "category": "Latest News",
        "url": "https://alsadaalmuhtarmun.com/"
      }
    ]
  },
  {
    "id": "alumalarabiya",
    "name": "Alumalarabiya",
    "domain": "alumalarabiya.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alumalarabiya-latest",
        "category": "Latest News",
        "url": "https://alumalarabiya.com/"
      }
    ]
  },
  {
    "id": "alyaumalmisry",
    "name": "Alyaumalmisry",
    "domain": "alyaumalmisry.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alyaumalmisry-latest",
        "category": "Latest News",
        "url": "https://alyaumalmisry.com/"
      }
    ]
  },
  {
    "id": "alyaumetali",
    "name": "Alyaumetali",
    "domain": "alyaumetali.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "alyaumetali-latest",
        "category": "Latest News",
        "url": "https://alyaumetali.com/"
      }
    ]
  },
  {
    "id": "amwajiskendria",
    "name": "Amwajiskendria",
    "domain": "amwajiskendria.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "amwajiskendria-latest",
        "category": "Latest News",
        "url": "https://amwajiskendria.com/"
      }
    ]
  },
  {
    "id": "anabasareea",
    "name": "Anabasareea",
    "domain": "anabasareea.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "anabasareea-latest",
        "category": "Latest News",
        "url": "https://anabasareea.com/"
      }
    ]
  },
  {
    "id": "anasharqy",
    "name": "Anasharqy",
    "domain": "anasharqy.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "anasharqy-latest",
        "category": "Latest News",
        "url": "https://anasharqy.com/"
      }
    ]
  },
  {
    "id": "anashra",
    "name": "Anashra",
    "domain": "anashra.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "anashra-latest",
        "category": "Latest News",
        "url": "https://anashra.com/"
      }
    ]
  },
  {
    "id": "anbaqatar",
    "name": "Anbaqatar",
    "domain": "anbaqatar.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "anbaqatar-latest",
        "category": "Latest News",
        "url": "https://anbaqatar.com/"
      }
    ]
  },
  {
    "id": "arabiealarabi",
    "name": "Arabiealarabi",
    "domain": "arabiealarabi.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "arabiealarabi-latest",
        "category": "Latest News",
        "url": "https://arabiealarabi.com/"
      }
    ]
  },
  {
    "id": "aradaralarabi",
    "name": "Aradaralarabi",
    "domain": "aradaralarabi.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "aradaralarabi-latest",
        "category": "Latest News",
        "url": "https://aradaralarabi.com/"
      }
    ]
  },
  {
    "id": "arrafedin",
    "name": "Arrafedin",
    "domain": "arrafedin.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "arrafedin-latest",
        "category": "Latest News",
        "url": "https://arrafedin.com/"
      }
    ]
  },
  {
    "id": "asabahaljadid",
    "name": "Asabahaljadid",
    "domain": "asabahaljadid.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "asabahaljadid-latest",
        "category": "Latest News",
        "url": "https://asabahaljadid.com/"
      }
    ]
  },
  {
    "id": "asadalarabi",
    "name": "Asadalarabi",
    "domain": "asadalarabi.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "asadalarabi-latest",
        "category": "Latest News",
        "url": "https://asadalarabi.com/"
      }
    ]
  },
  {
    "id": "asadalkhaliji",
    "name": "Asadalkhaliji",
    "domain": "asadalkhaliji.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "asadalkhaliji-latest",
        "category": "Latest News",
        "url": "https://asadalkhaliji.com/"
      }
    ]
  },
  {
    "id": "asahafadimogratia",
    "name": "Asahafadimogratia",
    "domain": "asahafadimogratia.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "asahafadimogratia-latest",
        "category": "Latest News",
        "url": "https://asahafadimogratia.com/"
      }
    ]
  },
  {
    "id": "ashabakasaudia",
    "name": "Ashabakasaudia",
    "domain": "ashabakasaudia.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "ashabakasaudia-latest",
        "category": "Latest News",
        "url": "https://ashabakasaudia.com/"
      }
    ]
  },
  {
    "id": "ashabalrai",
    "name": "Ashabalrai",
    "domain": "ashabalrai.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "ashabalrai-latest",
        "category": "Latest News",
        "url": "https://ashabalrai.com/"
      }
    ]
  },
  {
    "id": "ashahidelikhbari",
    "name": "Ashahidelikhbari",
    "domain": "ashahidelikhbari.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "ashahidelikhbari-latest",
        "category": "Latest News",
        "url": "https://ashahidelikhbari.com/"
      }
    ]
  },
  {
    "id": "ashshamsalarabia",
    "name": "Ashshamsalarabia",
    "domain": "ashshamsalarabia.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "ashshamsalarabia-latest",
        "category": "Latest News",
        "url": "https://ashshamsalarabia.com/"
      }
    ]
  },
  {
    "id": "asiyasa",
    "name": "Asiyasa",
    "domain": "asiyasa.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "asiyasa-latest",
        "category": "Latest News",
        "url": "https://asiyasa.com/"
      }
    ]
  },
  {
    "id": "assabaah",
    "name": "Assabaah",
    "domain": "assabaah.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "assabaah-latest",
        "category": "Latest News",
        "url": "https://assabaah.com/"
      }
    ]
  },
  {
    "id": "awalkalam",
    "name": "Awalkalam",
    "domain": "awalkalam.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "awalkalam-latest",
        "category": "Latest News",
        "url": "https://awalkalam.com/"
      }
    ]
  },
  {
    "id": "awdatelwael",
    "name": "Awdatelwael",
    "domain": "awdatelwael.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "awdatelwael-latest",
        "category": "Latest News",
        "url": "https://awdatelwael.com/"
      }
    ]
  },
  {
    "id": "awlawiaat",
    "name": "Awlawiaat",
    "domain": "awlawiaat.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "awlawiaat-latest",
        "category": "Latest News",
        "url": "https://awlawiaat.com/"
      }
    ]
  },
  {
    "id": "ayamalosrah",
    "name": "Ayamalosrah",
    "domain": "ayamalosrah.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "ayamalosrah-latest",
        "category": "Latest News",
        "url": "https://ayamalosrah.com/"
      }
    ]
  },
  {
    "id": "bahrainalghad",
    "name": "Bahrainalghad",
    "domain": "bahrainalghad.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "bahrainalghad-latest",
        "category": "Latest News",
        "url": "https://bahrainalghad.com/"
      }
    ]
  },
  {
    "id": "bahrelmarifa",
    "name": "Bahrelmarifa",
    "domain": "bahrelmarifa.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "bahrelmarifa-latest",
        "category": "Latest News",
        "url": "https://bahrelmarifa.com/"
      }
    ]
  },
  {
    "id": "barqalkhalij",
    "name": "Barqalkhalij",
    "domain": "barqalkhalij.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "barqalkhalij-latest",
        "category": "Latest News",
        "url": "https://barqalkhalij.com/"
      }
    ]
  },
  {
    "id": "bashayerelkhabar",
    "name": "Bashayerelkhabar",
    "domain": "bashayerelkhabar.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "bashayerelkhabar-latest",
        "category": "Latest News",
        "url": "https://bashayerelkhabar.com/"
      }
    ]
  },
  {
    "id": "bathhay",
    "name": "Bathhay",
    "domain": "bathhay.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "bathhay-latest",
        "category": "Latest News",
        "url": "https://bathhay.com/"
      }
    ]
  },
  {
    "id": "bayanatama",
    "name": "Bayanatama",
    "domain": "bayanatama.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "bayanatama-latest",
        "category": "Latest News",
        "url": "https://bayanatama.com/"
      }
    ]
  }
  ,
  {
    "id": "bisharafaq",
    "name": "Bisharafaq",
    "domain": "bisharafaq.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "bisharafaq-latest",
        "category": "Latest News",
        "url": "https://bisharafaq.com/"
      }
    ]
  },
  {
    "id": "burjelakhbar",
    "name": "Burjelakhbar",
    "domain": "burjelakhbar.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "burjelakhbar-latest",
        "category": "Latest News",
        "url": "https://burjelakhbar.com/"
      }
    ]
  },
  {
    "id": "buslatalakhbar",
    "name": "Buslatalakhbar",
    "domain": "buslatalakhbar.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "buslatalakhbar-latest",
        "category": "Latest News",
        "url": "https://buslatalakhbar.com/"
      }
    ]
  },
  {
    "id": "dalilaraby",
    "name": "Dalilaraby",
    "domain": "dalilaraby.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "dalilaraby-latest",
        "category": "Latest News",
        "url": "https://dalilaraby.com/"
      }
    ]
  },
  {
    "id": "daralhikmat",
    "name": "Daralhikmat",
    "domain": "daralhikmat.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "daralhikmat-latest",
        "category": "Latest News",
        "url": "https://daralhikmat.com/"
      }
    ]
  },
  {
    "id": "dubainewstyle-ar",
    "name": "Dubainewstyle Ar",
    "domain": "dubainewstyle.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "dubainewstyle-ar-latest",
        "category": "Latest News",
        "url": "https://www.dubainewstyle.com/ar/"
      }
    ]
  },
  {
    "id": "dubaiglobalnews-ar",
    "name": "Dubaiglobalnews Ar",
    "domain": "dubaiglobalnews.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "dubaiglobalnews-ar-latest",
        "category": "Latest News",
        "url": "https://www.dubaiglobalnews.com/ar/"
      }
    ]
  },
  {
    "id": "dubainewstyle-ar-223",
    "name": "Dubainewstyle Ar 223",
    "domain": "dubainewstyle.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "dubainewstyle-ar-223-latest",
        "category": "Latest News",
        "url": "https://www.dubainewstyle.com/ar/"
      }
    ]
  },
  {
    "id": "eljazaeir",
    "name": "Eljazaeir",
    "domain": "eljazaeir.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "eljazaeir-latest",
        "category": "Latest News",
        "url": "https://eljazaeir.com/"
      }
    ]
  },
  {
    "id": "elmuqtataf",
    "name": "Elmuqtataf",
    "domain": "elmuqtataf.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "elmuqtataf-latest",
        "category": "Latest News",
        "url": "https://elmuqtataf.com/"
      }
    ]
  },
  {
    "id": "ermiratco",
    "name": "Ermiratco",
    "domain": "ermiratco.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "ermiratco-latest",
        "category": "Latest News",
        "url": "https://ermiratco.com/"
      }
    ]
  },
  {
    "id": "emiratelkhabar",
    "name": "Emiratelkhabar",
    "domain": "emiratelkhabar.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "emiratelkhabar-latest",
        "category": "Latest News",
        "url": "https://emiratelkhabar.com/"
      }
    ]
  },
  {
    "id": "enn",
    "name": "Enn",
    "domain": "enn.ae",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "enn-latest",
        "category": "Latest News",
        "url": "https://enn.ae/"
      }
    ]
  },
  {
    "id": "essahafa",
    "name": "Essahafa",
    "domain": "essahafa.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "essahafa-latest",
        "category": "Latest News",
        "url": "https://essahafa.com/"
      }
    ]
  },
  {
    "id": "eyeofdubai-ar-news",
    "name": "Eyeofdubai Ar News",
    "domain": "eyeofdubai.ae",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "eyeofdubai-ar-news-latest",
        "category": "Latest News",
        "url": "https://www.eyeofdubai.ae/ar/news/"
      }
    ]
  },
  {
    "id": "eyeofriyadh-ar-news",
    "name": "Eyeofriyadh Ar News",
    "domain": "eyeofriyadh.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "eyeofriyadh-ar-news-latest",
        "category": "Latest News",
        "url": "https://www.eyeofriyadh.com/ar/news/"
      }
    ]
  },
  {
    "id": "fahshamil",
    "name": "Fahshamil",
    "domain": "fahshamil.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "fahshamil-latest",
        "category": "Latest News",
        "url": "https://fahshamil.com/"
      }
    ]
  },
  {
    "id": "fawaseltunis",
    "name": "Fawaseltunis",
    "domain": "fawaseltunis.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "fawaseltunis-latest",
        "category": "Latest News",
        "url": "https://fawaseltunis.com/"
      }
    ]
  },
  {
    "id": "fidayirataldoua",
    "name": "Fidayirataldoua",
    "domain": "fidayirataldoua.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "fidayirataldoua-latest",
        "category": "Latest News",
        "url": "https://fidayirataldoua.com/"
      }
    ]
  },
  {
    "id": "ghadeeralarab",
    "name": "Ghadeeralarab",
    "domain": "ghadeeralarab.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "ghadeeralarab-latest",
        "category": "Latest News",
        "url": "https://ghadeeralarab.com/"
      }
    ]
  },
  {
    "id": "haqeeqah",
    "name": "Haqeeqah",
    "domain": "haqeeqah.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "haqeeqah-latest",
        "category": "Latest News",
        "url": "https://haqeeqah.com/"
      }
    ]
  },
  {
    "id": "hayatalarabi",
    "name": "Hayatalarabi",
    "domain": "hayatalarabi.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "hayatalarabi-latest",
        "category": "Latest News",
        "url": "https://hayatalarabi.com/"
      }
    ]
  },
  {
    "id": "hayatalmadina",
    "name": "Hayatalmadina",
    "domain": "hayatalmadina.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "hayatalmadina-latest",
        "category": "Latest News",
        "url": "https://hayatalmadina.com/"
      }
    ]
  },
  {
    "id": "hayatwabashar",
    "name": "Hayatwabashar",
    "domain": "hayatwabashar.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "hayatwabashar-latest",
        "category": "Latest News",
        "url": "https://hayatwabashar.com/"
      }
    ]
  },
  {
    "id": "hewararabi",
    "name": "Hewararabi",
    "domain": "hewararabi.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "hewararabi-latest",
        "category": "Latest News",
        "url": "https://hewararabi.com/"
      }
    ]
  },
  {
    "id": "hikayetwatan",
    "name": "Hikayetwatan",
    "domain": "hikayetwatan.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "hikayetwatan-latest",
        "category": "Latest News",
        "url": "https://hikayetwatan.com/"
      }
    ]
  },
  {
    "id": "hunaalasima",
    "name": "Hunaalasima",
    "domain": "hunaalasima.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "hunaalasima-latest",
        "category": "Latest News",
        "url": "https://hunaalasima.com/"
      }
    ]
  },
  {
    "id": "ibrawakhait",
    "name": "Ibrawakhait",
    "domain": "ibrawakhait.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "ibrawakhait-latest",
        "category": "Latest News",
        "url": "https://ibrawakhait.com/"
      }
    ]
  },
  {
    "id": "ikhtubutnews",
    "name": "Ikhtubutnews",
    "domain": "ikhtubutnews.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "ikhtubutnews-latest",
        "category": "Latest News",
        "url": "https://ikhtubutnews.com/"
      }
    ]
  },
  {
    "id": "iqtisadalbalad",
    "name": "Iqtisadalbalad",
    "domain": "iqtisadalbalad.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "iqtisadalbalad-latest",
        "category": "Latest News",
        "url": "https://iqtisadalbalad.com/"
      }
    ]
  },
  {
    "id": "istiqlalarab",
    "name": "Istiqlalarab",
    "domain": "istiqlalarab.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "istiqlalarab-latest",
        "category": "Latest News",
        "url": "https://istiqlalarab.com/"
      }
    ]
  },
  {
    "id": "kalamarabi",
    "name": "Kalamarabi",
    "domain": "kalamarabi.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "kalamarabi-latest",
        "category": "Latest News",
        "url": "https://kalamarabi.com/"
      }
    ]
  },
  {
    "id": "kawaliselkhabar",
    "name": "Kawaliselkhabar",
    "domain": "kawaliselkhabar.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "kawaliselkhabar-latest",
        "category": "Latest News",
        "url": "https://kawaliselkhabar.com/"
      }
    ]
  },
  {
    "id": "khabar3agil",
    "name": "Khabar3agil",
    "domain": "khabar3agil.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "khabar3agil-latest",
        "category": "Latest News",
        "url": "https://khabar3agil.com/"
      }
    ]
  },
  {
    "id": "khabaralkuwait",
    "name": "Khabaralkuwait",
    "domain": "khabaralkuwait.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "khabaralkuwait-latest",
        "category": "Latest News",
        "url": "https://khabaralkuwait.com/"
      }
    ]
  },
  {
    "id": "khabarelbahrain",
    "name": "Khabarelbahrain",
    "domain": "khabarelbahrain.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "khabarelbahrain-latest",
        "category": "Latest News",
        "url": "https://khabarelbahrain.com/"
      }
    ]
  },
  {
    "id": "khabarmouwatin",
    "name": "Khabarmouwatin",
    "domain": "khabarmouwatin.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "khabarmouwatin-latest",
        "category": "Latest News",
        "url": "https://khabarmouwatin.com/"
      }
    ]
  },
  {
    "id": "khaleejeyes",
    "name": "Khaleejeyes",
    "domain": "khaleejeyes.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "khaleejeyes-latest",
        "category": "Latest News",
        "url": "https://khaleejeyes.com/"
      }
    ]
  },
  {
    "id": "khanalkhaleli",
    "name": "Khanalkhaleli",
    "domain": "khanalkhaleli.com",
    "country": "AE",
    "languages": ["en"],
    "type": "newspaper",
    "credibilityScore": 85,
    "tier": "standard",
    "feeds": [
      {
        "id": "khanalkhaleli-latest",
        "category": "Latest News",
        "url": "https://khanalkhaleli.com/"
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
