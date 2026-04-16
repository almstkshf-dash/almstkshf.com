"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { resolveApiKey } from "./utils/keys";

/**
 * ═══════════════════════════════════════════════════════════════════
 * SEARCH OPTIMIZER ENGINE
 * Uses Gemini (BYOK or System) to expand, refine, and translate
 * search queries for maximum monitoring coverage.
 *
 * Fallback: Context-Aware Heuristic Engine (zero-cost, zero-AI)
 * ═══════════════════════════════════════════════════════════════════
 */

// ─── Stop Words (EN + AR) ─────────────────────────────────────────
const STOP_WORDS = new Set([
  "the", "a", "an", "in", "on", "at", "to", "for", "of", "and", "or",
  "is", "was", "are", "with", "by", "from", "as", "into", "about",
  "في", "من", "إلى", "على", "عن", "مع", "هو", "هي", "هم", "و",
]);

// ─── GCC / UAE / KSA Entity Bilingual Map ────────────────────────
const ENTITY_MAP: Record<string, string> = {
  ADNOC: 'ADNOC OR "Abu Dhabi National Oil Company" OR "أدنوك"',
  NEOM: 'NEOM OR "نيوم"',
  ARAMCO: 'Aramco OR "Saudi Aramco" OR "أرامكو"',
  ETIHAD: 'Etihad OR "Etihad Airways" OR "الاتحاد للطيران"',
  EMIRATES: 'Emirates OR "طيران الإمارات"',
  ADIB: 'ADIB OR "Abu Dhabi Islamic Bank" OR "مصرف أبوظبي الإسلامي"',
  ENOC: 'ENOC OR "Emirates National Oil Company" OR "شركة الإمارات الوطنية للنفط"',
  ETISALAT: 'Etisalat OR "e&" OR "اتصالات"',
  DEWA: 'DEWA OR "Dubai Electricity and Water Authority" OR "هيئة كهرباء ومياه دبي"',
  "MUBADALA": 'Mubadala OR "mubadala investment" OR "مبادلة"',
  "ADQ": 'ADQ OR "Abu Dhabi Developmental Holding" OR "أبوظبي للتنمية"',
  "STC": 'STC OR "Saudi Telecom Company" OR "الاتصالات السعودية"',
  "SABIC": 'SABIC OR "Saudi Basic Industries" OR "سابك"',
  "TALABAT": 'Talabat OR "طلبات"',
  "CAREEM": 'Careem OR "كريم"',
};

// ─── Context-Specific Threat Modifier Profiles ────────────────────
const CONTEXT_PROFILES = {
  darkweb: {
    modifiers: [
      "leak", "breach", "dump", "database", "credentials",
      "exploit", "onion", "darknet", "hacked", "stolen",
      "تسريب", "اختراق", "قاعدة بيانات", "بيانات مسربة",
    ],
    booleanClause: '(leak OR breach OR dump OR "darknet" OR exploit OR credentials OR "data dump" OR onion)',
    explanation: "Added Dark Web threat-intelligence modifiers: breach, dump, exploit, onion, darknet.",
  },
  osint: {
    modifiers: [
      "exposure", "dox", "pastebin", "github", "recon",
      "الكشف", "التعرض", "مصادر مفتوحة",
    ],
    booleanClause: '(pastebin OR github OR exposure OR dox OR recon OR "open source intelligence" OR منتدى)',
    explanation: "Added OSINT surface-web modifiers for exposure and recon tracking.",
  },
  news: {
    modifiers: [
      "report", "announcement", "press release", "statement", "coverage",
      "بيان", "تقرير", "مؤتمر صحفي", "تصريح",
    ],
    booleanClause: '(report OR announcement OR "press release" OR statement OR coverage OR تقرير OR بيان)',
    explanation: "Added news-specific synonyms for media coverage tracking.",
  },
} as const;

// ─── Robust JSON Parser (handles Gemini markdown wrappers) ─────────
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

// ─── Context-Aware Heuristic Optimizer (THE MISSING ALGORITHM) ────
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

  // 1. ── Stop Word Removal ──────────────────────────────────────────
  const words = optimized.split(/\s+/);
  const meaningful = words.filter(w => !STOP_WORDS.has(w.toLowerCase()));
  if (meaningful.length > 0 && meaningful.length < words.length) {
    optimized = meaningful.join(" ");
    explanation = "Removed stop words for cleaner signal.";
  }

  // 2. ── Acronym Exact-Match Wrapping ──────────────────────────────
  if (!optimized.includes(" ") && optimized.length > 2 && optimized === optimized.toUpperCase()) {
    optimized = `"${optimized}"`;
    explanation = "Wrapped acronym in quotes for exact match.";
  }

  // 3. ── GCC Entity Bilingual Expansion ────────────────────────────
  const upperKey = optimized.replace(/"/g, "").toUpperCase().trim();
  if (ENTITY_MAP[upperKey]) {
    optimized = ENTITY_MAP[upperKey];
    explanation = "Expanded to bilingual (EN/AR) form using known GCC entity mapping.";
  }

  // 4. ── Context-Aware Threat/Domain Modifier Injection ─────────────
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

  // 5. ── Multilingual Hint (Arabic transliteration for UAE/KSA market) ─
  if (langs.includes("ar") && !optimized.includes("OR") && optimized.length < 100) {
    // Only append Arabic hint if no Arabic characters already present
    const hasArabic = /[\u0600-\u06FF]/.test(optimized);
    if (!hasArabic && context !== "darkweb") {
      // For news/osint, add a broad Arabic OR clause only if query is simple
      explanation += " (Arabic search arm recommended — add AR translation manually for best results)";
    }
  }

  return { original, optimized, explanation, method: "heuristic" };
}

// ─── Main Exported Action ─────────────────────────────────────────
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
      console.warn("⚠️ No Gemini API key for SearchOptimizer. Using heuristic fallback.");
      return heuristicOptimize(args.keyword, langList, args.context);
    }

    const prompt = `You are an expert Media Monitoring Query Optimizer.
Your task is to take a raw keyword/phrase and transform it into a powerful Boolean Search Query.

Input Keyword: "${args.keyword}"
Context: ${args.context.toUpperCase()}
Target Languages: ${langList.join(", ")}

Rules:
1. Clean the query from noise, stop words, or irrelevant symbols.
2. If the user provides a name, expand it with common variations (e.g., "ADNOC" -> "ADNOC" OR "Abu Dhabi National Oil Company" OR "أدنوك").
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

        // Robust parsing — strips markdown code fences Gemini sometimes emits
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

    // All AI models failed — fall back to heuristic
    console.warn("SearchOptimizer: All Gemini models exhausted. Using heuristic engine.");
    return heuristicOptimize(args.keyword, langList, args.context);
  },
});
