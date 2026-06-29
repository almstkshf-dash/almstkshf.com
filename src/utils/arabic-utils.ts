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
 *   1. Shape the entire string (arabic-persian-reshaper gives contextual glyph forms)
 *   2. Split into word+whitespace tokens
 *   3. Within each token that contains Arabic: reverse the Arabic character runs and
 *      swap mirrored brackets; leave LTR tokens (English, numbers) unchanged
 *   4. Reverse the order of ALL tokens — this gives RTL word order for LTR rendering
 *      while naturally preserving every space, because whitespace tokens are also
 *      reversed in position (the space between word A and word B stays between them
 *      even after A and B swap positions).
 *
 * NOTE: Do NOT combine an entire mixed Arabic+LTR info-line into one fixArabicForPDF
 * call when the LTR content has positional meaning (e.g. "اللغات: AR / EN").
 * Instead, fix each Arabic label separately and assemble the line manually in RTL
 * visual order — see generateMediaMonitoringPDF for the pattern.
 */
export const fixArabicForPDF = (text: string): string => {
    if (!text || !isArabic(text)) return text;

    // Process each line independently to preserve explicit newlines
    if (text.includes('\n')) {
        return text.split('\n').map(line => fixArabicForPDF(line)).join('\n');
    }

    // Shape the entire string first — the reshaper is context-sensitive and
    // correctly handles word boundaries (Arabic letters never connect across spaces).
    const shaped = reshaper.ArabicShaper.convertArabic(text);

    // Split into alternating content-tokens and whitespace-tokens.
    // Whitespace is captured as its own token so it survives the reversal intact.
    const tokens = shaped.split(/(\s+)/);

    const processedTokens = tokens.map((token: string) => {
        // Whitespace and pure-LTR tokens (English, numbers, punctuation) pass through,
        // only swapping mirrored bracket characters for the RTL reading context.
        if (!/[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(token)) {
            return swapBrackets(token);
        }

        // Token contains Arabic — split into Arabic-script segments and LTR segments.
        // Reverse the characters within each Arabic segment, then reverse the segment
        // order so the whole token reads correctly when rendered left-to-right.
        const segments = token.split(/([\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]+)/);
        const processedSegments = segments.map((seg: string) => {
            if (/[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(seg)) {
                return seg.split('').reverse().join('');
            }
            return swapBrackets(seg);
        });
        return processedSegments.reverse().join('');
    });

    // Reversing all tokens gives RTL word order.  Because whitespace tokens are
    // included in the reversal, every gap remains between the same two words.
    return processedTokens.reverse().join('');
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
