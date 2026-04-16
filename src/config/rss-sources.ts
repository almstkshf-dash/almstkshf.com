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
  { id: 'main', name: 'Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©', url: 'https://aawsat.com/feed' },
  { id: 'news', name: 'ÙƒÙ„ Ø§Ù„Ø§Ø®Ø¨Ø§Ø±', url: 'https://aawsat.com/feed/news' },
  { id: 'world', name: 'Ø§Ù„Ø¹Ø§Ù„Ù… Ø§Ù„Ø¹Ø±Ø¨ÙŠ', url: 'https://aawsat.com/feed/arab-world' },
  { id: 'gulf', name: 'Ø§Ù„Ø®Ù„ÙŠØ¬', url: 'https://aawsat.com/feed/gulf' },
  { id: 'europe', name: 'Ø£ÙˆØ±ÙˆØ¨Ø§', url: 'https://aawsat.com/feed/europe' },
  { id: 'america', name: 'Ø§Ù„Ø£Ù…ÙŠØ±ÙƒÙŠØªÙŠÙ†', url: 'https://aawsat.com/feed/america' },
  { id: 'asia', name: 'Ø¢Ø³ÙŠØ§', url: 'https://aawsat.com/feed/asia' },
  { id: 'africa', name: 'Ø£ÙØ±ÙŠÙ‚ÙŠØ§', url: 'https://aawsat.com/feed/africa' },
  { id: 'economy', name: 'Ø§Ù„Ø§Ù‚ØªØµØ§Ø¯', url: 'https://aawsat.com/feed/economy' },
  { id: 'political', name: 'Ù…Ù†ÙˆØ¹Ø§Øª', url: 'https://aawsat.com/feed/political' },
  { id: 'sport', name: 'Ø§Ù„Ø±ÙŠØ§Ø¶Ø©', url: 'https://aawsat.com/feed/sport' },
  { id: 'last-page', name: 'Ø£ÙˆÙ„Ù‰2', url: 'https://aawsat.com/feed/last-page' },
  { id: 'reviews', name: 'Ù…Ø±Ø§Ø¬Ø¹Ø§Øª', url: 'https://aawsat.com/feed/reviews' },
  { id: 'fundamentalism', name: 'Ù…Ù†Ø­Ù†ÙŠØ§Øª Ø£ØµÙˆÙ„ÙŠØ©', url: 'https://aawsat.com/feed/fundamentalism' },
  { id: 'press', name: 'Ø§Ù„Ø¥Ø¹Ù„Ø§Ù…', url: 'https://aawsat.com/feed/press' },
  { id: 'education', name: 'Ø§Ù„ØªØ¹Ù„ÙŠÙ…', url: 'https://aawsat.com/feed/education' },
  { id: 'hassad', name: 'Ø§Ù„Ø­ØµØ§Ø¯', url: 'https://aawsat.com/feed/hassad' },
  { id: 'travel', name: 'Ø§Ù„Ø³ÙŠØ§Ø­Ø©', url: 'https://aawsat.com/feed/travel' },
  { id: 'it', name: 'ØªÙ‚Ù†ÙŠØ© Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª', url: 'https://aawsat.com/feed/information-technology' },
  { id: 'culture', name: 'ÙØ¶Ø§Ø¡Ø§Øª', url: 'https://aawsat.com/feed/culture' },
  { id: 'vehicles', name: 'Ø³ÙŠØ§Ø±Ø§Øª', url: 'https://aawsat.com/feed/vehicles' },
  { id: 'cinema', name: 'Ø³ÙŠÙ†Ù…Ø§', url: 'https://aawsat.com/feed/cinema' },
  { id: 'health', name: 'ØµØ­ØªÙƒ', url: 'https://aawsat.com/feed/health' },
  { id: 'realestate', name: 'Ø¹Ù‚Ø§Ø±Ø§Øª', url: 'https://aawsat.com/feed/realestate' },
  { id: 'science', name: 'Ø¹Ù„ÙˆÙ…', url: 'https://aawsat.com/feed/science' },
  { id: 'arts', name: 'Ø£Ù†ØºØ§Ù… ÙˆÙÙ†ÙˆÙ†', url: 'https://aawsat.com/feed/arts' },
  { id: 'food', name: 'Ù…Ø°Ø§Ù‚Ø§Øª', url: 'https://aawsat.com/feed/food' },
  { id: 'fashion', name: 'Ù„Ù…Ø³Ø§Øª', url: 'https://aawsat.com/feed/fashion' },
  { id: 'investigation', name: 'ØªØ­Ù‚ÙŠÙ‚', url: 'https://aawsat.com/feed/investigation' },
  { id: 'all', name: 'Ø§Ù„ÙƒÙ„', url: 'https://aawsat.com/feed/all' },
  { id: 'first', name: 'Ø§Ù„Ø§ÙˆÙ„Ù‰', url: 'https://aawsat.com/feed/first' },
  { id: 'opinion', name: 'Ø§Ù„Ø±Ø£ÙŠ', url: 'https://aawsat.com/feed/opinion' }
];
