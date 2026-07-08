/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

export const CATEGORIES = [
  'social',
  'people',
  'dating',
  'phone',
  'public records',
  'geolocation',
  'maps',
  'business',
  'search',
  'directory',
  'misc',
  'news',
  'email',
  'security',
] as const;

export const LABELS = [
  { code: 'T', text: 'Tool (local install)' },
  { code: 'R', text: 'Registration required' },
  { code: 'M', text: 'Manual URL edit' },
  { code: 'D', text: 'Google dork' },
] as const;

export const PLATFORM_ICONS: Record<string, string> = {
  'Twitter/X': '𝕏',
  'Spotify': '🎵',
  'Duolingo': '🦉',
  'WordPress': '📝',
  'ProtonMail': '🔒',
  'Foursquare': '📍',
  'Flickr': '📸',
  'Airbnb': '🏠',
  'Snapchat': '👻',
  'Pinterest': '📌',
  'Zoom': '📹',
  'Instagram': '📸',
  'GitHub': '💻',
  'Adobe': '🎨',
  'Last.fm': '🎧',
  'Disqus': '💬',
  'MyAnimeList': '🎬',
  'Quora': '❓',
};

export const CATEGORY_COLORS: Record<string, string> = {
  social: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
  professional: 'from-purple-500/10 to-violet-500/10 border-purple-500/20',
  entertainment: 'from-pink-500/10 to-rose-500/10 border-pink-500/20',
  productivity: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20',
  ecommerce: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
};
