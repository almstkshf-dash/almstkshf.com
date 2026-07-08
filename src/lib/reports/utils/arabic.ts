/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { fixArabicForPDF, isArabic } from '@/utils/arabic-utils';
import { ReportTranslations } from '../types';

export { fixArabicForPDF, isArabic };

export function fixArabic(text: string): string {
    return fixArabicForPDF(text);
}

export function isArabicReport(translations: ReportTranslations): boolean {
    const textToTest = [
        translations.brand_name,
        translations.report_title,
        translations.sheet_name,
        translations.Reports?.pr_title,
        translations.date,
        translations.title
    ].join(' ');
    return /[\u0600-\u06FF]/.test(textToTest);
}
