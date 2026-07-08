/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { MEDIA_SOURCES } from './media-sources';

export interface RSSCategory {
  id: string;
  name: string;
  url: string;
  country?: string;
}

// Reconstruct AAWSAT_SOURCES for compatibility if needed
const aawsatSource = MEDIA_SOURCES.find(s => s.name === 'Asharq Al-Awsat');
export const AAWSAT_SOURCES: RSSCategory[] = aawsatSource
  ? aawsatSource.feeds.map(f => ({ id: f.id, name: f.category, url: f.url, country: aawsatSource.country }))
  : [];

// Reconstruct PREMIUM_SOURCES: Record<string, RSSCategory[]>
export const PREMIUM_SOURCES: Record<string, RSSCategory[]> = MEDIA_SOURCES.reduce((acc, source) => {
  acc[source.name] = source.feeds.map(f => ({
    id: f.id,
    name: f.category,
    url: f.url,
    country: source.country
  }));
  return acc;
}, {} as Record<string, RSSCategory[]>);

// Reconstruct ALL_SOURCES
export const ALL_SOURCES = Object.entries(PREMIUM_SOURCES).flatMap(([publisher, categories]) =>
  categories.map(cat => ({
    ...cat,
    publisher,
    label: `${publisher} - ${cat.name}`
  }))
);
