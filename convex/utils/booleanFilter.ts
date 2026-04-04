/**
 * ═══════════════════════════════════════════════════════════════════
 * BOOLEAN FILTER ENGINE
 * Pure utility — no external dependencies, no Convex imports.
 *
 * Supports:
 *   +word       → mandatory term (article MUST contain it)
 *   -word       → excluded term (article MUST NOT contain it)
 *   "phrase"    → exact phrase match (mandatory)
 *   word        → soft term (ignored in strict gate — used for scoring)
 *
 * Usage:
 *   parseBooleanKeyword('ADNOC -gas +"press release"')
 *   matchesBooleanFilter(expression, "article title", "article snippet")
 * ═══════════════════════════════════════════════════════════════════
 */

export interface BooleanExpression {
  mandatory: string[];   // +word or "phrase" — ALL must match
  excluded: string[];    // -word — NONE must match
  soft: string[];        // plain words — no hard constraint
  rawKeyword: string;    // the original keyword to use as API query term
}

/**
 * Parses a user-provided keyword string into a BooleanExpression.
 *
 * Rules:
 *  - Tokens starting with + are mandatory (strip the +)
 *  - Tokens starting with - are excluded (strip the -)
 *  - Tokens wrapped in quotes are exact phrases (mandatory)
 *  - All other tokens are soft
 */
export function parseBooleanKeyword(keyword: string): BooleanExpression {
  const mandatory: string[] = [];
  const excluded: string[] = [];
  const soft: string[] = [];

  // Tokenise: first extract quoted phrases, then split remainder by spaces
  const tokens: string[] = [];
  const quoteRegex = /[+\-]?"[^"]+"/g;
  let remaining = keyword;
  let match: RegExpExecArray | null;

  while ((match = quoteRegex.exec(keyword)) !== null) {
    tokens.push(match[0]);
    remaining = remaining.replace(match[0], " ");
  }

  // Split remaining on whitespace
  remaining.split(/\s+/).forEach((t) => {
    if (t) tokens.push(t);
  });

  for (const token of tokens) {
    const stripped = token.trim();
    if (!stripped) continue;

    if (stripped.startsWith("+")) {
      const value = stripped.slice(1).replace(/^"|"$/g, "").toLowerCase();
      if (value) mandatory.push(value);
    } else if (stripped.startsWith("-")) {
      const value = stripped.slice(1).replace(/^"|"$/g, "").toLowerCase();
      if (value) excluded.push(value);
    } else if (stripped.startsWith('"') && stripped.endsWith('"')) {
      // Bare quoted phrase → mandatory
      const value = stripped.replace(/^"|"$/g, "").toLowerCase();
      if (value) mandatory.push(value);
    } else {
      soft.push(stripped.toLowerCase());
    }
  }

  // rawKeyword: the first soft or mandatory term (for API queries)
  const rawKeyword = [...mandatory, ...soft].find((t) => t.length > 0) ?? keyword;

  return { mandatory, excluded, soft, rawKeyword };
}

/**
 * Returns true if the article text passes the boolean filter gate.
 * @param expr      - Parsed BooleanExpression
 * @param title     - Article title
 * @param snippet   - Article snippet / description
 */
export function matchesBooleanFilter(
  expr: BooleanExpression,
  title: string,
  snippet: string
): boolean {
  const haystack = `${title} ${snippet}`.toLowerCase();

  // 1. All mandatory terms must be present
  for (const term of expr.mandatory) {
    if (!haystack.includes(term)) {
      return false;
    }
  }

  // 2. No excluded terms may be present
  for (const term of expr.excluded) {
    if (haystack.includes(term)) {
      return false;
    }
  }

  return true;
}

/**
 * Extracts the clean query string to send to news APIs —
 * strips boolean operators, keeps the core terms.
 */
export function buildApiQuery(keyword: string): string {
  const expr = parseBooleanKeyword(keyword);
  // Build: mandatory phrases + soft terms, quoted if multi-word
  const terms = [...expr.mandatory, ...expr.soft].map((t) =>
    t.includes(" ") ? `"${t}"` : t
  );
  return terms.join(" ") || keyword;
}
