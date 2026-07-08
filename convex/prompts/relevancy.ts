/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { SYSTEM_ROLE, TRUST_BOUNDARY, STRICT_JSON_OUTPUT_REQUIREMENTS, cleanAndTruncate } from "./common";

/**
 * Returns the media monitoring relevancy evaluation prompt.
 */
export function getRelevancyPrompt(title: string, snippet: string, keyword: string): string {
    const cleanedTitle = cleanAndTruncate(title, 150);
    const cleanedSnippet = cleanAndTruncate(snippet, 600);
    const cleanedKeyword = cleanAndTruncate(keyword, 100);

    return `${SYSTEM_ROLE}

---

${TRUST_BOUNDARY}

---

TITLE
<<<
${cleanedTitle}
>>>

SNIPPET
<<<
${cleanedSnippet}
>>>

Monitoring Keyword: "${cleanedKeyword}"

---

Relevancy Rules:
1. Evaluate how relevant the article is to the monitoring keyword.
2. Determine the matchType:
   - "Primary": The article is directly and substantially about the keyword. (relevancyScore >= 95)
   - "Secondary": The keyword is a key topic or mentioned in relation to the main topic. (relevancyScore: 85-94)
   - "Incidental": The keyword is mentioned only in passing or in a list of unrelated entities. (relevancyScore: 50-84)
   - "None": The keyword is completely irrelevant or not present. (relevancyScore: 0-49)
3. Check if the keyword is explicitly mentioned (keywordMentioned: true/false).
4. Provide a one-sentence logical reason explaining the relationship.
5. Provide a confidence score (0-100) representing your scoring certainty.

---

${STRICT_JSON_OUTPUT_REQUIREMENTS}

Expected JSON Schema structure:
{
  "relevancyScore": number (0-100),
  "matchType": "Primary" | "Secondary" | "Incidental" | "None",
  "keywordMentioned": boolean,
  "reason": "one sentence explanation",
  "confidence": number (0-100)
}`;
}
