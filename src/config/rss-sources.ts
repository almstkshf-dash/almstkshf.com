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
}

export const AAWSAT_SOURCES: RSSCategory[] = [
  { id: 'main', name: 'main', url: 'https://aawsat.com/feed' },
  { id: 'news', name: 'news', url: 'https://aawsat.com/feed' },
  { id: 'world', name: 'world', url: 'https://aawsat.com/feed/arab-world' },
  { id: 'gulf', name: 'gulf', url: 'https://aawsat.com/feed/gulf' },
  { id: 'europe', name: 'europe', url: 'https://aawsat.com/feed/europe' },
  { id: 'america', name: 'america', url: 'https://aawsat.com/feed/america' },
  { id: 'asia', name: 'asia', url: 'https://aawsat.com/feed/asia' },
  { id: 'africa', name: 'africa', url: 'https://aawsat.com/feed/africa' },
  { id: 'economy', name: 'economy', url: 'https://aawsat.com/feed/economy' },
  { id: 'political', name: 'political', url: 'https://aawsat.com/feed/political' },
  { id: 'sport', name: 'sport', url: 'https://aawsat.com/feed/sport' },
  { id: 'last-page', name: 'last-page', url: 'https://aawsat.com/feed/last-page' },
  { id: 'reviews', name: 'reviews', url: 'https://aawsat.com/feed/reviews' },
  { id: 'fundamentalism', name: 'fundamentalism', url: 'https://aawsat.com/feed/fundamentalism' },
  { id: 'press', name: 'press', url: 'https://aawsat.com/feed/press' },
  { id: 'education', name: 'education', url: 'https://aawsat.com/feed/education' },
  { id: 'hassad', name: 'hassad', url: 'https://aawsat.com/feed/hassad' },
  { id: 'travel', name: 'travel', url: 'https://aawsat.com/feed/travel' },
  { id: 'it', name: 'it', url: 'https://aawsat.com/feed/information-technology' },
  { id: 'culture', name: 'culture', url: 'https://aawsat.com/feed/culture' },
  { id: 'vehicles', name: 'vehicles', url: 'https://aawsat.com/feed/vehicles' },
  { id: 'cinema', name: 'cinema', url: 'https://aawsat.com/feed/cinema' },
  { id: 'health', name: 'health', url: 'https://aawsat.com/feed/health' },
  { id: 'realestate', name: 'realestate', url: 'https://aawsat.com/feed/realestate' },
  { id: 'science', name: 'science', url: 'https://aawsat.com/feed/science' },
  { id: 'arts', name: 'arts', url: 'https://aawsat.com/feed/arts' },
  { id: 'food', name: 'food', url: 'https://aawsat.com/feed/food' },
  { id: 'fashion', name: 'fashion', url: 'https://aawsat.com/feed/fashion' },
  { id: 'investigation', name: 'investigation', url: 'https://aawsat.com/feed/investigation' },
  { id: 'all', name: 'all', url: 'https://aawsat.com/feed/all' },
  { id: 'first', name: 'first', url: 'https://aawsat.com/feed/first' },
  { id: 'opinion', name: 'opinion', url: 'https://aawsat.com/feed/opinion' }
];
