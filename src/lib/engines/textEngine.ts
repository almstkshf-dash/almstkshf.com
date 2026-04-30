/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

// ─── Interfaces ────────────────────────────────────────────────────────────

/** Per-sentence breakdown result */
export interface SentenceResult {
  text: string;
  score: number;        // 0–100, higher = more AI-like
  label: "Human" | "Mixed" | "AI";
  signals: string[];
  startIndex: number;   // character offset in original text
  endIndex: number;
}

/** Highlighted range for UI rendering */
export interface HighlightedRange {
  start: number;
  end: number;
  type: "marker" | "opener" | "closer" | "hedge" | "human" | "transition";
}

/** Named signal entry for the signals panel */
export interface SignalEntry {
  id: string;
  label: string;       // For legacy or non-localized export
  description: string; // For legacy or non-localized export
  labelKey: string;    // i18n key (prefix AiInspector.text.)
  descKey: string;     // i18n key (prefix AiInspector.text.)
  severity: "low" | "medium" | "high";
  count?: number;
}

/** Full analysis result — unified interface */
export interface TextAnalysisResult {
  // ── Top-level (backward-compatible) ──
  score: number;                          // 0 (Human) → 100 (AI)
  signals: SignalEntry[];                 // Named signal entries for UI
  highlightedRanges: HighlightedRange[];  // Character-offset ranges for highlighting

  // ── Extended forensic breakdown ──
  verdict: "Fully Human" | "Mostly Human" | "Mixed" | "Mostly AI" | "Fully AI";
  verdictKey: string;                    // i18n key
  sentences: SentenceResult[];           // Per-sentence scores
  signalBreakdown: Record<string, number>; // Aggregated signal → count map
  wordCount: number;
  avgSentenceLength: number;             // words
  burstinessScore: number;               // 0–100; low = AI-like
  contractionRatio: number;             // as % (e.g. 1.5 = 1.5%)
  listDensity: number;                  // 0–100 (% of sentences with list structure)
  passiveVoiceRatio: number;            // 0–100 (% of sentences with passive voice)
  vocabularyRichness: number;           // Type-Token Ratio × 100
  isArabicDominant: boolean;
}

// ─── Signal dictionaries ───────────────────────────────────────────────────

