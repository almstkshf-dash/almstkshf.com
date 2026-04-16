/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { resolveApiKey } from "./utils/keys";

/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * SEARCH OPTIMIZER ENGINE
 * Uses Gemini (BYOK or System) to expand, refine, and translate
 * search queries for maximum monitoring coverage.
 *
 * Fallback: Context-Aware Heuristic Engine (zero-cost, zero-AI)
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

// â”€â”€â”€ Stop Words (EN + AR) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STOP_WORDS = new Set([
  "the", "a", "an", "in", "on", "at", "to", "for", "of", "and", "or",
  "is", "was", "are", "with", "by", "from", "as", "into", "about",
  "ÙÙŠ", "Ù…Ù†", "Ø¥Ù„Ù‰", "Ø¹Ù„Ù‰", "Ø¹Ù†", "Ù…Ø¹", "Ù‡Ùˆ", "Ù‡ÙŠ", "Ù‡Ù…", "Ùˆ",
]);

// â”€â”€â”€ GCC / UAE / KSA Entity Bilingual Map â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ENTITY_MAP: Record<string, string> = {
  ADNOC: 'ADNOC OR "Abu Dhabi National Oil Company" OR "Ø£Ø¯Ù†ÙˆÙƒ"',
  NEOM: 'NEOM OR "Ù†ÙŠÙˆÙ…"',
  ARAMCO: 'Aramco OR "Saudi Aramco" OR "Ø£Ø±Ø§Ù…ÙƒÙˆ"',
  ETIHAD: 'Etihad OR "Etihad Airways" OR "Ø§Ù„Ø§ØªØ­Ø§Ø¯ Ù„Ù„Ø·ÙŠØ±Ø§Ù†"',
  EMIRATES: 'Emirates OR "Ø·ÙŠØ±Ø§Ù† Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª"',
  ADIB: 'ADIB OR "Abu Dhabi Islamic Bank" OR "Ù…ØµØ±Ù Ø£Ø¨ÙˆØ¸Ø¨ÙŠ Ø§Ù„Ø¥Ø³Ù„Ø§Ù…ÙŠ"',
  ENOC: 'ENOC OR "Emirates National Oil Company" OR "Ø´Ø±ÙƒØ© Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª Ø§Ù„ÙˆØ·Ù†ÙŠØ© Ù„Ù„Ù†ÙØ·"',
  ETISALAT: 'Etisalat OR "e&" OR "Ø§ØªØµØ§Ù„Ø§Øª"',
  DEWA: 'DEWA OR "Dubai Electricity and Water Authority" OR "Ù‡ÙŠØ¦Ø© ÙƒÙ‡Ø±Ø¨Ø§Ø¡ ÙˆÙ…ÙŠØ§Ù‡ Ø¯Ø¨ÙŠ"',
  "MUBADALA": 'Mubadala OR "mubadala investment" OR "Ù…Ø¨Ø§Ø¯Ù„Ø©"',
  "ADQ": 'ADQ OR "Abu Dhabi Developmental Holding" OR "Ø£Ø¨ÙˆØ¸Ø¨ÙŠ Ù„Ù„ØªÙ†Ù…ÙŠØ©"',
  "STC": 'STC OR "Saudi Telecom Company" OR "Ø§Ù„Ø§ØªØµØ§Ù„Ø§Øª Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©"',
  "SABIC": 'SABIC OR "Saudi Basic Industries" OR "Ø³Ø§Ø¨Ùƒ"',
  "TALABAT": 'Talabat OR "Ø·Ù„Ø¨Ø§Øª"',
  "CAREEM": 'Careem OR "ÙƒØ±ÙŠÙ…"',
};

