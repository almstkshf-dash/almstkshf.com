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

const head = [['التاريخ', 'العنوان باللغة العربية', 'Source (EN)', 'الوصول Reach']];
const body = [
    ['2026-06-29', 'تطلق "تحقيق أمنية" الدورة الـ15 من سوقها السنوي', 'Almstkshf Media', '1,250'],
    ['2026-06-28', 'تقرير جديد عن الأمن السيبراني والذكاء الاصطناعي', 'Tech News', '340']
];

// Map cells to store raw text for custom drawing since we clear it in willDrawCell
const cellTextCache = {};

autoTable(doc, {
    head: head,
    body: body,
    startY: 30,
    styles: {
        font: 'Amiri',
        fontSize: 10,
        halign: 'right' // Default align to right for Arabic table
    },
    didParseCell: (data) => {
        // Cache the raw text and clear it so autoTable doesn't draw it
        const key = `${data.row.index}-${data.column.index}-${data.section}`;
        cellTextCache[key] = data.cell.text;
        data.cell.text = ''; // Clear it
    },
    didDrawCell: (data) => {
        const key = `${data.row.index}-${data.column.index}-${data.section}`;
        const rawTextArray = cellTextCache[key];
        if (!rawTextArray) return;
        
        // join in case it is multi-line
        const rawText = Array.isArray(rawTextArray) ? rawTextArray.join('\n') : rawTextArray;
        if (!rawText) return;
        
        // Calculate the draw coordinates
        // For right alignment, we start at cell.x + cell.width - padding
        const padding = data.cell.styles.cellPadding.right || 2;
        const x = data.cell.x + data.cell.width - padding;
        
        // Calculate Y coordinate (vertical centering)
        const textHeight = doc.getTextDimensions(rawText).h;
        const y = data.cell.y + (data.cell.height + textHeight / 2) / 2 + 1; // approximation
        
        doc.setFont('Amiri');
        doc.setFontSize(data.cell.styles.fontSize);
        
        // Draw the text RTL mixed!
        drawArabicRTLMixed(doc, rawText, x, y);
    }
});

fs.writeFileSync(path.join(__dirname, '../test-table-rtl.pdf'), Buffer.from(doc.output('arraybuffer')));
console.log("PDF written to test-table-rtl.pdf");
