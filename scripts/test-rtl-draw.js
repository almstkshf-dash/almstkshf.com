const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');
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
    // Arabic unicode block: \u0600-\u06FF, plus Arabic Presentation Forms: \uFB50-\uFDFF, \uFE70-\uFEFF
    const parts = text.split(/([\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]+)/);

    let currentX = x;

    for (let i = 0; i < parts.length; i++) {
        const seg = parts[i];
        if (!seg) continue;

        const isArabic = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(seg);

        if (isArabic) {
            // Shape the Arabic characters
            const shaped = reshaper.ArabicShaper.convertArabic(seg);
            // Draw character-by-character from right to left
            for (let j = 0; j < shaped.length; j++) {
                const char = shaped[j];
                const charWidth = doc.getTextWidth(char);
                currentX -= charWidth;
                doc.text(char, currentX, y);
            }
        } else {
            // LTR segment (English, numbers, spaces, punctuation)
            // Get the width of the whole segment
            const segWidth = doc.getTextWidth(seg);
            currentX -= segWidth;
            // Draw the entire segment LTR
            doc.text(seg, currentX, y);
        }
    }
}

doc.text("Manual RTL Mixed Text Drawing Test (Fixed):", 20, 20);

// Test 1: Mixed English and Arabic
const testText1 = '"تحقيق أمنية" تطلق الدورة الـ15 من "سوق أمنيات عيد الأضحى"';
drawArabicRTLMixed(doc, testText1, 180, 40);

// Test 2: OSINT mixed
const testText2 = "تقرير OSINT للمستكشف (2026) - نسخة تجريبية";
drawArabicRTLMixed(doc, testText2, 180, 60);

fs.writeFileSync(path.join(__dirname, '../test-rtl-draw-mixed-fixed.pdf'), Buffer.from(doc.output('arraybuffer')));
console.log("PDF written to test-rtl-draw-mixed-fixed.pdf");
