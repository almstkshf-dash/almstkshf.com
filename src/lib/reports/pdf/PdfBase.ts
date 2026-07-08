/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import type { jsPDF } from 'jspdf';
import { fixArabic, isArabic, isArabicReport } from '../utils/arabic';
import { fetchImageAsBase64 } from '../utils/images';
import { BRAND_DARK, BRAND_AMBER, ACCENT_BG, ReportTranslations } from '../types';

// @ts-ignore
import reshaper from 'arabic-persian-reshaper';

export interface AutoTablejsPDF extends jsPDF {
    lastAutoTable: {
        finalY: number;
    };
}

/**
 * Loads the Amiri font dynamically from local filesystem (server) or HTTP fetch (client).
 * Returning the base64 string or null on failure.
 */
async function getAmiriFontBase64(): Promise<string | null> {
    try {
        if (typeof window === 'undefined') {
            // Server-side Node environment
            const fs = require('fs');
            const path = require('path');
            const fontPath = path.join(process.cwd(), 'public', 'fonts', 'amiri.ttf');
            if (fs.existsSync(fontPath)) {
                return fs.readFileSync(fontPath).toString('base64');
            }
        } else {
            // Client-side browser environment
            const res = await fetch('/fonts/amiri.ttf');
            if (res.ok) {
                const buffer = await res.arrayBuffer();
                let binary = '';
                const bytes = new Uint8Array(buffer);
                for (let i = 0; i < bytes.byteLength; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                return btoa(binary);
            }
        }
    } catch (err) {
        console.warn('Failed to dynamically load Amiri font:', err);
    }
    return null;
}

export class PdfBase {
    public static async initPDF(logoUrl?: string) {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', hotfixes: ["px_line_height"] });
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        let fontLoaded = false;
        const amiriBase64 = await getAmiriFontBase64();
        if (amiriBase64) {
            try {
                doc.addFileToVFS('Amiri-Regular.ttf', amiriBase64);
                doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
                fontLoaded = true;
            } catch (e) {
                console.warn('Amiri font registration failed:', e);
            }
        }

        const logoBase64 = logoUrl ? await fetchImageAsBase64(logoUrl) : null;

        // Apply RTL override for Arabic text
        this.overrideJsPDFText(doc);

        return { doc, pageWidth, pageHeight, fontLoaded, logoBase64 };
    }

    public static overrideJsPDFText(doc: jsPDF) {
        if ((doc as any).__arabicOverridden) return;
        (doc as any).__arabicOverridden = true;

        const originalText = doc.text;
        const originalGetTextWidth = doc.getTextWidth;

        doc.text = function(text: any, x: any, y: any, options: any) {
            if (Array.isArray(text)) {
                let currentY = y;
                const lineHeight = options?.lineHeight || 1.15;
                const fontSize = doc.getFontSize() / 72 * 25.4;
                const spacing = fontSize * lineHeight;
                
                text.forEach((line: string) => {
                    doc.text(line, x, currentY, options);
                    currentY += spacing;
                });
                return doc;
            }

            const strText = String(text || '');
            const hasArabic = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(strText);
            
            if (hasArabic) {
                const shaped = reshaper.ArabicShaper.convertArabic(strText);
                const parts = shaped.split(/([\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]+)/);
                
                let totalWidth = 0;
                parts.forEach((part: string) => {
                    if (part) {
                        totalWidth += originalGetTextWidth.call(doc, part);
                    }
                });
                
                let currentX = x;
                const align = options?.align || 'left';
                if (align === 'center') {
                    currentX = x + totalWidth / 2;
                } else if (align === 'right') {
                    currentX = x;
                } else {
                    currentX = x + totalWidth;
                }
                
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    if (!part) continue;
                    
                    const isPartArabic = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(part);
                    if (isPartArabic) {
                        for (let j = 0; j < part.length; j++) {
                            const char = part[j];
                            const charWidth = originalGetTextWidth.call(doc, char);
                            currentX -= charWidth;
                            originalText.call(doc, char, currentX, y, { ...options, align: 'left' });
                        }
                    } else {
                        const partWidth = originalGetTextWidth.call(doc, part);
                        currentX -= partWidth;
                        originalText.call(doc, part, currentX, y, { ...options, align: 'left' });
                    }
                }
                return doc;
            }

            return originalText.call(doc, text, x, y, options);
        };

        doc.getTextWidth = function(text: any) {
            const strText = String(text || '');
            const hasArabic = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(strText);
            if (hasArabic) {
                const shaped = reshaper.ArabicShaper.convertArabic(strText);
                return originalGetTextWidth.call(doc, shaped);
            }
            return originalGetTextWidth.call(doc, text);
        };
    }

    public static addCoverPage(doc: jsPDF, title: string, count: number, translations: ReportTranslations, logoBase64: string | null, fontLoaded: boolean) {
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        doc.setFillColor(...BRAND_DARK);
        doc.rect(0, 0, pageWidth, 70, 'F');

        if (logoBase64) {
            try { doc.addImage(logoBase64, 'PNG', pageWidth / 2 - 15, 15, 30, 30); } catch { /* */ }
        }

        doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text(fixArabic(translations.brand_name || 'ALMSTKSHF'), pageWidth / 2, 53, { align: 'center' });

        if (translations.brand_tagline) {
            doc.setFontSize(8);
            doc.setTextColor(220, 220, 220);
            doc.text(fixArabic(translations.brand_tagline), pageWidth / 2, 60, { align: 'center' });
        }

        doc.setFontSize(24);
        doc.setTextColor(...BRAND_DARK);
        doc.text(fixArabic(title.toUpperCase()), pageWidth / 2, pageHeight / 2 - 10, { align: 'center' });

        doc.setDrawColor(...BRAND_AMBER);
        doc.setLineWidth(1);
        doc.line(pageWidth / 4, pageHeight / 2, (pageWidth * 3) / 4, pageHeight / 2);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(fixArabic(`${translations.Reports?.generated_at || 'Issue Date'}: ${new Date().toLocaleDateString()}`), pageWidth / 2, pageHeight / 2 + 15, { align: 'center' });
        doc.text(fixArabic(`${translations.Reports?.data_points || 'Total Data Points'}: ${count}`), pageWidth / 2, pageHeight / 2 + 22, { align: 'center' });

        doc.setFillColor(...BRAND_DARK);
        doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    }

    public static addPageHeader(doc: jsPDF, logoBase64: string | null, pageWidth: number, translations: ReportTranslations, fontLoaded: boolean) {
        doc.setFillColor(...BRAND_DARK);
        doc.rect(0, 0, pageWidth, 15, 'F');
        
        const isHeaderArabic = isArabic(translations.brand_name || 'ALMSTKSHF');
        
        if (logoBase64) {
            try { 
                const logoX = isHeaderArabic ? pageWidth - 16 : 5;
                doc.addImage(logoBase64, 'PNG', logoX, 2, 11, 11); 
            } catch { /* */ }
        }
        
        doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
        doc.setTextColor(255);
        doc.setFontSize(10);
        
        const headerText = translations.brand_name || 'ALMSTKSHF';
        if (isHeaderArabic) {
            doc.text(fixArabic(headerText), pageWidth - 18, 9, { align: 'right' });
        } else {
            doc.text(fixArabic(headerText), 18, 9);
        }
    }

    public static drawHeading(doc: jsPDF, text: string, x: number, y: number, fontLoaded: boolean) {
        doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(...BRAND_DARK);
        const processed = fixArabic(text);
        if (isArabic(text)) {
            const pageWidth = doc.internal.pageSize.width;
            doc.text(processed, pageWidth - x, y, { align: 'right' });
        } else {
            doc.text(processed, x, y);
        }
    }

    public static drawMetricBoxes(doc: jsPDF, boxes: { label: string, value: string, color: readonly [number, number, number] | [number, number, number] }[], y: number, pageWidth: number, fontLoaded: boolean) {
        const boxW = (pageWidth - 40) / boxes.length;
        boxes.forEach((box, i) => {
            const x = 14 + i * (boxW + 6);
            doc.setFillColor(...ACCENT_BG);
            doc.roundedRect(x, y, boxW, 25, 2, 2, 'F');
            doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(100);
            doc.text(fixArabic(box.label), x + boxW / 2, y + 8, { align: 'center' });
            doc.setFontSize(14);
            doc.setTextColor(...(box.color as [number, number, number]));
            doc.text(fixArabic(box.value), x + boxW / 2, y + 18, { align: 'center' });
        });
    }

    public static async addAutoTable(doc: jsPDF, options: {
        head: string[][];
        body: any[];
        startY: number;
        fontLoaded: boolean;
        logoBase64: string | null;
        translations: ReportTranslations;
        didDrawPage?: (data: any) => void;
        didDrawCell?: (data: any) => void;
        columnStyles?: any;
    }) {
        const autoTable = (await import('jspdf-autotable')).default;
        const isArabicMode = isArabicReport(options.translations);

        const processedHead = options.head.map(row => {
            const processedRow = row.map(cell => fixArabic(cell || ''));
            return isArabicMode ? [...processedRow].reverse() : processedRow;
        });

        const sanitizedBody = (options.body || []).map((row: any) => {
            const rawRow = Array.isArray(row) ? row : Object.values(row);
            const processedRow = rawRow.map((cell: any) => {
                if (typeof cell === 'string') {
                    return fixArabic(cell);
                }
                return cell ?? '';
            });
            return isArabicMode ? [...processedRow].reverse() : processedRow;
        });

        let columnStyles = options.columnStyles || {};
        if (isArabicMode && options.columnStyles && options.head[0]) {
            const totalCols = options.head[0].length;
            columnStyles = {};
            for (const key in options.columnStyles) {
                const colIdx = parseInt(key, 10);
                if (!isNaN(colIdx)) {
                    columnStyles[totalCols - 1 - colIdx] = options.columnStyles[key];
                } else {
                    columnStyles[key] = options.columnStyles[key];
                }
            }
        } else if (!options.columnStyles && isArabicMode) {
            if (options.head[0]) {
                const totalCols = options.head[0].length;
                columnStyles = {
                    [totalCols - 2]: { cellWidth: 'auto', minCellWidth: 40 }
                };
            }
        } else if (!options.columnStyles) {
            columnStyles = {
                1: { cellWidth: 'auto', minCellWidth: 40 }
            };
        }

        const {
            fontLoaded,
            logoBase64,
            translations,
            ...autoTableOptions
        } = options;

        return autoTable(doc, {
            ...autoTableOptions,
            head: processedHead,
            body: sanitizedBody as any,
            margin: { horizontal: 10 },
            styles: {
                fontSize: 7.5,
                font: fontLoaded ? 'Amiri' : 'helvetica',
                cellPadding: { top: 2.5, bottom: 2.5, left: 2, right: 2 },
                overflow: 'linebreak',
                cellWidth: 'auto',
                valign: 'middle',
                halign: isArabicMode ? 'right' : 'left'
            },
            headStyles: {
                fillColor: BRAND_DARK,
                textColor: [255, 255, 255],
                fontStyle: fontLoaded ? 'normal' : 'bold',
                fontSize: 8.5,
                cellPadding: { top: 3.5, bottom: 3.5, left: 2.5, right: 2.5 },
                valign: 'middle',
                halign: isArabicMode ? 'right' : 'left'
            },
            alternateRowStyles: {
                fillColor: ACCENT_BG
            },
            columnStyles: columnStyles,
            didDrawCell: options.didDrawCell,
            didDrawPage: options.didDrawPage,
            didParseCell: (data) => {
                const text = String(data.cell.raw || '');
                const hasArabic = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
                if (hasArabic) {
                    data.cell.styles.halign = 'right';
                }
            }
        });
    }

    public static finalizePDF(doc: jsPDF, title: string, translations: ReportTranslations, fontLoaded: boolean, returnOnly = false) {
        const pages = doc.getNumberOfPages();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        const isArabicMode = /[\u0600-\u06FF]/.test(translations.Reports?.pr_title || '') || /[\u0600-\u06FF]/.test(title);

        for (let i = 1; i <= pages; i++) {
            doc.setPage(i);
            doc.setFont(fontLoaded ? 'Amiri' : 'helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(150);

            const brandName = translations.brand_name || 'ALMSTKSHF';
            const fixedTitle = fixArabic(title);
            const pageStr = translations.Reports?.page || 'Page';
            const pageInfo = fixArabic(`${pageStr} ${i} / ${pages}`);

            if (isArabicMode) {
                doc.text(pageInfo, 14, pageHeight - 10, { align: 'left' });
                doc.text(brandName, 45, pageHeight - 10, { align: 'left' });
                doc.text(fixedTitle, pageWidth - 14, pageHeight - 10, { align: 'right' });
            } else {
                doc.text(`${brandName} | ${title}`, 14, pageHeight - 10);
                doc.text(pageInfo, pageWidth - 14, pageHeight - 10, { align: 'right' });
            }
        }

        if (returnOnly) return;

        const dateStr = new Date().toISOString().split('T')[0];
        doc.save(`${title.replace(/\s+/g, '_')}_${dateStr}.pdf`);
    }
}
