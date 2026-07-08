/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { useAction } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { LookupType, OsintResult } from '../types';

export function useOsintLookup() {
  const lookupEmail = useAction(api.osint.lookupEmail);
  const lookupDomain = useAction(api.osint.lookupDomain);
  const lookupIp = useAction(api.osint.lookupIp);
  const lookupUsername = useAction(api.osint.lookupUsername);
  const lookupPhone = useAction(api.osint.lookupPhone);
  const lookupNews = useAction(api.osint.lookupNews);
  const lookupCorporate = useAction(api.osint.lookupCorporate);
  const lookupLocation = useAction(api.osint.lookupLocation);
  const lookupWikipedia = useAction(api.osint.lookupWikipedia);
  const lookupGleif = useAction(api.osint.lookupGleif);
  const lookupWatchlist = useAction(api.osint.lookupWatchlist);
  const optimizeQueryAction = useAction(api.searchOptimizer.optimizeQuery);

  const LOOKUP_HANDLERS: Record<
    LookupType,
    (q: string) => Promise<{ success: boolean; data?: any; error?: string }>
  > = {
    email: (q: string) => lookupEmail({ email: q }),
    domain: (q: string) => lookupDomain({ domain: q }),
    ip: (q: string) => lookupIp({ ip: q }),
    username: (q: string) => lookupUsername({ username: q }),
    phone: (q: string) => lookupPhone({ phone: q }),
    news: (q: string) => lookupNews({ query: q }),
    corporate: (q: string) => lookupCorporate({ companyName: q }),
    location: (q: string) => lookupLocation({ locationName: q }),
    wikipedia: (q: string) => lookupWikipedia({ query: q }),
    gleif: (q: string) => lookupGleif({ companyName: q }),
    watchlist: (q: string) => lookupWatchlist({ query: q }),
  };

  const performLookup = async (type: LookupType, query: string): Promise<OsintResult> => {
    const handler = LOOKUP_HANDLERS[type];
    if (!handler) {
      throw new Error(`Unsupported lookup type: ${type}`);
    }
    const response = await handler(query);
    if (!response.success) {
      throw new Error(response.error || 'No results returned');
    }
    return response.data;
  };

  const optimizeQuery = async (query: string, activeType: LookupType) => {
    const response = await optimizeQueryAction({
      keyword: query.trim(),
      context: activeType === 'news' ? 'news' : 'osint',
      targetLanguages: ['en', 'ar'],
    });
    return response;
  };

  return { performLookup, optimizeQuery };
}