// â”€â”€â”€ Context-Specific Threat Modifier Profiles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CONTEXT_PROFILES = {
  darkweb: {
    modifiers: [
      "leak", "breach", "dump", "database", "credentials",
      "exploit", "onion", "darknet", "hacked", "stolen",
      "ØªØ³Ø±ÙŠØ¨", "Ø§Ø®ØªØ±Ø§Ù‚", "Ù‚Ø§Ø¹Ø¯Ø© Ø¨ÙŠØ§Ù†Ø§Øª", "Ø¨ÙŠØ§Ù†Ø§Øª Ù…Ø³Ø±Ø¨Ø©",
    ],
    booleanClause: '(leak OR breach OR dump OR "darknet" OR exploit OR credentials OR "data dump" OR onion)',
    explanation: "Added Dark Web threat-intelligence modifiers: breach, dump, exploit, onion, darknet.",
  },
  osint: {
    modifiers: [
      "exposure", "dox", "pastebin", "github", "recon",
      "Ø§Ù„ÙƒØ´Ù", "Ø§Ù„ØªØ¹Ø±Ø¶", "Ù…ØµØ§Ø¯Ø± Ù…ÙØªÙˆØ­Ø©",
    ],
    booleanClause: '(pastebin OR github OR exposure OR dox OR recon OR "open source intelligence" OR Ù…Ù†ØªØ¯Ù‰)',
    explanation: "Added OSINT surface-web modifiers for exposure and recon tracking.",
  },
  news: {
    modifiers: [
      "report", "announcement", "press release", "statement", "coverage",
      "Ø¨ÙŠØ§Ù†", "ØªÙ‚Ø±ÙŠØ±", "Ù…Ø¤ØªÙ…Ø± ØµØ­ÙÙŠ", "ØªØµØ±ÙŠØ­",
    ],
    booleanClause: '(report OR announcement OR "press release" OR statement OR coverage OR ØªÙ‚Ø±ÙŠØ± OR Ø¨ÙŠØ§Ù†)',
    explanation: "Added news-specific synonyms for media coverage tracking.",
  },
} as const;

// â”€â”€â”€ Robust JSON Parser (handles Gemini markdown wrappers) â”€â”€â”€â”€â”€â”€â”€â”€â”€
function safeParseJson(raw: string): Record<string, unknown> | null {
  try {
    // Strip potential ```json ... ``` or ``` ... ``` markdown blocks
    const stripped = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();
    return JSON.parse(stripped);
  } catch {
    return null;
  }
}

// â”€â”€â”€ Context-Aware Heuristic Optimizer (THE MISSING ALGORITHM) â”€â”€â”€â”€
/**
 * Zero-cost fallback optimizer that implements context-aware Boolean
 * query construction when Gemini is unavailable.
 * Handles stop-word removal, entity expansion, and threat modifiers.
 */
function heuristicOptimize(
  keyword: string,
  langs: string[],
  context: "news" | "osint" | "darkweb"
): { original: string; optimized: string; explanation: string; method: "heuristic" } {
  const original = keyword;
  let optimized = keyword.trim();
  let explanation = "Applied keyword preservation (no AI key configured).";

  // 1. â”€â”€ Stop Word Removal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const words = optimized.split(/\s+/);
  const meaningful = words.filter(w => !STOP_WORDS.has(w.toLowerCase()));
  if (meaningful.length > 0 && meaningful.length < words.length) {
    optimized = meaningful.join(" ");
    explanation = "Removed stop words for cleaner signal.";
  }

  // 2. â”€â”€ Acronym Exact-Match Wrapping â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!optimized.includes(" ") && optimized.length > 2 && optimized === optimized.toUpperCase()) {
    optimized = `"${optimized}"`;
    explanation = "Wrapped acronym in quotes for exact match.";
  }

  // 3. â”€â”€ GCC Entity Bilingual Expansion â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const upperKey = optimized.replace(/"/g, "").toUpperCase().trim();
  if (ENTITY_MAP[upperKey]) {
    optimized = ENTITY_MAP[upperKey];
    explanation = "Expanded to bilingual (EN/AR) form using known GCC entity mapping.";
  }

  // 4. â”€â”€ Context-Aware Threat/Domain Modifier Injection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // This is the core missing algorithm: inject context-specific Boolean clauses
  // to amplify signal in the right intelligence domain.
  const profile = CONTEXT_PROFILES[context];
  if (profile && !optimized.includes(" AND ") && !optimized.includes(" OR ")) {
    optimized = `${optimized} AND ${profile.booleanClause}`;
    explanation = profile.explanation;
  } else if (profile && !optimized.toLowerCase().includes("leak") && !optimized.toLowerCase().includes("breach")) {
    // Even for already-complex queries in darkweb context, append critical modifiers
    if (context === "darkweb") {
      optimized = `(${optimized}) AND (leak OR breach OR dump)`;
      explanation = "Reinforced query with Dark Web breach signals.";
    }
  }

  // 5. â”€â”€ Multilingual Hint (Arabic transliteration for UAE/KSA market) â”€
  if (langs.includes("ar") && !optimized.includes("OR") && optimized.length < 100) {
    // Only append Arabic hint if no Arabic characters already present
    const hasArabic = /[\u0600-\u06FF]/.test(optimized);
    if (!hasArabic && context !== "darkweb") {
      // For news/osint, add a broad Arabic OR clause only if query is simple
      explanation += " (Arabic search arm recommended â€” add AR translation manually for best results)";
    }
  }

  return { original, optimized, explanation, method: "heuristic" };
}