/** AI opener phrases — how LLMs always start responses */
const AI_OPENERS: RegExp[] = [
  /^certainly[,!]?/i,
  /^absolutely[,!]?/i,
  /^great question[,!]?/i,
  /^of course[,!]?/i,
  /^sure[,!]?/i,
  /^indeed[,!]?/i,
  /^i'd be (happy|glad|delighted) to/i,
  /^i'd love to/i,
  /^as an ai\b/i,
  /^as a language model\b/i,
  /^in today's (world|landscape|digital age|fast.paced|rapidly)/i,
  /^in the (modern|current|contemporary|ever-changing|digital)/i,
  /^welcome to/i,
  /^thank you for (asking|your question|reaching out)/i,
  /^that('s| is) (a great|an excellent|an interesting|a fascinating)/i,
  /^what (a great|an excellent|an interesting)/i,
  /^i('m| am) (excited|thrilled|pleased) to/i,
  /^let me (help|explain|break|walk|guide)/i,
  /^allow me to (explain|walk|guide|help)/i,
  /^i understand (that|your|the|how)/i,
  /^i appreciate (your|the|that)/i,
  // New Openers (Expansion to 55+)
  /^precisely[,!]?/i,
  /^naturally[,!]?/i,
  /^understood[,!]?/i,
  /^you're absolutely right[,!]?/i,
  /^correct[,!]?/i,
  /^spot on[,!]?/i,
  /^agreed[,!]?/i,
  /^excellent question[,!]?/i,
  /^what an interesting perspective[,!]?/i,
  /^you've raised a valid point[,!]?/i,
  /^that is (a |)profound question[,!]?/i,
  /^intriguing question[,!]?/i,
  /^let me walk you through[,!]?/i,
  /^i'll walk you through[,!]?/i,
  /^let me guide you[,!]?/i,
  /^allow me to explain[,!]?/i,
  /^i can certainly assist[,!]?/i,
  /^i would be pleased to[,!]?/i,
  /^in recent years[,!]?/i,
  /^in an era of[,!]?/i,
  /^we live in a world[,!]?/i,
  /^as technology continues to (evolve|advance)/i,
  /^in the rapidly changing landscape/i,
  /^in this day and age/i,
  /^throughout history/i,
  /^in a globalized world/i,
  /^when it comes to/i,
  /^understanding this/i,
  /^the concept of/i,
  /^to understand the/i,
  /^let's look at/i,
  /^taking a closer look/i,
  /^let's (explore|dive|examine)/i,
  /^it is (important|essential|crucial) to note/i,
  /^to get started/i,
  /^to begin with/i,
  // Arabic openers
  /^بالتأكيد[،!]?/,
  /^بكل سرور[،!]?/,
  /^شكراً (لك|على|لسؤالك)/,
  /^يسعدني/,
  /^بناءً على/,
  /^في عالم (اليوم|الحديث)/,
];

/** AI transition words — used to chain ideas artificially */
const AI_TRANSITIONS: RegExp[] = [
  /\bfurthermore\b/i,
  /\bmoreover\b/i,
  /\badditionally\b/i,
  /\bin conclusion\b/i,
  /\bto summarize\b/i,
  /\bin summary\b/i,
  /\bit is worth noting\b/i,
  /\bit is important to note\b/i,
  /\bit('s| is) worth mentioning\b/i,
  /\bnotably\b/i,
  /\bin essence\b/i,
  /\bin other words\b/i,
  /\bto elaborate\b/i,
  /\bconsequently\b/i,
  /\bsubsequently\b/i,
  /\bin addition to (this|that)\b/i,
  /\bon the other hand\b/i,
  /\bit('s| is) also worth\b/i,
  /\blast but not least\b/i,
  /\bto (wrap up|round off|cap it all)\b/i,
  /\bnot only .{1,40} but also\b/i,
  /\bby the same token\b/i,
  /\bwith that (said|in mind)\b/i,
  /\bto that end\b/i,
  /\bbuilding on (this|that)\b/i,
  // New Transitions (Expansion to 55+)
  /\bto sum up\b/i,
  /\ball in all\b/i,
  /\btaken together\b/i,
  /\bon balance\b/i,
  /\bin a nutshell\b/i,
  /\bbriefly\b/i,
  /\bto recap\b/i,
  /\bultimately\b/i,
  /\bat the end of the day\b/i,
  /\bit bears mentioning\b/i,
  /\bit should be noted\b/i,
  /\bit can be mentioned\b/i,
  /\bimportantly\b/i,
  /\bcrucially\b/i,
  /\bsignificantly\b/i,
  /\bof particular importance\b/i,
  /\bit is vital to recognize\b/i,
  /\bput simply\b/i,
  /\bto frame this\b/i,
  /\bto clarify further\b/i,
  /\bin a different light\b/i,
  /\bmore specifically\b/i,
  /\bto put it another way\b/i,
  /\bthat said\b/i,
  /\bnevertheless\b/i,
  /\balbeit\b/i,
  /\bwhile this may be true\b/i,
  /\bdespite this\b/i,
  /\bnotwithstanding\b/i,
  /\bbe that as it may\b/i,
  /\btherefore\b/i,
  /\bthus\b/i,
  /\bhence\b/i,
  /\bas a result\b/i,
  /\bby extension\b/i,
  /\bin light of this\b/i,
  /\baccordingly\b/i,
  /\bfor this reason\b/i,
  /\bgiven these facts\b/i,
  /\bto put it frankly\b/i,
  /\bas mentioned earlier\b/i,
  // Arabic transitions
  /\bعلاوة على ذلك\b/,
  /\bبالإضافة إلى ذلك\b/,
  /\bفي الختام\b/,
  /\bوخلاصة القول\b/,
  /\bومن الجدير بالذكر\b/,
  /\bفضلاً عن ذلك\b/,
];

/** AI hedges, buzzwords, corporate-speak — assistant-voice vocabulary */
const AI_HEDGES: RegExp[] = [
  /\bit('s| is) important to\b/i,
  /\bit('s| is) crucial to\b/i,
  /\bit('s| is) essential to\b/i,
  /\bit('s| is) vital to\b/i,
  /\bone (should|must|needs to|ought to)\b/i,
  /\bwe (should|must|need to|ought to)\b/i,
  /\ballow me to\b/i,
  /\bi (can|will) help you\b/i,
  /\blet('s| us) (explore|dive|delve|examine|discuss|look at)\b/i,
  /\bdelve into\b/i,
  /\bunpack\b/i,
  /\bleverage\b/i,
  /\boptimize\b/i,
  /\bsynergize?\b/i,
  /\bseamlessly\b/i,
  /\btailored to\b/i,
  /\bcomprehensive(ly)?\b/i,
  /\brobust\b/i,
  /\bholistic(ally)?\b/i,
  /\bparadigm\b/i,
  /\bproactive(ly)?\b/i,
  /\bactionable\b/i,
  /\bgranular\b/i,
  /\bscalable\b/i,
  /\bstreamline\b/i,
  /\bempowers?\b/i,
  /\bfoster(ing)?\b/i,
  /\bcurated?\b/i,
  /\bpivot(al)?\b/i,
  /\bechoes?\b/i,
  /\btransform(ative)?\b/i,
  /\binvaluable\b/i,
  /\bunderscores?\b/i,
  /\bnavigat(e|ing)\b/i,
  /\blandscape\b/i,
  /\becosystem\b/i,
  /\bstate-of-the-art\b/i,
  /\bcutting-edge\b/i,
  /\bgroundbreaking\b/i,
  /\bpioneer(ing)?\b/i,
  /\bsophisticated\b/i,
  /\bnuanced\b/i,
  /\bintricate(ly)?\b/i,
  /\bmeticulously\b/i,
  /\bpainstakingly\b/i,
  /\bdynamic(ally)?\b/i,
  /\binnovative(ly)?\b/i,
  /\btransparency\b/i,
  /\baccountability\b/i,
  /\bstakeholder\b/i,
  /\bsynergy\b/i,
  /\bvalue proposition\b/i,
  /\bkey takeaway\b/i,
  /\bearmark\b/i,
  /\bdeep.?dive\b/i,
  // New Buzzwords (Expansion to 65+)
  /\bsustainable\b/i,
  /\bbest practices\b/i,
  /\bgame-changer\b/i,
  /\bforward-thinking\b/i,
  /\bmission-critical\b/i,
  /\bcore competency\b/i,
  /\bimpactful\b/i,
  /\bmeaningful\b/i,
  /\bdriving change\b/i,
  /\bmoving forward\b/i,
  /\bmoving the needle\b/i,
  /\bcatalytic\b/i,
  /\bvalue-driven\b/i,
  /\bmyriad of\b/i,
  /\ba plethora of\b/i,
  /\bplays a crucial role\b/i,
  /\bserves as a cornerstone\b/i,
  /\bserves as a testament\b/i,
  /\bparamount\b/i,
  /\bat its core\b/i,
  /\bsuffice it to say\b/i,
  /\bit goes without saying\b/i,
  /\bneedless to say\b/i,
  /\bwithout further ado\b/i,
  /\ba multifaceted issue\b/i,
  /\ba complex tapestry\b/i,
  /\bfostering a sense of\b/i,
  /\bshaping the future\b/i,
  // Arabic hedges
  /\bمن الأهمية بمكان\b/,
  /\bتجدر الإشارة\b/,
  /\bمن المهم أن\b/,
  /\bينبغي التنويه\b/,
];

/** AI closers — how LLMs always wrap up a response */
const AI_CLOSERS: RegExp[] = [
  /\bi hope (this|that) (helps|clarifies|answers)/i,
  /\bfeel free to (ask|reach out|contact)/i,
  /\bdon't hesitate to\b/i,
  /\bif you have any (questions|concerns|follow.up)/i,
  /\bplease let me know\b/i,
  /\bI('m| am) here to help\b/i,
  /\bshould you need (anything|further|more)/i,
  /\bhappy to (help|assist|clarify|elaborate)\b/i,
  /\bwishing you (all the best|success|luck)\b/i,
  /\bi('m| am) always (here|available|ready)\b/i,
  /\bdo not hesitate to\b/i,
  /\bi look forward to (hearing|helping|assisting)/i,
  /\byour (feedback|thoughts|questions) are welcome/i,
  /\bwe hope this (article|guide|post|overview) (has been|was)/i,
  // Arabic closers
  /\bلا تتردد في\b/,
  /\bإذا كان لديك أي استفسار\b/,
  /\bنحن هنا للمساعدة\b/,
  /\bيسعدنا تقديم المساعدة\b/,
];

/** Over-explanation markers   AI explains things nobody asked for */
const AI_OVER_EXPLAIN: RegExp[] = [
  /\bto put it (simply|another way|differently)\b/i,
  /\bin layman'?s terms\b/i,
  /\bto break (it|this|that) down\b/i,
  /\bwhat this means is\b/i,
  /\bwhat (this|that) entails\b/i,
  /\bessentially what (this|that) means\b/i,
  /\bthink of it (as|like)\b/i,
  /\ban analogy (would be|here is)\b/i,
  /\bto give you (an example|some context|a sense)\b/i,
  /\bin (practical|real.world) terms\b/i,
  /\bsimply put\b/i,
  /\bto be (more |)precise\b/i,
  /\bto clarify\b/i,
  /\bin other words\b/i,
  // New Over-explanation (Expansion to 40+)
  /\bsimply stated\b/i,
  /\bplainly put\b/i,
  /\bin plain english\b/i,
  /\bfor the sake of clarity\b/i,
  /\bto put it mildly\b/i,
  /\bfor ease of understanding\b/i,
  /\bbreaking it down\b/i,
  /\blet's break this down\b/i,
  /\bbroken down into\b/i,
  /\bif we analyze the components\b/i,
  /\bto dissect this\b/i,
  /\bthe takeaway here\b/i,
  /\bthe upshot\b/i,
  /\bwhat you need to understand\b/i,
  /\bthe bottom line is\b/i,
  /\bthe key point to remember\b/i,
  /\bmuch like\b/i,
  /\bjust like a\b/i,
  /\bsimilar to how\b/i,
  /\bcomparable to\b/i,
  /\banalogous to\b/i,
  /\bconsider the following\b/i,
  /\bimagine a\b/i,
  /\bpicture this\b/i,
  /\blet's examine\b/i,
  /\bto illustrate this\b/i,
  /\ba good way to think about this\b/i,
  /\bto better understand\b/i,
];

/** Contraction patterns — AI avoids these in formal mode */
const CONTRACTIONS: RegExp[] = [
  /\b(don't|doesn't|didn't|won't|wouldn't|can't|couldn't|shouldn't|isn't|aren't|wasn't|weren't)\b/i,
  /\b(I'm|I've|I'll|I'd|you're|you've|you'll|you'd|he's|she's|it's|we're|we've|they're|they've)\b/i,
  /\b(that's|there's|here's|what's|who's|how's|let's|that'll|that'd)\b/i,
  /\b(could've|should've|would've|might've|must've)\b/i,
  /\b(y'all|y'all've|ain't|gonna|wanna|gotta)\b/i,
];

/** Human signals — casual language AI almost never uses */
const HUMAN_SIGNALS: RegExp[] = [
  /\b(lol|lmao|omg|wtf|tbh|imo|imho|ngl|idk|rn|afaik|fwiw|smh|brb|gtg|irl|btw|fyi)\b/i,
  /\b(gonna|wanna|gotta|kinda|sorta|dunno|lemme|gimme|ain't|y'all)\b/i,
  /\b(dude|bro|man,|mate,|ugh|meh|yikes|whoa)\b/i,
  /\.{2,}/,         // hesitation ellipsis
  /[!]{2,}/,        // raw excitement
  /[?]{2,}/,        // confused/frustrated
  /\b(honestly|literally|basically|actually like|i mean,?|you know,?)\b/i,
  /\b(damn|hell|crap|shit|fuck|bloody|freaking|frickin|freakin)\b/i,
  /—\s*\w/,         // em dash mid-thought
  /\banyway[,s]?\b/i,
  /\bso yeah\b/i,
  /\bright\?\s/i,   // checking in mid-text
  /\bsort of\b/i,
  /\bkind of\b/i,
  /\bi (think|feel|guess|suppose|reckon)\b/i,
  /\bmaybe (it'?s|that'?s|i should)\b/i,
  /\bnot (gonna|going to) lie\b/i,
  // Arabic informal
  /\bمش عارف\b/,
  /\bوالله\b/,
  /\bاللي فات مات\b/,
  /\bيعني\b/,
];

/** List-heavy writing patterns — AI loves structured lists even in prose */
const LIST_MARKERS: RegExp[] = [
  /^\s*[-•*]\s+/m,
  /^\s*\d+[.)]\s+/m,
  /\b(first|second|third|fourth|fifth),?\s+(you|we|it|the)\b/i,
  /\b(one|two|three|four|five) (key|main|important|crucial|major) (point|reason|factor|aspect|element|way)\b/i,
  /\bfirstly[,:]?\s/i,
  /\bsecondly[,:]?\s/i,
  /\bthirdly[,:]?\s/i,
  /\ba\)\s|b\)\s|c\)\s/i,
  // Arabic list markers
  /^\s*أولاً[،:]/m,
  /^\s*ثانياً[،:]/m,
  /^\s*ثالثاً[،:]/m,
];

/** Passive voice patterns — AI overuses passive constructions */
const PASSIVE_VOICE: RegExp[] = [
  /\b(is|are|was|were|be|been|being)\s+([\w]+ed|[\w]+en)\b/i,
  /\bhas been ([\w]+ed|[\w]+en)\b/i,
  /\bhave been ([\w]+ed|[\w]+en)\b/i,
  /\bhad been ([\w]+ed|[\w]+en)\b/i,
  /\bwill be ([\w]+ed|[\w]+en)\b/i,
  /\bcan be ([\w]+ed|[\w]+en)\b/i,
  /\bshould be ([\w]+ed|[\w]+en)\b/i,
  /\bmust be ([\w]+ed|[\w]+en)\b/i,
  // False-positive filter: common non-passive "is known", "is needed"
];

/** AI structural patterns — formulaic paragraph openers */
const AI_STRUCTURAL: RegExp[] = [
  /^(When it comes to|In terms of|With regard to|Regarding|As for)\b/i,
  /^(One of the (most|key|main|primary|important))\b/i,
  /^(The (concept|idea|notion|practice|importance) of)\b/i,
  /^(There (is|are) (a number|several|many|various|numerous))\b/i,
  /\b(plays? a (crucial|vital|key|significant|major|important|pivotal) role)\b/i,
  /\b(a (wide|broad|diverse|comprehensive) (range|array|variety|spectrum) of)\b/i,
  /\b(it is (clear|evident|apparent|obvious) that)\b/i,
  /\b(has (proven|proved) to be)\b/i,
  /\b(cannot be (overstated|understated))\b/i,
  /\b(in (recent|today's|modern) (years|times|era|world))\b/i,
];

// ─── Utility: detect if text is predominantly Arabic ─────────────────────â”€

function detectArabicDominance(text: string): boolean {
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const totalChars = text.replace(/\s/g, '').length;
  return totalChars > 0 && arabicChars / totalChars > 0.4;
}

// ─── Sentence splitter (English + Arabic aware) ───────────────────────────

function splitSentences(text: string): Array<{ text: string; startIndex: number }> {
  const results: Array<{ text: string; startIndex: number }> = [];
  // Split on sentence-ending punctuation including Arabic periods (؟ !)
  const sentenceRe = /[^.!?؟\n]+[.!?؟\n]*/g;
  let match: RegExpExecArray | null;
  while ((match = sentenceRe.exec(text)) !== null) {
    const trimmed = match[0].trim();
    if (trimmed.length > 10) {
      results.push({ text: trimmed, startIndex: match.index });
    }
  }
  return results;
}

// ─── Burstiness: human writing has high variance in sentence lengths ──────â”€

function calcBurstiness(lengths: number[]): number {
  if (lengths.length < 2) return 50; // neutral
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length;
  const std = Math.sqrt(variance);
  return Math.min(100, Math.round((std / Math.max(mean, 1)) * 100));
}

// ─── Contraction ratio ───────────────────────────────────────────────────â”€

function calcContractionRatio(text: string, wordCount: number): number {
  let hits = 0;
  for (const pattern of CONTRACTIONS) {
    const matches = text.match(new RegExp(pattern.source, 'gi'));
    if (matches) hits += matches.length;
  }
  return wordCount > 0 ? hits / wordCount : 0;
}

// ─── List density ────────────────────────────────────────────────────────

function calcListDensity(sentences: string[]): number {
  let listSentences = 0;
  for (const s of sentences) {
    for (const p of LIST_MARKERS) {
      if (p.test(s)) { listSentences++; break; }
    }
  }
  return sentences.length > 0 ? Math.round((listSentences / sentences.length) * 100) : 0;
}

// ─── Passive voice density ────────────────────────────────────────────────

function calcPassiveVoiceRatio(sentences: string[]): number {
  let passiveSentences = 0;
  for (const s of sentences) {
    for (const p of PASSIVE_VOICE) {
      if (p.test(s)) { passiveSentences++; break; }
    }
  }
  return sentences.length > 0 ? Math.round((passiveSentences / sentences.length) * 100) : 0;
}

// ─── Vocabulary richness (TTR) ────────────────────────────────────────────

function calcVocabularyRichness(text: string): number {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  if (words.length === 0) return 0;
  const unique = new Set(words);
  return Math.round((unique.size / words.length) * 100);
}

// ─── Per-sentence scorer ──────────────────────────────────────────────────

function scoreSentence(
  sentence: string,
  startIndex: number,
  index: number,
  total: number,
  isArabic: boolean
): SentenceResult {
  let score = 0;
  const signals: string[] = [];
  const words = sentence.split(/\s+/).length;

  // 1. AI openers — first sentence weighted higher
  for (const pattern of AI_OPENERS) {
    if (pattern.test(sentence)) {
      score += index === 0 ? 38 : 24;
      signals.push("AI opener phrase");
      break;
    }
  }

  // 2. AI transitions — cumulative
  let transitionHits = 0;
  for (const pattern of AI_TRANSITIONS) {
    if (pattern.test(sentence)) transitionHits++;
  }
  if (transitionHits > 0) {
    score += transitionHits * 16;
    signals.push(`AI transition word (×${transitionHits})`);
  }

  // 3. AI hedges / buzzwords — cumulative
  let hedgeHits = 0;
  for (const pattern of AI_HEDGES) {
    if (pattern.test(sentence)) hedgeHits++;
  }
  if (hedgeHits > 0) {
    score += hedgeHits * 12;
    signals.push(`AI buzzword/hedge (×${hedgeHits})`);
  }

  // 4. Over-explanation patterns
  let overExplainHits = 0;
  for (const pattern of AI_OVER_EXPLAIN) {
    if (pattern.test(sentence)) overExplainHits++;
  }
  if (overExplainHits > 0) {
    score += overExplainHits * 14;
    signals.push("AI over-explanation pattern");
  }

  // 5. AI closers — last 2 sentences only
  if (index >= total - 2) {
    for (const pattern of AI_CLOSERS) {
      if (pattern.test(sentence)) {
        score += 40;
        signals.push("AI closing phrase");
        break;
      }
    }
  }

  // 6. Structural patterns
  let structHits = 0;
  for (const pattern of AI_STRUCTURAL) {
    if (pattern.test(sentence)) structHits++;
  }
  if (structHits > 0) {
    score += structHits * 10;
    signals.push(`Formulaic sentence structure (×${structHits})`);
  }

  // 7. List-marker in sentence
  for (const pattern of LIST_MARKERS) {
    if (pattern.test(sentence)) {
      score += 10;
      signals.push("List-style structure");
      break;
    }
  }

  // 8. Passive voice
  for (const pattern of PASSIVE_VOICE) {
    if (pattern.test(sentence)) {
      score += 8;
      signals.push("Passive voice construction");
      break;
    }
  }

  // 9. No contractions in a long English sentence
  if (!isArabic) {
    let hasContraction = false;
    for (const pattern of CONTRACTIONS) {
      if (pattern.test(sentence)) { hasContraction = true; break; }
    }
    if (words > 12 && !hasContraction) {
      score += 10;
      signals.push("No contractions (formal AI style)");
    }
  }

  // 10. Human signals — reduce score
  let humanHits = 0;
  for (const pattern of HUMAN_SIGNALS) {
    if (pattern.test(sentence)) humanHits++;
  }
  if (humanHits > 0) {
    score -= humanHits * 22;
    signals.push(`Human signal detected (×${humanHits})`);
  }

  // 11. AI sweet-spot sentence length (15–28 words, ends with period)
  if (words >= 15 && words <= 28 && /[.؟]$/.test(sentence)) {
    score += 7;
    signals.push("Uniform sentence length (AI sweet spot)");
  }

  // 12. Very long sentence with no natural pause
  if (words > 35 && !/[,\-–—();،]/.test(sentence)) {
    score += 10;
    signals.push("Run-on without natural pause");
  }

  // 13. Short choppy sentences in a row (structural AI formatting trick)
  if (words < 6 && /^(Note|Warning|Tip|Reminder|Key point|Important)/i.test(sentence)) {
    score += 12;
    signals.push("AI callout/label heading");
  }

  // Clamp to [0, 100]
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    text: sentence,
    score: clampedScore,
    label: clampedScore >= 60 ? "AI" : clampedScore >= 30 ? "Mixed" : "Human",
    signals: signals.length ? signals : ["No strong signals"],
    startIndex,
    endIndex: startIndex + sentence.length,
  };
}

// ─── Highlight builder ───────────────────────────────────────────────────â”€

function buildHighlightedRanges(text: string): HighlightedRange[] {
  const ranges: HighlightedRange[] = [];

  function scanPatterns(
    patterns: RegExp[],
    type: HighlightedRange["type"]
  ): void {
    for (const pattern of patterns) {
      const re = new RegExp(pattern.source, (pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'));
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        ranges.push({ start: m.index, end: m.index + m[0].length, type });
      }
    }
  }

  scanPatterns(AI_OPENERS, "opener");
  scanPatterns(AI_TRANSITIONS, "transition");
  scanPatterns(AI_HEDGES, "hedge");
  scanPatterns(AI_CLOSERS, "closer");
  scanPatterns(HUMAN_SIGNALS, "human");

  // Deduplicate overlapping ranges (keep first)
  ranges.sort((a, b) => a.start - b.start);
  const deduped: HighlightedRange[] = [];
  let lastEnd = -1;
  for (const r of ranges) {
    if (r.start >= lastEnd) {
      deduped.push(r);
      lastEnd = r.end;
    }
  }
  return deduped;
}

// ─── Named signal entries builder ─────────────────────────────────────────

function buildSignalEntries(
  signalBreakdown: Record<string, number>
): SignalEntry[] {
  const META: Record<string, { id: string; label: string; description: string; labelKey: string; descKey: string; severity: "low" | "medium" | "high" }> = {
    "AI opener phrase": {
      id: "ai_opener",
      label: "AI Opener Phrase",
      description: "Response starts with typical LLM affirmation or greeting.",
      labelKey: "signal_ai_opener_label",
      descKey: "signal_ai_opener_desc",
      severity: "high"
    },
    "AI transition word": {
      id: "ai_transition",
      label: "AI Transition Word",
      description: "Formal connective words strongly correlated with LLM output.",
      labelKey: "signal_ai_transition_label",
      descKey: "signal_ai_transition_desc",
      severity: "medium"
    },
    "AI buzzword/hedge": {
      id: "ai_hedge",
      label: "AI Buzzword / Hedge",
      description: "Corporate or assistant-voice vocabulary typical of AI generation.",
      labelKey: "signal_ai_hedge_label",
      descKey: "signal_ai_hedge_desc",
      severity: "medium"
    },
    "AI over-explanation pattern": {
      id: "ai_overexplain",
      label: "Over-Explanation",
      description: "Unnecessary clarification added as filler, a key LLM behavior.",
      labelKey: "signal_ai_overexplain_label",
      descKey: "signal_ai_overexplain_desc",
      severity: "medium"
    },
    "AI closing phrase": {
      id: "ai_closer",
      label: "AI Closing Phrase",
      description: "Text ends with a typical LLM sign-off or offer to help.",
      labelKey: "signal_ai_closer_label",
      descKey: "signal_ai_closer_desc",
      severity: "high"
    },
    "Formulaic sentence structure": {
      id: "ai_structure",
      label: "Formulaic Structure",
      description: "Sentence follows rigid formula patterns favored by language models.",
      labelKey: "signal_ai_structure_label",
      descKey: "signal_ai_structure_desc",
      severity: "medium"
    },
    "Passive voice construction": {
      id: "passive_voice",
      label: "Passive Voice",
      description: "AI tends to over-use passive constructions to sound neutral.",
      labelKey: "signal_passive_voice_label",
      descKey: "signal_passive_voice_desc",
      severity: "low"
    },
    "No contractions (formal AI style)": {
      id: "no_contractions",
      label: "Contraction Absence",
      description: "Absence of contractions in long sentences signals non-human tone.",
      labelKey: "signal_no_contractions_label",
      descKey: "signal_no_contractions_desc",
      severity: "low"
    },
    "List-style structure": {
      id: "list_structure",
      label: "List-Style Structure",
      description: "Enumerated structure in prose, an AI preference for clarity-signaling.",
      labelKey: "signal_list_structure_label",
      descKey: "signal_list_structure_desc",
      severity: "low"
    },
    "Uniform sentence length (AI sweet spot)": {
      id: "uniform_length",
      label: "Uniform Cadence",
      description: "Consistent 15–28 word sentences without length variation.",
      labelKey: "signal_uniform_length_label",
      descKey: "signal_uniform_length_desc",
      severity: "medium"
    },
    "Run-on without natural pause": {
      id: "run_on",
      label: "Run-On Sentence",
      description: "Long sentence with no commas or dashes — unnatural for human writers.",
      labelKey: "signal_run_on_label",
      descKey: "signal_run_on_desc",
      severity: "low"
    },
    "Human signal detected": {
      id: "human_signal",
      label: "Human Signal",
      description: "Informal language, slang, or emotional cues indicating human authorship.",
      labelKey: "signal_human_signal_label",
      descKey: "signal_human_signal_desc",
      severity: "high"
    },
    "AI callout/label heading": {
      id: "callout_label",
      label: "Callout Label Heading",
      description: "Short imperative labels (Note:, Tip:) used as formatting devices by AI.",
      labelKey: "signal_callout_label",
      descKey: "signal_callout_desc",
      severity: "medium"
    },
  };

  const entries: SignalEntry[] = [];
  for (const [key, count] of Object.entries(signalBreakdown)) {
    // Fuzzy match on key prefix
    const metaKey = Object.keys(META).find(k => key.startsWith(k.split(" (×")[0]));
    if (metaKey) {
      const meta = META[metaKey];
      entries.push({
        ...meta,
        count,
        label: count > 1 ? `${meta.label} (×${count})` : meta.label,
      });
    } else if (key !== "No strong signals") {
      // Fallback for unknown signals
      const safeId = key.toLowerCase().replace(/\s+/g, "_");
      entries.push({
        id: safeId,
        label: key,
        description: `Detected ${count} time(s).`,
        labelKey: `signal_${safeId}_label`, // Generic fallback
        descKey: `signal_${safeId}_desc`,    // Generic fallback
        severity: "low",
        count,
      });
    }
  }

  return entries;
}

// ─── Main analyzer ────────────────────────────────────────────────────────

export function analyzeText(text: string): TextAnalysisResult {

  // Short-circuit for trivially short input
  if (!text || text.trim().length < 20) {
    return {
      score: 0,
      signals: [],
      highlightedRanges: [],
      verdict: "Fully Human",
      verdictKey: "verdict_fully_human",
      sentences: [],
      signalBreakdown: {},
      wordCount: 0,
      avgSentenceLength: 0,
      burstinessScore: 50,
      contractionRatio: 0,
      listDensity: 0,
      passiveVoiceRatio: 0,
      vocabularyRichness: 0,
      isArabicDominant: false,
    };
  }

  const isArabic = detectArabicDominance(text);
  const rawSentences = splitSentences(text);
  const sentenceTexts = rawSentences.map(s => s.text);

  const words = text.split(/\s+/).filter(Boolean);
  const sentenceLengths = sentenceTexts.map(s => s.split(/\s+/).length);

  // Score each sentence
  const scoredSentences = rawSentences.map((s, i) =>
    scoreSentence(s.text, s.startIndex, i, rawSentences.length, isArabic)
  );

  // Global metrics
  const burstiness = calcBurstiness(sentenceLengths);
  const contractionRatio = calcContractionRatio(text, words.length);
  const listDensity = calcListDensity(sentenceTexts);
  const passiveVoiceRatio = calcPassiveVoiceRatio(sentenceTexts);
  const vocabularyRichness = calcVocabularyRichness(text);

  // Global penalties
  const burstinessPenalty = burstiness < 20 ? 20 : burstiness < 40 ? 10 : 0;
  const contractionPenalty = !isArabic && contractionRatio < 0.01 ? 12
    : !isArabic && contractionRatio < 0.03 ? 6
      : 0;
  const listPenalty = listDensity > 50 ? 14 : listDensity > 30 ? 7 : 0;
  const passivePenalty = passiveVoiceRatio > 60 ? 10 : passiveVoiceRatio > 40 ? 5 : 0;
  const ttrBoost = vocabularyRichness < 35 && words.length > 50 ? 10 : 0; // Low TTR = AI

  const rawAvgScore = scoredSentences.length
    ? scoredSentences.reduce((a, b) => a + b.score, 0) / scoredSentences.length
    : 0;

  const overallScore = Math.min(
    100,
    Math.round(rawAvgScore + burstinessPenalty + contractionPenalty + listPenalty + passivePenalty + ttrBoost)
  );

  // Signal breakdown
  const breakdown: Record<string, number> = {};
  scoredSentences.forEach(r => {
    r.signals.forEach(sig => {
      // Normalize: strip "(×N)" suffix for aggregation
      const key = sig.replace(/\s*\(×\d+\)$/, '');
      breakdown[key] = (breakdown[key] || 0) + 1;
    });
  });

  const verdict: TextAnalysisResult["verdict"] =
    overallScore >= 82 ? "Fully AI" :
      overallScore >= 62 ? "Mostly AI" :
        overallScore >= 40 ? "Mixed" :
          overallScore >= 20 ? "Mostly Human" :
            "Fully Human";

  const verdictKey =
    overallScore >= 82 ? "verdict_fully_ai" :
      overallScore >= 62 ? "verdict_mostly_ai" :
        overallScore >= 40 ? "verdict_mixed" :
          overallScore >= 20 ? "verdict_mostly_human" :
            "verdict_fully_human";

  const namedSignals = buildSignalEntries(breakdown);
  const highlightedRanges = buildHighlightedRanges(text);

  return {
    // Backward-compatible fields
    score: overallScore,
    signals: namedSignals,
    highlightedRanges,

    // Extended forensic breakdown
    verdict,
    verdictKey,
    sentences: scoredSentences,
    signalBreakdown: breakdown,
    wordCount: words.length,
    avgSentenceLength: sentenceLengths.length
      ? Math.round(sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length)
      : 0,
    burstinessScore: burstiness,
    contractionRatio: Math.round(contractionRatio * 1000) / 10, // as %
    listDensity,
    passiveVoiceRatio,
    vocabularyRichness,
    isArabicDominant: isArabic,
  };
}
