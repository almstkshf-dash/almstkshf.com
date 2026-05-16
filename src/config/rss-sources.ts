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
    { id: 'dubai-pr', name: 'Latest PR', url: 'https://www.dubaiprnetwork.com/rssfeed.asp', country: 'UAE' }
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
  ]
};

export const ALL_SOURCES = Object.entries(PREMIUM_SOURCES).flatMap(([publisher, categories]) => 
  categories.map(cat => ({
    ...cat,
    publisher,
    label: `${publisher} - ${cat.name}`
  }))
);
