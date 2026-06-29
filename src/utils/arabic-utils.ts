/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

// @ts-ignore
import reshaper from 'arabic-persian-reshaper';

export const isArabic = (text: string): boolean => {
    return /[\u0600-\u06FF]/.test(text);
};

/**
 * Fixes Arabic text for PDF rendering in jsPDF.
 *
 * jsPDF is inherently LTR. To render Arabic correctly we must:
 *   1. Shape characters (get contextual/connected glyph forms via arabic-persian-reshaper)
 *   2. Reverse the visual order so that reading left-to-right produces correct RTL Arabic
 *
 * For MIXED lines (Arabic + English/numbers) we use a bidi-run approach:
 *   - Split the line into alternating Arabic-word-runs and LTR-token-runs
 *   - Reverse the run list so Arabic content appears before LTR content (RTL visual order)
 *   - Within each Arabic run, shape the whole run then reverse characters
 *   - LTR runs (numbers, English, punctuation) are kept intact
 *
 * This prevents the old bug where a wholesale word-reversal would put English
 * words in the wrong position in mixed lines like "تحليل | Analysis".
 */
export const fixArabicForPDF = (text: string): string => {
    if (!text || !isArabic(text)) return text;

    // Process each line independently to preserve explicit newlines
    if (text.includes('\n')) {
        return text.split('\n').map(line => fixArabicForPDF(line)).join('\n');
    }

    // ── Step 1: split the line into bidi token runs ────────────────────────────
    // A token is either a whitespace sequence, an Arabic word, or an LTR token.
    // We split on whitespace but keep the separators so we can reconstruct spacing.
    const tokens = text.split(/(\s+)/);

    // ── Step 2: group consecutive Arabic tokens into "Arabic runs" and keep
    //           LTR tokens (English, numbers, punctuation) as standalone runs ──
    type Run = { isArabic: boolean; tokens: string[] };
    const runs: Run[] = [];

    for (const token of tokens) {
        const hasArabicChar = /[\u0600-\u06FF]/.test(token);
        const isWhitespace = /^\s+$/.test(token);

        if (runs.length === 0) {
            runs.push({ isArabic: hasArabicChar, tokens: [token] });
            continue;
        }

        const last = runs[runs.length - 1];

        if (isWhitespace) {
            // Attach whitespace to the previous run so gaps are preserved
            last.tokens.push(token);
        } else if (hasArabicChar === last.isArabic) {
            last.tokens.push(token);
        } else {
            runs.push({ isArabic: hasArabicChar, tokens: [token] });
        }
    }

    // ── Step 3: reverse the run order (RTL visual layout) ─────────────────────
    runs.reverse();

    // ── Step 4: process each run ───────────────────────────────────────────────
    const processedRunStrings = runs.map(run => {
        if (!run.isArabic) {
            // LTR run — swap mirrored brackets for RTL context but keep order
            return run.tokens.map(t => swapBrackets(t)).join('');
        }

        // Arabic run: shape the entire run as one string (context-sensitive shaping
        // requires the full word, not isolated characters), then reverse characters.
        const runText = run.tokens.join('');
        const shaped = reshaper.ArabicShaper.convertArabic(runText);

        // Reverse characters so the shaped Arabic reads correctly when rendered LTR
        return shaped.split('').reverse().join('');
    });

    return processedRunStrings.join('');
};

/** Swaps mirrored bracket characters for RTL rendering context. */
function swapBrackets(text: string): string {
    let result = '';
    for (const char of text) {
        if (char === '(') result += ')';
        else if (char === ')') result += '(';
        else if (char === '[') result += ']';
        else if (char === ']') result += '[';
        else if (char === '{') result += '}';
        else if (char === '}') result += '{';
        else if (char === '<') result += '>';
        else if (char === '>') result += '<';
        else result += char;
    }
    return result;
}

/**
 * Detects if a string needs special PDF handling.
 */
export const processPdfText = (text: string): string => {
    return isArabic(text) ? fixArabicForPDF(text) : text;
};
