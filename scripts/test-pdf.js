const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');
const reshaper = require('arabic-persian-reshaper');

// Read Amiri font base64 from the project
const fontPath = path.join(__dirname, '../src/lib/fonts/amiri-font-base64.ts');
let amiriBase64 = '';
if (fs.existsSync(fontPath)) {
    const content = fs.readFileSync(fontPath, 'utf8');
    const match = content.match(/AMIRI_FONT_BASE64\s*=\s*['"`](.*?)['"`]/s);
    if (match) {
        amiriBase64 = match[1].trim();
    }
}

if (!amiriBase64) {
    console.error("Could not find Amiri font base64!");
    process.exit(1);
}

const doc = new jsPDF();
doc.addFileToVFS('Amiri-Regular.ttf', amiriBase64);
doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
doc.setFont('Amiri');

const testText = "سوق أمنيات عيد الأضحى";

// 1. Original
doc.setFontSize(14);
doc.text("1. Original: " + testText, 20, 30);

// 2. Shaped only
const shaped = reshaper.ArabicShaper.convertArabic(testText);
doc.text("2. Shaped only: " + shaped, 20, 50);

// 3. Reversed only (unshaped)
const reversed = testText.split('').reverse().join('');
doc.text("3. Reversed only: " + reversed, 20, 70);

// 4. Shaped and reversed (current method)
const words = shaped.split(/(\s+)/);
const processedWords = words.map(w => {
    if (/[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(w)) {
        return w.split('').reverse().join('');
    }
    return w;
});
const shapedAndReversed = processedWords.reverse().join('');
doc.text("4. Shaped and Reversed: " + shapedAndReversed, 20, 90);

fs.writeFileSync(path.join(__dirname, '../test-arabic.pdf'), Buffer.from(doc.output('arraybuffer')));
console.log("PDF written to test-arabic.pdf");
console.log("Shaped & Reversed string:", shapedAndReversed);
