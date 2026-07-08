/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { useMemo } from 'react';
import { Resource } from '../types';

interface FilterOptions {
  category: string;
  labelFilter: string;
  freeOnly: boolean;
  language: string;
  search: string;
}

export function useResourceFilter(resources: Resource[], options: FilterOptions) {
  const { category, labelFilter, freeOnly, language, search } = options;

  return useMemo(() => {
    let list = resources;

    if (category !== 'all') {
      list = list.filter((r) => r.categories.includes(category));
    }
    if (labelFilter !== 'all') {
      list = list.filter((r) => r.labels.includes(labelFilter));
    }
    if (freeOnly) {
      list = list.filter((r) => r.freeTier);
    }
    if (language !== 'all') {
      list = list.filter((r) => r.language === language || r.language === 'both');
    }

    if (search.trim()) {
      const queryWords = search.toLowerCase().trim().split(/\s+/);
      list = list.filter((r) => {
        const nameLower = r.name.toLowerCase();
        const descLower = r.description.toLowerCase();
        const catsLower = r.categories.map((c) => c.toLowerCase());

        return queryWords.every(
          (word) =>
            nameLower.includes(word) ||
            descLower.includes(word) ||
            catsLower.some((c) => c.includes(word))
        );
      });
    }

    return list;
  }, [resources, category, labelFilter, freeOnly, language, search]);
}
