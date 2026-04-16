/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

export interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
  content?: string;
  author?: string;
  categories?: string[];
  guid?: string;
  isoDate?: string;
}

export interface FeedResponse {
  success: boolean;
  data?: FeedItem[];
  error?: string;
  source?: string;
}
