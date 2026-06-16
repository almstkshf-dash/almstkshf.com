// Test encoding recovery script (Self-contained)
const WIN1252_TO_BYTE = {
  0x20AC: 0x80, // €
  0x201A: 0x82, // ‚
  0x0192: 0x83, // ƒ
  0x201E: 0x84, // „
  0x2026: 0x85, // …
  0x2020: 0x86, // †
  0x2021: 0x87, // ‡
  0x02C6: 0x88, // ˆ
  0x2030: 0x89, // ‰
  0x0160: 0x8A, // Š
  0x2039: 0x8B, // ‹
  0x0152: 0x8C, // Œ
  0x017D: 0x8E, // Ž
  0x2018: 0x91, // ‘
  0x2019: 0x92, // ’
  0x201C: 0x93, // “
  0x201D: 0x94, // ”
  0x2022: 0x95, // •
  0x2013: 0x96, // –
  0x2014: 0x97, // —
  0x02DC: 0x98, // ˜
  0x2122: 0x99, // ™
  0x0161: 0x9A, // š
  0x203A: 0x9B, // ›
  0x0153: 0x9C, // œ
  0x017E: 0x9E, // ž
  0x0178: 0x9F, // Ÿ
};

function hasMojibake(text) {
  const regex = /[\u00D8\u00D9][\u0080-\u00BF\u20AC\u201A\u0192\u201E\u2026\u2020\u2021\u02C6\u2030\u0160\u2039\u0152\u017D\u2018\u2019\u201C\u201D\u2022\u2013\u2014\u02DC\u2122\u0161\u203A\u0153\u017E\u0178]/;
  return regex.test(text);
}

function tryRecoverMojibake(text) {
  try {
    const bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code in WIN1252_TO_BYTE) {
        bytes[i] = WIN1252_TO_BYTE[code];
      } else if (code === 0x20 && i > 0 && bytes[i - 1] === 0xd9) {
        bytes[i] = 0x81; // Map space after 0xd9 to 0x81 (Feh)
      } else if (code <= 255) {
        bytes[i] = code;
      } else {
        return null;
      }
    }
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return decoded;
  } catch (e) {
    return null;
  }
}

const testCases = [
  {
    name: "Clean Arabic text",
    input: "لا تتردد في الاتصال بنا إن كان لديك أي استفسار",
    shouldRecover: false,
    expected: "لا تتردد في الاتصال بنا إن كان لديك أي استفسار"
  },
  {
    name: "Mojibake text (UTF-8 read as Latin-1/Windows-1252)",
    input: "Ù„Ø§ ØªØªØ±Ø¯Ø¯ Ù ÙŠ Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ù†Ø§ Ø¥Ù† ÙƒØ§Ù† Ù„Ø¯ÙŠÙƒ Ø£ÙŠ Ø§Ø³ØªÙ Ø³Ø§Ø±",
    shouldRecover: true,
    expected: "لا تتردد في الاتصال بنا إن كان لديك أي استفسار"
  },
  {
    name: "Mojibake text with Windows-1252 mapped quotes/special chars",
    input: "Ø¥Ù† ÙƒØ§Ù† Ù„Ø¯ÙŠÙƒ Ø£ÙŠ Ø§Ø³ØªÙ Ø³Ø§Ø±",
    shouldRecover: true,
    expected: "إن كان لديك أي استفسار"
  },
  {
    name: "Mixed English and Mojibake text",
    input: "Hello World! Ù„Ø§ ØªØªØ±Ø¯Ø¯ Ù ÙŠ",
    shouldRecover: true,
    expected: "Hello World! لا تتردد في"
  },
  {
    name: "Normal English text",
    input: "Hello, this is a clean English message with normal quotes.",
    shouldRecover: false,
    expected: "Hello, this is a clean English message with normal quotes."
  }
];

let failed = 0;
console.log("=== Running Mojibake Recovery Tests ===");

testCases.forEach((tc, idx) => {
  const isMoji = hasMojibake(tc.input);
  console.log(`\nTest #${idx + 1}: ${tc.name}`);
  console.log(`Input: "${tc.input}"`);
  console.log(`Detected Mojibake: ${isMoji} (Expected: ${tc.shouldRecover})`);
  
  if (isMoji !== tc.shouldRecover) {
    console.error(`❌ FAILURE: Detection mismatch!`);
    failed++;
    return;
  }
  
  if (isMoji) {
    const recovered = tryRecoverMojibake(tc.input);
    console.log(`Recovered: "${recovered}"`);
    if (recovered !== tc.expected) {
      console.error(`❌ FAILURE: Expected "${tc.expected}", got "${recovered}"`);
      failed++;
    } else {
      console.log(`✅ SUCCESS!`);
    }
  } else {
    const recovered = tryRecoverMojibake(tc.input);
    console.log(`Recovered result: "${recovered}"`);
    if (recovered !== null && recovered !== tc.expected) {
      console.error(`❌ FAILURE: Expected null or original, got "${recovered}"`);
      failed++;
    } else {
      console.log(`✅ SUCCESS (Skipped recovery, left intact)`);
    }
  }
});

console.log(`\n=== Summary: ${testCases.length - failed}/${testCases.length} tests passed ===`);
if (failed > 0) {
  process.exit(1);
}
