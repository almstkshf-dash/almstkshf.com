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
 * Since jsPDF is LTR, we shape the Arabic characters and reverse them
 * to simulate RTL flow on a per-word basis for proper connectivity and direction.
 */
export const fixArabicForPDF = (text: string): string => {
    if (!text || !isArabic(text)) return text;
    
    // Shape characters using the reshaper to get correct connected glyph forms
    const shaped = reshaper.reshape(text);
    
    // Split by spaces (retaining whitespace) to keep alignment intact
    const words = shaped.split(/(\s+)/);
    
    const processedWords = words.map((w: string) => {
        // Reverse characters only if it's an Arabic word (including shaped glyphs/presentation forms)
        if (/[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(w)) {
            return w.split('').reverse().join('');
        }
        return w;
    });
    
    // Reverse word order to align sentences from Right-to-Left (RTL)
    return processedWords.reverse().join('');
};

/**
 * Detects if a string needs special PDF handling.
 */
export const processPdfText = (text: string): string => {
    return isArabic(text) ? fixArabicForPDF(text) : text;
};
