/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { OsintLookupType, OsintHistoryItem } from '@/types/reports';

export type LookupType = OsintLookupType;
export type HistoryItem = OsintHistoryItem;

export interface PlatformPresence {
  platform: string;
  found: boolean | null;
  url: string;
  category: string;
}

export interface SocialPresenceData {
  platforms: PlatformPresence[];
  foundOn: string[];
  notFoundOn: string[];
  unknownOn: string[];
  totalChecked: number;
  totalFound: number;
}

export interface EmailResult {
  socialPresence?: SocialPresenceData;
  socialPresenceNote?: string;
  is_disposable?: boolean;
  mx_records?: string | string[];
  gravatar?: { displayName?: string };
  user?: string;
  domain?: string;
  is_free?: boolean;
  catch_all?: boolean;
}

export interface IPResult {
  country_name?: string;
  country?: string;
  security?: {
    is_vpn?: boolean;
    threat_level?: string;
  };
  is_proxy?: boolean;
  city?: string;
  region?: string;
  zip?: string;
  time_zone?: { name?: string };
  asn?: string;
  isp?: string;
  org?: string;
  type?: string;
}

export interface DomainResult {
  registered?: string;
  dnssec?: string;
  status?: string;
  registrar?: string;
  created_date?: string;
  expiration_date?: string;
  updated_date?: string;
  name_servers?: string[];
  mx_found?: boolean;
}

export interface PhoneResult {
  valid?: boolean;
  line_type?: string;
  carrier?: string;
  local_format?: string;
  international_format?: string;
  country_prefix?: string;
  location?: string;
}

export interface NewsArticle {
  title: string;
  link: string;
  source: string;
  date: string;
}

export interface NewsResult {
  provider?: string;
  totalArticles?: number | string;
  articles?: NewsArticle[];
}

export interface CorporateCompany {
  name: string;
  url: string;
  jurisdiction?: string;
  status?: string;
  number?: string;
}

export interface CorporateResult {
  companies?: CorporateCompany[];
}

export interface LocationItem {
  displayName: string;
  osmUrl: string;
  type?: string;
  city?: string;
  country?: string;
}

export interface LocationResult {
  locations?: LocationItem[];
}

export interface WikipediaResult {
  wiki?: {
    title: string;
    url: string;
    summary: string;
  };
}

export interface GleifRecord {
  legalName: string;
  lei: string;
  status: string;
  jurisdiction: string;
}

export interface GleifResult {
  records?: GleifRecord[];
}

export interface WatchlistMatch {
  id?: string;
  caption: string;
  matchScore: number;
  schema?: string;
  datasets?: string[];
  topics?: string[];
}

export interface WatchlistResult {
  isClean?: boolean;
  totalMatches?: number;
  matches?: WatchlistMatch[];
}

export type OsintResult =
  | EmailResult
  | IPResult
  | DomainResult
  | PhoneResult
  | NewsResult
  | CorporateResult
  | LocationResult
  | WikipediaResult
  | GleifResult
  | WatchlistResult;

export interface Resource {
  id: string;
  name: string;
  url: string;
  description: string;
  categories: string[];
  labels: string[];
  freeTier: boolean;
  language: 'en' | 'ar' | 'both';
}
