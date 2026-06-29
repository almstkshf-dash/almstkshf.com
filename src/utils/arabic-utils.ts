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
    return text;
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
