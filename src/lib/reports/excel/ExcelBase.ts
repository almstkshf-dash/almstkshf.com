/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import type ExcelJS from 'exceljs';

export class ExcelBase {
    /**
     * Finalizes the workbook by writing to a buffer and either downloading in-browser or returning as a Blob.
     */
    public static async downloadOrReturn(
        workbook: ExcelJS.Workbook, 
        title: string, 
        returnOnly = false
    ): Promise<Blob | void> {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        if (returnOnly) {
            return blob;
        }

        if (typeof window !== 'undefined') {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            const dateStr = new Date().toISOString().split('T')[0];
            link.download = `${title.replace(/\s+/g, '_')}_${dateStr}.xlsx`;
            link.click();
            URL.revokeObjectURL(link.href);
        }
    }

    /**
     * Formats alignment and fonts for RTL mode (Arabic).
     */
    public static formatArabicSheet(sheet: ExcelJS.Worksheet) {
        sheet.views = [{ rightToLeft: true }];
        sheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.alignment = {
                    horizontal: 'right',
                    vertical: 'middle',
                    wrapText: cell.alignment?.wrapText
                };
                cell.font = { ...cell.font, name: 'Arial' };
            });
        });
    }
}
