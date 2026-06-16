const STOPWORDS = new Set([
  "من", "في", "مع", "على", "إلى", "الى", "عن", "ب", "ل", "و", "أو", "او", "ثم", "أن", "ان", "أنه", "انه", "هذا", "هذه", "ذلك", "كل", "قد", "لقد", "كان", "كانت", "هو", "هي", "هم", "لنحو",
  "the", "of", "and", "in", "to", "for", "with", "on", "at", "by", "an", "a", "is", "that", "it", "this"
]);

function normalizeArabicText(text) {
  return text
    .toLowerCase()
    .replace(/[\u064B-\u0652]/g, "") // Remove harakat (diacritics)
    .replace(/[أإآ]/g, "ا")          // Normalize Alef
    .replace(/ة/g, "ه")              // Normalize Teh Marbuta
    .replace(/ى/g, "ي")              // Normalize Alef Maksura
    .replace(/[\"“»«”″'’‘.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ") // Replace punctuation/quotes with spaces
    .replace(/\s+/g, " ")            // Normalize spaces
    .trim();
}

function parseBooleanKeyword(keyword) {
  const mandatory = [];
  const excluded = [];
  const soft = [];
  const orGroups = [];

  const orParts = keyword.split(/\s+OR\s+/i);
  if (orParts.length > 1) {
    orGroups.push(orParts.map(p => p.trim().replace(/^[\"“»«”″]|[\"“»«”″]$/g, "").toLowerCase()).filter(Boolean));
  }

  const tokens = [];
  const quoteRegex = /[+\-]?([\"“»«”″])([^\"“»«”″]+)([\"“»«”″])/g;
  let remaining = keyword;
  let match;

  while ((match = quoteRegex.exec(keyword)) !== null) {
    tokens.push(match[0]);
    remaining = remaining.replace(match[0], " ");
  }

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

function matchesBooleanFilter(expr, title, snippet) {
  const normalizedHaystack = normalizeArabicText(`${title} ${snippet}`);

  const hasTerm = (term) => {
    const normTerm = normalizeArabicText(term);
    if (!normTerm) return true;
    return normalizedHaystack.includes(normTerm);
  };

  for (const term of expr.mandatory) {
    if (!hasTerm(term)) return false;
  }

  for (const term of expr.excluded) {
    if (hasTerm(term)) return false;
  }

  for (const term of expr.soft) {
    const norm = term.trim().toLowerCase();
    if (STOPWORDS.has(norm)) continue;
    if (!hasTerm(term)) return false;
  }

  for (const group of expr.orGroups) {
    if (!group.some(term => hasTerm(term))) {
      return false;
    }
  }

  return true;
}

const keyword = `تزامناً مع “اليوم العالمي للعمال” هوتباك تنظم يوماً ترفيهياً لنحو 1,500 من موظفيها في “دبي ميراكل جاردن”`;
const expr = parseBooleanKeyword(keyword);
console.log("Parsed Expression:", JSON.stringify(expr, null, 2));

const articleTitle = `تزامناً مع “اليوم العالمي للعمال” هوتباك تنظم يوماً ترفيهياً لنحو 1,500 من موظفيها في “دبي ميراكل جاردن” - AlMadar Magazine`;
const articleSnippet = `دبي، الإمارات العربية المتحدة – 1 مايو 2026: احتفلت شركة هوتباك، المتخصصة في حلول التعبئة والتغليف المستدامة ومقرها دولة الإمارات، بـ”اليوم العالمي للعمال” من خلال جمع 1,500 من موظفيها في تجربة مميزة لا تُنسى في “دبي ميراكل جاردن”.`;

const result = matchesBooleanFilter(expr, articleTitle, articleSnippet);
console.log("Match Result (New Filter):", result);
