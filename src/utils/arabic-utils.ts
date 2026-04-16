/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

export const isArabic = (text: string): boolean => {
    return /[\u0600-\u06FF]/.test(text);
};

/**
 * Fixes Arabic text for PDF rendering in jsPDF.
 * Since jsPDF is LTR, we reverse the word order to simulate RTL flow.
 * Note: For simple jsPDF usage without a shaper, we also reverse characters 
 * if the selected font doesn't handle shaping (like standard Helvetica).
 * With Amiri, we should only need word reversal if it supports Arabic shaping.
 */
export const fixArabicForPDF = (text: string): string => {
    if (!text || !isArabic(text)) return text;
    
    // Split into segments to handle mixed English/Arabic correctly
    const words = text.trim().split(/\s+/);
    
    // Reverse word order for RTL paragraph flow
    return words.reverse().join(' ');
};

/**
 * Detects if a string needs special PDF handling.
 */
export const processPdfText = (text: string): string => {
    return isArabic(text) ? fixArabicForPDF(text) : text;
};
