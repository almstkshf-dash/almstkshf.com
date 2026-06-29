const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

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

const testText = "سوق أمنيات عيد الأضحى";

doc.setFontSize(14);
try {
    doc.text(testText, 150, 30, { direction: 'rtl', align: 'right' });
} catch (e) {
    doc.text("Error with direction: " + e.message, 20, 30);
}
doc.text("Normal: " + testText, 20, 50);

fs.writeFileSync(path.join(__dirname, '../test-rtl.pdf'), Buffer.from(doc.output('arraybuffer')));
console.log("PDF written to test-rtl.pdf");
