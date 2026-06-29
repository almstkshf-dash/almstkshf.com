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

// The original doc.text
const originalText = doc.text;

// Our custom drawing function
function drawArabicRTLMixed(doc, text, x, y) {
    if (!text) return;
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
                originalText.call(doc, char, currentX, y);
            }
        } else {
            const segWidth = doc.getTextWidth(seg);
            currentX -= segWidth;
            originalText.call(doc, seg, currentX, y);
        }
    }
}

// Override doc.text
doc.text = function(text, x, y, options) {
    if (!text) return doc;
    
    // Check if it's an array (jsPDF supports array of strings)
    if (Array.isArray(text)) {
        let currentY = y;
        const fontSize = doc.internal.getFontSize();
        const lineHeight = fontSize * 0.4; // rough estimation
        text.forEach((line) => {
            doc.text(line, x, currentY, options);
            currentY += lineHeight;
        });
        return doc;
    }
    
    const hasArabic = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
    
    if (hasArabic) {
        const align = (options && options.align) || 'left';
        let startX = x;
        const textWidth = doc.getTextWidth(text);
        
        if (align === 'right') {
            startX = x;
        } else if (align === 'center') {
            startX = x + textWidth / 2;
        } else {
            startX = x + textWidth;
        }
        
        drawArabicRTLMixed(doc, text, startX, y);
    } else {
        // Fallback to original text drawing for non-Arabic
        originalText.call(doc, text, x, y, options);
    }
    return doc;
};

// Test normal text drawing
doc.text("سوق أمنيات عيد الأضحى", 100, 20, { align: 'center' });
doc.text("الـ15 من الدورة", 100, 30, { align: 'right' });
doc.text("Normal English Text", 20, 40);

// Test table
const head = [['التاريخ', 'العنوان باللغة العربية', 'Source (EN)', 'الوصول Reach'].reverse()];
const body = [
    ['2026-06-29', 'تطلق "تحقيق أمنية" الدورة الـ15 من سوقها السنوي\nوهذا سطر ثانٍ للتجربة', 'Almstkshf Media', '1,250'].reverse(),
    ['2026-06-28', 'تقرير جديد عن الأمن السيبراني والذكاء الاصطناعي', 'Tech News', '340'].reverse()
];

autoTable(doc, {
    head: head,
    body: body,
    startY: 50,
    styles: {
        font: 'Amiri',
        fontSize: 10,
        halign: 'right'
    }
});

fs.writeFileSync(path.join(__dirname, '../test-override.pdf'), Buffer.from(doc.output('arraybuffer')));
console.log("PDF written to test-override.pdf");
