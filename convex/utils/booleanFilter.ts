/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

export interface BooleanExpression {
  mandatory: string[];     // +word or "phrase" — ALL must match
  excluded: string[];      // -word — NONE must match
  soft: string[];          // plain words — no hard constraint
  orGroups: string[][];    // [["A", "B"], ["C", "D"]] → (A or B) AND (C or D)
  rawKeyword: string;      // the original keyword to use as API query term
}

// Common Arabic and English stopwords to ignore in plain soft matching to prevent false negatives
export const STOPWORDS = new Set([
  "من", "في", "مع", "على", "إلى", "الى", "عن", "ب", "ل", "و", "أو", "او", "ثم", "أن", "ان", "أنه", "انه", "هذا", "هذه", "ذلك", "كل", "قد", "لقد", "كان", "كانت", "هو", "هي", "هم", "لنحو",
  "the", "of", "and", "in", "to", "for", "with", "on", "at", "by", "an", "a", "is", "that", "it", "this"
]);

/**
 * Normalizes Arabic and English text to ensure robust matching across different forms of alefs,
 * Teh Marbutas, Alef Maksuras, diacritics, curly/straight quotes, and punctuation.
 */
export function normalizeArabicText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[\u064B-\u0652]/g, "") // Remove Arabic diacritics (harakat)
    .replace(/[أإآ]/g, "ا")          // Normalize Alefs to bare Alef
    .replace(/ة/g, "ه")              // Normalize Teh Marbuta to Heh
    .replace(/ى/g, "ي")              // Normalize Alef Maksura to Yeh
    .replace(/[\"“»«”″'’‘.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ") // Strip all straight/curly/Arabic quotes & punctuation
    .replace(/\s+/g, " ")            // Collapse multiple spaces
    .trim();
}

/**
 * Parses a user-provided keyword string into a BooleanExpression.
 * Supports straight, curly, and Arabic double quotes for phrase extraction.
 */
export function parseBooleanKeyword(keyword: string): BooleanExpression {
  const mandatory: string[] = [];
  const excluded: string[] = [];
  const soft: string[] = [];
  const orGroups: string[][] = [];

  // 1. Handle OR logic: Split by " OR " (case insensitive)
  const orParts = keyword.split(/\s+OR\s+/i);
  if (orParts.length > 1) {
    orGroups.push(
      orParts.map(p => 
        p.trim().replace(/^[\"“»«”″]|[\"“»«”″]$/g, "").toLowerCase()
      ).filter(Boolean)
    );
  }

  // 2. Tokenise supporting all standard, curly, and Arabic double quotes: "...", “...”, ”...”, «...», »...«
  const tokens: string[] = [];
  const quoteRegex = /[+\-]?([\"“»«”″])([^\"“»«”″]+)([\"“»«”″])/g;
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
      const value = stripped.slice(1).replace(/^[\"“»«”″]|[\"“»«”″]$/g, "").toLowerCase();
      if (value) mandatory.push(value);
    } else if (stripped.startsWith("-")) {
      const value = stripped.slice(1).replace(/^[\"“»«”″]|[\"“»«”″]$/g, "").toLowerCase();
      if (value) excluded.push(value);
    } else if (/^[\"“»«”″]/.test(stripped) && /[\"“»«”″]$/.test(stripped)) {
      const value = stripped.replace(/^[\"“»«”″]|[\"“»«”″]$/g, "").toLowerCase();
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
 * Uses Arabic normalization and ignores common stopwords in plain matching to prevent false negatives.
 */
export function matchesBooleanFilter(
  expr: BooleanExpression,
  title: string,
  snippet: string
): boolean {
  const normalizedHaystack = normalizeArabicText(`${title} ${snippet}`);

  const hasTerm = (term: string) => {
    const normTerm = normalizeArabicText(term);
    if (!normTerm) return true;
    return normalizedHaystack.includes(normTerm);
  };

  // 1. All mandatory terms must be present
  for (const term of expr.mandatory) {
    if (!hasTerm(term)) return false;
  }

  // 2. No excluded terms may be present
  for (const term of expr.excluded) {
    if (hasTerm(term)) return false;
  }

  // 3. All plain soft terms must also be present (skipping common stopwords)
  for (const term of expr.soft) {
    const norm = term.trim().toLowerCase();
    if (STOPWORDS.has(norm)) continue; // skip common stopwords to avoid false negatives
    if (!hasTerm(term)) return false;
  }

  // 4. At least one member of each OR group must be present
  for (const group of expr.orGroups) {
    if (!group.some(term => hasTerm(term))) {
      return false;
    }
  }

  return true;
}

/**
 * Extracts the clean query string to send to news APIs.
 * Implements Smart Query Shrinking to strip stopwords and limit search terms to ensure high accuracy.
 */
export function buildApiQuery(keyword: string): string {
  const expr = parseBooleanKeyword(keyword);
  
  // If there are OR groups, construct the query for engines that support OR
  if (expr.orGroups.length > 0) {
    return expr.orGroups.map(group => 
      group.map(t => t.includes(" ") ? `"${t}"` : t).join(" OR ")
    ).join(" ");
  }

  // Filter out common stopwords from soft terms to avoid search engine query pollution
  const filteredSoft = expr.soft.filter(t => !STOPWORDS.has(t.toLowerCase()));

  // Wrap phrases in double quotes, and keep single words
  const mandatoryTerms = expr.mandatory.map(t => `"${t}"`);
  const softTerms = filteredSoft.map(t => t.includes(" ") ? `"${t}"` : t);

  const allTerms = [...mandatoryTerms, ...softTerms];

  // Smart Query Shrinking: Limit to at most 6 core search terms to avoid search engine reject/overflow
  const coreTerms = allTerms.slice(0, 6);

  return coreTerms.join(" ") || keyword;
}

