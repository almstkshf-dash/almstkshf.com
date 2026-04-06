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
 *   A OR B      → either A or B must be present
 *
 * Usage:
 *   parseBooleanKeyword('ADNOC -gas +"press release"')
 *   matchesBooleanFilter(expression, "article title", "article snippet")
 * ═══════════════════════════════════════════════════════════════════
 */

export interface BooleanExpression {
  mandatory: string[];     // +word or "phrase" — ALL must match
  excluded: string[];      // -word — NONE must match
  soft: string[];          // plain words — no hard constraint
  orGroups: string[][];    // [["A", "B"], ["C", "D"]] → (A or B) AND (C or D)
  rawKeyword: string;      // the original keyword to use as API query term
}

/**
 * Parses a user-provided keyword string into a BooleanExpression.
 */
export function parseBooleanKeyword(keyword: string): BooleanExpression {
  const mandatory: string[] = [];
  const excluded: string[] = [];
  const soft: string[] = [];
  const orGroups: string[][] = [];

  // 1. Handle OR logic: Split by " OR " (case insensitive)
  const orParts = keyword.split(/\s+OR\s+/i);
  if (orParts.length > 1) {
    // If we have OR parts, treat them as a group where at least one must match
    orGroups.push(orParts.map(p => p.trim().replace(/^"|"$/g, "").toLowerCase()).filter(Boolean));
  }

  // 2. Tokenise (original logic + refinement)
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
    if (t && t.toUpperCase() !== 'OR') tokens.push(t);
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
      const value = stripped.replace(/^"|"$/g, "").toLowerCase();
      if (value) mandatory.push(value);
    } else {
      soft.push(stripped.toLowerCase());
    }
  }

  const rawKeyword = [...mandatory, ...soft].find((t) => t.length > 0) ?? keyword;
  return { mandatory, excluded, soft, orGroups, rawKeyword };
}

/**
 * Returns true if the article text passes the boolean filter gate.
 */
export function matchesBooleanFilter(
  expr: BooleanExpression,
  title: string,
  snippet: string
): boolean {
  const haystack = `${title} ${snippet}`.toLowerCase();

  // 1. All mandatory terms must be present
  for (const term of expr.mandatory) {
    if (!haystack.includes(term)) return false;
  }

  // 2. No excluded terms may be present
  for (const term of expr.excluded) {
    if (haystack.includes(term)) return false;
  }

  // 3. At least one member of each OR group must be present
  for (const group of expr.orGroups) {
    if (!group.some(term => haystack.includes(term))) {
      return false;
    }
  }

  return true;
}

/**
 * Extracts the clean query string to send to news APIs.
 */
export function buildApiQuery(keyword: string): string {
  const expr = parseBooleanKeyword(keyword);
  
  // If there are OR groups, construct the query for engines that support OR
  if (expr.orGroups.length > 0) {
    return expr.orGroups.map(group => 
      group.map(t => t.includes(" ") ? `"${t}"` : t).join(" OR ")
    ).join(" ");
  }

  const terms = [...expr.mandatory, ...expr.soft].map((t) =>
    t.includes(" ") ? `"${t}"` : t
  );
  return terms.join(" ") || keyword;
}