// â”€â”€â”€ Main Exported Action â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const optimizeQuery = action({
  args: {
    keyword: v.string(),
    context: v.union(v.literal("news"), v.literal("osint"), v.literal("darkweb")),
    targetLanguages: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const apiKey = await resolveApiKey(ctx, "GEMINI_API_KEY", "gemini");
    const langList = args.targetLanguages || ["en", "ar"];

    if (!apiKey) {
      console.warn("âš ï¸ No Gemini API key for SearchOptimizer. Using heuristic fallback.");
      return heuristicOptimize(args.keyword, langList, args.context);
    }

    const prompt = `You are an expert Media Monitoring Query Optimizer.
Your task is to take a raw keyword/phrase and transform it into a powerful Boolean Search Query.

Input Keyword: "${args.keyword}"
Context: ${args.context.toUpperCase()}
Target Languages: ${langList.join(", ")}

Rules:
1. Clean the query from noise, stop words, or irrelevant symbols.
2. If the user provides a name, expand it with common variations (e.g., "ADNOC" -> "ADNOC" OR "Abu Dhabi National Oil Company" OR "Ø£Ø¯Ù†ÙˆÙƒ").
3. Translate the keyword into all target languages provided.
4. If the context is DARKWEB or OSINT: Add relevant threat-intelligence modifiers (e.g., "leak", "breach", "dump", "database", "credentials", "exploit").
5. If the context is NEWS: Add industry-specific synonyms and press coverage terms.
6. Return a query string that uses standard Boolean operators: AND, OR, MUST (+), MUST NOT (-), and "quotes" for phrases.
7. MAX LENGTH: 250 characters.

Return valid JSON ONLY with these exact fields:
{
  "optimizedQuery": "string",
  "explanation": "one short sentence explaining what was added"
}`;

    // Correct Gemini model names (3.x series does NOT exist in the API)
    const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (!response.ok) {
          console.warn(`SearchOptimizer: ${model} returned ${response.status}, trying next...`);
          continue;
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) continue;

        // Robust parsing â€” strips markdown code fences Gemini sometimes emits
        const parsed = safeParseJson(rawText);
        if (!parsed || typeof parsed.optimizedQuery !== "string") {
          console.warn(`SearchOptimizer: ${model} returned unparseable JSON, trying next...`);
          continue;
        }

        return {
          original: args.keyword,
          optimized: parsed.optimizedQuery as string,
          explanation: (parsed.explanation as string) || "AI-optimized query.",
          method: "ai" as const,
        };
      } catch (e) {
        console.error(`SearchOptimizer: ${model} threw`, e);
        continue;
      }
    }

    // All AI models failed â€” fall back to heuristic
    console.warn("SearchOptimizer: All Gemini models exhausted. Using heuristic engine.");
    return heuristicOptimize(args.keyword, langList, args.context);
  },
});
