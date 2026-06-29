const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable').default;
const reshaper = require('arabic-persian-reshaper');

// Read Amiri font base64
const fontPath = path.join(__dirname, '../src/lib/fonts/amiri-font-base64.ts');
let amiriBase64 = '';
if (fs.existsSync(fontPath)) {
    const content = fs.readFileSync(fontPath, 'utf8');
    const match = content.match(/AMIRI_FONT_BASE64\s*=\s*['"`](.*?)['"`]/s);
    if (match) {
        amiriBase64 = match[1].trim();
    }
}

const doc = new jsPDF();
doc.addFileToVFS('Amiri-Regular.ttf', amiriBase64);
doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
doc.setFont('Amiri');
doc.setFontSize(14);

// Improved RTL text drawing function that handles mixed direction text
function drawArabicRTLMixed(doc, text, x, y) {
    if (!text) return;
    
    // Split into Arabic (RTL) and Non-Arabic (LTR) segments
    const parts = text.split(/([\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]+)/);
    let currentX = x;
    
    for (let i = 0; i < parts.length; i++) {
        const seg = parts[i];
        if (!seg) continue;
        
        const isArabic = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(seg);
        
        if (isArabic) {
            const shaped = reshaper.ArabicShaper.convertArabic(seg);
            for (let j = 0; j < shaped.length; j++) {
                const char = shaped[j];
                const charWidth = doc.getTextWidth(char);
                currentX -= charWidth;
                doc.text(char, currentX, y);
            }
        } else {
            const segWidth = doc.getTextWidth(seg);
            currentX -= segWidth;
            doc.text(seg, currentX, y);
        }
    }
}

const originalHead = ['التاريخ', 'العنوان باللغة العربية', 'Source (EN)', 'الوصول Reach'];
const originalBody = [
    ['2026-06-29', 'تطلق "تحقيق أمنية" الدورة الـ15 من سوقها السنوي\nوهذا سطر ثانٍ للتجربة', 'Almstkshf Media', '1,250'],
    ['2026-06-28', 'تقرير جديد عن الأمن السيبراني والذكاء الاصطناعي', 'Tech News', '340']
];

// In Arabic Mode, reverse the columns of both head and body to render RTL table
const head = [ [...originalHead].reverse() ];
const body = originalBody.map(row => [...row].reverse());

const cellTextCache = {};

autoTable(doc, {
    head: head,
    body: body,
    startY: 30,
    styles: {
        font: 'Amiri',
        fontSize: 10,
        halign: 'right', // Align text to right inside cells
        valign: 'middle'
    },
    columnStyles: {
        // Adjust column widths since they are reversed now
        // Index 0: Reach (originally 3)
        // Index 1: Source (originally 2)
        // Index 2: Title (originally 1)
        // Index 3: Date (originally 0)
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 100 },
        3: { cellWidth: 30 }
    },
    didParseCell: (data) => {
        // Cache the raw text and clear it so autoTable doesn't draw it
        const key = `${data.row.index}-${data.column.index}-${data.section}`;
        cellTextCache[key] = data.cell.text;
        data.cell.text = ''; // Clear it
    },
    didDrawCell: (data) => {
        const key = `${data.row.index}-${data.column.index}-${data.section}`;
        const rawTextLines = cellTextCache[key];
        if (!rawTextLines || rawTextLines.length === 0) return;
        
        doc.setFont('Amiri');
        doc.setFontSize(data.cell.styles.fontSize);
        
        // Calculate vertical centering and line height
        const fontSize = data.cell.styles.fontSize;
        const lineHeight = fontSize * 0.4; // approx line height in mm
        const totalHeight = rawTextLines.length * lineHeight;
        
        // Starting Y: cell middle minus half the total text height
        let currentY = data.cell.y + (data.cell.height - totalHeight) / 2 + lineHeight - 0.5;
        
        // Starting X: right edge of the cell minus padding
        const padding = data.cell.styles.cellPadding.right || 2;
        const rightX = data.cell.x + data.cell.width - padding;
        
        rawTextLines.forEach((line) => {
            if (line) {
                drawArabicRTLMixed(doc, line, rightX, currentY);
            }
            currentY += lineHeight;
        });
    }
});

fs.writeFileSync(path.join(__dirname, '../test-table-rtl-fixed.pdf'), Buffer.from(doc.output('arraybuffer')));
console.log("PDF written to test-table-rtl-fixed.pdf");
